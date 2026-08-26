import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Phone,
  Calendar,
  Users,
  Flower2,
  Music,
  Utensils,
  Wheat,
  Leaf,
  Info,
  Footprints,
  Mic,
  Heart,
  MessageSquareText,
  ChevronRight
} from "lucide-react";
import { Badge, Row, ListGroup, LargeTitle } from "./ui.jsx";
import { useT, pick } from "./i18n.jsx";
import { useNav } from "./nav.jsx";
import { FESTIVALS, EVENTS, RESTAURANTS, ME, DEFAULT_STAFF } from "./data.js";
import { getFestivals, getEvents } from "./lib/content.js";
function FestivalsScreen() {
  const { t, lang } = useT();
  const { push } = useNav();
  const [festivals, setFestivals] = useState(null);
  useEffect(() => {
    let a = true;
    getFestivals().then((d) => a && setFestivals(d));
    return () => {
      a = false;
    };
  }, []);
  return <div className="tf-screen"><LargeTitle title={t.festTitle} /><p className="tf-bd tf-dim tf-intro">{t.festIntro}</p>{(festivals || []).map((f) => <article
    key={f.id}
    className="tf-card tf-link"
    role="button"
    tabIndex={0}
    onClick={() => push({ type: "festival", festival: f })}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") push({ type: "festival", festival: f });
    }}
  ><div className="tf-link-body"><div className="tf-card-head"><div className="tf-iconwell tf-iconwell-accent"><Music size={20} /></div><div><div className="tf-hl">{f.name}</div><div className="tf-sb tf-dim">{f.place} · {f.date}</div></div></div><div className="tf-badgerow"><Badge icon={MapPin} tone="accent">{pick(lang, f.toilets)}</Badge>{f.quiet && <Badge icon={Leaf}>{t.quiet}</Badge>}{f.ownFood && <Badge icon={Utensils}>{t.ownFood}</Badge>}{f.firstAid && <Badge icon={Heart}>{t.firstAid}</Badge>}</div></div><ChevronRight size={20} className="tf-chevron" /></article>)}<div style={{ height: 24 }} /></div>;
}
function SunflowerScreen() {
  const { t, lang } = useT();
  const { push } = useNav();
  const staffMsg = typeof localStorage !== "undefined" && localStorage.getItem("tf:staffMsg") || DEFAULT_STAFF;
  const cardName = typeof localStorage !== "undefined" && localStorage.getItem("tf:cardName") || "";
  return <div className="tf-screen"><LargeTitle title={t.sunTitle} /><div className="tf-flower-card" role="button" tabIndex={0} onClick={() => push({ type: "editmsg" })}><div className="tf-flower-emblem"><Flower2 size={30} strokeWidth={2} /></div><div className="tf-flower-scheme">{t.sunTitle} · {t.sunScheme}</div><div className={cardName ? "tf-flower-name" : "tf-flower-name tf-flower-name-empty"}>{cardName || t.sunYourName}</div><div className="tf-flower-note">{pick(lang, ME.note)}</div></div><div className="tf-staffmsg"><div className="tf-cap tf-dim" style={{ textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>{t.sunStaffPrompt}</div><p className="tf-bd" style={{ fontWeight: 600, margin: "0 0 8px" }}>{staffMsg}</p><p className="tf-sb tf-dim" style={{ margin: 0 }}>I have a hidden medical condition and may need urgent access to a toilet. Thank you for your understanding.</p></div><ListGroup header={t.sunAboutHead} footer={t.sunAboutBody}><Row leading={<div className="tf-iconwell"><Info size={20} /></div>} title={t.sunWhere} onClick={() => push({ type: "where" })} /><Row leading={<div className="tf-iconwell"><MessageSquareText size={20} /></div>} title={t.sunEdit} onClick={() => push({ type: "editmsg" })} last /></ListGroup></div>;
}
const eventIcon = { support: Users, talk: Mic, walk: Footprints, meeting: Calendar };
function EventsScreen() {
  const { t, lang } = useT();
  const [events, setEvents] = useState(null);
  useEffect(() => {
    let a = true;
    getEvents().then((d) => a && setEvents(d));
    return () => {
      a = false;
    };
  }, []);
  const list = events || [];
  const typeLabel = { support: t.evtSupport, talk: t.evtTalk, walk: t.evtWalk, meeting: t.evtMeeting };
  return <div className="tf-screen"><LargeTitle title={t.eventsTitle} /><ListGroup header={t.eventsFrom}>{list.map((e, i) => {
    const Icon = eventIcon[e.type] || Calendar;
    return <Row
      key={e.id}
      last={i === list.length - 1}
      leading={<div className="tf-iconwell tf-iconwell-accent"><Icon size={20} /></div>}
      title={pick(lang, e.title)}
      subtitle={`${pick(lang, e.date)} · kl. ${e.time} · ${pick(lang, e.place)}`}
      trailing={<span className="tf-pill">{typeLabel[e.type]}</span>}
    />;
  })}</ListGroup><button className="tf-btn tf-btn-tinted" style={{ margin: "4px 16px 0" }}>{t.signUp}</button></div>;
}
function RestaurantsScreen() {
  const { t } = useT();
  const [filter, setFilter] = useState("all");
  const list = useMemo(() => {
    if (filter === "gluten") return RESTAURANTS.filter((r) => r.glutenFree);
    if (filter === "fodmap") return RESTAURANTS.filter((r) => r.fodmap);
    return RESTAURANTS;
  }, [filter]);
  const segs = [["all", t.fAll], ["gluten", t.fGluten], ["fodmap", t.fFodmap]];
  return <div className="tf-screen"><LargeTitle title={t.restTitle} /><div className="tf-seg">{segs.map(([k, label]) => <button key={k} className={`tf-seg-item${filter === k ? " tf-seg-on" : ""}`} onClick={() => setFilter(k)}>{label}</button>)}</div><ListGroup footer={t.restNote}>{list.map((r, i) => <Row
    key={r.id}
    last={i === list.length - 1}
    leading={<div className="tf-iconwell tf-iconwell-accent"><Utensils size={20} /></div>}
    title={r.name}
    subtitle={<span className="tf-badgerow" style={{ marginTop: 4 }}>{r.glutenFree && <Badge icon={Wheat}>{t.aGluten}</Badge>}{r.dairyFree && <Badge icon={Leaf}>{t.aDairy}</Badge>}{r.fodmap && <Badge tone="accent">{t.aFodmap}</Badge>}{r.callAhead && <Badge icon={Phone}>{t.aCall}</Badge>}</span>}
    trailing={<Phone size={18} className="tf-chev" />}
  />)}</ListGroup></div>;
}
export {
  EventsScreen,
  FestivalsScreen,
  RestaurantsScreen,
  SunflowerScreen
};
