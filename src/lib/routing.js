function decodePolyline(encoded, precision = 6) {
  let index = 0, lat = 0, lng = 0, byte, shift, result;
  const coords = [];
  const factor = Math.pow(10, precision);
  while (index < encoded.length) {
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 31) << shift;
      shift += 5;
    } while (byte >= 32);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 31) << shift;
      shift += 5;
    } while (byte >= 32);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lat / factor, lng / factor]);
  }
  return coords;
}
async function getMatrix(from, targets, mode) {
  const costing = mode === "car" ? "auto" : "pedestrian";
  const payload = {
    sources: [{ lat: from.lat, lon: from.lng }],
    targets: targets.map((t) => ({ lat: t.lat, lon: t.lng })),
    costing,
    units: "kilometers"
  };
  const url = `https://valhalla1.openstreetmap.de/sources_to_targets?json=${encodeURIComponent(JSON.stringify(payload))}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("matrix_http_" + r.status);
  const j = await r.json();
  const row = j.sources_to_targets && j.sources_to_targets[0];
  if (!row) throw new Error("no_matrix");
  return row.map((c) => c && c.time != null ? { timeS: c.time, distanceKm: c.distance } : null);
}
async function getRoute(from, to, mode, language = "en-US") {
  const costing = mode === "car" ? "auto" : "pedestrian";
  const payload = {
    locations: [{ lat: from.lat, lon: from.lng }, { lat: to.lat, lon: to.lng }],
    costing,
    directions_options: { units: "kilometers", language }
  };
  const url = `https://valhalla1.openstreetmap.de/route?json=${encodeURIComponent(JSON.stringify(payload))}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("route_http_" + r.status);
  const j = await r.json();
  const leg = j.trip && j.trip.legs && j.trip.legs[0];
  if (!leg || !leg.shape) throw new Error("no_route");
  return {
    coords: decodePolyline(leg.shape, 6),
    steps: (leg.maneuvers || []).map((m) => ({
      instruction: m.instruction,
      length: m.length,
      time: m.time,
      type: m.type,
      street_names: m.street_names || [],
      beginShapeIndex: m.begin_shape_index,
      endShapeIndex: m.end_shape_index
    })),
    distanceKm: j.trip.summary.length,
    timeS: j.trip.summary.time
  };
}
export {
  getMatrix,
  getRoute
};
