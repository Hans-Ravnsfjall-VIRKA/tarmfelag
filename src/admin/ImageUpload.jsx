import React, { useRef, useState } from "react";
import { ImagePlus, Camera, Loader2, X } from "lucide-react";
import { uploadBuildingPhoto } from "../lib/storage.js";
import BuildingPhoto from "../BuildingPhoto.jsx";
function ImageUpload({ url, seed, onChange }) {
  const fileRef = useRef(null);
  const camRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const u = await uploadBuildingPhoto(file);
      onChange(u);
    } catch {
      setErr('Fekk ikki sent mynd upp. Kanna at "supabase-admin-setup.sql" er koyrt.');
    }
    setBusy(false);
    e.target.value = "";
  };
  return <div className="tf-up"><div className="tf-up-preview"><BuildingPhoto url={url} seed={seed} alt="" />{busy && <div className="tf-up-busy"><Loader2 className="tf-spin" size={24} /></div>}</div><div className="tf-up-actions"><button type="button" className="tf-btn tf-btn-primary" style={{ margin: 0, flex: 1 }} onClick={() => camRef.current && camRef.current.click()} disabled={busy}><Camera size={17} /> Tak mynd
        </button><button type="button" className="tf-btn tf-btn-tinted" style={{ margin: 0, flex: 1 }} onClick={() => fileRef.current && fileRef.current.click()} disabled={busy}><ImagePlus size={17} /> {url ? "Skift" : "Vel mynd"}</button>{url && <button type="button" className="tf-up-clear" onClick={() => onChange("")} aria-label="Strika myndina"><X size={17} /></button>}</div><input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} /><input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />{err && <div className="tf-cap" style={{ color: "var(--red)", marginTop: 6 }}>{err}</div>}</div>;
}
export {
  ImageUpload as default
};
