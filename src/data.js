const FESTIVALS = [
  {
    id: "voxbotn",
    name: "Voxbotn",
    place: "Vágsbotnur, Tórshavn",
    date: "31. juli – 1. august 2026",
    toilets: { fo: "Vesi á havnarøkinum", en: "Toilets by the harbour area" },
    quiet: true,
    ownFood: true,
    firstAid: true
  },
  {
    id: "gfest",
    name: "G! Festival",
    place: "Syðrugøta",
    date: "16.–18. juli 2026",
    toilets: { fo: "Nógv vesi á økinum", en: "Plenty of toilets on site" },
    quiet: true,
    ownFood: true,
    firstAid: true
  },
  {
    id: "torsfest",
    name: "Tórsfest",
    place: "Miðborgin, Tórshavn",
    date: "12.–13. juni 2026",
    toilets: { fo: "Vesi á tiltaksøkinum", en: "Toilets at the event area" },
    quiet: false,
    ownFood: false,
    firstAid: true
  },
  {
    id: "olavsoka",
    name: "Ólavsøka",
    place: "Tórshavn",
    date: "28.–29. juli 2026",
    toilets: { fo: "Almenn vesi í miðbýnum", en: "Public toilets in the centre" },
    quiet: false,
    ownFood: true,
    firstAid: true
  },
  {
    id: "summar",
    name: "Summarfestivalurin",
    place: "Vágsbøður, Klaksvík",
    date: "6.–8. august 2026",
    toilets: { fo: "Vesi við innganginum", en: "Toilets at the entrance" },
    quiet: true,
    ownFood: false,
    firstAid: true
  }
];
const T = (id, fo, en, lat, lng, acc) => ({ id, name: { fo, en }, lat, lng, is_accessible: acc, is_free: true, open: true });
const FESTIVAL_TOILETS = {
  voxbotn: [
    T("voxbotn-1", "Vesi við høvuðssviðinum", "Toilets by the main stage", 62.0076, -6.7686, false),
    T("voxbotn-2", "Atkomuligt vesi", "Accessible toilet", 62.0079, -6.7679, true),
    T("voxbotn-3", "Vesi við matbásunum", "Toilets by the food stalls", 62.0072, -6.7692, false),
    T("voxbotn-4", "Vesi við inngongd", "Toilets by the entrance", 62.0083, -6.7695, false)
  ],
  gfest: [
    T("gfest-1", "Vesi við høvuðssviðinum", "Toilets by the main stage", 62.1962, -6.748, false),
    T("gfest-2", "Atkomuligt vesi", "Accessible toilet", 62.1968, -6.7472, true),
    T("gfest-3", "Vesi á tjaldingarplássinum", "Toilets at the campsite", 62.1955, -6.7491, false),
    T("gfest-4", "Vesi við strondini", "Toilets by the beach", 62.1971, -6.7465, false)
  ],
  summar: [
    T("summar-1", "Vesi við inngongd", "Toilets by the entrance", 62.2312, -6.5895, false),
    T("summar-2", "Atkomuligt vesi", "Accessible toilet", 62.2318, -6.5887, true),
    T("summar-3", "Vesi við sviðinum", "Toilets by the stage", 62.2306, -6.5901, false)
  ],
  torsfest: [
    T("torsfest-1", "Vesi á Vaglinum", "Toilets at Vaglið", 62.0118, -6.7682, false),
    T("torsfest-2", "Atkomuligt vesi", "Accessible toilet", 62.0124, -6.7689, true),
    T("torsfest-3", "Vesi við Tinganesi", "Toilets by Tinganes", 62.0108, -6.7674, false),
    T("torsfest-4", "Vesi í SMS", "Toilets in SMS", 62.0136, -6.7724, true)
  ],
  olavsoka: [
    T("olavsoka-1", "Vesi á Vaglinum", "Toilets at Vaglið", 62.0116, -6.77, false),
    T("olavsoka-2", "Atkomuligt vesi við Havnini", "Accessible toilet by the harbour", 62.0073, -6.7686, true),
    T("olavsoka-3", "Vesi við Roynd", "Toilets by Roynd", 62.0101, -6.7712, false),
    T("olavsoka-4", "Vesi við Gundadali", "Toilets by Gundadalur", 62.0155, -6.7779, false)
  ]
};
const EVENTS = [
  { id: "e1", type: "support", title: { fo: "Stuðulsbólkur fyri IBD", en: "IBD support group" }, place: { fo: "Heilsuhúsið, Tórshavn", en: "Heilsuhúsið, Tórshavn" }, date: { fo: "tós. 25. juni", en: "Thu 25 Jun" }, time: "19.30" },
  { id: "e2", type: "talk", title: { fo: "Kostur og IBD", en: "Diet and IBD" }, place: { fo: "Á netinum (Teams)", en: "Online (Teams)" }, date: { fo: "mán. 1. juli", en: "Mon 1 Jul" }, time: "20.00" },
  { id: "e3", type: "walk", title: { fo: "Felagsganga í Havnardalinum", en: "Group walk in Havnardalur" }, place: { fo: "Møting við Svimjihøllina", en: "Meet at the swimming hall" }, date: { fo: "ley. 12. juli", en: "Sat 12 Jul" }, time: "11.00" },
  { id: "e4", type: "meeting", title: { fo: "Ársaðalfundur", en: "Annual general meeting" }, place: { fo: "Hotel Føroyar", en: "Hotel Føroyar" }, date: { fo: "mik. 27. august", en: "Wed 27 Aug" }, time: "19.00" }
];
const RESTAURANTS = [
  { id: "r1", name: "Etika", area: "Áarvegur", glutenFree: true, dairyFree: false, fodmap: false, callAhead: true },
  { id: "r2", name: "Barbara Fish House", area: "Gongin", glutenFree: true, dairyFree: true, fodmap: false, callAhead: true },
  { id: "r3", name: "Katrina Christiansen", area: "Miðborgin", glutenFree: true, dairyFree: true, fodmap: true, callAhead: false },
  { id: "r4", name: "Frí Bakarí", area: "Niels Finsens gøta", glutenFree: true, dairyFree: false, fodmap: true, callAhead: false }
];
const ME = { note: { fo: "Kann tørva skjóta atgongd til vesi", en: "May need quick toilet access" } };
const DEFAULT_STAFF = "Eg havi eina ósjónliga sjúku og kann tørva skjóta atgongd til vesi. Takk fyri forstáilsi.";
const WHERE_USED = [
  { id: "w1", name: "SMS handilsmiðstøð", type: { fo: "Handilsmiðstøð", en: "Shopping centre" }, town: "Tórshavn" },
  { id: "w2", name: "Miklagarður", type: { fo: "Stórmarknaður", en: "Supermarket" }, town: "Tórshavn" },
  { id: "w3", name: "FK", type: { fo: "Stórmarknaður", en: "Supermarket" }, town: "Fleiri staðir" },
  { id: "w4", name: "Bónus", type: { fo: "Stórmarknaður", en: "Supermarket" }, town: "Tórshavn" },
  { id: "w5", name: "Vágar Floghavn", type: { fo: "Floghavn", en: "Airport" }, town: "Sørvágur" },
  { id: "w6", name: "Landssjúkrahúsið", type: { fo: "Sjúkrahús", en: "Hospital" }, town: "Tórshavn" },
  { id: "w7", name: "Norrøna (Smyril Line)", type: { fo: "Ferja", en: "Ferry" }, town: "Tórshavn" },
  { id: "w8", name: "Posta", type: { fo: "Postur", en: "Post office" }, town: "Fleiri staðir" },
  { id: "w9", name: "Betri", type: { fo: "Banki / trygging", en: "Bank / insurance" }, town: "Tórshavn" }
];
export {
  DEFAULT_STAFF,
  EVENTS,
  FESTIVALS,
  FESTIVAL_TOILETS,
  ME,
  RESTAURANTS,
  WHERE_USED
};
