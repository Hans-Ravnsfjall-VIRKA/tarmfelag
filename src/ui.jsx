import React from "react";
import { ChevronRight, ChevronLeft, Star } from "lucide-react";
const Badge = ({ icon: Icon, children, tone = "neutral" }) => <span className={`tf-badge tf-badge-${tone}`}>{Icon && <Icon size={12} strokeWidth={2.4} />}{children}</span>;
const Row = ({ leading, title, subtitle, trailing, onClick, last }) => <button className={`tf-row${last ? " tf-row-last" : ""}`} onClick={onClick}>{leading && <div className="tf-row-lead">{leading}</div>}<div className="tf-row-mid"><div className="tf-hl">{title}</div>{subtitle && <div className="tf-sb tf-dim">{subtitle}</div>}</div>{trailing !== void 0 ? trailing : <ChevronRight size={18} className="tf-chev" />}</button>;
const ListGroup = ({ header, footer, children }) => <section className="tf-group-wrap">{header && <div className="tf-group-head">{header}</div>}<div className="tf-group">{children}</div>{footer && <div className="tf-group-foot">{footer}</div>}</section>;
const LargeTitle = ({ title, action }) => <header className="tf-largehead"><h1 className="tf-lt">{title}</h1>{action}</header>;
const DetailHeader = ({ title, onBack, backLabel }) => <header className="tf-detailhead"><button className="tf-backbtn" onClick={onBack}><ChevronLeft size={22} strokeWidth={2.4} /><span>{backLabel}</span></button><h1 className="tf-detailtitle">{title}</h1></header>;
const Stars = ({ value = 0, onChange, size = 18 }) => <div className="tf-stars">{[1, 2, 3, 4, 5].map((n) => <button
  key={n}
  type="button"
  className={`tf-star${n <= value ? " on" : ""}${onChange ? " tap" : ""}`}
  onClick={onChange ? () => onChange(n) : void 0}
  disabled={!onChange}
  aria-label={`${n}`}
><Star size={size} strokeWidth={2} fill={n <= value ? "currentColor" : "none"} /></button>)}</div>;
export {
  Badge,
  DetailHeader,
  LargeTitle,
  ListGroup,
  Row,
  Stars
};
