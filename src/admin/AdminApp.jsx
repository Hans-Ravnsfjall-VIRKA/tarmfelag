import React, { useEffect, useRef, useState } from "react";
import { MapPin, Music, Calendar, Star, TriangleAlert, Flower2, Plus, LogOut } from "lucide-react";
import { supabase, hasSupabase } from "../lib/supabase.js";
import ToiletsAdmin from "./ToiletsAdmin.jsx";
import FestivalsAdmin from "./FestivalsAdmin.jsx";
import EventsAdmin from "./EventsAdmin.jsx";
import ReviewsAdmin from "./ReviewsAdmin.jsx";
import ReportsAdmin from "./ReportsAdmin.jsx";
import { logLogin } from "../lib/accessLog.js";
const TABS = [
  { key: "vesi", label: "Vesi", icon: MapPin, Comp: ToiletsAdmin, intro: "Stovna, rætta og strika vesi við bústaði, mynd og upplatingartíðum." },
  { key: "fest", label: "Festivalar", icon: Music, Comp: FestivalsAdmin, intro: "Umsit festivalar og tey vesi, sum hoyra til." },
  { key: "tiltok", label: "Tiltøk", icon: Calendar, Comp: EventsAdmin, intro: "Skráset tiltøk hjá Tarmfelagnum." },
  { key: "ummaeli", label: "Ummæli", icon: Star, Comp: ReviewsAdmin, intro: "Les, rætta og fjal ummæli, sum brúkarar hava skrivað." },
  { key: "frabod", label: "Fráboðanir", icon: TriangleAlert, Comp: ReportsAdmin, intro: "Hygg at fráboðanum frá brúkarum og avgreið tær." }
];
function AdminApp() {
  const [session, setSession] = useState(void 0);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [tab, setTab] = useState("vesi");
  const [canCreate, setCanCreate] = useState(true);
  const newFn = useRef(() => {
  });
  useEffect(() => {
    if (!hasSupabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  const signIn = async () => {
    setAuthErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setAuthErr(error.message);
    else logLogin(email);
  };
  if (session === void 0) return <div className="tf-admin"><div className="tf-admin-loading">…</div></div>;
  if (!session) {
    return <div className="tf-admin tf-admin-login"><div className="tf-login"><div className="tf-login-emblem"><Flower2 size={28} strokeWidth={2} /></div><h1 className="tf-login-title">Tarmfelagið</h1><p className="tf-login-sub">Stjórnaramboð</p><div className="tf-login-fields"><input className="tf-login-input" placeholder="Teldupostur" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /><input className="tf-login-input" type="password" placeholder="Loyniorð" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && signIn()} /></div><button className="tf-btn tf-btn-primary" onClick={signIn}>Rita inn</button>{authErr && <div className="tf-login-err">{authErr}</div>}</div></div>;
  }
  const active = TABS.find((x) => x.key === tab);
  const Comp = active.Comp;
  return <div className="tf-admin"><header className="tf-admin-bar"><div className="tf-admin-headtext"><h1 className="tf-admin-title">{active.label}</h1><p className="tf-admin-intro">{active.intro}</p></div><div className="tf-admin-actions"><button className="tf-admin-iconbtn" onClick={() => supabase.auth.signOut()} aria-label="Rita út"><LogOut size={18} /></button>{canCreate && <button className="tf-admin-add" onClick={() => newFn.current && newFn.current()}><Plus size={18} strokeWidth={2.8} /><span>Nýtt</span></button>}</div></header><div className="tf-admin-scroll" key={tab}><Comp onNewFn={(fn) => {
    newFn.current = fn;
  }} onListView={setCanCreate} /></div><nav className="tf-admin-tabbar">{TABS.map((x) => {
    const Icon = x.icon;
    const on = tab === x.key;
    return <button key={x.key} className={`tf-admin-tabitem${on ? " on" : ""}`} onClick={() => setTab(x.key)}><Icon size={22} strokeWidth={on ? 2.4 : 2} /><span>{x.label}</span></button>;
  })}</nav></div>;
}
export {
  AdminApp as default
};
