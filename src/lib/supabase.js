import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL || "";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const hasSupabase = Boolean(url && key);
const supabaseHost = (() => {
  try {
    return new URL(url).host;
  } catch {
    return url || "(tómt)";
  }
})();
const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-anon-key"
);
export {
  hasSupabase,
  supabase,
  supabaseHost
};
