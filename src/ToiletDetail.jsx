import React, { useEffect, useState } from "react";
import { Navigation, Accessibility, Clock, MapPin, TriangleAlert } from "lucide-react";
import { Badge, DetailHeader, ListGroup, Stars } from "./ui.jsx";
import BuildingPhoto from "./BuildingPhoto.jsx";
import { useT, pick, hoursLabel } from "./i18n.jsx";
import { useNav } from "./nav.jsx";
import { getReviews, addReview } from "./lib/reviews.js";
import { addReport } from "./lib/reports.js";
const KINDS = [
  { id: "closed", label: "reportKindClosed" },
  { id: "dirty", label: "reportKindDirty" },
  { id: "access", label: "reportKindAccess" },
  { id: "other", label: "reportKindOther" }
];
function ToiletDetail({ toilet, fix }) {
  const { t, lang } = useT();
  const { pop, push } = useNav();
  const key = String(toilet.id);
  const name = pick(lang, toilet.name);
  const open = toilet.oh ? toilet.oh.open : true;
  const hours = hoursLabel(t, toilet.oh);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [repOpen, setRepOpen] = useState(false);
  const [repKind, setRepKind] = useState(null);
  const [repText, setRepText] = useState("");
  const [repBusy, setRepBusy] = useState(false);
  const [repNote, setRepNote] = useState("");
  const [repSent, setRepSent] = useState(false);
  useEffect(() => {
    let alive = true;
    getReviews(key).then((r) => alive && setReviews(r));
    return () => {
      alive = false;
    };
  }, [key]);
  const submit = async () => {
    if (!rating) {
      setNote(t.needRating);
      return;
    }
    setBusy(true);
    setNote("");
    const res = await addReview(key, { rating, comment, author });
    setBusy(false);
    if (res.ok) {
      setReviews(await getReviews(key));
      setRating(0);
      setComment("");
      setAuthor("");
      setNote(t.reviewSaved);
    } else {
      setNote(res.reason === "setup" ? t.setupNeeded : t.reviewError);
    }
  };
  const submitReport = async () => {
    if (!repKind) {
      setRepNote(t.reportPick);
      return;
    }
    setRepBusy(true);
    setRepNote("");
    const res = await addReport(key, { kind: repKind, comment: repText });
    setRepBusy(false);
    if (res.ok) setRepSent(true);
    else setRepNote(res.reason === "setup" ? t.setupNeeded : t.reviewError);
  };
  const avg = reviews.length ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10 : 0;
  return <div className="tf-screen tf-detail"><DetailHeader title={name} onBack={pop} backLabel={t.back} /><div className="tf-photo"><BuildingPhoto url={toilet.photo_url} seed={toilet.id} alt={name} /></div><div className="tf-hero" style={{ marginTop: 14 }}><div className="tf-hero-top"><span className="tf-cap tf-dim" style={{ textTransform: "uppercase", letterSpacing: ".04em" }}>{t.info}</span><span className={`tf-status ${open ? "tf-open" : "tf-closed"}`}>{open ? t.open : t.closed}</span></div>{toilet.municipality && <div className="tf-sb tf-dim" style={{ marginTop: 4 }}><MapPin size={13} /> {toilet.municipality}</div>}<div className="tf-hero-hours"><Clock size={14} strokeWidth={2.2} /> {hours}</div><div className="tf-badgerow">{toilet.is_accessible && <Badge icon={Accessibility} tone="accent">{t.accessible}</Badge>}{toilet.is_free && <Badge>{t.free}</Badge>}</div><button className="tf-btn tf-btn-primary" onClick={() => push({ type: "nav", toilet: { ...toilet, name }, fix })}><Navigation size={18} strokeWidth={2.4} /> {t.showWay}</button></div>{
    /* Report a problem */
  }<div className="tf-report">{repSent ? <div className="tf-report-sent"><TriangleAlert size={16} /> {t.reportSent}</div> : !repOpen ? <><button className="tf-btn tf-btn-tinted tf-report-open" onClick={() => setRepOpen(true)}><TriangleAlert size={17} strokeWidth={2.2} /> {t.reportBtn}</button><p className="tf-cap tf-dim tf-report-help">{t.reportHelp}</p></> : <div className="tf-report-form"><div className="tf-chiprow">{KINDS.map((k) => <button key={k.id} className={`tf-chip${repKind === k.id ? " on" : ""}`} onClick={() => setRepKind(k.id)}>{t[k.label]}</button>)}</div><textarea className="tf-input" rows={2} placeholder={t.reportComment} value={repText} onChange={(e) => setRepText(e.target.value)} /><div className="tf-report-actions"><button className="tf-btn tf-btn-tinted" onClick={() => {
    setRepOpen(false);
    setRepKind(null);
    setRepText("");
    setRepNote("");
  }}>{t.navClose}</button><button className="tf-btn tf-btn-primary" disabled={repBusy} onClick={submitReport}>{t.send}</button></div>{repNote && <div className="tf-cap tf-dim" style={{ marginTop: 6, textAlign: "center" }}>{repNote}</div>}</div>}</div><ListGroup header={`${t.reviews}${reviews.length ? `  ·  ${avg} ★ (${reviews.length})` : ""}`}>{reviews.length === 0 ? <div className="tf-row tf-row-last" style={{ cursor: "default" }}><div className="tf-row-mid"><div className="tf-sb tf-dim">{t.noReviews}</div></div></div> : reviews.map((r, i) => <div key={r.id || i} className={`tf-row${i === reviews.length - 1 ? " tf-row-last" : ""}`} style={{ cursor: "default", alignItems: "flex-start" }}><div className="tf-row-mid"><Stars value={r.rating} size={14} />{r.comment && <div className="tf-sb" style={{ marginTop: 4 }}>{r.comment}</div>}<div className="tf-cap tf-dim" style={{ marginTop: 4 }}>{r.author || "-"}</div></div></div>)}</ListGroup><ListGroup header={t.addReview}><div className="tf-form"><Stars value={rating} onChange={setRating} size={26} /><textarea className="tf-input" rows={3} placeholder={t.comment} value={comment} onChange={(e) => setComment(e.target.value)} /><input className="tf-input" placeholder={t.yourName} value={author} onChange={(e) => setAuthor(e.target.value)} /><button className="tf-btn tf-btn-primary" style={{ marginTop: 4 }} disabled={busy} onClick={submit}>{t.send}</button>{note && <div className="tf-cap tf-dim" style={{ marginTop: 8, textAlign: "center" }}>{note}</div>}</div></ListGroup><div style={{ height: 120 }} /></div>;
}
export {
  ToiletDetail as default
};
