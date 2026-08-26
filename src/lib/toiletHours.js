import { supabase } from "./supabase.js";
const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DOW_SHORT = { 0: "Sun", 1: "Mán", 2: "Týs", 3: "Mik", 4: "Hós", 5: "Frí", 6: "Ley" };
function defaultHours() {
  const days = {};
  for (let d = 0; d < 7; d++) days[d] = { open: false, from: "08:00", to: "17:00" };
  return { mode: "always", days };
}
async function loadToiletHours(toiletId) {
  const base = defaultHours();
  if (!toiletId) return base;
  const { data, error } = await supabase.from("toilet_hours").select("*").eq("toilet_id", toiletId);
  if (error || !data || data.length === 0) return base;
  const days = base.days;
  for (const r of data) {
    const d = r.day_of_week;
    const from = String(r.open_time).slice(0, 5);
    const to = String(r.close_time).slice(0, 5);
    if (!days[d].open) days[d] = { open: true, from, to };
    else {
      if (from < days[d].from) days[d].from = from;
      if (to > days[d].to) days[d].to = to;
    }
  }
  return { mode: "custom", days };
}
function hoursToRows(hours) {
  if (!hours || hours.mode === "always") return [];
  const rows = [];
  for (let d = 0; d < 7; d++) {
    const x = hours.days[d];
    if (x && x.open && x.from && x.to && x.to > x.from) rows.push({ day_of_week: d, open_time: x.from, close_time: x.to });
  }
  return rows;
}
export {
  DOW_ORDER,
  DOW_SHORT,
  defaultHours,
  hoursToRows,
  loadToiletHours
};
