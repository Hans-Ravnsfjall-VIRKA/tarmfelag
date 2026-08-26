import { supabase } from "./supabase.js";
async function uploadBuildingPhoto(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `buildings/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const up = await supabase.storage.from("toilet-photos").upload(path, file, { upsert: false, contentType: file.type || void 0 });
  if (up.error) throw up.error;
  const { data } = supabase.storage.from("toilet-photos").getPublicUrl(path);
  return data.publicUrl;
}
export {
  uploadBuildingPhoto
};
