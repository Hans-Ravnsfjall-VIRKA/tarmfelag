import { supabase, hasSupabase } from "./supabase.js";
function clientId() {
  try {
    let id = localStorage.getItem("tf:cid");
    if (!id) {
      id = window.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem("tf:cid", id);
    }
    return id;
  } catch {
    return null;
  }
}
async function lookupGeo() {
  const sources = [
    ["https://ipwho.is/", (j) => j && j.success !== false ? { ip: j.ip, country: j.country, city: j.city, lat: j.latitude, lng: j.longitude } : null],
    ["https://get.geojs.io/v1/ip/geo.json", (j) => j ? { ip: j.ip, country: j.country, city: j.city, lat: parseFloat(j.latitude), lng: parseFloat(j.longitude) } : null],
    ["https://ipapi.co/json/", (j) => j && !j.error ? { ip: j.ip, country: j.country_name, city: j.city, lat: j.latitude, lng: j.longitude } : null],
    ["https://freeipapi.com/api/json", (j) => j ? { ip: j.ipAddress, country: j.countryName, city: j.cityName, lat: j.latitude, lng: j.longitude } : null]
  ];
  for (const [url, map] of sources) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const g = map(await r.json());
      if (g && (g.city || g.country || g.lat != null)) return g;
    } catch {
    }
  }
  return {};
}
async function record({ kind, email }) {
  if (!hasSupabase) return;
  const geo = await lookupGeo();
  try {
    await supabase.from("access_log").insert({
      kind,
      email: email || null,
      client_id: clientId(),
      ip: geo.ip || null,
      country: geo.country || null,
      city: geo.city || null,
      lat: geo.lat ?? null,
      lng: geo.lng ?? null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null
    });
  } catch {
  }
}
function logVisit() {
  try {
    if (sessionStorage.getItem("tf:visited")) return;
    sessionStorage.setItem("tf:visited", "1");
  } catch {
  }
  record({ kind: "visit", email: null });
}
function logLogin(email) {
  record({ kind: "login", email });
}
async function getAccessLog() {
  if (!hasSupabase) return [];
  const { data, error } = await supabase.from("access_log").select("*").order("created_at", { ascending: false }).limit(1e3);
  if (error) return [];
  return data || [];
}
export {
  getAccessLog,
  logLogin,
  logVisit
};
