import React from "react";
import { ChevronRight } from "lucide-react";
function Toggle({ label, checked, onChange }) {
  return <button type="button" role="switch" aria-checked={checked} className="tf-toggle-row" onClick={() => onChange(!checked)}><span className="tf-toggle-label">{label}</span><span className={`tf-switch${checked ? " on" : ""}`} /></button>;
}
function EmptyState({ icon: Icon, title, subtitle, cta, onCta }) {
  return <div className="tf-empty">{Icon && <div className="tf-empty-ico"><Icon size={30} strokeWidth={1.8} /></div>}<div className="tf-empty-title">{title}</div>{subtitle && <div className="tf-empty-sub">{subtitle}</div>}{cta && <button className="tf-btn tf-btn-primary tf-empty-cta" onClick={onCta}>{cta}</button>}</div>;
}
function ListRow({ leading, title, meta, status, onClick }) {
  return <button className="tf-lrow" onClick={onClick}>{leading && <div className="tf-lrow-lead">{leading}</div>}<div className="tf-lrow-mid"><div className="tf-lrow-title">{title}</div>{meta && <div className="tf-lrow-meta">{meta}</div>}</div>{status !== void 0 && <span className={`tf-dot ${status ? "on" : "off"}`} />}<ChevronRight className="tf-lrow-chev" size={18} /></button>;
}
export {
  EmptyState,
  ListRow,
  Toggle
};
