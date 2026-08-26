import { supabase, hasSupabase } from "./supabase.js";
const setupReason = (e) => e && (e.code === "42P01" || /relation .* does not exist|bucket|not found/i.test(e.message || "")) ? "setup" : "error";
async function getReviews(key) {
  if (!hasSupabase) return [];
  const { data, error } = await supabase.from("toilet_reviews").select("*").eq("toilet_key", key).order("created_at", { ascending: false });
  if (error) return [];
  return data || [];
}
async function addReview(key, { rating, comment, author }) {
  if (!hasSupabase) return { ok: false, reason: "nodata" };
  const { error } = await supabase.from("toilet_reviews").insert({ toilet_key: key, rating, comment: comment || null, author: author || null });
  if (error) return { ok: false, reason: setupReason(error), error };
  return { ok: true };
}
async function adminGetAllReviews() {
  if (!hasSupabase) return [];
  const { data, error } = await supabase.from("toilet_reviews").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return data || [];
}
async function adminUpdateReview(id, patch) {
  if (!hasSupabase) return { ok: false };
  const { error } = await supabase.from("toilet_reviews").update(patch).eq("id", id);
  return { ok: !error, error };
}
async function adminDeleteReview(id) {
  if (!hasSupabase) return { ok: false };
  const { error } = await supabase.from("toilet_reviews").delete().eq("id", id);
  return { ok: !error, error };
}
async function getPhoto(key) {
  if (!hasSupabase) return null;
  const { data, error } = await supabase.from("toilet_photos").select("url").eq("toilet_key", key).order("created_at", { ascending: false }).limit(1);
  if (error || !data || !data.length) return null;
  return data[0].url;
}
async function uploadPhoto(key, file) {
  if (!hasSupabase) return { ok: false, reason: "nodata" };
  try {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${key}/${Date.now()}.${ext}`;
    const up = await supabase.storage.from("toilet-photos").upload(path, file, { upsert: false });
    if (up.error) return { ok: false, reason: "setup", error: up.error };
    const { data: pub } = supabase.storage.from("toilet-photos").getPublicUrl(path);
    const url = pub.publicUrl;
    const ins = await supabase.from("toilet_photos").insert({ toilet_key: key, url });
    if (ins.error) return { ok: false, reason: setupReason(ins.error), error: ins.error };
    return { ok: true, url };
  } catch (e) {
    return { ok: false, reason: "error", error: e };
  }
}
export {
  addReview,
  adminDeleteReview,
  adminGetAllReviews,
  adminUpdateReview,
  getPhoto,
  getReviews,
  uploadPhoto
};
