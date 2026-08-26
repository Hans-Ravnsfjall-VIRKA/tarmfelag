import React, { useState } from "react";
import { DetailHeader } from "./ui.jsx";
import { useT } from "./i18n.jsx";
import { useNav } from "./nav.jsx";
import { DEFAULT_STAFF } from "./data.js";
function EditMessageScreen() {
  const { t } = useT();
  const { pop } = useNav();
  const [msg, setMsg] = useState(() => localStorage.getItem("tf:staffMsg") || DEFAULT_STAFF);
  const [name, setName] = useState(() => localStorage.getItem("tf:cardName") || "");
  const [note, setNote] = useState("");
  const save = () => {
    localStorage.setItem("tf:cardName", name.trim());
    localStorage.setItem("tf:staffMsg", msg.trim() || DEFAULT_STAFF);
    setNote(t.msgSaved);
  };
  const reset = () => {
    setMsg(DEFAULT_STAFF);
    localStorage.setItem("tf:staffMsg", DEFAULT_STAFF);
    setNote(t.msgSaved);
  };
  return <div className="tf-screen tf-detail"><DetailHeader title={t.editTitle} onBack={pop} backLabel={t.sunTitle} /><p className="tf-intro tf-sb tf-dim" style={{ padding: "0 20px 8px" }}>{t.editIntro}</p><div style={{ padding: "0 16px" }}><input className="tf-input" value={name} placeholder={t.sunYourName} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 10 }} /><textarea className="tf-input" rows={5} value={msg} placeholder={t.msgPlaceholder} onChange={(e) => setMsg(e.target.value)} /><button className="tf-btn tf-btn-primary" style={{ marginTop: 12 }} onClick={save}>{t.msgSave}</button><button className="tf-btn tf-btn-tinted" style={{ marginTop: 8 }} onClick={reset}>{t.msgReset}</button>{note && <div className="tf-cap tf-dim" style={{ marginTop: 10, textAlign: "center" }}>{note}</div>}</div><div style={{ height: 120 }} /></div>;
}
export {
  EditMessageScreen as default
};
