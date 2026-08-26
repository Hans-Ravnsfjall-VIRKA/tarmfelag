import React from "react";
import { Store } from "lucide-react";
import { DetailHeader, ListGroup, Row } from "./ui.jsx";
import { useT, pick } from "./i18n.jsx";
import { useNav } from "./nav.jsx";
import { WHERE_USED } from "./data.js";
function WhereUsedScreen() {
  const { t, lang } = useT();
  const { pop } = useNav();
  return <div className="tf-screen tf-detail"><DetailHeader title={t.whereTitle} onBack={pop} backLabel={t.sunTitle} /><p className="tf-intro tf-sb tf-dim" style={{ padding: "0 20px 4px" }}>{t.whereIntro}</p><ListGroup footer={t.whereNote}>{WHERE_USED.map((w, i) => <Row
    key={w.id}
    last={i === WHERE_USED.length - 1}
    leading={<div className="tf-iconwell tf-iconwell-accent"><Store size={20} /></div>}
    title={w.name}
    subtitle={`${pick(lang, w.type)} · ${w.town}`}
    trailing={<span />}
  />)}</ListGroup><div style={{ height: 120 }} /></div>;
}
export {
  WhereUsedScreen as default
};
