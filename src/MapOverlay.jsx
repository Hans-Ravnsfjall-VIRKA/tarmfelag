import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X } from "lucide-react";
import { TILE_URL, TILE_OPTS } from "./lib/maptiles.js";
const TORSHAVN = [62.0107, -6.7741];
function MapOverlay({ toilets, fix, onPick, onClose, title }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { zoomControl: true, attributionControl: true }).setView(TORSHAVN, 10);
    L.tileLayer(TILE_URL, TILE_OPTS).addTo(map);
    const group = L.layerGroup().addTo(map);
    const pts = [];
    (toilets || []).forEach((t) => {
      const m = L.circleMarker([t.lat, t.lng], { radius: 8, weight: 2, color: "#fff", fillColor: t.open ? "#2e8c78" : "#8e8e93", fillOpacity: 1 });
      m.on("click", () => onPick && onPick(t));
      m.addTo(group);
      pts.push([t.lat, t.lng]);
    });
    if (fix) {
      L.circleMarker([fix.lat, fix.lng], { radius: 8, weight: 3, color: "#fff", fillColor: "#0a84ff", fillOpacity: 1 }).addTo(group);
      pts.push([fix.lat, fix.lng]);
    }
    mapRef.current = map;
    setTimeout(() => {
      map.invalidateSize();
      if (pts.length === 1) map.setView(pts[0], 14);
      else if (pts.length > 1) {
        try {
          map.fitBounds(pts, { padding: [50, 50], maxZoom: 13 });
        } catch {
        }
      }
    }, 60);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);
  return <div className="tf-mapoverlay"><div ref={elRef} className="tf-mapoverlay-canvas" /><button className="tf-mapoverlay-close" onClick={onClose} aria-label="Lat aftur"><X size={22} strokeWidth={2.4} /></button>{title && <div className="tf-mapoverlay-title">{title}</div>}</div>;
}
export {
  MapOverlay as default
};
