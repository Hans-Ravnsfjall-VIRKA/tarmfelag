import { supabase, hasSupabase } from "./supabase.js";
import { FESTIVALS, FESTIVAL_TOILETS, EVENTS } from "../data.js";
const mockFestivals = () => FESTIVALS.map((f) => ({ ...f, toiletsList: FESTIVAL_TOILETS[f.id] || [] }));
async function getFestivals() {
  if (!hasSupabase) return mockFestivals();
  try {
    const { data: fests, error } = await supabase.from("festivals").select("*").eq("is_active", true).order("sort");
    if (error || !fests || !fests.length) return mockFestivals();
    const { data: fts } = await supabase.from("festival_toilets").select("*").order("sort");
    const byFest = {};
    (fts || []).forEach((x) => {
      (byFest[x.festival_id] ||= []).push(x);
    });
    return fests.map((f) => ({
      id: f.id,
      name: f.name,
      place: f.place,
      date: f.date_text,
      toilets: { fo: f.toilets_fo, en: f.toilets_en },
      quiet: f.quiet,
      ownFood: f.own_food,
      firstAid: f.first_aid,
      toiletsList: (byFest[f.id] || []).map((x) => ({
        id: x.id,
        name: { fo: x.name_fo, en: x.name_en },
        lat: x.lat,
        lng: x.lng,
        is_accessible: x.is_accessible,
        is_free: true,
        open: true
      }))
    }));
  } catch {
    return mockFestivals();
  }
}
async function getEvents() {
  if (!hasSupabase) return EVENTS;
  try {
    const { data, error } = await supabase.from("events").select("*").eq("is_active", true).order("sort");
    if (error || !data || !data.length) return EVENTS;
    return data.map((e) => ({
      id: e.id,
      type: e.type,
      time: e.time,
      title: { fo: e.title_fo, en: e.title_en },
      place: { fo: e.place_fo, en: e.place_en },
      date: { fo: e.date_fo, en: e.date_en }
    }));
  } catch {
    return EVENTS;
  }
}
export {
  getEvents,
  getFestivals
};
