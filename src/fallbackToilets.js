const FP = "https://commons.wikimedia.org/wiki/Special:FilePath/";
const PHOTO = {
  tinganes: `${FP}Tinganes_57.jpg?width=900`,
  gjogv: `${FP}Gj%C3%B3gv,_Faroe_Islands.JPG?width=900`,
  gjogvWinter: `${FP}Gj%C3%B3gv,_Faroe_Islands_(winter).JPG?width=900`,
  bour5: `${FP}Bour,_Faroe_Islands_(5).JPG?width=900`,
  bour3: `${FP}Bour,_Faroe_Islands_(3).JPG?width=900`,
  eidi: `${FP}Ei%C3%B0i,_Faroe_Islands.JPG?width=900`,
  husavik: `${FP}H%C3%BAsav%C3%ADk,_Faroe_Islands.JPG?width=900`
};
const FALLBACK_PHOTOS = PHOTO;
const FALLBACK_TOILETS = [
  { id: "fb-vagsbryggja", name: "Almenn vesi á Vágsbryggju", lat: 62.00742, lng: -6.7683, municipality: "Tórshavnar kommuna", is_accessible: true, is_free: true, photo_url: PHOTO.tinganes },
  { id: "fb-sms", name: "SMS handilsmiðstøð", lat: 62.01355, lng: -6.77241, municipality: "Tórshavnar kommuna", is_accessible: true, is_free: true, photo_url: PHOTO.husavik },
  { id: "fb-lsh", name: "Landssjúkrahúsið", lat: 62.00272, lng: -6.77653, municipality: "Tórshavnar kommuna", is_accessible: true, is_free: true, photo_url: PHOTO.eidi },
  { id: "fb-klaksvik", name: "Klaksvíkar ferjuhavn", lat: 62.2266, lng: -6.589, municipality: "Klaksvíkar kommuna", is_accessible: true, is_free: true, photo_url: PHOTO.gjogvWinter },
  { id: "fb-vestmanna", name: "Vestmanna ferðavinnuhús", lat: 62.1558, lng: -7.169, municipality: "Vestmanna kommuna", is_accessible: false, is_free: false, photo_url: PHOTO.bour5 },
  { id: "fb-gjogv", name: "Gjógv tjaldingarpláss", lat: 62.3325, lng: -6.9547, municipality: "Eysturkommuna", is_accessible: false, is_free: true, photo_url: PHOTO.gjogv },
  { id: "fb-sandavagur", name: "Kommunuskrivstovan í Sandavági", lat: 62.0537, lng: -7.1498, municipality: "Vága kommuna", is_accessible: false, is_free: true, photo_url: PHOTO.bour3 }
];
const everyDay = (id, open, close) => [0, 1, 2, 3, 4, 5, 6].map((d) => ({ toilet_id: id, day_of_week: d, open_time: open, close_time: close }));
const weekdays = (id, open, close) => [1, 2, 3, 4, 5].map((d) => ({ toilet_id: id, day_of_week: d, open_time: open, close_time: close }));
const FALLBACK_HOURS = [
  ...everyDay("fb-vagsbryggja", "06:00", "23:00"),
  { toilet_id: "fb-sms", day_of_week: 1, open_time: "10:00", close_time: "18:00" },
  { toilet_id: "fb-sms", day_of_week: 2, open_time: "10:00", close_time: "18:00" },
  { toilet_id: "fb-sms", day_of_week: 3, open_time: "10:00", close_time: "18:00" },
  { toilet_id: "fb-sms", day_of_week: 4, open_time: "10:00", close_time: "18:00" },
  { toilet_id: "fb-sms", day_of_week: 5, open_time: "10:00", close_time: "19:00" },
  { toilet_id: "fb-sms", day_of_week: 6, open_time: "10:00", close_time: "17:00" },
  ...everyDay("fb-klaksvik", "07:00", "12:00"),
  ...everyDay("fb-klaksvik", "13:00", "21:00"),
  ...weekdays("fb-sandavagur", "08:00", "16:00")
];
export {
  FALLBACK_HOURS,
  FALLBACK_PHOTOS,
  FALLBACK_TOILETS
};
