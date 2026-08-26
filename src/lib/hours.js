const toMin = (t) => {
  const [h, m] = t.split(":");
  return Number(h) * 60 + Number(m);
};
const fmt = (t) => t.slice(0, 5).replace(":", ".");
function evalHours(rows, now = /* @__PURE__ */ new Date()) {
  if (!rows || rows.length === 0) return { open: true, kind: "always" };
  const dow = now.getDay();
  const today = rows.filter((r) => r.day_of_week === dow).sort((a, b) => toMin(a.open_time) - toMin(b.open_time));
  if (today.length === 0) return { open: false, kind: "closedToday" };
  const mins = now.getHours() * 60 + now.getMinutes();
  let open = false;
  for (const r of today) if (mins >= toMin(r.open_time) && mins < toMin(r.close_time)) open = true;
  const first = today[0];
  const last = today[today.length - 1];
  return { open, kind: "range", range: `${fmt(first.open_time)}–${fmt(last.close_time)}` };
}
export {
  evalHours
};
