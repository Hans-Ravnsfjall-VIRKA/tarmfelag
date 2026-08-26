import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2 } from "lucide-react";
import { TILE_URL, TILE_OPTS } from "./lib/maptiles.js";
import MapOverlay from "./MapOverlay.jsx";
const TORSHAVN = [62.0107, -6.7741];
function MapCard({ toilets, fix, onPick, height }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const groupRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { zoomControl: false, attributionControl: true }).setView(TORSHAVN, 12);
    L.tileLayer(TILE_URL, TILE_OPTS).addTo(map);
    groupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 60);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);
  useEffect(() => {
    const map = mapRef.current;
    const group = groupRef.current;
    if (!map || !group) return;
    group.clearLayers();
    const pts = [];
    (toilets || []).forEach((t) => {
      const m = L.circleMarker([t.lat, t.lng], { radius: 7, weight: 2, color: "#fff", fillColor: t.open ? "#2e8c78" : "#8e8e93", fillOpacity: 1 });
      m.on("click", () => onPick && onPick(t));
      m.addTo(group);
      pts.push([t.lat, t.lng]);
    });
    if (fix) L.circleMarker([fix.lat, fix.lng], { radius: 7, weight: 3, color: "#fff", fillColor: "#0a84ff", fillOpacity: 1 }).addTo(group);
    map.invalidateSize();
    if (fix && toilets && toilets.length) {
      const nearest = [toilets[0].lat, toilets[0].lng];
      try {
        map.fitBounds([[fix.lat, fix.lng], nearest], { padding: [44, 44], maxZoom: 15 });
      } catch {
        map.setView([fix.lat, fix.lng], 14);
      }
    } else if (fix) {
      map.setView([fix.lat, fix.lng], 14);
    } else if (pts.length > 1) {
      try {
        map.fitBounds(pts, { padding: [28, 28], maxZoom: 12 });
      } catch {
      }
    } else if (pts.length === 1) {
      map.setView(pts[0], 14);
    }
  }, [toilets, fix, onPick]);
  return <><div className="tf-map" style={height ? { height } : void 0}><div ref={elRef} className="tf-map-canvas" /><button className="tf-map-expand" onClick={() => setExpanded(true)} aria-label="Vís alt kortið"><Maximize2 size={17} strokeWidth={2.4} /></button></div>{expanded && <MapOverlay
    toilets={toilets}
    fix={fix}
    onClose={() => setExpanded(false)}
    onPick={(t) => {
      setExpanded(false);
      onPick && onPick(t);
    }}
  />}</>;
}
export {
  MapCard as default
};
