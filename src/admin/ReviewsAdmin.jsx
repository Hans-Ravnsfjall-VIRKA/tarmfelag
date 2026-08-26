import React, { useEffect, useState } from "react";
import { Star, Search, ChevronLeft } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { Stars } from "../ui.jsx";
import BuildingPhoto from "../BuildingPhoto.jsx";
import { Toggle, EmptyState, ListRow } from "./AdminUI.jsx";
import { adminGetAllReviews, adminUpdateReview, adminDeleteReview } from "../lib/reviews.js";
const fmtDate = (s) => {
  try {
    const d = new Date(s);
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
  } catch {
    return "";
  }
};
function ReviewsAdmin({ onNewFn, onListView }) {
  const [rows, setRows] = useState(null);
  const [meta, setMeta] = useState({});
  const [openKey, setOpenKey] = useState(null);
  const [form, setForm] = useState(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [view, setView] = useState("byToilet");
  const [sort, setSort] = useState("new");
  const load = async () => {
    const data = await adminGetAllReviews();
    setRows(data);
    const map = {};
    const { data: ts } = await supabase.from("toilets").select("id,name,photo_url");
    (ts || []).forEach((t) => {
      map[String(t.id)] = { name: t.name, photo: t.photo_url };
    });
    const { data: fts } = await supabase.from("festival_toilets").select("*");
    (fts || []).forEach((t) => {
      map[String(t.id)] = { name: t.name_fo || t.name || t.name_en || "Festivalvesi", photo: null };
    });
    setMeta(map);
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    onNewFn && onNewFn(() => {
    });
    onListView && onListView(false);
  }, [onNewFn, onListView]);
  const name = (k) => meta[k] && meta[k].name || "Vesi";
  const photo = (k) => meta[k] && meta[k].photo;
  const save = async () => {
    setBusy(true);
    setMsg("");
    const res = await adminUpdateReview(form.id, {
      rating: form.rating,
      comment: form.comment || null,
      author: form.author || null,
      is_hidden: form.is_hidden
    });
    setBusy(false);
    if (!res.ok) {
      setMsg(res.error?.message || "Okkurt gekk galið.");
      return;
    }
    setForm(null);
    await load();
  };
  const del = async () => {
    if (!window.confirm("Strika hetta ummælið heilt?")) return;
    const res = await adminDeleteReview(form.id);
    if (!res.ok) {
      setMsg(res.error?.message || "Okkurt brást.");
      return;
    }
    setForm(null);
    await load();
  };
  const toggleHidden = async (r) => {
    await adminUpdateReview(r.id, { is_hidden: !r.is_hidden });
    await load();
  };
  if (form) {
    return <div className="tf-admin-body"><button className="tf-backbtn" onClick={() => {
      setForm(null);
      setMsg("");
    }}><ChevronLeft size={18} /> {name(form.toilet_key)}</button><div className="tf-admin-subhead">Ummæli · {fmtDate(form.created_at)}</div><div className="tf-card-group"><div className="tf-field"><label>Stjørnur</label><Stars value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} size={26} /></div><div className="tf-field"><label>Ummæli</label><textarea className="tf-input" rows={3} value={form.comment || ""} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} /></div><div className="tf-field"><label>Navn</label><input className="tf-input" value={form.author || ""} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} /></div></div><div className="tf-admin-subhead">Støða</div><div className="tf-toggles"><Toggle label="Víst í appini" checked={!form.is_hidden} onChange={(v) => setForm((f) => ({ ...f, is_hidden: !v }))} /></div><button className="tf-btn tf-btn-primary" disabled={busy} onClick={save}>{busy ? "Goymir…" : "Goym"}</button><button className="tf-btn tf-btn-tinted" onClick={() => {
      setForm(null);
      setMsg("");
    }}>Avlýs</button><button className="tf-btn tf-btn-ghost-danger" onClick={del}>Strika ummæli</button>{msg && <div className="tf-cap" style={{ color: "var(--red)", marginTop: 10, textAlign: "center" }}>{msg}</div>}</div>;
  }
  if (!rows) {
    return <div className="tf-admin-body"><div className="tf-admin-count" style={{ padding: "24px 4px" }}>Innlesur…</div></div>;
  }
  if (openKey) {
    const list = rows.filter((r) => r.toilet_key === openKey).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const hidden = list.filter((r) => r.is_hidden).length;
    return <div className="tf-admin-body"><button className="tf-backbtn" onClick={() => setOpenKey(null)}><ChevronLeft size={18} /> Øll vesi</button><div className="tf-admin-subhead">{name(openKey)}</div><div className="tf-admin-count">{list.length} ummæli{hidden ? ` · ${hidden} fjald` : ""}</div><div className="tf-admin-list">{list.map((r) => <div key={r.id} className="tf-rev-item"><button className="tf-rev-main" onClick={() => setForm({ ...r })}><div className="tf-rev-rate"><Star size={12} strokeWidth={2.4} fill="currentColor" />{r.rating}</div><div className="tf-rev-body"><div className="tf-rev-text">{r.comment || "(eingin tekstur)"}</div><div className="tf-rev-meta">{r.author || "Dulnevndur"} · {fmtDate(r.created_at)}</div></div></button><button className={`tf-rev-eye${r.is_hidden ? " off" : ""}`} onClick={() => toggleHidden(r)}>{r.is_hidden ? "Vís" : "Fjal"}</button></div>)}</div></div>;
  }
  const groupsMap = /* @__PURE__ */ new Map();
  for (const r of rows) {
    if (!groupsMap.has(r.toilet_key)) groupsMap.set(r.toilet_key, []);
    groupsMap.get(r.toilet_key).push(r);
  }
  let groups = [...groupsMap.entries()].map(([key, items]) => ({
    key,
    items,
    hidden: items.filter((x) => x.is_hidden).length,
    label: name(key)
  }));
  if (q.trim()) groups = groups.filter((g) => g.label.toLowerCase().includes(q.trim().toLowerCase()));
  groups.sort((a, b) => b.items.length - a.items.length || a.label.localeCompare(b.label));
  const needle = q.trim().toLowerCase();
  let allList = needle ? rows.filter((r) => `${r.comment || ""} ${r.author || ""} ${name(r.toilet_key)}`.toLowerCase().includes(needle)) : rows.slice();
  allList.sort((a, b) => {
    if (sort === "rateHigh") return b.rating - a.rating || new Date(b.created_at) - new Date(a.created_at);
    if (sort === "rateLow") return a.rating - b.rating || new Date(b.created_at) - new Date(a.created_at);
    return new Date(b.created_at) - new Date(a.created_at);
  });
  if (rows.length === 0) {
    return <div className="tf-admin-body"><EmptyState icon={Star} title="Eingi ummæli enn" subtitle="Tá ið fólk skriva ummæli í appini, verða tey savnað her undir hvørjum vesi." /></div>;
  }
  return <div className="tf-admin-body"><div className="tf-seg2"><button className={view === "byToilet" ? "on" : ""} onClick={() => setView("byToilet")}>Eftir vesi</button><button className={view === "all" ? "on" : ""} onClick={() => setView("all")}>Øll ummæli</button></div><div className="tf-admin-search" style={{ marginTop: 10 }}><Search size={17} /><input placeholder={view === "all" ? "Leita í ummælum…" : "Leita eftir vesi…"} value={q} onChange={(e) => setQ(e.target.value)} /></div>{view === "byToilet" ? <><div className="tf-admin-count">{groups.length} vesi við ummælum</div>{groups.length === 0 ? <div className="tf-admin-noresult">Einki vesi samsvarar leitingini.</div> : <div className="tf-admin-list">{groups.map((g) => <ListRow
    key={g.key}
    leading={<div className="tf-thumb"><BuildingPhoto url={photo(g.key)} seed={g.key} alt="" /></div>}
    title={g.label}
    meta={`${g.items.length} ummæli${g.hidden ? ` · ${g.hidden} fjald` : ""}`}
    status={g.hidden === 0}
    onClick={() => setOpenKey(g.key)}
  />)}</div>}</> : <><div className="tf-seg2" style={{ marginTop: 10 }}><button className={sort === "new" ? "on" : ""} onClick={() => setSort("new")}>Nýggjast</button><button className={sort === "rateHigh" ? "on" : ""} onClick={() => setSort("rateHigh")}>Hægst metan</button><button className={sort === "rateLow" ? "on" : ""} onClick={() => setSort("rateLow")}>Lægst metan</button></div><div className="tf-admin-count">{allList.length} ummæli</div>{allList.length === 0 ? <div className="tf-admin-noresult">Einki ummæli samsvarar leitingini.</div> : <div className="tf-admin-list">{allList.map((r) => <div key={r.id} className="tf-rev-item"><button className="tf-rev-main" onClick={() => setForm({ ...r })}><div className="tf-rev-rate"><Star size={12} strokeWidth={2.4} fill="currentColor" />{r.rating}</div><div className="tf-rev-body"><div className="tf-rev-text">{r.comment || "(eingin tekstur)"}</div><div className="tf-rev-meta">{name(r.toilet_key)} · {r.author || "Dulnevndur"} · {fmtDate(r.created_at)}</div></div></button><button className={`tf-rev-eye${r.is_hidden ? " off" : ""}`} onClick={() => toggleHidden(r)}>{r.is_hidden ? "Vís" : "Fjal"}</button></div>)}</div>}</>}</div>;
}
export {
  ReviewsAdmin as default
};
