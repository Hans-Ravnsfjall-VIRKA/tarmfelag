import React, { useEffect, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import AddressAutocomplete from "../AddressAutocomplete.jsx";
import BuildingPhoto from "../BuildingPhoto.jsx";
import { Toggle, EmptyState, ListRow } from "./AdminUI.jsx";
import ImageUpload from "./ImageUpload.jsx";
import LocationButton from "./LocationButton.jsx";
import HoursEditor from "./HoursEditor.jsx";
import { defaultHours, loadToiletHours, hoursToRows } from "../lib/toiletHours.js";
const EMPTY = { id: null, name: "", description: "", address: "", municipality: "", lat: "", lng: "", photo_url: "", is_accessible: false, is_free: true, is_active: true };
function ToiletsAdmin({ onNewFn, onListView }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(null);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    const { data } = await supabase.from("toilets").select("*").order("name");
    setRows(data || []);
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    onNewFn && onNewFn(() => {
      setMsg("");
      setForm({ ...EMPTY, hours: defaultHours() });
    });
  }, [onNewFn]);
  useEffect(() => {
    onListView && onListView(!form);
  }, [form, onListView]);
  const openEdit = async (x) => {
    setMsg("");
    const hours = await loadToiletHours(x.id);
    setForm({ ...EMPTY, ...x, lat: String(x.lat), lng: String(x.lng), hours });
  };
  const save = async () => {
    setBusy(true);
    setMsg("");
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setBusy(false);
      setMsg("Breiddarstig/longdarstig vanta ella eru skeiv.");
      return;
    }
    const payload = {
      name: form.name,
      description: form.description || null,
      address: form.address || null,
      municipality: form.municipality || null,
      lat,
      lng,
      photo_url: form.photo_url || null,
      is_accessible: form.is_accessible,
      is_free: form.is_free,
      is_active: form.is_active
    };
    let id = form.id;
    if (id) {
      const { error } = await supabase.from("toilets").update(payload).eq("id", id);
      if (error) {
        setBusy(false);
        setMsg(error.message);
        return;
      }
    } else {
      const { data, error } = await supabase.from("toilets").insert(payload).select("id").single();
      if (error) {
        setBusy(false);
        setMsg(error.message);
        return;
      }
      id = data.id;
    }
    const { error: hErr } = await supabase.rpc("replace_toilet_hours", { p_toilet_id: id, p_hours: hoursToRows(form.hours) });
    setBusy(false);
    if (hErr) {
      setMsg("Vesið er goymt, men tíðirnar kundu ikki goymast: " + hErr.message);
      load();
      return;
    }
    setForm(null);
    load();
  };
  const del = async () => {
    if (!form.id || !window.confirm("Strika hetta vesi?")) return;
    const { error } = await supabase.from("toilets").delete().eq("id", form.id);
    if (error) {
      setMsg(error.message);
      return;
    }
    setForm(null);
    load();
  };
  if (form) {
    return <div className="tf-admin-body"><div className="tf-admin-subhead">Vesi</div><div className="tf-card-group"><div className="tf-field"><label>Navn</label><input className="tf-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div><div className="tf-field"><label>Bústaður (leita)</label><AddressAutocomplete value={form.address} placeholder="Skriva bústað…" onPick={(p) => setForm((f) => ({ ...f, ...p }))} /></div><LocationButton onLocate={({ lat, lng, town }) => setForm((f) => ({ ...f, lat: String(lat), lng: String(lng), municipality: f.municipality || town || "" }))} /><div className="tf-field-row"><div className="tf-field"><label>Breiddargráð</label><input className="tf-input" inputMode="decimal" value={form.lat} onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))} /></div><div className="tf-field"><label>Longdargráð</label><input className="tf-input" inputMode="decimal" value={form.lng} onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))} /></div></div><div className="tf-field"><label>Kommuna</label><input className="tf-input" value={form.municipality} onChange={(e) => setForm((f) => ({ ...f, municipality: e.target.value }))} /></div><div className="tf-field"><label>Lýsing</label><textarea className="tf-input" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div></div><div className="tf-admin-subhead">Mynd av bygninginum</div><ImageUpload url={form.photo_url} seed={form.id || form.name || "new"} onChange={(u) => setForm((f) => ({ ...f, photo_url: u }))} /><div className="tf-admin-subhead">Opnunartíðir</div><HoursEditor hours={form.hours} onChange={(h) => setForm((f) => ({ ...f, hours: h }))} /><div className="tf-admin-subhead">Støða</div><div className="tf-toggles"><Toggle label="Atkomuligt" checked={form.is_accessible} onChange={(v) => setForm((f) => ({ ...f, is_accessible: v }))} /><Toggle label="Ókeypis" checked={form.is_free} onChange={(v) => setForm((f) => ({ ...f, is_free: v }))} /><Toggle label="Virkið (víst í appini)" checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} /></div><button className="tf-btn tf-btn-primary" disabled={busy} onClick={save}>{busy ? "Goymir…" : "Goym"}</button><button className="tf-btn tf-btn-tinted" onClick={() => {
      setForm(null);
      setMsg("");
    }}>Avlýs</button>{form.id && <button className="tf-btn tf-btn-ghost-danger" onClick={del}>Strika vesi</button>}{msg && <div className="tf-cap" style={{ color: "var(--red)", marginTop: 10, textAlign: "center" }}>{msg}</div>}</div>;
  }
  if (rows && rows.length === 0) {
    return <div className="tf-admin-body"><EmptyState icon={MapPin} title="Eingi vesi enn" subtitle="Legg fyrsta vesið afturat við bústaði, mynd og upplatingartíðum." cta="Stovna fyrsta vesið" onCta={() => setForm({ ...EMPTY, hours: defaultHours() })} /></div>;
  }
  if (!rows) {
    return <div className="tf-admin-body"><div className="tf-admin-count" style={{ padding: "24px 4px" }}>Innlesur…</div></div>;
  }
  const shown = (rows || []).filter((x) => {
    if (!q.trim()) return true;
    const hay = `${x.name} ${x.municipality || ""}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });
  return <div className="tf-admin-body"><div className="tf-admin-search"><Search size={17} /><input placeholder="Leita eftir navni ella bygd/býi…" value={q} onChange={(e) => setQ(e.target.value)} /></div><div className="tf-admin-count">{shown.length} vesi{q.trim() ? ` av ${rows.length}` : ""}</div>{shown.length === 0 ? <div className="tf-admin-noresult">Einki vesi samsvarar leitingini.</div> : <div className="tf-admin-list">{shown.map((x) => <ListRow
    key={x.id}
    leading={<div className="tf-thumb"><BuildingPhoto url={x.photo_url} seed={x.id} alt="" /></div>}
    title={x.name}
    meta={[x.municipality, `${x.lat?.toFixed ? x.lat.toFixed(4) : x.lat}, ${x.lng?.toFixed ? x.lng.toFixed(4) : x.lng}`].filter(Boolean).join(" · ")}
    status={x.is_active}
    onClick={() => openEdit(x)}
  />)}</div>}</div>;
}
export {
  ToiletsAdmin as default
};
