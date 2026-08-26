import React from "react";
import { DOW_ORDER, DOW_SHORT } from "../lib/toiletHours.js";
function HoursEditor({ hours, onChange }) {
  const setMode = (mode) => onChange({ ...hours, mode });
  const setDay = (d, patch) => onChange({ ...hours, days: { ...hours.days, [d]: { ...hours.days[d], ...patch } } });
  return <div className="tf-hours"><div className="tf-seg2"><button type="button" className={hours.mode === "always" ? "on" : ""} onClick={() => setMode("always")}>Alt samdøgrið</button><button type="button" className={hours.mode === "custom" ? "on" : ""} onClick={() => setMode("custom")}>Ávísar tíðir</button></div>{hours.mode === "custom" && <div className="tf-hours-days">{DOW_ORDER.map((d) => {
    const x = hours.days[d];
    return <div key={d} className={`tf-hours-row${x.open ? " on" : ""}`}><button type="button" className="tf-hours-day" onClick={() => setDay(d, { open: !x.open })}><span className={`tf-switch sm${x.open ? " on" : ""}`} /><span>{DOW_SHORT[d]}</span></button>{x.open ? <div className="tf-hours-times"><input type="time" value={x.from} onChange={(e) => setDay(d, { from: e.target.value })} /><span>–</span><input type="time" value={x.to} onChange={(e) => setDay(d, { to: e.target.value })} /></div> : <span className="tf-hours-closed">Stongt</span>}</div>;
  })}</div>}</div>;
}
export {
  HoursEditor as default
};
