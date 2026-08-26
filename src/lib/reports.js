import { supabase, hasSupabase } from "./supabase.js";
async function addReport(key, { kind, comment }) {
  if (!hasSupabase) return { ok: false, reason: "nodb" };
  const { error } = await supabase.from("toilet_reports").insert({
    toilet_key: key,
    kind,
    comment: comment || null
  });
  if (error) {
    const reason = /relation|does not exist|schema cache/i.test(error.message || "") ? "setup" : "error";
    return { ok: false, reason };
  }
  return { ok: true };
}
async function adminGetReports() {
  if (!hasSupabase) return [];
  const { data, error } = await supabase.from("toilet_reports").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return data || [];
}
async function adminUpdateReport(id, patch) {
  if (!hasSupabase) return { ok: false };
  const { error } = await supabase.from("toilet_reports").update(patch).eq("id", id);
  return { ok: !error, error };
}
async function adminDeleteReport(id) {
  if (!hasSupabase) return { ok: false };
  const { error } = await supabase.from("toilet_reports").delete().eq("id", id);
  return { ok: !error, error };
}
export {
  addReport,
  adminDeleteReport,
  adminGetReports,
  adminUpdateReport
};
