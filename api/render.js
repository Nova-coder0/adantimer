import { readFile } from "node:fs/promises";

import path from "node:path";



const LOCALES = {
  en: { htmlLang: "en", dir: "ltr", inLanguage: "en", homeTitle: "Adantimer | Accurate Prayer Times and Next Salah Countdown", homeDescription: "Check accurate prayer times, see the next salah countdown, and review the full daily schedule automatically by location.", homeEyebrow: "Prayer times by city", findButton: "Find Prayer Times", cityLabel: "City", countryLabel: "Country", cityPlaceholder: "Enter city", countryPlaceholder: "Country (optional)", nextPrayer: "Next Prayer", currentPrayer: "Current Prayer", today: "Today", method: "Method", loading: "Loading...", connector: "in", listConnector: "and", popularCities: "Popular city shortcuts", searchShortcuts: "Prayer search shortcuts", whyEyebrow: "Why this page helps", exploreEyebrow: "Explore More", aboutEyebrow: "About", faqEyebrow: "FAQ", locationWaiting: "Detecting your location", locationFallback: "Trying GPS, then IP fallback.", noScript: "JavaScript is required to load live prayer times and the next prayer countdown.", footer: "Accurate prayer times by city." },
  ar: { htmlLang: "ar", dir: "rtl", inLanguage: "ar", homeTitle: "Adantimer | \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0648\u0648\u0642\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062d\u0645\u0629", homeDescription: "\u062a\u062d\u0642\u0642 \u0645\u0646 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629\u060c \u0648\u0627\u0639\u0631\u0641 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062d\u0645\u0629\u060c \u0648\u0631\u0627\u062c\u0639 \u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645 \u062d\u0633\u0628 \u0645\u0648\u0642\u0639\u0643.", homeEyebrow: "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u062d\u0633\u0628 \u0627\u0644\u0645\u062f\u064a\u0646\u0629", findButton: "\u0627\u0639\u0631\u0636 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629", cityLabel: "\u0627\u0644\u0645\u062f\u064a\u0646\u0629", countryLabel: "\u0627\u0644\u062f\u0648\u0644\u0629", cityPlaceholder: "\u0623\u062f\u062e\u0644 \u0627\u0644\u0645\u062f\u064a\u0646\u0629", countryPlaceholder: "\u0627\u0644\u062f\u0648\u0644\u0629 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)", nextPrayer: "\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062d\u0645\u0629", currentPrayer: "\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629", today: "\u0627\u0644\u064a\u0648\u0645", method: "\u0627\u0644\u0637\u0631\u064a\u0642\u0629", loading: "\u062c\u0627\u0631 \u0627\u0644\u062a\u062d\u0645\u064a\u0644...", connector: "\u0641\u064a", listConnector: "\u0648", popularCities: "\u0631\u0648\u0627\u0628\u0637 \u0633\u0631\u064a\u0639\u0629 \u0644\u0644\u0645\u062f\u0646", searchShortcuts: "\u0631\u0648\u0627\u0628\u0637 \u0633\u0631\u064a\u0639\u0629 \u0644\u0646\u0648\u0639 \u0627\u0644\u0628\u062d\u062b", whyEyebrow: "\u0644\u0645\u0627\u0630\u0627 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0641\u064a\u062f\u0629", exploreEyebrow: "\u0627\u0643\u062a\u0634\u0641 \u0627\u0644\u0645\u0632\u064a\u062f", aboutEyebrow: "\u062d\u0648\u0644 \u0627\u0644\u0635\u0641\u062d\u0629", faqEyebrow: "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629", locationWaiting: "\u062c\u0627\u0631 \u062a\u062d\u062f\u064a\u062f \u0645\u0648\u0642\u0639\u0643", locationFallback: "\u064a\u062a\u0645 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 GPS \u0623\u0648\u0644\u0627 \u062b\u0645 IP \u0639\u0646\u062f \u0627\u0644\u062d\u0627\u062c\u0629.", noScript: "\u064a\u062a\u0637\u0644\u0628 \u0639\u0631\u0636 \u0627\u0644\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u062d\u064a\u0629 \u062a\u0634\u063a\u064a\u0644 JavaScript.", footer: "\u0645\u0648\u0627\u0642\u064a\u062a \u0635\u0644\u0627\u0629 \u062f\u0642\u064a\u0642\u0629 \u062d\u0633\u0628 \u0627\u0644\u0645\u062f\u064a\u0646\u0629." },
  de: { htmlLang: "de", dir: "ltr", inLanguage: "de", homeTitle: "Adantimer | Genaue Gebetszeiten und naechstes Gebet", homeDescription: "Pruefe genaue Gebetszeiten, sieh den Countdown zum naechsten Gebet und den heutigen Gebetsplan automatisch nach Standort.", homeEyebrow: "Gebetszeiten nach Stadt", findButton: "Gebetszeiten laden", cityLabel: "Stadt", countryLabel: "Land", cityPlaceholder: "Stadt eingeben", countryPlaceholder: "Land (optional)", nextPrayer: "Naechstes Gebet", currentPrayer: "Aktuelles Gebet", today: "Heute", method: "Methode", loading: "Wird geladen...", connector: "in", listConnector: "und", popularCities: "Beliebte Staedte", searchShortcuts: "Gebets-Suchkuerzel", whyEyebrow: "Darum hilft diese Seite", exploreEyebrow: "Mehr entdecken", aboutEyebrow: "Ueberblick", faqEyebrow: "FAQ", locationWaiting: "Standort wird erkannt", locationFallback: "Zuerst GPS, danach IP-Fallback.", noScript: "JavaScript wird benoetigt, um Live-Gebetszeiten und den Countdown zu laden.", footer: "Genaue Gebetszeiten nach Stadt." },
  fr: { htmlLang: "fr", dir: "ltr", inLanguage: "fr", homeTitle: "Adantimer | Horaires de priere et prochaine priere", homeDescription: "Consultez les horaires de priere, le compte a rebours de la prochaine priere et le planning du jour selon la position.", homeEyebrow: "Horaires par ville", findButton: "Voir les horaires", cityLabel: "Ville", countryLabel: "Pays", cityPlaceholder: "Entrer une ville", countryPlaceholder: "Pays (optionnel)", nextPrayer: "Prochaine priere", currentPrayer: "Priere actuelle", today: "Aujourd'hui", method: "Methode", loading: "Chargement...", connector: "a", listConnector: "et", popularCities: "Villes populaires", searchShortcuts: "Raccourcis de recherche", whyEyebrow: "Pourquoi cette page aide", exploreEyebrow: "Explorer plus", aboutEyebrow: "A propos", faqEyebrow: "FAQ", locationWaiting: "Detection de votre position", locationFallback: "GPS d'abord, puis IP en secours.", noScript: "JavaScript est requis pour charger les horaires en direct.", footer: "Horaires de priere precis par ville." },
  tr: { htmlLang: "tr", dir: "ltr", inLanguage: "tr", homeTitle: "Adantimer | Dogru namaz vakitleri ve sonraki namaz", homeDescription: "Namaz vakitlerini, sonraki namaz geri sayimini ve gunluk takvimi konuma gore otomatik gorun.", homeEyebrow: "Sehre gore namaz vakitleri", findButton: "Vakitleri goster", cityLabel: "Sehir", countryLabel: "Ulke", cityPlaceholder: "Sehir girin", countryPlaceholder: "Ulke (istege bagli)", nextPrayer: "Sonraki namaz", currentPrayer: "Guncel namaz", today: "Bugun", method: "Yontem", loading: "Yukleniyor...", connector: "icin", listConnector: "ve", popularCities: "Populer sehirler", searchShortcuts: "Arama kisayollari", whyEyebrow: "Bu sayfa neden yararli", exploreEyebrow: "Daha fazlasi", aboutEyebrow: "Hakkinda", faqEyebrow: "SSS", locationWaiting: "Konum algilaniyor", locationFallback: "Once GPS, sonra IP yedegi denenir.", noScript: "Canli vakitleri yuklemek icin JavaScript gerekir.", footer: "Sehre gore dogru namaz vakitleri." },
  "zh-hans": { htmlLang: "zh-CN", dir: "ltr", inLanguage: "zh-Hans", homeTitle: "Adantimer | \u51c6\u786e\u793c\u62dc\u65f6\u95f4\u4e0e\u4e0b\u4e00\u6b21\u793c\u62dc", homeDescription: "\u67e5\u770b\u51c6\u786e\u793c\u62dc\u65f6\u95f4\u3001\u4e0b\u4e00\u6b21\u793c\u62dc\u5012\u8ba1\u65f6\u4ee5\u53ca\u6839\u636e\u4f4d\u7f6e\u81ea\u52a8\u52a0\u8f7d\u7684\u6bcf\u65e5\u65f6\u95f4\u8868\u3002", homeEyebrow: "\u6309\u57ce\u5e02\u67e5\u770b\u793c\u62dc\u65f6\u95f4", findButton: "\u67e5\u770b\u793c\u62dc\u65f6\u95f4", cityLabel: "\u57ce\u5e02", countryLabel: "\u56fd\u5bb6", cityPlaceholder: "\u8f93\u5165\u57ce\u5e02", countryPlaceholder: "\u56fd\u5bb6\uff08\u53ef\u9009\uff09", nextPrayer: "\u4e0b\u4e00\u6b21\u793c\u62dc", currentPrayer: "\u5f53\u524d\u793c\u62dc", today: "\u4eca\u5929", method: "\u8ba1\u7b97\u65b9\u5f0f", loading: "\u52a0\u8f7d\u4e2d...", connector: "", listConnector: "\u548c", popularCities: "\u70ed\u95e8\u57ce\u5e02", searchShortcuts: "\u641c\u7d22\u5feb\u6377\u5165\u53e3", whyEyebrow: "\u4e3a\u4ec0\u4e48\u8fd9\u9875\u6709\u7528", exploreEyebrow: "\u7ee7\u7eed\u63a2\u7d22", aboutEyebrow: "\u5173\u4e8e", faqEyebrow: "\u5e38\u89c1\u95ee\u9898", locationWaiting: "\u6b63\u5728\u8bc6\u522b\u4f60\u7684\u4f4d\u7f6e", locationFallback: "\u5148\u5c1d\u8bd5 GPS\uff0c\u518d\u4f7f\u7528 IP \u5907\u7528\u3002", noScript: "\u9700\u8981\u542f\u7528 JavaScript \u624d\u80fd\u52a0\u8f7d\u5b9e\u65f6\u793c\u62dc\u65f6\u95f4\u3002", footer: "\u6309\u57ce\u5e02\u63d0\u4f9b\u51c6\u786e\u793c\u62dc\u65f6\u95f4\u3002" }
};



