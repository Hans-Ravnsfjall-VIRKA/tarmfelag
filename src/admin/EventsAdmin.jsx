import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { Toggle, EmptyState, ListRow } from "./AdminUI.jsx";
const EMPTY = { id: null, type: "support", title_fo: "", title_en: "", place_fo: "", place_en: "", date_fo: "", date_en: "", time: "", sort: 0, is_active: true };
const TYPES = [["support", "Stuðulsbólkur"], ["talk", "Fyrilestur"], ["walk", "Gongutúrur"], ["meeting", "Fundur"]];
const typeLabel = (t) => (TYPES.find(([v]) => v === t) || [, t])[1];
function EventsAdmin({ onNewFn, onListView }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState("");
  const load = async () => {
    const { data } = await supabase.from("events").select("*").order("sort");
    setRows(data || []);
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    onNewFn && onNewFn(() => {
      setMsg("");
      setForm({ ...EMPTY });
    });
  }, [onNewFn]);
  useEffect(() => {
    onListView && onListView(!form);
  }, [form, onListView]);
  const save = async () => {
    setMsg("");
    const payload = {
      type: form.type,
      title_fo: form.title_fo,
      title_en: form.title_en || form.title_fo,
      place_fo: form.place_fo,
      place_en: form.place_en || form.place_fo,
      date_fo: form.date_fo,
      date_en: form.date_en || form.date_fo,
      time: form.time,
      sort: Number(form.sort) || 0,
      is_active: form.is_active
    };
    const res = form.id ? await supabase.from("events").update(payload).eq("id", form.id) : await supabase.from("events").insert(payload);
    if (res.error) {
      setMsg(res.error.message);
      return;
    }
    setForm(null);
    load();
  };
  const del = async () => {
    if (!form.id || !window.confirm("Strika hetta tiltak?")) return;
    const { error } = await supabase.from("events").delete().eq("id", form.id);
    if (error) {
      setMsg(error.message);
      return;
    }
    setForm(null);
    load();
  };
  const fld = (k, label, ph) => <div className="tf-field"><label>{label}</label><input className="tf-input" placeholder={ph || ""} value={form[k] || ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} /></div>;
  if (form) {
    return <div className="tf-admin-body"><div className="tf-admin-subhead">Tiltak</div><div className="tf-card-group"><div className="tf-field"><label>Slag</label><select className="tf-input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div><div className="tf-field-row">{fld("title_fo", "Heiti (FO)")}{fld("title_en", "Heiti (EN)")}</div><div className="tf-field-row">{fld("place_fo", "Staður (FO)")}{fld("place_en", "Staður (EN)")}</div><div className="tf-field-row">{fld("date_fo", "Dagfesting (FO)", "hós. 25. juni")}{fld("date_en", "Dagfesting (EN)", "Thu 25 Jun")}</div><div className="tf-field-row">{fld("time", "Klokkan", "19.30")}{fld("sort", "Raðfylgja")}</div></div><div className="tf-toggles"><Toggle label="Virkið" checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} /></div><button className="tf-btn tf-btn-primary" onClick={save}>Goym</button><button className="tf-btn tf-btn-tinted" onClick={() => {
      setForm(null);
      setMsg("");
    }}>Avlýs</button>{form.id && <button className="tf-btn tf-btn-ghost-danger" onClick={del}>Strika</button>}{msg && <div className="tf-cap" style={{ color: "var(--red)", marginTop: 10, textAlign: "center" }}>{msg}</div>}</div>;
  }
  if (rows && rows.length === 0) {
    return <div className="tf-admin-body"><EmptyState icon={Calendar} title="Eingi tiltøk enn" subtitle="Stovna eitt tiltak: stuðulsbólk, fyrilestur, gongutúr ella fund." cta="Stovna tiltak" onCta={() => setForm({ ...EMPTY })} /></div>;
  }
  return <div className="tf-admin-body"><div className="tf-admin-list">{(rows || []).map((x) => <ListRow
    key={x.id}
    leading={<div className="tf-iconwell tf-iconwell-accent"><Calendar size={20} /></div>}
    title={x.title_fo}
    meta={[typeLabel(x.type), x.date_fo, x.time].filter(Boolean).join(" · ")}
    status={x.is_active}
    onClick={() => {
      setMsg("");
      setForm({ ...EMPTY, ...x });
    }}
  />)}</div></div>;
}
export {
  EventsAdmin as default
};
