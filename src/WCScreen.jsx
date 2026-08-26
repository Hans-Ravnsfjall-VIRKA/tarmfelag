import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Navigation, Accessibility, Clock, Footprints, Car, ChevronRight } from "lucide-react";
import { Badge, ListGroup, LargeTitle, Row } from "./ui.jsx";
import MapCard from "./MapCard.jsx";
import BuildingPhoto from "./BuildingPhoto.jsx";
import { useT, hoursLabel } from "./i18n.jsx";
import { useNav } from "./nav.jsx";
import { supabase, hasSupabase } from "./lib/supabase.js";
import { haversine, getPosition, fmtDistance, walkMinutes } from "./lib/geo.js";
import { getMatrix } from "./lib/routing.js";
import { evalHours } from "./lib/hours.js";
import { FALLBACK_TOILETS, FALLBACK_HOURS } from "./fallbackToilets.js";
const TORSHAVN_LL = { lat: 62.0107, lng: -6.7741 };
const mins = (s) => Math.max(1, Math.round(s / 60));
function decorate(rows, hoursRows) {
  const byToilet = {};
  for (const h of hoursRows || []) (byToilet[h.toilet_id] ||= []).push(h);
  return (rows || []).filter((t) => t.lat != null && t.lng != null).map((t) => {
    const oh = evalHours(byToilet[t.id]);
    return { ...t, oh, open: oh.open };
  });
}
function WCScreen() {
  const { t } = useT();
  const { push } = useNav();
  const [status, setStatus] = useState("loading");
  const [raw, setRaw] = useState([]);
  const [fix, setFix] = useState(null);
  const [source, setSource] = useState("live");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [travel, setTravel] = useState({});
  useEffect(() => {
    let alive = true;
    (async () => {
      let rows = null;
      let hoursRows = [];
      if (hasSupabase) {
        try {
          const direct = await supabase.from("toilets").select("*").eq("is_active", true);
          if (!direct.error && direct.data && direct.data.length) rows = direct.data;
          else {
            const rpc = await supabase.rpc("nearest_toilets", { lat: TORSHAVN_LL.lat, lng: TORSHAVN_LL.lng, max_results: 200 });
            if (!rpc.error && rpc.data && rpc.data.length) rows = rpc.data;
          }
          if (rows) {
            const hRes = await supabase.from("toilet_hours").select("*");
            if (!hRes.error) hoursRows = hRes.data || [];
          }
        } catch {
        }
      }
      let src = "live";
      if (!rows || rows.length === 0) {
        rows = FALLBACK_TOILETS;
        hoursRows = FALLBACK_HOURS;
        src = "fallback";
      }
      if (alive) {
        setRaw(decorate(rows, hoursRows));
        setSource(src);
        setStatus("ready");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    let alive = true;
    (async () => {
      const f = await getPosition();
      if (alive && f) setFix(f);
    })();
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!fix || raw.length === 0) return;
    let alive = true;
    (async () => {
      const targets = raw.map((x) => ({ id: x.id, lat: x.lat, lng: x.lng }));
      const [walk, drive] = await Promise.all([
        getMatrix(fix, targets, "foot").catch(() => null),
        getMatrix(fix, targets, "car").catch(() => null)
      ]);
      if (!alive || !walk && !drive) return;
      const map = {};
      targets.forEach((tg, i) => {
        const w = walk && walk[i];
        const d = drive && drive[i];
        let best = null;
        if (w && d) best = w.timeS <= d.timeS ? { ...w, mode: "foot" } : { ...d, mode: "car" };
        else if (w) best = { ...w, mode: "foot" };
        else if (d) best = { ...d, mode: "car" };
        if (best) map[tg.id] = best;
      });
      setTravel(map);
    })();
    return () => {
      alive = false;
    };
  }, [fix, raw]);
  const toilets = useMemo(() => {
    const out = raw.map((x) => ({
      ...x,
      distM: fix ? haversine(fix, { lat: x.lat, lng: x.lng }) : null,
      travel: travel[x.id] || null
    }));
    out.sort((a, b) => {
      if (a.travel && b.travel) return a.travel.timeS - b.travel.timeS;
      if (a.travel) return -1;
      if (b.travel) return 1;
      if (fix) return (a.distM ?? Infinity) - (b.distM ?? Infinity);
      return a.name.localeCompare(b.name, "fo");
    });
    return out;
  }, [raw, fix, travel]);
  const openDetail = (toilet) => push({ type: "toilet", toilet, fix });
  const reachText = (x) => x.travel ? `${mins(x.travel.timeS)} min` : fmtDistance(x.distM);
  if (status === "loading") {
    return <div className="tf-screen"><LargeTitle title={t.wcTitle} /><p className="tf-bd tf-dim tf-intro">{t.loading}</p></div>;
  }
  const openList = toilets.filter((x) => x.open);
  const shown = onlyOpen && openList.length ? openList : toilets;
  const nearest = shown.find((x) => x.open) || shown[0];
  const rest = nearest ? shown.filter((x) => x.id !== nearest.id) : [];
  const HeroModeIcon = nearest && nearest.travel && nearest.travel.mode === "car" ? Car : Footprints;
  return <div className="tf-screen"><LargeTitle title={t.wcTitle} /><MapCard toilets={shown} fix={fix} onPick={openDetail} />{source === "fallback" && <p className="tf-sb tf-dim tf-intro" style={{ paddingTop: 12 }}>{t.offlineSample}</p>}{source === "live" && !fix && <p className="tf-sb tf-dim tf-intro" style={{ paddingTop: 12 }}>{t.allowLocation}</p>}<div className="tf-switchrow"><span className="lbl">{t.showOpenOnly}</span><button className={`tf-switch${onlyOpen ? " on" : ""}`} role="switch" aria-checked={onlyOpen} onClick={() => setOnlyOpen((v) => !v)} /></div>{nearest && <div className="tf-hero tf-hero-tap" role="button" tabIndex={0} onClick={() => openDetail(nearest)}><div className="tf-hero-photo"><BuildingPhoto url={nearest.photo_url} seed={nearest.id} alt={nearest.name} /></div><div className="tf-hero-top"><span className="tf-cap tf-dim" style={{ letterSpacing: ".04em", textTransform: "uppercase" }}>{fix ? t.nearestOpen : t.toilet}</span><span className={`tf-status ${nearest.open ? "tf-open" : "tf-closed"}`}>{nearest.open ? t.open : t.closed}</span></div><div className="tf-hero-name">{nearest.name}</div><div className="tf-sb tf-dim">{[nearest.municipality, reachText(nearest)].filter(Boolean).join(" · ")}</div><div className="tf-hero-hours"><Clock size={14} strokeWidth={2.2} /> {hoursLabel(t, nearest.oh)}</div><div className="tf-badgerow">{nearest.travel ? <Badge icon={HeroModeIcon}>{mins(nearest.travel.timeS)} min · {nearest.travel.mode === "car" ? t.navCar : t.navWalk}</Badge> : nearest.distM != null && <Badge icon={Footprints}>{walkMinutes(nearest.distM)} min</Badge>}{nearest.is_accessible && <Badge icon={Accessibility} tone="accent">{t.accessible}</Badge>}{nearest.is_free && <Badge>{t.free}</Badge>}</div><button className="tf-btn tf-btn-primary" onClick={(e) => {
    e.stopPropagation();
    push({ type: "nav", toilet: nearest, fix });
  }}><Navigation size={18} strokeWidth={2.4} /> {t.showWay}</button></div>}{rest.length > 0 && <ListGroup header={fix ? t.otherNear : t.allToilets}>{rest.map((x, i) => <Row
    key={x.id}
    last={i === rest.length - 1}
    onClick={() => openDetail(x)}
    leading={<div className={`tf-iconwell ${x.open ? "" : "tf-iconwell-dim"}`}>{x.travel && x.travel.mode === "car" ? <Car size={20} /> : x.travel ? <Footprints size={20} /> : <MapPin size={20} />}</div>}
    title={x.name}
    subtitle={[x.open ? t.open : t.closed, hoursLabel(t, x.oh), reachText(x)].filter(Boolean).join(" · ")}
    trailing={<ChevronRight size={18} className="tf-chev" />}
  />)}</ListGroup>}</div>;
}
export {
  WCScreen as default
};
