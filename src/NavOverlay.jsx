import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  X,
  Footprints,
  Car,
  MapPin,
  Flag,
  ExternalLink,
  Play,
  Square,
  LocateFixed,
  Check,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  CornerUpRight,
  CornerUpLeft,
  RotateCcw,
  RotateCw,
  Ship,
  ArrowUpRight
} from "lucide-react";
import { useT } from "./i18n.jsx";
import { useNav } from "./nav.jsx";
import BuildingPhoto from "./BuildingPhoto.jsx";
import { TILE_URL, TILE_OPTS } from "./lib/maptiles.js";
import { getPosition, fmtDistance, haversine, cumulativeDistances, snapToRoute } from "./lib/geo.js";
import { getRoute } from "./lib/routing.js";
import { foInstruction } from "./lib/maneuver-fo.js";
import { openDirections } from "./lib/directions.js";
const NAVZOOM = 17;
const fmtKm = (km) => km < 1 ? `${Math.round(km * 1e3)} m` : `${km.toFixed(1)} km`;
const fmtMin = (s) => {
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} t ${m % 60} min`;
};
function maneuverIcon(type) {
  switch (type) {
    case 4:
    case 5:
    case 6:
      return Flag;
    case 9:
    case 10:
    case 18:
    case 20:
    case 23:
      return ArrowRight;
    case 11:
      return CornerUpRight;
    case 14:
      return CornerUpLeft;
    case 15:
    case 16:
    case 19:
    case 21:
    case 24:
      return ArrowLeft;
    case 12:
    case 13:
      return RotateCcw;
    case 26:
    case 27:
      return RotateCw;
    case 28:
    case 29:
      return Ship;
    case 25:
    case 37:
    case 38:
      return ArrowUpRight;
    default:
      return ArrowUp;
  }
}
function NavOverlay({ toilet, fix }) {
  const { t, lang } = useT();
  const { pop } = useNav();
  const [mode, setMode] = useState("foot");
  const [origin, setOrigin] = useState(fix || null);
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState("loading");
  const [navigating, setNavigating] = useState(false);
  const [live, setLive] = useState(null);
  const [guide, setGuide] = useState(null);
  const [following, setFollowing] = useState(true);
  const [rerouting, setRerouting] = useState(false);
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const cumRef = useRef(null);
  const manAlongRef = useRef(null);
  const offCountRef = useRef(0);
  const lastRerouteRef = useRef(0);
  const dest = { lat: toilet.lat, lng: toilet.lng };
  const instrOf = (s) => s ? lang === "fo" ? foInstruction(s) : s.instruction : "";
  useEffect(() => {
    let alive = true;
    if (!origin) getPosition().then((f) => {
      if (!alive) return;
      if (f) setOrigin(f);
      else setStatus("nolocation");
    });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { zoomControl: false, attributionControl: true }).setView([toilet.lat, toilet.lng], 14);
    L.tileLayer(TILE_URL, TILE_OPTS).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    map.on("dragstart", () => setFollowing(false));
    setTimeout(() => map.invalidateSize(), 60);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (!origin) return;
    let alive = true;
    setStatus("loading");
    getRoute(origin, dest, mode, "en-US").then((r) => {
      if (!alive) return;
      setRoute(r);
      setStatus("ready");
    }).catch(() => {
      if (alive) setStatus("error");
    });
    return () => {
      alive = false;
    };
  }, [origin, mode]);
  useEffect(() => {
    if (!route) return;
    cumRef.current = cumulativeDistances(route.coords);
    manAlongRef.current = route.steps.map((s) => cumRef.current[s.beginShapeIndex] ?? 0);
    draw(route, navigating);
  }, [route]);
  useEffect(() => {
    if (!navigating) return;
    if (!("geolocation" in navigator)) {
      setStatus("nolocation");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => setLive({ lat: p.coords.latitude, lng: p.coords.longitude, heading: p.coords.heading, acc: p.coords.accuracy }),
      () => {
      },
      { enableHighAccuracy: true, maximumAge: 1e3, timeout: 2e4 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [navigating]);
  useEffect(() => {
    if (!navigating || !live || !route || !cumRef.current) return;
    const g = computeGuide(live);
    setGuide(g);
    setUser(live.lat, live.lng, live.heading);
    if (following && mapRef.current && !g.arrived) mapRef.current.panTo([live.lat, live.lng], { animate: true, duration: 0.5 });
    if (!g.arrived && g.off > 55) {
      offCountRef.current += 1;
      if (offCountRef.current >= 3 && Date.now() - lastRerouteRef.current > 9e3) {
        lastRerouteRef.current = Date.now();
        offCountRef.current = 0;
        setRerouting(true);
        getRoute(live, dest, mode, "en-US").then((r) => {
          setRoute(r);
          setRerouting(false);
        }).catch(() => setRerouting(false));
      }
    } else offCountRef.current = 0;
  }, [live, navigating, route, following]);
  function computeGuide(pos) {
    const coords = route.coords, cum = cumRef.current, man = manAlongRef.current, steps = route.steps;
    const snap = snapToRoute(pos, coords, cum);
    const total = cum[cum.length - 1] || 0;
    const remaining = Math.max(0, total - snap.along);
    let nextIdx = -1;
    for (let i = 1; i < steps.length; i++) {
      if (man[i] > snap.along + 1) {
        nextIdx = i;
        break;
      }
    }
    if (nextIdx === -1) nextIdx = steps.length - 1;
    return {
      off: snap.off,
      remaining,
      distToNext: Math.max(0, man[nextIdx] - snap.along),
      nextStep: steps[nextIdx],
      subStep: steps[nextIdx + 1] || null,
      arrived: remaining < 20 || haversine(pos, dest) < 25,
      etaS: total > 0 ? route.timeS * (remaining / total) : 0
    };
  }
  function draw(r, navMode) {
    const map = mapRef.current, group = layerRef.current;
    if (!map || !group) return;
    group.clearLayers();
    L.polyline(r.coords, { color: "#2e8c78", weight: 6, opacity: 0.9, lineCap: "round", lineJoin: "round" }).addTo(group);
    L.circleMarker([toilet.lat, toilet.lng], { radius: 7, weight: 2, color: "#fff", fillColor: "#2e8c78", fillOpacity: 1 }).addTo(group);
    if (!navMode) {
      if (origin) L.circleMarker([origin.lat, origin.lng], { radius: 7, weight: 3, color: "#fff", fillColor: "#0a84ff", fillOpacity: 1 }).addTo(group);
      try {
        map.fitBounds(L.polyline(r.coords).getBounds(), { padding: [40, 40] });
      } catch {
      }
    }
  }
  function setUser(lat, lng, heading) {
    const map = mapRef.current;
    if (!map) return;
    const icon = L.divIcon({
      className: "tf-navarrow-wrap",
      html: `<div class="tf-navarrow" style="transform:rotate(${heading == null ? 0 : heading}deg)"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2 L19 21 L12 16 L5 21 Z" fill="#0a84ff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    if (!userMarkerRef.current) userMarkerRef.current = L.marker([lat, lng], { icon, zIndexOffset: 1e3 }).addTo(map);
    else {
      userMarkerRef.current.setLatLng([lat, lng]);
      userMarkerRef.current.setIcon(icon);
    }
  }
  const start = () => {
    const p = live || origin;
    if (!p) {
      setStatus("nolocation");
      return;
    }
    setNavigating(true);
    setFollowing(true);
    setGuide(null);
    if (mapRef.current) mapRef.current.setView([p.lat, p.lng], NAVZOOM);
    setUser(p.lat, p.lng, null);
    draw(route, true);
  };
  const stop = () => {
    setNavigating(false);
    setGuide(null);
    setFollowing(true);
    if (userMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    draw(route, false);
  };
  const recenter = () => {
    const p = live || origin;
    setFollowing(true);
    if (p && mapRef.current) mapRef.current.setView([p.lat, p.lng], NAVZOOM);
  };
  const GuideIcon = guide && !guide.arrived ? maneuverIcon(guide.nextStep.type) : ArrowUp;
  return <div className="tf-nav"><header className="tf-nav-head"><button className="tf-nav-close" onClick={pop} aria-label={t.navClose}><X size={22} strokeWidth={2.4} /></button><div className="tf-nav-title">{toilet.name}</div>{!navigating ? <div className="tf-nav-modes"><button className={mode === "foot" ? "on" : ""} onClick={() => setMode("foot")} aria-label={t.navWalk}><Footprints size={18} strokeWidth={2.2} /></button><button className={mode === "car" ? "on" : ""} onClick={() => setMode("car")} aria-label={t.navCar}><Car size={18} strokeWidth={2.2} /></button></div> : <div style={{ width: 1 }} />}</header><div className="tf-nav-map"><div ref={elRef} className="tf-map-canvas" />{navigating && guide && !guide.arrived && <div className="tf-navguide"><div className="tf-navguide-ico"><GuideIcon size={30} strokeWidth={2.6} /></div><div className="tf-navguide-body"><div className="tf-navguide-dist">{t.navIn} {fmtDistance(guide.distToNext)}</div><div className="tf-navguide-instr">{instrOf(guide.nextStep)}</div>{guide.subStep && <div className="tf-navguide-then">{t.navThen}: {instrOf(guide.subStep)}</div>}</div></div>}{navigating && rerouting && <div className="tf-navtoast">{t.navRerouting}</div>}{navigating && !following && guide && !guide.arrived && <button className="tf-navrecenter" onClick={recenter}><LocateFixed size={17} /> {t.navRecenter}</button>}</div>{status === "ready" && route && !navigating && <button className="tf-nav-maps" onClick={() => openDirections(toilet.lat, toilet.lng, toilet.name, mode === "foot" ? "walk" : "drive", origin)}><ExternalLink size={15} /> {t.navOpenMaps}</button>}<div className="tf-nav-sheet">{
    /* Overview (not yet navigating) */
  }{status === "ready" && route && !navigating && <><div className="tf-nav-summary"><div><div className="tf-nav-eta">{fmtMin(route.timeS)}</div><div className="tf-sb tf-dim">{fmtKm(route.distanceKm)} · {mode === "foot" ? t.navWalk : t.navCar}</div></div><button className="tf-btn tf-btn-primary tf-nav-start" onClick={start}><Play size={18} strokeWidth={2.6} fill="currentColor" /> {t.navStart}</button></div><p className="tf-cap tf-dim" style={{ textAlign: "center", margin: "2px 0 10px" }}>{t.navStartHint}</p><ol className="tf-nav-steps">{route.steps.map((s, i) => {
    const Ico = maneuverIcon(s.type);
    return <li key={i} className="tf-nav-step"><div className="tf-nav-step-ico"><Ico size={16} /></div><div className="tf-nav-step-body"><div className="tf-bd">{instrOf(s)}</div>{s.length > 0 && <div className="tf-cap tf-dim">{fmtKm(s.length)}</div>}</div></li>;
  })}</ol><div className="tf-nav-photo"><BuildingPhoto url={toilet.photo_url} seed={toilet.id} alt={toilet.name} /></div></>}{
    /* Live navigating */
  }{navigating && guide && !guide.arrived && <><div className="tf-nav-live"><div><div className="tf-nav-eta">{fmtMin(guide.etaS)}</div><div className="tf-sb tf-dim">{fmtDistance(guide.remaining)} {t.navRemaining}</div></div><button className="tf-btn tf-btn-tinted tf-nav-stop" onClick={stop}><Square size={16} strokeWidth={2.6} fill="currentColor" /> {t.navStop}</button></div><div className="tf-nav-photo tf-nav-photo-sm"><BuildingPhoto url={toilet.photo_url} seed={toilet.id} alt={toilet.name} /></div></>}{
    /* Arrived */
  }{navigating && guide && guide.arrived && <div className="tf-nav-arrived"><div className="tf-nav-arrived-ico"><Check size={28} strokeWidth={3} /></div><div className="tf-nav-arrived-title">{t.navArrived}</div><div className="tf-sb tf-dim">{t.navArrivedSub}</div><button className="tf-btn tf-btn-primary" style={{ marginTop: 14 }} onClick={pop}>{t.navDone}</button></div>}{status === "loading" && !navigating && <p className="tf-bd tf-dim" style={{ padding: "18px 4px" }}>{t.navLoading}</p>}{status === "nolocation" && <div style={{ padding: "14px 4px" }}><p className="tf-bd tf-dim">{t.navNoLocation}</p><button className="tf-btn tf-btn-tinted" style={{ marginTop: 8 }} onClick={() => openDirections(toilet.lat, toilet.lng, toilet.name, mode === "foot" ? "walk" : "drive", null)}>{t.navOpenMaps}</button></div>}{status === "error" && !navigating && <div style={{ padding: "14px 4px" }}><p className="tf-bd tf-dim">{t.navError}</p><button className="tf-btn tf-btn-tinted" style={{ marginTop: 8 }} onClick={() => openDirections(toilet.lat, toilet.lng, toilet.name, mode === "foot" ? "walk" : "drive", origin)}>{t.navOpenMaps}</button></div>}</div></div>;
}
export {
  NavOverlay as default
};
