import React, { useState } from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import { getPositionPrecise, reverseGeocode } from "../lib/geo.js";
function LocationButton({ onLocate }) {
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const [err, setErr] = useState("");
  const go = async () => {
    setBusy(true);
    setErr("");
    setInfo("");
    const pos = await getPositionPrecise();
    if (!pos) {
      setBusy(false);
      setErr("Fekk ikki staðseting. Loyv kaganum atgongd til staðseting og royn aftur.");
      return;
    }
    let town = null;
    try {
      town = await reverseGeocode(pos.lat, pos.lng);
    } catch {
    }
    onLocate({ lat: pos.lat, lng: pos.lng, town });
    setBusy(false);
    setInfo(`Støð fingin${pos.accuracy ? ` (±${Math.round(pos.accuracy)} m)` : ""}.`);
  };
  return <div className="tf-loc"><button type="button" className="tf-btn tf-btn-tinted" style={{ margin: 0 }} onClick={go} disabled={busy}>{busy ? <Loader2 className="tf-spin" size={17} /> : <LocateFixed size={17} />} Brúka verandi staðseting
      </button>{info && <div className="tf-cap tf-dim" style={{ marginTop: 6 }}>{info}</div>}{err && <div className="tf-cap" style={{ color: "var(--red)", marginTop: 6 }}>{err}</div>}</div>;
}
export {
  LocationButton as default
};
