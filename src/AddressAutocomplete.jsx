import React, { useEffect, useRef, useState } from "react";
function AddressAutocomplete({ value, onPick, placeholder }) {
  const [q, setQ] = useState(value || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    setQ(value || "");
  }, [value]);
  const onType = (text) => {
    setQ(text);
    onPick && onPick({ address: text });
    clearTimeout(timer.current);
    if (text.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=6&lat=62.0&lon=-7.0&lang=default`;
        const r = await fetch(url);
        const j = await r.json();
        const feats = (j.features || []).filter((f) => (f.properties.countrycode || "").toLowerCase() === "fo");
        setResults(feats);
        setOpen(feats.length > 0);
      } catch {
        setResults([]);
        setOpen(false);
      }
    }, 300);
  };
  const choose = (f) => {
    const [lng, lat] = f.geometry.coordinates;
    const p = f.properties;
    const main = [p.housenumber, p.street].filter(Boolean).join(" ") || p.name || "";
    const label = [main, [p.postcode, p.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
    setQ(label);
    setOpen(false);
    setResults([]);
    onPick && onPick({ address: label, lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)), municipality: p.county || p.city || "" });
  };
  return <div className="tf-ac"><input
    className="tf-input"
    value={q}
    placeholder={placeholder}
    autoComplete="off"
    onChange={(e) => onType(e.target.value)}
    onFocus={() => results.length && setOpen(true)}
    onBlur={() => setTimeout(() => setOpen(false), 150)}
  />{open && results.length > 0 && <div className="tf-ac-list">{results.map((f, i) => {
    const p = f.properties;
    const main = [p.housenumber, p.street].filter(Boolean).join(" ") || p.name || "-";
    const sub = [p.postcode, p.city, p.county].filter(Boolean).join(" ");
    return <button type="button" key={i} className="tf-ac-item" onMouseDown={(e) => {
      e.preventDefault();
      choose(f);
    }}><div className="tf-hl">{main}</div>{sub && <div className="tf-sb tf-dim">{sub}</div>}</button>;
  })}</div>}</div>;
}
export {
  AddressAutocomplete as default
};
