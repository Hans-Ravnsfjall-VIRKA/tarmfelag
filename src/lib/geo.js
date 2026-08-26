function haversine(a, b) {
  const R = 6371e3;
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function getPosition() {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8e3, maximumAge: 3e4 }
    );
  });
}
function getPositionPrecise() {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 15e3, maximumAge: 0 }
    );
  });
}
async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&accept-language=fo`;
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) return null;
    const j = await r.json();
    const a = j.address || {};
    return a.town || a.village || a.city || a.hamlet || a.municipality || a.suburb || null;
  } catch {
    return null;
  }
}
function fmtDistance(m) {
  if (m == null) return null;
  if (m < 1e3) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1e3).toFixed(1)} km`;
}
function walkMinutes(m) {
  if (m == null) return null;
  return Math.max(1, Math.round(m / 80));
}
function cumulativeDistances(coords) {
  const cum = [0];
  for (let i = 1; i < coords.length; i++) {
    cum[i] = cum[i - 1] + haversine(
      { lat: coords[i - 1][0], lng: coords[i - 1][1] },
      { lat: coords[i][0], lng: coords[i][1] }
    );
  }
  return cum;
}
function ll2xy(lat, lng, lat0) {
  const R = 6371e3, toRad = (d) => d * Math.PI / 180;
  return [toRad(lng) * Math.cos(toRad(lat0)) * R, toRad(lat) * R];
}
function snapToRoute(pos, coords, cum) {
  const lat0 = pos.lat;
  const P = ll2xy(pos.lat, pos.lng, lat0);
  let best = { off: Infinity, along: 0, point: coords[0] };
  for (let i = 0; i < coords.length - 1; i++) {
    const A = ll2xy(coords[i][0], coords[i][1], lat0);
    const B = ll2xy(coords[i + 1][0], coords[i + 1][1], lat0);
    const ABx = B[0] - A[0], ABy = B[1] - A[1];
    const ab2 = ABx * ABx + ABy * ABy || 1;
    let tt = ((P[0] - A[0]) * ABx + (P[1] - A[1]) * ABy) / ab2;
    tt = Math.max(0, Math.min(1, tt));
    const projx = A[0] + tt * ABx, projy = A[1] + tt * ABy;
    const off = Math.hypot(P[0] - projx, P[1] - projy);
    if (off < best.off) {
      const segLen = cum[i + 1] - cum[i];
      best = {
        off,
        along: cum[i] + tt * segLen,
        point: [coords[i][0] + tt * (coords[i + 1][0] - coords[i][0]), coords[i][1] + tt * (coords[i + 1][1] - coords[i][1])]
      };
    }
  }
  return best;
}
export {
  cumulativeDistances,
  fmtDistance,
  getPosition,
  getPositionPrecise,
  haversine,
  reverseGeocode,
  snapToRoute,
  walkMinutes
};
