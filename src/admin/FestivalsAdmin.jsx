import React, { useEffect, useState } from "react";
import { Music, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import AddressAutocomplete from "../AddressAutocomplete.jsx";
import { Toggle, EmptyState, ListRow } from "./AdminUI.jsx";
import ImageUpload from "./ImageUpload.jsx";
import LocationButton from "./LocationButton.jsx";
const F_EMPTY = { id: null, name: "", place: "", date_text: "", toilets_fo: "", toilets_en: "", quiet: false, own_food: false, first_aid: false, sort: 0, is_active: true };
const T_EMPTY = { id: null, name_fo: "", name_en: "", address: "", lat: "", lng: "", photo_url: "", is_accessible: false, sort: 0 };
function FestivalsAdmin({ onNewFn, onListView }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(null);
  const [toilets, setToilets] = useState([]);
  const [tForm, setTForm] = useState(null);
  const [msg, setMsg] = useState("");
  const load = async () => {
    const { data } = await supabase.from("festivals").select("*").order("sort");
    setRows(data || []);
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    onNewFn && onNewFn(() => openFestival(null));
  }, [onNewFn]);
  useEffect(() => {
    onListView && onListView(!form && !tForm);
  }, [form, tForm, onListView]);
  const loadToilets = async (festivalId) => {
    if (!festivalId) {
      setToilets([]);
      return;
    }
    const { data } = await supabase.from("festival_toilets").select("*").eq("festival_id", festivalId).order("sort");
    setToilets(data || []);
  };
  const openFestival = async (f) => {
    setMsg("");
    setTForm(null);
    setForm(f ? { ...F_EMPTY, ...f } : { ...F_EMPTY });
    await loadToilets(f ? f.id : null);
  };
  const saveFestival = async () => {
    setMsg("");
    const payload = {
      name: form.name,
      place: form.place || null,
      date_text: form.date_text || null,
      toilets_fo: form.toilets_fo || null,
      toilets_en: form.toilets_en || form.toilets_fo || null,
      quiet: form.quiet,
      own_food: form.own_food,
      first_aid: form.first_aid,
      sort: Number(form.sort) || 0,
      is_active: form.is_active
    };
    if (form.id) {
      const { error } = await supabase.from("festivals").update(payload).eq("id", form.id);
      if (error) {
        setMsg(error.message);
        return;
      }
      setForm(null);
      load();
    } else {
      const { data, error } = await supabase.from("festivals").insert(payload).select().single();
      if (error) {
        setMsg(error.message);
        return;
      }
      setForm({ ...F_EMPTY, ...data });
      loadToilets(data.id);
      load();
      setMsg("Goymt. Nú kanst tú leggja vesi afturat.");
    }
  };
  const delFestival = async () => {
    if (!form.id || !window.confirm("Strika henda festivalin og øll vesi á honum?")) return;
    const { error } = await supabase.from("festivals").delete().eq("id", form.id);
    if (error) {
      setMsg(error.message);
      return;
    }
    setForm(null);
    load();
  };
  const saveToilet = async () => {
    const lat = parseFloat(tForm.lat);
    const lng = parseFloat(tForm.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setMsg("Breiddarstig/longdarstig vanta á vesinum.");
      return;
    }
    const payload = { festival_id: form.id, name_fo: tForm.name_fo, name_en: tForm.name_en || tForm.name_fo, lat, lng, photo_url: tForm.photo_url || null, is_accessible: tForm.is_accessible, sort: Number(tForm.sort) || 0 };
    const res = tForm.id ? await supabase.from("festival_toilets").update(payload).eq("id", tForm.id) : await supabase.from("festival_toilets").insert(payload);
    if (res.error) {
      setMsg(res.error.message);
      return;
    }
    setTForm(null);
    loadToilets(form.id);
  };
  const delToilet = async () => {
    if (!tForm.id || !window.confirm("Strika hetta vesi?")) return;
    const { error } = await supabase.from("festival_toilets").delete().eq("id", tForm.id);
    if (error) {
      setMsg(error.message);
      return;
    }
    setTForm(null);
    loadToilets(form.id);
  };
  if (form && tForm) {
    return <div className="tf-admin-body"><div className="tf-admin-subhead">{form.name} · vesi</div><div className="tf-card-group"><div className="tf-field-row"><div className="tf-field"><label>Navn (FO)</label><input className="tf-input" value={tForm.name_fo} onChange={(e) => setTForm((f) => ({ ...f, name_fo: e.target.value }))} /></div><div className="tf-field"><label>Navn (EN)</label><input className="tf-input" value={tForm.name_en} onChange={(e) => setTForm((f) => ({ ...f, name_en: e.target.value }))} /></div></div><div className="tf-field"><label>Bústaður (leita)</label><AddressAutocomplete value={tForm.address} placeholder="Skriva bústað…" onPick={(p) => setTForm((f) => ({ ...f, address: p.address ?? f.address, lat: p.lat != null ? String(p.lat) : f.lat, lng: p.lng != null ? String(p.lng) : f.lng }))} /></div><LocationButton onLocate={({ lat, lng }) => setTForm((f) => ({ ...f, lat: String(lat), lng: String(lng) }))} /><div className="tf-field-row"><div className="tf-field"><label>Breiddargráð</label><input className="tf-input" inputMode="decimal" value={tForm.lat} onChange={(e) => setTForm((f) => ({ ...f, lat: e.target.value }))} /></div><div className="tf-field"><label>Longdargráð</label><input className="tf-input" inputMode="decimal" value={tForm.lng} onChange={(e) => setTForm((f) => ({ ...f, lng: e.target.value }))} /></div></div></div><div className="tf-admin-subhead">Mynd</div><ImageUpload url={tForm.photo_url} seed={tForm.id || tForm.name_fo || "new"} onChange={(u) => setTForm((f) => ({ ...f, photo_url: u }))} /><div className="tf-toggles"><Toggle label="Atkomuligt" checked={tForm.is_accessible} onChange={(v) => setTForm((f) => ({ ...f, is_accessible: v }))} /></div><button className="tf-btn tf-btn-primary" onClick={saveToilet}>Goym vesi</button><button className="tf-btn tf-btn-tinted" onClick={() => {
      setTForm(null);
      setMsg("");
    }}>Avlýs</button>{tForm.id && <button className="tf-btn tf-btn-ghost-danger" onClick={delToilet}>Strika vesi</button>}{msg && <div className="tf-cap" style={{ color: "var(--red)", marginTop: 10, textAlign: "center" }}>{msg}</div>}</div>;
  }
  if (form) {
    return <div className="tf-admin-body"><div className="tf-admin-subhead">Festivalur</div><div className="tf-card-group"><div className="tf-field"><label>Navn</label><input className="tf-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div><div className="tf-field-row"><div className="tf-field"><label>Staður</label><input className="tf-input" value={form.place} onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))} /></div><div className="tf-field"><label>Dato</label><input className="tf-input" value={form.date_text} onChange={(e) => setForm((f) => ({ ...f, date_text: e.target.value }))} /></div></div><div className="tf-field-row"><div className="tf-field"><label>Vesi-stutt (FO)</label><input className="tf-input" value={form.toilets_fo} onChange={(e) => setForm((f) => ({ ...f, toilets_fo: e.target.value }))} /></div><div className="tf-field"><label>Vesi-stutt (EN)</label><input className="tf-input" value={form.toilets_en} onChange={(e) => setForm((f) => ({ ...f, toilets_en: e.target.value }))} /></div></div></div><div className="tf-toggles"><Toggle label="Friðarrúm" checked={form.quiet} onChange={(v) => setForm((f) => ({ ...f, quiet: v }))} /><Toggle label="Loyvt at hava egnan mat við" checked={form.own_food} onChange={(v) => setForm((f) => ({ ...f, own_food: v }))} /><Toggle label="Fyrstahjálp" checked={form.first_aid} onChange={(v) => setForm((f) => ({ ...f, first_aid: v }))} /><Toggle label="Virkið" checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} /></div><button className="tf-btn tf-btn-primary" onClick={saveFestival}>Goym festival</button><button className="tf-btn tf-btn-tinted" onClick={() => {
      setForm(null);
      setMsg("");
    }}>Aftur</button>{form.id && <button className="tf-btn tf-btn-ghost-danger" onClick={delFestival}>Strika festival</button>}{msg && <div className="tf-cap tf-dim" style={{ marginTop: 10, textAlign: "center" }}>{msg}</div>}{form.id && <><div className="tf-admin-subhead">Vesi á hesum festivali</div>{toilets.length > 0 && <div className="tf-admin-list">{toilets.map((x) => <ListRow
      key={x.id}
      leading={<div className="tf-iconwell tf-iconwell-accent"><MapPin size={19} /></div>}
      title={x.name_fo}
      meta={`${x.lat}, ${x.lng}${x.is_accessible ? " · atkomuligt" : ""}`}
      onClick={() => setTForm({ ...T_EMPTY, ...x, lat: String(x.lat ?? ""), lng: String(x.lng ?? "") })}
    />)}</div>}<button className="tf-btn tf-btn-tinted" onClick={() => setTForm({ ...T_EMPTY, sort: toilets.length })}>+ Legg vesi afturat</button></>}</div>;
  }
  if (rows && rows.length === 0) {
    return <div className="tf-admin-body"><EmptyState icon={Music} title="Eingin festivalur enn" subtitle="Stovna ein festival og legg síðani vesi afturat." cta="Stovna festival" onCta={() => openFestival(null)} /></div>;
  }
  return <div className="tf-admin-body"><div className="tf-admin-list">{(rows || []).map((x) => <ListRow
    key={x.id}
    leading={<div className="tf-iconwell tf-iconwell-accent"><Music size={20} /></div>}
    title={x.name}
    meta={[x.place, x.date_text].filter(Boolean).join(" · ")}
    status={x.is_active}
    onClick={() => openFestival(x)}
  />)}</div></div>;
}
export {
  FestivalsAdmin as default
};