const SUPPORTED_LANGUAGES = ["en", "ar", "de", "fr", "tr", "zh-hans"];

const LANGUAGE_ALIASES = {
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

const TOP_CITIES = [
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

const ROUTES = {
  home: { path: city => city ? `/${slugify(city)}` : "/" },
  "prayer-times": { path: city => city ? `/prayer-times/${slugify(city)}` : "/prayer-times" },
  "next-prayer": { path: city => city ? `/next-prayer/${slugify(city)}` : "/next-prayer" },
  fajr: { path: city => city ? `/fajr-time/${slugify(city)}` : "/fajr-time" },
  dhuhr: { path: city => city ? `/dhuhr-time/${slugify(city)}` : "/dhuhr-time" },
  asr: { path: city => city ? `/asr-time/${slugify(city)}` : "/asr-time" },
  maghrib: { path: city => city ? `/maghrib-time/${slugify(city)}` : "/maghrib-time" },
  isha: { path: city => city ? `/isha-time/${slugify(city)}` : "/isha-time" }
};

const ROUTE_LABELS = {
  home: { en: "Prayer Times", ar: "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629", de: "Gebetszeiten", fr: "Horaires de priere", tr: "Namaz Vakitleri", "zh-hans": "\u793c\u62dc\u65f6\u95f4" },
  "prayer-times": { en: "Prayer Times", ar: "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629", de: "Gebetszeiten", fr: "Horaires de priere", tr: "Namaz Vakitleri", "zh-hans": "\u793c\u62dc\u65f6\u95f4" },
  "next-prayer": { en: "Next Prayer Time", ar: "\u0648\u0642\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062d\u0645\u0629", de: "Naechstes Gebet", fr: "Prochaine priere", tr: "Sonraki Namaz", "zh-hans": "\u4e0b\u4e00\u6b21\u793c\u62dc\u65f6\u95f4" },
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

function buildDescription(language, topic, place) {
  const base = {
    en: `Check accurate ${topic.toLowerCase()}${place ? ` in ${place}` : ""}, see the next prayer countdown, and review today's full daily prayer schedule.`,
    ar: `\u062a\u062d\u0642\u0642 \u0645\u0646 ${topic}${place ? ` \u0641\u064a ${place}` : ""}\u060c \u0648\u0627\u0639\u0631\u0641 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0648\u062c\u062f\u0648\u0644 \u0627\u0644\u0635\u0644\u0648\u0627\u062a \u0627\u0644\u0643\u0627\u0645\u0644 \u0644\u0644\u064a\u0648\u0645.`,
    de: `Pruefe ${topic.toLowerCase()}${place ? ` in ${place}` : ""}, sieh den Countdown zum naechsten Gebet und den vollstaendigen Tagesplan.`,
    fr: `Consultez ${topic.toLowerCase()}${place ? ` a ${place}` : ""}, voyez la prochaine priere et le planning complet du jour.`,
    tr: `${topic.toLowerCase()}${place ? ` ${place} icin` : ""} bilgisini, sonraki namaz geri sayimini ve gunluk takvimi gorun.`,
    "zh-hans": `\u67e5\u770b${place ? `${place}\u7684` : ""}${topic}\u3001\u4e0b\u4e00\u6b21\u793c\u62dc\u5012\u8ba1\u65f6\u4ee5\u53ca\u4eca\u65e5\u5b8c\u6574\u65f6\u95f4\u8868\u3002`
  };
  return base[language] || base.en;
}

function buildHeroSubtitle(language, topic, place) {
  const base = {
    en: place ? `Use this page to check ${topic.toLowerCase()} in ${place}, follow the live next-prayer countdown, and review the full daily salah schedule.` : "Check accurate daily prayer times, follow the next prayer countdown, and switch quickly to any city worldwide.", ar: place ? `\u0627\u0633\u062a\u062e\u062d\u0644\u0645 \u0647\u0630\u0647 \u0627\