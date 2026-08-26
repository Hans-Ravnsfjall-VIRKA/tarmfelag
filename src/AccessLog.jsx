import React, { useEffect, useState } from "react";
import { Flower2, RotateCw, LogOut, MapPin } from "lucide-react";
import { supabase, hasSupabase } from "./lib/supabase.js";
import { getAccessLog } from "./lib/accessLog.js";
const fmt = (s) => {
  try {
    const d = new Date(s);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  } catch {
    return "";
  }
};
function AccessLog() {
  const [session, setSession] = useState(void 0);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [rows, setRows] = useState(null);
  useEffect(() => {
    if (!hasSupabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  const load = async () => {
    setRows(await getAccessLog());
  };
  useEffect(() => {
    if (session) load();
  }, [session]);
  const signIn = async () => {
    setAuthErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setAuthErr(error.message);
  };
  if (session === void 0) return <div className="tf-admin"><div className="tf-admin-loading">…</div></div>;
  if (!session) {
    return <div className="tf-admin tf-admin-login"><div className="tf-login"><div className="tf-login-emblem"><Flower2 size={28} strokeWidth={2} /></div><h1 className="tf-login-title">Vitjanir</h1><p className="tf-login-sub">Atgongd kravd</p><div className="tf-login-fields"><input className="tf-login-input" placeholder="Teldupostur" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /><input className="tf-login-input" type="password" placeholder="Loyniorð" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && signIn()} /></div><button className="tf-btn tf-btn-primary" onClick={signIn}>Rita inn</button>{authErr && <div className="tf-login-err">{authErr}</div>}</div></div>;
  }
  const visits = (rows || []).filter((r) => r.kind !== "login").length;
  const logins = (rows || []).filter((r) => r.kind === "login").length;
  const cset = /* @__PURE__ */ new Set();
  for (const r of rows || []) {
    const k = r.client_id || r.ip;
    if (k) cset.add(k);
  }
  const uniqueClients = cset.size;
  return <div className="tf-admin"><header className="tf-admin-bar"><div className="tf-admin-headtext"><h1 className="tf-admin-title">Vitjanir</h1><p className="tf-admin-intro">Tá ið fólk vitja appina, og hvaðani í heiminum. Innritanir í stjórnaramboðið eru eisini merktar.</p></div><div className="tf-admin-actions"><button className="tf-admin-iconbtn" onClick={load} aria-label="Endurles"><RotateCw size={18} /></button><button className="tf-admin-iconbtn" onClick={() => supabase.auth.signOut()} aria-label="Rita út"><LogOut size={18} /></button></div></header><div className="tf-admin-scroll"><div className="tf-admin-body">{rows === null ? <div className="tf-admin-count" style={{ padding: "24px 4px" }}>Innlesur…</div> : rows.length === 0 ? <div className="tf-admin-noresult">Eingin vitjan enn.</div> : <><div className="tf-log-stats"><div className="tf-log-stat"><div className="n">{uniqueClients}</div><div className="l">einstakir vitjandi</div></div><div className="tf-log-stat"><div className="n">{visits}</div><div className="l">vitjanir í alt</div></div><div className="tf-log-stat"><div className="n">{logins}</div><div className="l">innritanir</div></div></div><div className="tf-admin-count">{rows.length} skrásetingar</div><div className="tf-admin-list">{rows.map((r) => <div key={r.id} className="tf-log-row"><div className="tf-log-main"><div className="tf-log-when">{fmt(r.created_at)}</div><div className="tf-log-where"><MapPin size={12} /> {[r.city, r.country].filter(Boolean).join(", ") || "Ókend støð"}</div>{r.email && <div className="tf-log-email">{r.email}</div>}</div><div className="tf-log-side"><span className={`tf-log-kind${r.kind === "login" ? " login" : ""}`}>{r.kind === "login" ? "Innritan" : "Vitjan"}</span>{r.ip && <div className="tf-log-ip">{r.ip}</div>}</div></div>)}</div></>}</div></div></div>;
}
export {
  AccessLog as default
};
