import React, { useEffect, useState } from "react";
import { TriangleAlert, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { EmptyState } from "./AdminUI.jsx";
import { adminGetReports, adminUpdateReport, adminDeleteReport } from "../lib/reports.js";
const KIND = {
  closed: { label: "Stongt", cls: "red" },
  dirty: { label: "Ógreitt", cls: "amber" },
  access: { label: "Atkoma", cls: "amber" },
  other: { label: "Annað", cls: "gray" }
};
const fmtDate = (s) => {
  try {
    const d = new Date(s);
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
  } catch {
    return "";
  }
};
function ReportsAdmin({ onNewFn, onListView }) {
  const [rows, setRows] = useState(null);
  const [meta, setMeta] = useState({});
  const [showAll, setShowAll] = useState(false);
  const load = async () => {
    setRows(await adminGetReports());
    const map = {};
    const { data: ts } = await supabase.from("toilets").select("id,name");
    (ts || []).forEach((t) => {
      map[String(t.id)] = t.name;
    });
    const { data: fts } = await supabase.from("festival_toilets").select("*");
    (fts || []).forEach((t) => {
      map[String(t.id)] = t.name_fo || t.name || t.name_en || "Festival vesi";
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
  const name = (k) => meta[k] || "Vesi";
  const resolve = async (r) => {
    await adminUpdateReport(r.id, { status: r.status === "new" ? "done" : "new" });
    load();
  };
  const del = async (r) => {
    if (!window.confirm("Strika hesa fráboðan?")) return;
    await adminDeleteReport(r.id);
    load();
  };
  if (!rows) return <div className="tf-admin-body"><div className="tf-admin-count" style={{ padding: "24px 4px" }}>Innlesur…</div></div>;
  if (rows.length === 0) {
    return <div className="tf-admin-body"><EmptyState icon={TriangleAlert} title="Eingar fráboðanir enn" subtitle="Tá ið brúkarar boða frá um broytingar, so sum at eitt vesi er stongt, síggjast tær her." /></div>;
  }
  const open = rows.filter((r) => r.status === "new");
  const shown = showAll ? rows : open;
  return <div className="tf-admin-body"><div className="tf-seg2"><button className={!showAll ? "on" : ""} onClick={() => setShowAll(false)}>Óavgreiddar</button><button className={showAll ? "on" : ""} onClick={() => setShowAll(true)}>Allar</button></div><div className="tf-admin-count">{open.length} óavgreiddar{showAll ? ` · ${rows.length} í alt` : ""}</div>{shown.length === 0 ? <div className="tf-admin-noresult">Ongar óavgreiddar fráboðanir.</div> : <div className="tf-admin-list">{shown.map((r) => {
    const k = KIND[r.kind] || KIND.other;
    return <div key={r.id} className={`tf-rep-item${r.status === "done" ? " done" : ""}`}><div className="tf-rep-body"><div className="tf-rep-top"><span className={`tf-kind tf-kind-${k.cls}`}>{k.label}</span><span className="tf-rep-name">{name(r.toilet_key)}</span></div>{r.comment && <div className="tf-rep-text">{r.comment}</div>}<div className="tf-rep-date">{fmtDate(r.created_at)}</div></div><div className="tf-rep-actions"><button className="tf-rev-eye" onClick={() => resolve(r)}>{r.status === "new" ? "Avgreitt" : "Aftur"}</button><button className="tf-rep-del" onClick={() => del(r)} aria-label="Strika"><Trash2 size={16} /></button></div></div>;
  })}</div>}</div>;
}
export {
  ReportsAdmin as default
};
