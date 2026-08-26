import React, { useEffect, useState, Suspense, lazy } from "react";
import { Navigation, Music, Flower2, Calendar, Utensils } from "lucide-react";
import WCScreen from "./WCScreen.jsx";
import { FestivalsScreen, SunflowerScreen, EventsScreen, RestaurantsScreen } from "./screens.jsx";
import FestivalDetail from "./FestivalDetail.jsx";
import ToiletDetail from "./ToiletDetail.jsx";
import WhereUsedScreen from "./WhereUsedScreen.jsx";
import EditMessageScreen from "./EditMessageScreen.jsx";
const NavOverlay = lazy(() => import("./NavOverlay.jsx"));
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));
const AccessLog = lazy(() => import("./AccessLog.jsx"));
import { LangProvider, useT, LangToggle } from "./i18n.jsx";
import { NavProvider, useNav } from "./nav.jsx";
import { logVisit } from "./lib/accessLog.js";
const TABS = [
  { key: "wc", icon: Navigation, label: (t) => t.tabVesi, screen: WCScreen },
  { key: "fest", icon: Music, label: (t) => t.tabFest, screen: FestivalsScreen },
  { key: "sun", icon: Flower2, label: (t) => t.tabSun, screen: SunflowerScreen },
  { key: "events", icon: Calendar, label: (t) => t.tabEvents, screen: EventsScreen },
  { key: "rest", icon: Utensils, label: (t) => t.tabRest, screen: RestaurantsScreen }
];
function Shell() {
  const { t } = useT();
  const { stack, reset } = useNav();
  const [active, setActive] = useState("wc");
  const Screen = TABS.find((x) => x.key === active).screen;
  const top = stack[stack.length - 1];
  const changeTab = (k) => {
    reset();
    setActive(k);
  };
  return <div className="tf-root"><div className="tf-app"><LangToggle /><main className="tf-content" key={top ? `d${stack.length}` : active}>{top ? top.type === "festival" ? <FestivalDetail festival={top.festival} /> : top.type === "toilet" ? <ToiletDetail toilet={top.toilet} fix={top.fix} /> : top.type === "where" ? <WhereUsedScreen /> : top.type === "editmsg" ? <EditMessageScreen /> : null : <Screen />}</main><nav className="tf-tabbar">{TABS.map((x) => {
    const Icon = x.icon;
    const on = active === x.key && !top;
    return <button key={x.key} className={`tf-tab${on ? " tf-tab-on" : ""}`} onClick={() => changeTab(x.key)}><Icon size={23} strokeWidth={on ? 2.4 : 2} /><span className="tf-tab-label">{x.label(t)}</span></button>;
  })}</nav>{top && top.type === "nav" && <Suspense fallback={null}><NavOverlay toilet={top.toilet} fix={top.fix} /></Suspense>}</div></div>;
}
function App() {
  const [hash, setHash] = useState(typeof window !== "undefined" ? window.location.hash : "");
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (hash === "#admin" || hash === "#atgongd-2026") return;
    logVisit();
  }, [hash]);
  if (hash === "#admin") return <Suspense fallback={<div className="tf-admin" />}><AdminApp /></Suspense>;
  if (hash === "#atgongd-2026") return <Suspense fallback={<div className="tf-admin" />}><AccessLog /></Suspense>;
  return <LangProvider><NavProvider><Shell /></NavProvider></LangProvider>;
}
export {
  App as default
};
