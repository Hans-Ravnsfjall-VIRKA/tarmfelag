import React from "react";
import { MapPin, Accessibility } from "lucide-react";
import { DetailHeader, ListGroup, Row } from "./ui.jsx";
import MapCard from "./MapCard.jsx";
import { useT, pick } from "./i18n.jsx";
import { useNav } from "./nav.jsx";
function FestivalDetail({ festival }) {
  const { t, lang } = useT();
  const { pop, push } = useNav();
  const list = (festival.toiletsList || []).map((x) => ({
    ...x,
    municipality: festival.place,
    oh: { open: true, kind: "always" }
  }));
  return <div className="tf-screen tf-detail"><DetailHeader title={festival.name} onBack={pop} backLabel={t.festTitle} /><p className="tf-intro vesi-subhead tf-sb tf-dim" style={{ padding: "0 20px 4px" }}>{t.festToiletsAt(festival.place)} · {festival.date}</p><MapCard toilets={list} onPick={(x) => push({ type: "toilet", toilet: x })} /><ListGroup>{list.map((x, i) => <Row
    key={x.id}
    last={i === list.length - 1}
    onClick={() => push({ type: "toilet", toilet: x })}
    leading={<div className="tf-iconwell tf-iconwell-accent"><MapPin size={20} /></div>}
    title={pick(lang, x.name)}
    subtitle={x.is_accessible ? t.accessible : void 0}
    trailing={x.is_accessible ? <Accessibility size={18} className="tf-chev" /> : void 0}
  />)}</ListGroup><div style={{ height: 120 }} /></div>;
}
export {
  FestivalDetail as default
};
