import { readFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://www.adantimer.com";
const INDEX_PATH = path.join(process.cwd(), "index.html");
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
  { city: "Makkah", country: "Saudi Arabia", names: { ar: "مكة", de: "Mekka", fr: "La Mecque", tr: "Mekke", "zh-hans": "麦加" } },
  { city: "Madinah", country: "Saudi Arabia", names: { ar: "المدينة", de: "Medina", fr: "Médine", tr: "Medine", "zh-hans": "麦地那" } },
  { city: "Buraydah", country: "Saudi Arabia", names: { ar: "بريدة", de: "Buraida", fr: "Buraidah", tr: "Bureydah", "zh-hans": "布赖代" } },
  { city: "Cairo", country: "Egypt", names: { ar: "القاهرة", de: "Kairo", fr: "Le Caire", tr: "Kahire", "zh-hans": "开罗" } },
  { city: "Dubai", country: "United Arab Emirates", names: { ar: "دبي", de: "Dubai", fr: "Dubaï", tr: "Dubai", "zh-hans": "迪拜" } },
  { city: "Istanbul", country: "Turkey", names: { ar: "إسطنبول", de: "Istanbul", fr: "Istanbul", tr: "İstanbul", "zh-hans": "伊斯坦布尔" } },
  { city: "London", country: "United Kingdom", names: { ar: "لندن", de: "London", fr: "Londres", tr: "Londra", "zh-hans": "伦敦" } },
  { city: "New York", country: "United States", names: { ar: "نيويورك", de: "New York", fr: "New York", tr: "New York", "zh-hans": "纽约" } },
  { city: "Sydney", country: "Australia", names: { ar: "سيدني", de: "Sydney", fr: "Sydney", tr: "Sidney", "zh-hans": "悉尼" } }
];

const ROUTE_LABELS = {
  home: { en: "Prayer Times", ar: "مواقيت الصلاة", de: "Gebetszeiten", fr: "Horaires de prière", tr: "Namaz Vakitleri", "zh-hans": "礼拜时间" },
  "prayer-times": { en: "Prayer Times", ar: "مواقيت الصلاة", de: "Gebetszeiten", fr: "Horaires de prière", tr: "Namaz Vakitleri", "zh-hans": "礼拜时间" },
  "next-prayer": { en: "Next Prayer Time", ar: "وقت الصلاة القادمة", de: "Zeit des nächsten Gebets", fr: "Heure de la prochaine prière", tr: "Sonraki Namaz Vakti", "zh-hans": "下一次礼拜时间" },
  fajr: { en: "Fajr Time", ar: "وقت الفجر", de: "Fajr-Zeit", fr: "Heure du Fajr", tr: "Fajr Vakti", "zh-hans": "晨礼时间" },
  dhuhr: { en: "Dhuhr Time", ar: "وقت الظهر", de: "Dhuhr-Zeit", fr: "Heure du Dhuhr", tr: "Dhuhr Vakti", "zh-hans": "晌礼时间" },
  asr: { en: "Asr Time", ar: "وقت العصر", de: "Asr-Zeit", fr: "Heure du Asr", tr: "Asr Vakti", "zh-hans": "晡礼时间" },
  maghrib: { en: "Maghrib Time", ar: "وقت المغرب", de: "Maghrib-Zeit", fr: "Heure du Maghrib", tr: "Maghrib Vakti", "zh-hans": "昏礼时间" },
  isha: { en: "Isha Time", ar: "وقت العشاء", de: "Isha-Zeit", fr: "Heure du Isha", tr: "Isha Vakti", "zh-hans": "宵礼时间" }
};

const ROUTES = {
  home: { en: "Prayer Times", ar: "مواقيت الصلاة", path: city => city ? `/${slugify(city)}` : "/" },
  "prayer-times": { en: "Prayer Times", ar: "مواقيت الصلاة", path: city => city ? `/prayer-times/${slugify(city)}` : "/prayer-times" },
  "next-prayer": { en: "Next Prayer Time", ar: "وقت الصلاة القادمة", path: city => city ? `/next-prayer/${slugify(city)}` : "/next-prayer" },
  fajr: { en: "Fajr Time", ar: "وقت الفجر", path: city => city ? `/fajr-time/${slugify(city)}` : "/fajr-time" },
  dhuhr: { en: "Dhuhr Time", ar: "وقت الظهر", path: city => city ? `/dhuhr-time/${slugify(city)}` : "/dhuhr-time" },
  asr: { en: "Asr Time", ar: "وقت العصر", path: city => city ? `/asr-time/${slugify(city)}` : "/asr-time" },
  maghrib: { en: "Maghrib Time", ar: "وقت المغرب", path: city => city ? `/maghrib-time/${slugify(city)}` : "/maghrib-time" },
  isha: { en: "Isha Time", ar: "وقت العشاء", path: city => city ? `/isha-time/${slugify(city)}` : "/isha-time" }
};

