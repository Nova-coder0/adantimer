import { LOCALES } from "./render-locales.js";

export { LOCALES };

export const SUPPORTED_LANGUAGES = ["en", "ar", "de", "fr", "tr", "zh-hans"];

export const LANGUAGE_ALIASES = {
  en: "en",
  "en-us": "en",
  "en-gb": "en",
  ar: "ar",
  "ar-sa": "ar",
  "ar-eg": "ar",
  de: "de",
  "de-de": "de",
  fr: "fr",
  "fr-fr": "fr",
  tr: "tr",
  "tr-tr": "tr",
  zh: "zh-hans",
  "zh-cn": "zh-hans",
  "zh-hans": "zh-hans"
};

export const TOP_CITIES = [
  { city: "Makkah", country: "Saudi Arabia", names: { ar: "\u0645\u0643\u0629", de: "Mekka", fr: "La Mecque", tr: "Mekke", "zh-hans": "\u9ea6\u52a0" } },
  { city: "Madinah", country: "Saudi Arabia", names: { ar: "\u0627\u0644\u0645\u062f\u064a\u0646\u0629", de: "Medina", fr: "Medine", tr: "Medine", "zh-hans": "\u9ea6\u5730\u90a3" } },
  { city: "Buraydah", country: "Saudi Arabia", names: { ar: "\u0628\u0631\u064a\u062f\u0629", de: "Buraida", fr: "Buraidah", tr: "Bureydah", "zh-hans": "\u5e03\u8d56\u4ee3" } },
  { city: "Cairo", country: "Egypt", names: { ar: "\u0627\u0644\u0642\u0627\u0647\u0631\u0629", de: "Kairo", fr: "Le Caire", tr: "Kahire", "zh-hans": "\u5f00\u7f57" } },
  { city: "Dubai", country: "United Arab Emirates", names: { ar: "\u062f\u0628\u064a", de: "Dubai", fr: "Dubai", tr: "Dubai", "zh-hans": "\u8fea\u62dc" } },
  { city: "Istanbul", country: "Turkey", names: { ar: "\u0625\u0633\u0637\u0646\u0628\u0648\u0644", de: "Istanbul", fr: "Istanbul", tr: "Istanbul", "zh-hans": "\u4f0a\u65af\u5766\u5e03\u5c14" } },
  { city: "London", country: "United Kingdom", names: { ar: "\u0644\u0646\u062f\u0646", de: "London", fr: "Londres", tr: "Londra", "zh-hans": "\u4f26\u6566" } },
  { city: "New York", country: "United States", names: { ar: "\u0646\u064a\u0648\u064a\u0648\u0631\u0643", de: "New York", fr: "New York", tr: "New York", "zh-hans": "\u7ebd\u7ea6" } },
  { city: "Sydney", country: "Australia", names: { ar: "\u0633\u064a\u062f\u0646\u064a", de: "Sydney", fr: "Sydney", tr: "Sidney", "zh-hans": "\u6089\u5c3c" } }
];

export const ROUTES = {
  home: { path: city => city ? `/${slugify(city)}` : "/" },
  "prayer-times": { path: city => city ? `/prayer-times/${slugify(city)}` : "/prayer-times" },
  "next-prayer": { path: city => city ? `/next-prayer/${slugify(city)}` : "/next-prayer" },
  fajr: { path: city => city ? `/fajr-time/${slugify(city)}` : "/fajr-time" },
  dhuhr: { path: city => city ? `/dhuhr-time/${slugify(city)}` : "/dhuhr-time" },
  asr: { path: city => city ? `/asr-time/${slugify(city)}` : "/asr-time" },
  maghrib: { path: city => city ? `/maghrib-time/${slugify(city)}` : "/maghrib-time" },
  isha: { path: city => city ? `/isha-time/${slugify(city)}` : "/isha-time" }
};

export const ROUTE_LABELS = {
  home: { en: "Prayer Times", ar: "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629", de: "Gebetszeiten", fr: "Horaires de priere", tr: "Namaz Vakitleri", "zh-hans": "\u793c\u62dc\u65f6\u95f4" },
  "prayer-times": { en: "Prayer Times", ar: "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629", de: "Gebetszeiten", fr: "Horaires de priere", tr: "Namaz Vakitleri", "zh-hans": "\u793c\u62dc\u65f6\u95f4" },
  "next-prayer": { en: "Next Prayer Time", ar: "\u0648\u0642\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629", de: "Naechstes Gebet", fr: "Prochaine priere", tr: "Sonraki Namaz", "zh-hans": "\u4e0b\u4e00\u6b21\u793c\u62dc\u65f6\u95f4" },
  fajr: { en: "Fajr Time", ar: "\u0648\u0642\u062a \u0627\u0644\u0641\u062c\u0631", de: "Fajr Zeit", fr: "Heure du Fajr", tr: "Fajr Vakti", "zh-hans": "\u6668\u793c\u65f6\u95f4" },
  dhuhr: { en: "Dhuhr Time", ar: "\u0648\u0642\u062a \u0627\u0644\u0638\u0647\u0631", de: "Dhuhr Zeit", fr: "Heure du Dhuhr", tr: "Dhuhr Vakti", "zh-hans": "\u664c\u793c\u65f6\u95f4" },
  asr: { en: "Asr Time", ar: "\u0648\u0642\u062a \u0627\u0644\u0639\u0635\u0631", de: "Asr Zeit", fr: "Heure du Asr", tr: "Asr Vakti", "zh-hans": "\u665a\u793c\u65f6\u95f4" },
  maghrib: { en: "Maghrib Time", ar: "\u0648\u0642\u062a \u0627\u0644\u0645\u063a\u0631\u0628", de: "Maghrib Zeit", fr: "Heure du Maghrib", tr: "Maghrib Vakti", "zh-hans": "\u660f\u793c\u65f6\u95f4" },
  isha: { en: "Isha Time", ar: "\u0648\u0642\u062a \u0627\u0644\u0639\u0634\u0627\u0621", de: "Isha Zeit", fr: "Heure du Isha", tr: "Isha Vakti", "zh-hans": "\u5bb5\u793c\u65f6\u95f4" }
};

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}