const LOCALES = {
  en: {
    htmlLang: "en",
    dir: "ltr",
    title: (topic, place, type) => type === "home" && !place
      ? "Adantimer | Accurate Prayer Times and Next Salah Countdown"
      : `${topic}${place ? ` in ${place}` : ""} Today | Adantimer`,
    description: (topic, place) => place
      ? `Check accurate ${topic.toLowerCase()} in ${place}, see the next salah countdown, and review today's Fajr, Dhuhr, Asr, Maghrib, and Isha schedule.`
      : `Check accurate ${topic.toLowerCase()}, see the next salah countdown, and review today's prayer schedule automatically by location.`,
    inLanguage: "en"
  },
  ar: {
    htmlLang: "ar",
    dir: "rtl",
    title: (topic, place, type) => type === "home" && !place
      ? "Adantimer | مواقيت الصلاة ووقت الصلاة القادمة"
      : `${topic}${place ? ` في ${place}` : ""} اليوم | Adantimer`,
    description: (topic, place) => place
      ? `تحقق من ${topic} في ${place} اليوم، واعرف وقت الصلاة القادمة وجدول الفجر والظهر والعصر والمغرب والعشاء.`
      : `تحقق من ${topic} اليوم واعرف وقت الصلاة القادمة وجدول الصلوات حسب موقعك تلقائيا.`,
    inLanguage: "ar"
  },
  de: {
    htmlLang: "de",
    dir: "ltr",
    title: (topic, place, type) => type === "home" && !place
      ? "Adantimer | Genaue Gebetszeiten und Countdown zum nächsten Gebet"
      : `${topic}${place ? ` in ${place}` : ""} heute | Adantimer`,
    description: (topic, place) => place
      ? `Prüfe ${topic.toLowerCase()} in ${place}, sieh den Countdown zum nächsten Gebet und den heutigen Gebetsplan mit Fajr, Dhuhr, Asr, Maghrib und Isha.`
      : `Prüfe ${topic.toLowerCase()}, sieh den Countdown zum nächsten Gebet und den heutigen Gebetsplan automatisch passend zum Standort.`,
    inLanguage: "de"
  },
  fr: {
    htmlLang: "fr",
    dir: "ltr",
    title: (topic, place, type) => type === "home" && !place
      ? "Adantimer | Horaires de prière précis et prochaine prière"
      : `${topic}${place ? ` à ${place}` : ""} aujourd'hui | Adantimer`,
    description: (topic, place) => place
      ? `Consultez ${topic.toLowerCase()} à ${place}, voyez le compte à rebours jusqu'à la prochaine prière et le planning complet de Fajr, Dhuhr, Asr, Maghrib et Isha.`
      : `Consultez ${topic.toLowerCase()}, voyez le compte à rebours jusqu'à la prochaine prière et le planning du jour adapté automatiquement à la position.`,
    inLanguage: "fr"
  },
  tr: {
    htmlLang: "tr",
    dir: "ltr",
    title: (topic, place, type) => type === "home" && !place
      ? "Adantimer | Doğru namaz vakitleri ve sonraki namaz"
      : `${topic}${place ? ` ${place} için` : ""} bugün | Adantimer`,
    description: (topic, place) => place
      ? `${place} için ${topic.toLowerCase()} bilgisini, sonraki namaz geri sayımını ve Fajr, Dhuhr, Asr, Maghrib ile Isha vakitlerini görün.`
      : `${topic.toLowerCase()} bilgisini, sonraki namaz geri sayımını ve günlük namaz takvimini konuma göre otomatik görün.`,
    inLanguage: "tr"
  },
  "zh-hans": {
    htmlLang: "zh-CN",
    dir: "ltr",
    title: (topic, place, type) => type === "home" && !place
      ? "Adantimer | 准确礼拜时间与下一次礼拜倒计时"
      : `${place ? `${place}` : ""}${topic} | Adantimer`,
    description: (topic, place) => place
      ? `查看 ${place} 的${topic}、下一次礼拜倒计时，以及 Fajr、Dhuhr、Asr、Maghrib 和 Isha 的完整时间表。`
      : `查看${topic}、下一次礼拜倒计时，以及根据位置自动加载的每日礼拜时间表。`,
    inLanguage: "zh-Hans"
  }
};

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const language = normalizeLanguage(url.searchParams.get("lang"));
    const locale = LOCALES[language] || LOCALES.en;
    const pageType = normalizePageType(url.searchParams.get("type"));
    const route = ROUTES[pageType] || ROUTES.home;
    const city = normalizeCity(url.searchParams.get("city") || "");
    const place = getDisplayPlaceName(city, language);
    const topic = getTopicLabel(route, language);
    const canonicalPath = buildRoutePath(language, pageType, city);
    const canonical = `${SITE_URL}${canonicalPath}`;
    const alternates = getAlternates(route, city);
    const title = locale.title(topic, place, pageType);
    const description = locale.description(topic, place);
    const copy = getServerCopy({ canonical, city, language, pageType, place, topic });
    const template = await readFile(INDEX_PATH, "utf8");
    const html = applyTemplate(template, {
      alternates,
      canonical,
      copy,
      description,
      locale,
      pageType,
      title
    });

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, s-maxage=3600, stale-while