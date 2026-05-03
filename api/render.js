import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getDhikrCategories,
  getDhikrItems
} from "../data/dhikr-entries.js";
import {
  getHadithCategories,
  getHadithItems
} from "../data/hadith-entries.js";
import {
  QURAN_SURAHS,
  getAdjacentQuranSurahs,
  getQuranSurahBySlug
} from "../data/quran-surahs.js";

const SITE_URL = "https://www.adantimer.com";
const INDEX_PATH = path.join(process.cwd(), "templates", "index.html");
const PRIORITY_CITY_CONFIG_PATH = path.join(process.cwd(), "data", "priority-cities.json");
const QURAN_API_BASE = "https://api.alquran.cloud/v1";
const QURAN_API_TIMEOUT_MS = 12000;
const QURAN_SURAH_CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const quranSurahCache = new Map();
const PRIORITY_CITY_CONFIG = JSON.parse(readFileSync(PRIORITY_CITY_CONFIG_PATH, "utf8"));
const PRIORITY_CITY_GROUPS = PRIORITY_CITY_CONFIG.groups || [];
const PRIORITY_CITY_GROUPS_BY_ID = new Map(PRIORITY_CITY_GROUPS.map(group => [group.id, group]));
const PRIORITY_CITY_BY_SLUG = new Map(
  PRIORITY_CITY_GROUPS.flatMap(group =>
    group.cities.map(city => [city.slug, { ...city, groupId: group.id }])
  )
);
const TOP_CITIES = getPriorityCitiesByGroupIds(PRIORITY_CITY_CONFIG.sitemaps?.englishTopGroups || []);
const ENGLISH_PRIORITY_HOME_CITIES = getPriorityCitiesByGroupIds(PRIORITY_CITY_CONFIG.sitemaps?.englishTopGroups || []);
const ENGLISH_PRIORITY_HOME_CITY_BY_SLUG = new Map(ENGLISH_PRIORITY_HOME_CITIES.map(city => [city.slug, city]));
const ARABIC_PRIORITY_HOME_CITIES = getPriorityCitiesByGroupIds(PRIORITY_CITY_CONFIG.sitemaps?.arabicCoreGroups || []);
const ARABIC_PRIORITY_HOME_CITY_BY_SLUG = new Map(ARABIC_PRIORITY_HOME_CITIES.map(city => [city.slug, city]));
const PRIORITY_HOME_CUSTOM_VARIANTS = {
  en: new Map([
    ["dubai", { cityName: "Dubai", variant: "dubai" }],
    ["mecca", { cityName: "Mecca", variant: "mecca" }],
    ["oran", { cityName: "Oran", variant: "generic" }],
    ["annaba", { cityName: "Annaba", variant: "generic" }],
    ["bouira", { cityName: "Bouira", variant: "generic" }],
    ["chesham", { cityName: "Chesham", variant: "generic" }]
  ]),
  ar: new Map([
    ["dubai", { cityName: "دبي", variant: "dubai" }],
    ["oran", { cityName: "وهران", variant: "generic" }],
    ["annaba", { cityName: "عنابة", variant: "generic" }],
    ["bouira", { cityName: "البويرة", variant: "generic" }]
  ]),
  fr: new Map([
    ["oran", { cityName: "Oran", variant: "oran" }],
    ["annaba", { cityName: "Annaba", variant: "generic" }],
    ["bouira", { cityName: "Bouira", variant: "generic" }]
  ])
};
const ENGLISH_PRIORITY_HOME_GENERIC_SLUGS = getPriorityHomeGenericSlugs(ENGLISH_PRIORITY_HOME_CITIES, "en");
const ARABIC_PRIORITY_HOME_GENERIC_SLUGS = getPriorityHomeGenericSlugs(ARABIC_PRIORITY_HOME_CITIES, "ar");

const CITY_NAME_LOCALIZATIONS = {
  "makkah": { ar: "\u0645\u0643\u0629", de: "Mekka", fr: "La Mecque", tr: "Mekke", "zh-hans": "\u9ea6\u52a0" },
  "mecca": { ar: "\u0645\u0643\u0629", de: "Mekka", fr: "La Mecque", tr: "Mekke", "zh-hans": "\u9ea6\u52a0" },
  "madinah": { ar: "\u0627\u0644\u0645\u062f\u064a\u0646\u0629", de: "Medina", fr: "Medine", tr: "Medine", "zh-hans": "\u9ea6\u5730\u90a3" },
  "medina": { ar: "\u0627\u0644\u0645\u062f\u064a\u0646\u0629", de: "Medina", fr: "Medine", tr: "Medine", "zh-hans": "\u9ea6\u5730\u90a3" },
  "buraydah": { ar: "\u0628\u0631\u064a\u062f\u0629", de: "Buraida", fr: "Buraidah", tr: "Bureyde", "zh-hans": "\u5e03\u8d56\u8fbe" },
  "cairo": { ar: "\u0627\u0644\u0642\u0627\u0647\u0631\u0629", de: "Kairo", fr: "Le Caire", tr: "Kahire", "zh-hans": "\u5f00\u7f57" },
  "dubai": { ar: "\u062f\u0628\u064a", de: "Dubai", fr: "Duba\u00ef", tr: "Dubai", "zh-hans": "\u8fea\u62dc" },
  "riyadh": { ar: "\u0627\u0644\u0631\u064a\u0627\u0636", de: "Riad", fr: "Riyad", tr: "Riyad", "zh-hans": "\u5229\u96c5\u5f97" },
  "istanbul": { ar: "\u0625\u0633\u0637\u0646\u0628\u0648\u0644", de: "Istanbul", fr: "Istanbul", tr: "\u0130stanbul", "zh-hans": "\u4f0a\u65af\u5766\u5e03\u5c14" },
  "kuala-lumpur": { ar: "\u0643\u0648\u0627\u0644\u0627 \u0644\u0645\u0628\u0648\u0631", de: "Kuala Lumpur", fr: "Kuala Lumpur", tr: "Kuala Lumpur", "zh-hans": "\u5409\u9686\u5761" },
  "johor-bahru": { ar: "\u062c\u0648\u0647\u0648\u0631 \u0628\u0647\u0631\u0648", de: "Johor Bahru", fr: "Johor Bahru", tr: "Johor Bahru", "zh-hans": "\u65b0\u5c71" },
  "jakarta": { ar: "\u062c\u0627\u0643\u0631\u062a\u0627", de: "Jakarta", fr: "Jakarta", tr: "Cakarta", "zh-hans": "\u96c5\u52a0\u8fbe" },
  "oran": { ar: "\u0648\u0647\u0631\u0627\u0646", de: "Oran", fr: "Oran", tr: "Oran", "zh-hans": "\u5965\u5170" },
  "annaba": { ar: "\u0639\u0646\u0627\u0628\u0629", de: "Annaba", fr: "Annaba", tr: "Annaba", "zh-hans": "\u5b89\u7eb3\u5df4" },
  "bouira": { ar: "\u0627\u0644\u0628\u0648\u064a\u0631\u0629", de: "Bouira", fr: "Bouira", tr: "Bouira", "zh-hans": "Bouira" },
  "ain-benian": { ar: "\u0639\u064a\u0646 \u0627\u0644\u0628\u0646\u064a\u0627\u0646", de: "Ain Benian", fr: "Ain Benian", tr: "Ain Benian", "zh-hans": "Ain Benian" },
  "chesham": { ar: "\u062a\u0634\u064a\u0634\u0627\u0645", de: "Chesham", fr: "Chesham", tr: "Chesham", "zh-hans": "Chesham" },
  "london": { ar: "\u0644\u0646\u062f\u0646", de: "London", fr: "Londres", tr: "Londra", "zh-hans": "\u4f26\u6566" },
  "new-york": { ar: "\u0646\u064a\u0648\u064a\u0648\u0631\u0643", de: "New York", fr: "New York", tr: "New York", "zh-hans": "\u7ebd\u7ea6" },
  "singapore": { ar: "\u0633\u0646\u063a\u0627\u0641\u0648\u0631\u0629", de: "Singapur", fr: "Singapour", tr: "Singapur", "zh-hans": "\u65b0\u52a0\u5761" },
  "sydney": { ar: "\u0633\u064a\u062f\u0646\u064a", de: "Sydney", fr: "Sydney", tr: "Sidney", "zh-hans": "\u6089\u5c3c" },
  "berlin": { ar: "\u0628\u0631\u0644\u064a\u0646", de: "Berlin", fr: "Berlin", tr: "Berlin", "zh-hans": "\u67cf\u6797" },
  "paris": { ar: "\u0628\u0627\u0631\u064a\u0633", de: "Paris", fr: "Paris", tr: "Paris", "zh-hans": "\u5df4\u9ece" },
  "shanghai": { ar: "\u0634\u0646\u063a\u0647\u0627\u064a", de: "Shanghai", fr: "Shanghai", tr: "\u015eanhay", "zh-hans": "\u4e0a\u6d77" }
};

const COUNTRY_NAME_LOCALIZATIONS = {
  "saudi arabia": { ar: "\u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629", de: "Saudi-Arabien", fr: "Arabie saoudite", tr: "Suudi Arabistan", "zh-hans": "\u6c99\u7279\u963f\u62c9\u4f2f" },
  "egypt": { ar: "\u0645\u0635\u0631", de: "\u00c4gypten", fr: "\u00c9gypte", tr: "M\u0131s\u0131r", "zh-hans": "\u57c3\u53ca" },
  "malaysia": { ar: "\u0645\u0627\u0644\u064a\u0632\u064a\u0627", de: "Malaysia", fr: "Malaisie", tr: "Malezya", "zh-hans": "\u9a6c\u6765\u897f\u4e9a" },
  "indonesia": { ar: "\u0625\u0646\u062f\u0648\u0646\u064a\u0633\u064a\u0627", de: "Indonesien", fr: "Indon\u00e9sie", tr: "Endonezya", "zh-hans": "\u5370\u5ea6\u5c3c\u897f\u4e9a" },
  "algeria": { ar: "\u0627\u0644\u062c\u0632\u0627\u0626\u0631", de: "Algerien", fr: "Alg\u00e9rie", tr: "Cezayir", "zh-hans": "\u963f\u5c14\u53ca\u5229\u4e9a" },
  "united arab emirates": { ar: "\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a", de: "Vereinigte Arabische Emirate", fr: "\u00c9mirats arabes unis", tr: "Birle\u015fik Arap Emirlikleri", "zh-hans": "\u963f\u8054\u914b" },
  "turkey": { ar: "\u062a\u0631\u0643\u064a\u0627", de: "T\u00fcrkei", fr: "Turquie", tr: "T\u00fcrkiye", "zh-hans": "\u571f\u8033\u5176" },
  "united kingdom": { ar: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629", de: "Vereinigtes K\u00f6nigreich", fr: "Royaume-Uni", tr: "Birle\u015fik Krall\u0131k", "zh-hans": "\u82f1\u56fd" },
  "united states": { ar: "\u0627\u0644\u0648\u0644\u0627\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u062d\u062f\u0629", de: "Vereinigte Staaten", fr: "\u00c9tats-Unis", tr: "Amerika Birle\u015fik Devletleri", "zh-hans": "\u7f8e\u56fd" },
  "australia": { ar: "\u0623\u0633\u062a\u0631\u0627\u0644\u064a\u0627", de: "Australien", fr: "Australie", tr: "Avustralya", "zh-hans": "\u6fb3\u5927\u5229\u4e9a" },
  "singapore": { ar: "\u0633\u0646\u063a\u0627\u0641\u0648\u0631\u0629", de: "Singapur", fr: "Singapour", tr: "Singapur", "zh-hans": "\u65b0\u52a0\u5761" },
  "germany": { ar: "\u0623\u0644\u0645\u0627\u0646\u064a\u0627", de: "Deutschland", fr: "Allemagne", tr: "Almanya", "zh-hans": "\u5fb7\u56fd" },
  "france": { ar: "\u0641\u0631\u0646\u0633\u0627", de: "Frankreich", fr: "France", tr: "Fransa", "zh-hans": "\u6cd5\u56fd" },
  "china": { ar: "\u0627\u0644\u0635\u064a\u0646", de: "China", fr: "Chine", tr: "\u00c7in", "zh-hans": "\u4e2d\u56fd" }
};

const PRIORITY_GROUP_LABELS = {
  en: {
    core: "Core cities",
    "southeast-asia": "Southeast Asia",
    global: "Global cities",
    intents: "Priority intents"
  },
  ar: {
    core: "المدن الأساسية",
    "southeast-asia": "جنوب شرق آسيا",
    global: "مدن عالمية",
    intents: "صفحات النية الأساسية"
  },
  de: {
    core: "Kernstädte",
    "southeast-asia": "Südostasien",
    global: "Globale Städte",
    intents: "Prioritäts-Intents"
  },
  fr: {
    core: "Villes clés",
    "southeast-asia": "Asie du Sud-Est",
    global: "Villes mondiales",
    intents: "Intentions prioritaires"
  },
  tr: {
    core: "Çekirdek şehirler",
    "southeast-asia": "Güneydoğu Asya",
    global: "Küresel şehirler",
    intents: "Öncelikli aramalar"
  },
  "zh-hans": {
    core: "核心城市",
    "southeast-asia": "东南亚",
    global: "全球城市",
    intents: "重点意图页面"
  }
};

const ROUTES = {
  home: { en: "Prayer Times", ar: "مواقيت الصلاة", path: city => city ? `/${slugify(city)}` : "/" },
  "prayer-times": { en: "Prayer Times", ar: "مواقيت الصلاة", path: city => city ? `/prayer-times/${slugify(city)}` : "/prayer-times" },
  "next-prayer": { en: "Next Prayer Time", ar: "وقت الصلاة القادمة", path: city => city ? `/next-prayer/${slugify(city)}` : "/next-prayer" },
  fajr: { en: "Fajr Time", ar: "وقت الفجر", path: city => city ? `/fajr-time/${slugify(city)}` : "/fajr-time" },
  dhuhr: { en: "Dhuhr Time", ar: "وقت الظهر", path: city => city ? `/dhuhr-time/${slugify(city)}` : "/dhuhr-time" },
  asr: { en: "Asr Time", ar: "وقت العصر", path: city => city ? `/asr-time/${slugify(city)}` : "/asr-time" },
  maghrib: { en: "Maghrib Time", ar: "وقت المغرب", path: city => city ? `/maghrib-time/${slugify(city)}` : "/maghrib-time" },
  isha: { en: "Isha Time", ar: "وقت العشاء", path: city => city ? `/isha-time/${slugify(city)}` : "/isha-time" },
  qibla: { en: "Qibla Direction", ar: "اتجاه القبلة", path: () => "/qibla" },
  quran: { en: "Quran", ar: "القرآن", path: () => "/quran" },
  "quran-surah": { en: "Quran", ar: "القرآن", path: (city, surahSlug) => surahSlug ? `/quran/${slugify(surahSlug)}` : "/quran" },
  dhikr: { en: "Dhikr", ar: "الذكر", path: () => "/dhikr" },
  "dhikr-collection": { en: "Dhikr", ar: "الذكر", path: (city, collectionSlug) => collectionSlug ? `/dhikr/${getDhikrCollectionRouteSlug(collectionSlug)}` : "/dhikr" },
  hadith: { en: "Hadith", ar: "الحديث", path: () => "/hadith" },
  "hadith-collection": { en: "Hadith", ar: "الحديث", path: (city, collectionSlug) => collectionSlug ? `/hadith/${getHadithCollectionRouteSlug(collectionSlug)}` : "/hadith" }
};

const LOCALES = {
  en: {
    htmlLang: "en",
    dir: "ltr",
    inLanguage: "en",
    title: (topic, place, pageType) => pageType === "home" && !place
      ? "Adantimer | Accurate Prayer Times and Next Salah Countdown"
      : `${topic}${place ? ` in ${place}` : ""} Today | Adantimer`,
    description: (topic, place) => place
      ? `Check accurate ${topic.toLowerCase()} in ${place}, see the next salah countdown, and review today's Fajr, Dhuhr, Asr, Maghrib, and Isha schedule.`
      : `Check accurate ${topic.toLowerCase()}, see the next salah countdown, and review today's prayer schedule automatically by location.`
  },
  ar: {
    htmlLang: "ar",
    dir: "rtl",
    inLanguage: "ar",
    title: (topic, place, pageType) => pageType === "home" && !place
      ? "Adantimer | مواقيت الصلاة ووقت الصلاة القادمة"
      : `${topic}${place ? ` في ${place}` : ""} اليوم | Adantimer`,
    description: (topic, place) => place
      ? `تحقق من ${topic} في ${place} اليوم، واعرف وقت الصلاة القادمة وجدول الفجر والظهر والعصر والمغرب والعشاء.`
      : `تحقق من ${topic} اليوم واعرف وقت الصلاة القادمة وجدول الصلوات حسب موقعك تلقائيا.`
  }
};

const SUPPORTED_RENDER_LANGUAGES = ["en", "ar", "de", "fr", "tr", "zh-hans"];

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

const LANGUAGE_PREFIXES = {
  ar: "/ar",
  de: "/de",
  fr: "/fr",
  tr: "/tr",
  "zh-hans": "/zh-hans"
};

Object.assign(ROUTES.home, {
  de: "Gebetszeiten",
  fr: "Horaires de prière",
  tr: "Namaz Vakitleri",
  "zh-hans": "礼拜时间"
});

Object.assign(ROUTES["prayer-times"], {
  de: "Gebetszeiten",
  fr: "Horaires de prière",
  tr: "Namaz Vakitleri",
  "zh-hans": "礼拜时间"
});

Object.assign(ROUTES["next-prayer"], {
  de: "Zeit des nächsten Gebets",
  fr: "Heure de la prochaine prière",
  tr: "Sonraki Namaz Vakti",
  "zh-hans": "下一次礼拜时间"
});

Object.assign(ROUTES.fajr, {
  de: "Fajr-Zeit",
  fr: "Heure du Fajr",
  tr: "Fajr Vakti",
  "zh-hans": "晨礼时间"
});

Object.assign(ROUTES.dhuhr, {
  de: "Dhuhr-Zeit",
  fr: "Heure du Dhuhr",
  tr: "Dhuhr Vakti",
  "zh-hans": "晌礼时间"
});

Object.assign(ROUTES.asr, {
  de: "Asr-Zeit",
  fr: "Heure de l'Asr",
  tr: "Asr Vakti",
  "zh-hans": "晡礼时间"
});

Object.assign(ROUTES.maghrib, {
  de: "Maghrib-Zeit",
  fr: "Heure du Maghrib",
  tr: "Maghrib Vakti",
  "zh-hans": "昏礼时间"
});

Object.assign(ROUTES.isha, {
  de: "Isha-Zeit",
  fr: "Heure de l'Isha",
  tr: "Isha Vakti",
  "zh-hans": "宵礼时间"
});

Object.assign(ROUTES.qibla, {
  de: "Qibla-Richtung",
  fr: "Direction de la Qibla",
  tr: "Kible Yonu",
  "zh-hans": "Qibla方向"
});

Object.assign(ROUTES.quran, {
  de: "Koran",
  fr: "Coran",
  tr: "Kuran",
  "zh-hans": "古兰经"
});

Object.assign(ROUTES["quran-surah"], {
  de: "Koran",
  fr: "Coran",
  tr: "Kuran",
  "zh-hans": "古兰经"
});

Object.assign(ROUTES.dhikr, {
  de: "Dhikr",
  fr: "Dhikr",
  tr: "Zikir",
  "zh-hans": "记念"
});

Object.assign(ROUTES["dhikr-collection"], {
  de: "Dhikr",
  fr: "Dhikr",
  tr: "Zikir",
  "zh-hans": "记念"
});

Object.assign(ROUTES.hadith, {
  de: "Hadith",
  fr: "Hadith",
  tr: "Hadis",
  "zh-hans": "圣训"
});

Object.assign(ROUTES["hadith-collection"], {
  de: "Hadith",
  fr: "Hadith",
  tr: "Hadis",
  "zh-hans": "圣训"
});

Object.assign(LOCALES, {
  de: {
    htmlLang: "de",
    dir: "ltr",
    inLanguage: "de",
    title: (topic, place, pageType) => pageType === "home" && !place
      ? "Adantimer | Genaue Gebetszeiten und nächstes Gebet"
      : `${topic}${place ? ` in ${place}` : ""} heute | Adantimer`,
    description: (topic, place) => place
      ? `Prüfe ${topic} in ${place}, sieh das nächste Gebet und den heutigen Gebetsplan.`
      : `Prüfe ${topic} und den heutigen Gebetsplan automatisch nach Standort.`
  },
  fr: {
    htmlLang: "fr",
    dir: "ltr",
    inLanguage: "fr",
    title: (topic, place, pageType) => pageType === "home" && !place
      ? "Adantimer | Horaires de prière précis et prochaine prière"
      : `${topic}${place ? ` à ${place}` : ""} aujourd'hui | Adantimer`,
    description: (topic, place) => place
      ? `Consultez ${topic} à ${place}, la prochaine prière et le planning du jour.`
      : `Consultez ${topic} et le planning du jour selon la localisation.`
  },
  tr: {
    htmlLang: "tr",
    dir: "ltr",
    inLanguage: "tr",
    title: (topic, place, pageType) => pageType === "home" && !place
      ? "Adantimer | Doğru namaz vakitleri ve sonraki namaz"
      : `${place ? `${place} için ${topic}` : topic} | Adantimer`,
    description: (topic, place) => place
      ? `${place} için ${topic} bilgisini, sonraki namazı ve günlük takvimi görüntüleyin.`
      : `${topic} bilgisini ve günlük namaz takvimini konuma göre görüntüleyin.`
  },
  "zh-hans": {
    htmlLang: "zh-CN",
    dir: "ltr",
    inLanguage: "zh-Hans",
    title: (topic, place, pageType) => pageType === "home" && !place
      ? "Adantimer | 准确礼拜时间与下一次礼拜"
      : `${place ? `${place}` : ""}${topic} | Adantimer`,
    description: (topic, place) => place
      ? `查看 ${place} 的${topic}、下一次礼拜以及今日完整时间表。`
      : `按位置查看${topic}与今日完整礼拜时间表。`
  }
});

const INLINE_LINK_CONNECTORS = {
  ar: "و",
  de: "und",
  fr: "et",
  tr: "ve",
  "zh-hans": "和"
};

const REVELATION_LABELS = {
  en: { meccan: "Meccan", medinan: "Medinan" },
  ar: { meccan: "مكية", medinan: "مدنية" },
  de: { meccan: "Mekkanisch", medinan: "Medinensisch" },
  fr: { meccan: "Mecquoise", medinan: "Médinoise" },
  tr: { meccan: "Mekke", medinan: "Medine" },
  "zh-hans": { meccan: "麦加时期", medinan: "麦地那时期" }
};

const QURAN_INDEX_CONTENT = {
  en: {
    heroEyebrow: "Quran",
    heroHeading: "Read the Quran by surah",
    heroSubtitle: "Browse all 114 surahs, jump into a reading page quickly, and keep the Quran available as a dedicated page inside Adantimer.",
    searchLabel: "Search surahs",
    searchPlaceholder: "Search by surah name or number",
    searchHint: "Filter by transliteration, Arabic name, translated name, or surah number.",
    searchCount: count => `${count} surahs available`,
    emptyState: "No surah matched that search yet.",
    stats: [
      { value: "114", label: "Surahs" },
      { value: "6,236", label: "Ayat" },
      { value: "Standalone", label: "Reader page" }
    ],
    sectionEyebrow: "Surah index",
    sectionTitle: "Start with a surah",
    sectionIntro: "Open a surah directly and keep the Quran on its own focused page instead of mixing it into the prayer schedule.",
    faq: [
      {
        question: "Can I search Quran surahs on this page?",
        answer: "Yes. The Quran index page includes a client-side search field so visitors can filter surahs by name, Arabic title, translated title, or number."
      },
      {
        question: "Does this page already include all 114 surahs?",
        answer: "Yes. The page ships with a full local surah index so the main Quran directory is available immediately in the first HTML response."
      },
      {
        question: "Is this a standalone Quran page or part of the prayer schedule?",
        answer: "It is a standalone Quran page. The Quran index is separated from the prayer-time schedule so visitors can stay focused on reading."
      }
    ],
    footerText: "Dedicated Quran index and reading pages inside Adantimer.",
    noscriptText: "JavaScript is only needed for the Quran search filter. The surah index itself is already visible.",
    metaTitle: "Quran Surah Index and Reading Page | Adantimer",
    metaDescription: "Browse all 114 Quran surahs, search by name or number, and open a focused Quran reading page inside Adantimer."
  },
  ar: {
    heroEyebrow: "القرآن",
    heroHeading: "اقرأ القرآن حسب السورة",
    heroSubtitle: "تصفح جميع السور الـ 114، وانتقل بسرعة إلى صفحة القراءة، واجعل القرآن صفحة مستقلة داخل Adantimer.",
    searchLabel: "ابحث في السور",
    searchPlaceholder: "ابحث باسم السورة أو رقمها",
    searchHint: "يمكنك التصفية باسم السورة أو الاسم العربي أو الترجمة أو رقم السورة.",
    searchCount: count => `${count} سورة متاحة`,
    emptyState: "لا توجد سورة تطابق هذا البحث حالياً.",
    stats: [
      { value: "114", label: "سورة" },
      { value: "6,236", label: "آية" },
      { value: "مستقلة", label: "صفحة قراءة" }
    ],
    sectionEyebrow: "فهرس السور",
    sectionTitle: "ابدأ بسورة",
    sectionIntro: "افتح أي سورة مباشرة واحتفظ بالقرآن في صفحة مستقلة مركزة بدلاً من دمجه داخل جدول الصلاة.",
    faq: [
      {
        question: "هل يمكنني البحث في السور من هذه الصفحة؟",
        answer: "نعم. تحتوي صفحة فهرس القرآن على حقل بحث لتصفية السور بالاسم أو العنوان العربي أو الترجمة أو رقم السورة."
      },
      {
        question: "هل تضم الصفحة جميع السور الـ 114 بالفعل؟",
        answer: "نعم. يتم تحميل فهرس كامل للسور محلياً بحيث تكون صفحة القرآن الأساسية متاحة مباشرة في أول استجابة HTML."
      },
      {
        question: "هل هذه صفحة قرآن مستقلة أم جزء من صفحة مواقيت الصلاة؟",
        answer: "هذه صفحة قرآن مستقلة. تم فصل فهرس القرآن عن صفحة مواقيت الصلاة حتى يبقى التركيز على القراءة."
      }
    ],
    footerText: "فهرس وصفحات قراءة القرآن داخل Adantimer.",
    noscriptText: "يحتاج فلتر البحث فقط إلى JavaScript، أما فهرس السور نفسه فهو ظاهر بالفعل.",
    metaTitle: "فهرس سور القرآن وصفحة القراءة | Adantimer",
    metaDescription: "تصفح جميع سور القرآن الـ 114، وابحث بالاسم أو الرقم، وافتح صفحة قراءة قرآنية مستقلة داخل Adantimer."
  },
  de: {
    heroEyebrow: "Koran",
    heroHeading: "Lies den Koran nach Suren",
    heroSubtitle: "Durchsuche alle 114 Suren, öffne schnell eine Leseseite und halte den Koran als eigene fokussierte Seite in Adantimer bereit.",
    searchLabel: "Suren suchen",
    searchPlaceholder: "Nach Surenname oder Nummer suchen",
    searchHint: "Filtere nach Transliteration, arabischem Namen, Übersetzung oder Surennummer.",
    searchCount: count => `${count} Suren verfügbar`,
    emptyState: "Keine Sure passt aktuell zu dieser Suche.",
    stats: [
      { value: "114", label: "Suren" },
      { value: "6.236", label: "Verse" },
      { value: "Eigenständig", label: "Leseseite" }
    ],
    sectionEyebrow: "Surenverzeichnis",
    sectionTitle: "Mit einer Sure beginnen",
    sectionIntro: "Öffne eine Sure direkt und halte den Koran auf einer eigenen fokussierten Seite statt ihn in den Gebetsplan zu mischen.",
    faq: [
      {
        question: "Kann ich auf dieser Seite nach Suren suchen?",
        answer: "Ja. Die Koran-Indexseite enthält ein Suchfeld, das nach Name, arabischem Titel, Übersetzung oder Surennummer filtern kann."
      },
      {
        question: "Enthält diese Seite bereits alle 114 Suren?",
        answer: "Ja. Die Seite liefert ein vollständiges lokales Surenverzeichnis aus, sodass die Hauptübersicht schon im ersten HTML vorhanden ist."
      },
      {
        question: "Ist das eine eigenständige Koranseite oder Teil des Gebetsplans?",
        answer: "Es ist eine eigenständige Koranseite. Der Koranindex ist vom Gebetsplan getrennt, damit der Fokus auf dem Lesen bleibt."
      }
    ],
    footerText: "Eigenständige Koran-Index- und Leseseiten in Adantimer.",
    noscriptText: "JavaScript wird nur für den Suchfilter benötigt. Das Surenverzeichnis selbst ist bereits sichtbar.",
    metaTitle: "Koran-Surenverzeichnis und Leseseite | Adantimer",
    metaDescription: "Durchsuche alle 114 Koran-Suren, suche nach Name oder Nummer und öffne eine eigenständige Koran-Leseseite in Adantimer."
  },
  fr: {
    heroEyebrow: "Coran",
    heroHeading: "Lire le Coran par sourate",
    heroSubtitle: "Parcourez les 114 sourates, ouvrez rapidement une page de lecture et gardez le Coran sur une page dédiée dans Adantimer.",
    searchLabel: "Rechercher des sourates",
    searchPlaceholder: "Rechercher par nom ou numéro de sourate",
    searchHint: "Filtrez par translittération, nom arabe, nom traduit ou numéro de sourate.",
    searchCount: count => `${count} sourates disponibles`,
    emptyState: "Aucune sourate ne correspond à cette recherche pour le moment.",
    stats: [
      { value: "114", label: "Sourates" },
      { value: "6 236", label: "Versets" },
      { value: "Dédiée", label: "Page de lecture" }
    ],
    sectionEyebrow: "Index des sourates",
    sectionTitle: "Commencer par une sourate",
    sectionIntro: "Ouvrez une sourate directement et gardez le Coran sur une page dédiée au lieu de le mélanger au planning de prière.",
    faq: [
      {
        question: "Puis-je rechercher des sourates sur cette page ?",
        answer: "Oui. La page d'index du Coran comprend un champ de recherche pour filtrer par nom, titre arabe, titre traduit ou numéro de sourate."
      },
      {
        question: "Cette page contient-elle déjà les 114 sourates ?",
        answer: "Oui. La page embarque un index local complet des sourates afin que le répertoire principal soit déjà présent dans le premier HTML."
      },
      {
        question: "S'agit-il d'une page Coran autonome ou d'une partie du planning de prière ?",
        answer: "C'est une page Coran autonome. L'index du Coran est séparé du planning de prière pour garder le focus sur la lecture."
      }
    ],
    footerText: "Pages dédiées à l'index et à la lecture du Coran dans Adantimer.",
    noscriptText: "JavaScript n'est nécessaire que pour le filtre de recherche. L'index des sourates reste déjà visible.",
    metaTitle: "Index des sourates du Coran et page de lecture | Adantimer",
    metaDescription: "Parcourez les 114 sourates du Coran, recherchez par nom ou numéro et ouvrez une page de lecture dédiée dans Adantimer."
  },
  tr: {
    heroEyebrow: "Kuran",
    heroHeading: "Surelere göre Kuran oku",
    heroSubtitle: "Tüm 114 sureyi incele, okuma sayfasına hızlıca geç ve Kuran'ı Adantimer içinde ayrı bir odak sayfası olarak tut.",
    searchLabel: "Sure ara",
    searchPlaceholder: "Sure adı veya numarasına göre ara",
    searchHint: "Latin yazım, Arapça ad, çevrilmiş ad veya sure numarasına göre filtrele.",
    searchCount: count => `${count} sure hazır`,
    emptyState: "Bu aramaya uyan sure bulunamadı.",
    stats: [
      { value: "114", label: "Sure" },
      { value: "6.236", label: "Ayet" },
      { value: "Ayrı", label: "Okuma sayfası" }
    ],
    sectionEyebrow: "Sure dizini",
    sectionTitle: "Bir sure ile başla",
    sectionIntro: "Bir sureyi doğrudan aç ve Kuran'ı namaz çizelgesine karıştırmak yerine ayrı bir odak sayfasında tut.",
    faq: [
      {
        question: "Bu sayfada sure arayabilir miyim?",
        answer: "Evet. Kuran dizin sayfasında sure adı, Arapça başlık, çevrilmiş ad veya sure numarasına göre çalışan bir arama alanı bulunur."
      },
      {
        question: "Bu sayfa gerçekten 114 surenin tamamını içeriyor mu?",
        answer: "Evet. Sayfa tam yerel sure dizinini taşır, böylece ana Kuran rehberi ilk HTML içinde hazır gelir."
      },
      {
        question: "Bu bağımsız bir Kuran sayfası mı yoksa namaz çizelgesinin parçası mı?",
        answer: "Bu bağımsız bir Kuran sayfasıdır. Kuran dizini, okuma odağını korumak için namaz çizelgesinden ayrılmıştır."
      }
    ],
    footerText: "Adantimer içinde özel Kuran dizin ve okuma sayfaları.",
    noscriptText: "JavaScript sadece arama filtresi için gerekir. Sure dizini zaten görünür durumdadır.",
    metaTitle: "Kuran sure dizini ve okuma sayfası | Adantimer",
    metaDescription: "Tüm 114 Kuran suresini incele, ad veya numaraya göre ara ve Adantimer içinde özel bir Kuran okuma sayfası aç."
  },
  "zh-hans": {
    heroEyebrow: "古兰经",
    heroHeading: "按章节阅读古兰经",
    heroSubtitle: "浏览全部 114 章，快速进入阅读页面，并让古兰经在 Adantimer 中保持独立的专用页面。",
    searchLabel: "搜索章节",
    searchPlaceholder: "按章节名称或编号搜索",
    searchHint: "可按音译名、阿拉伯文名称、翻译名称或章节编号筛选。",
    searchCount: count => `共 ${count} 章`,
    emptyState: "当前没有匹配该搜索的章节。",
    stats: [
      { value: "114", label: "章" },
      { value: "6,236", label: "节" },
      { value: "独立", label: "阅读页面" }
    ],
    sectionEyebrow: "章节索引",
    sectionTitle: "从一章开始",
    sectionIntro: "直接打开任意章节，让古兰经保持为独立专注页面，而不是混在礼拜时间页面里。",
    faq: [
      {
        question: "我可以在这个页面里搜索章节吗？",
        answer: "可以。古兰经索引页带有搜索框，可按章节名称、阿拉伯文标题、翻译标题或章节编号筛选。"
      },
      {
        question: "这个页面已经包含全部 114 章了吗？",
        answer: "是的。页面内置完整的本地章节索引，因此主目录在首个 HTML 响应里就已经可用。"
      },
      {
        question: "这是独立的古兰经页面，还是礼拜时间页面的一部分？",
        answer: "这是独立的古兰经页面。古兰经索引与礼拜时间页面分离，以保持阅读场景专注。"
      }
    ],
    footerText: "Adantimer 内的独立古兰经索引与阅读页面。",
    noscriptText: "JavaScript 仅用于搜索筛选，章节索引本身已经直接显示。",
    metaTitle: "古兰经章节索引与阅读页面 | Adantimer",
    metaDescription: "浏览全部 114 个古兰经章节，按名称或编号搜索，并在 Adantimer 中打开独立的古兰经阅读页面。"
  }
};

const QURAN_SURAH_CONTENT = {
  en: {
    heroEyebrow: "Quran Reader",
    sectionEyebrow: "Full surah text",
    sectionTitle: surah => `Read Surah ${surah.nameSimple}`,
    sectionIntro: surah => `Read the full Arabic text of Surah ${surah.nameSimple}, keep the page shareable, and move directly to the previous or next surah.`,
    backLabel: "Back to all surahs",
    previousLabel: "Previous surah",
    nextLabel: "Next surah",
    versesLabel: ayahs => `${ayahs} ayahs`,
    revelationPrefix: "Revelation",
    emptyText: "We could not load the surah text right now. Please try again in a moment.",
    faq: surah => [
      {
        question: `Can I share the Surah ${surah.nameSimple} page directly?`,
        answer: `Yes. Each surah has its own direct route, so you can reopen or share Surah ${surah.nameSimple} without returning to the index.`
      },
      {
        question: "Is the surah text rendered directly on the page?",
        answer: "Yes. The surah reader is server-rendered so the ayahs are already present in the initial HTML response."
      },
      {
        question: "Can I continue to the next or previous surah?",
        answer: "Yes. Each surah page includes direct navigation to the previous and next surah where available."
      }
    ],
    footerText: surah => `Standalone Quran reading page for Surah ${surah.nameSimple} inside Adantimer.`,
    noscriptText: "JavaScript is not required to read this surah page.",
    metaTitle: surah => `Surah ${surah.nameSimple} Reader | Adantimer`,
    metaDescription: surah => `Read Surah ${surah.nameSimple} in Arabic, review its ayah count and revelation type, and move through the Quran from a focused reading page inside Adantimer.`
  },
  ar: {
    heroEyebrow: "قارئ القرآن",
    sectionEyebrow: "نص السورة كاملًا",
    sectionTitle: surah => `اقرأ سورة ${surah.nameSimple}`,
    sectionIntro: surah => `اقرأ النص العربي الكامل لسورة ${surah.nameSimple}، واحتفظ بصفحة مباشرة قابلة للمشاركة، وانتقل مباشرة إلى السورة السابقة أو التالية.`,
    backLabel: "العودة إلى جميع السور",
    previousLabel: "السورة السابقة",
    nextLabel: "السورة التالية",
    versesLabel: ayahs => `${ayahs} آية`,
    revelationPrefix: "النزول",
    emptyText: "تعذر تحميل نص السورة الآن. حاول مرة أخرى بعد قليل.",
    faq: surah => [
      {
        question: `هل يمكنني مشاركة صفحة سورة ${surah.nameSimple} مباشرة؟`,
        answer: `نعم. لكل سورة مسار مباشر خاص بها، لذلك يمكنك إعادة فتح سورة ${surah.nameSimple} أو مشاركتها بسهولة دون الرجوع إلى الفهرس.`
      },
      {
        question: "هل يتم عرض نص السورة مباشرة داخل الصفحة؟",
        answer: "نعم. يتم إنشاء صفحة السورة من الخادم بحيث تكون الآيات موجودة بالفعل في أول استجابة HTML."
      },
      {
        question: "هل يمكنني الانتقال إلى السورة السابقة أو التالية؟",
        answer: "نعم. تتضمن كل صفحة سورة روابط مباشرة إلى السورة السابقة والتالية عند توفرها."
      }
    ],
    footerText: surah => `صفحة قراءة مستقلة لسورة ${surah.nameSimple} داخل Adantimer.`,
    noscriptText: "لا يلزم JavaScript لقراءة صفحة السورة هذه.",
    metaTitle: surah => `قراءة سورة ${surah.nameSimple} | Adantimer`,
    metaDescription: surah => `اقرأ سورة ${surah.nameSimple} بالنص العربي، وراجع عدد الآيات ونوع النزول، وانتقل في القرآن من صفحة قراءة مركزة داخل Adantimer.`
  },
  de: {
    heroEyebrow: "Koran-Leser",
    sectionEyebrow: "Vollständiger Surentext",
    sectionTitle: surah => `Sure ${surah.nameSimple} lesen`,
    sectionIntro: surah => `Lies den vollständigen arabischen Text der Sure ${surah.nameSimple}, nutze eine direkt teilbare Seite und wechsle sofort zur vorherigen oder nächsten Sure.`,
    backLabel: "Zurück zu allen Suren",
    previousLabel: "Vorherige Sure",
    nextLabel: "Nächste Sure",
    versesLabel: ayahs => `${ayahs} Verse`,
    revelationPrefix: "Offenbarung",
    emptyText: "Der Surentext konnte gerade nicht geladen werden. Bitte versuche es gleich noch einmal.",
    faq: surah => [
      {
        question: `Kann ich die Seite für Sure ${surah.nameSimple} direkt teilen?`,
        answer: `Ja. Jede Sure hat ihre eigene direkte Route. Du kannst die Seite für Sure ${surah.nameSimple} daher leicht erneut öffnen oder teilen.`
      },
      {
        question: "Wird der Surentext direkt in der Seite gerendert?",
        answer: "Ja. Die Surenseite wird serverseitig gerendert, sodass die Ayat bereits im ersten HTML enthalten sind."
      },
      {
        question: "Kann ich zur vorherigen oder nächsten Sure wechseln?",
        answer: "Ja. Jede Surenseite enthält direkte Navigation zur vorherigen und nächsten Sure, sofern vorhanden."
      }
    ],
    footerText: surah => `Eigenständige Koran-Leseseite für Sure ${surah.nameSimple} in Adantimer.`,
    noscriptText: "JavaScript wird zum Lesen dieser Surenseite nicht benötigt.",
    metaTitle: surah => `Sure ${surah.nameSimple} lesen | Adantimer`,
    metaDescription: surah => `Lies Sure ${surah.nameSimple} auf Arabisch, sieh Anzahl der Verse und Offenbarungsart und bewege dich über eine fokussierte Leseseite durch den Koran.`
  },
  fr: {
    heroEyebrow: "Lecteur du Coran",
    sectionEyebrow: "Texte complet de la sourate",
    sectionTitle: surah => `Lire la sourate ${surah.nameSimple}`,
    sectionIntro: surah => `Lisez le texte arabe complet de la sourate ${surah.nameSimple}, gardez une page partageable et passez directement à la sourate précédente ou suivante.`,
    backLabel: "Retour à toutes les sourates",
    previousLabel: "Sourate précédente",
    nextLabel: "Sourate suivante",
    versesLabel: ayahs => `${ayahs} versets`,
    revelationPrefix: "Révélation",
    emptyText: "Impossible de charger le texte de la sourate pour le moment. Réessayez dans un instant.",
    faq: surah => [
      {
        question: `Puis-je partager directement la page de la sourate ${surah.nameSimple} ?`,
        answer: `Oui. Chaque sourate possède sa propre route directe, vous pouvez donc rouvrir ou partager la page de ${surah.nameSimple} facilement.`
      },
      {
        question: "Le texte de la sourate est-il rendu directement dans la page ?",
        answer: "Oui. La page de sourate est rendue côté serveur, de sorte que les ayahs sont déjà présentes dans le premier HTML."
      },
      {
        question: "Puis-je passer à la sourate précédente ou suivante ?",
        answer: "Oui. Chaque page de sourate inclut une navigation directe vers la sourate précédente et suivante si elles existent."
      }
    ],
    footerText: surah => `Page de lecture autonome pour la sourate ${surah.nameSimple} dans Adantimer.`,
    noscriptText: "JavaScript n'est pas nécessaire pour lire cette page de sourate.",
    metaTitle: surah => `Lire la sourate ${surah.nameSimple} | Adantimer`,
    metaDescription: surah => `Lisez la sourate ${surah.nameSimple} en arabe, consultez son nombre de versets et son type de révélation, puis avancez dans le Coran depuis une page dédiée.`
  },
  tr: {
    heroEyebrow: "Kuran Okuyucu",
    sectionEyebrow: "Sure metninin tam hali",
    sectionTitle: surah => `${surah.nameSimple} suresini oku`,
    sectionIntro: surah => `${surah.nameSimple} suresinin tam Arapça metnini oku, doğrudan paylaşılabilir bir sayfada kal ve önceki ya da sonraki sureye geç.`,
    backLabel: "Tüm surelere dön",
    previousLabel: "Önceki sure",
    nextLabel: "Sonraki sure",
    versesLabel: ayahs => `${ayahs} ayet`,
    revelationPrefix: "Nüzul",
    emptyText: "Sure metni şu anda yüklenemedi. Lütfen biraz sonra tekrar dene.",
    faq: surah => [
      {
        question: `${surah.nameSimple} suresi sayfasını doğrudan paylaşabilir miyim?`,
        answer: `Evet. Her surenin kendi doğrudan rotası vardır; ${surah.nameSimple} suresi sayfasını kolayca tekrar açabilir veya paylaşabilirsin.`
      },
      {
        question: "Sure metni sayfada doğrudan sunucu tarafından mı işleniyor?",
        answer: "Evet. Sure sayfası sunucu tarafında render edilir ve ayetler ilk HTML içinde hazır gelir."
      },
      {
        question: "Önceki ya da sonraki sureye geçebilir miyim?",
        answer: "Evet. Her sure sayfasında varsa önceki ve sonraki sure için doğrudan bağlantılar bulunur."
      }
    ],
    footerText: surah => `${surah.nameSimple} suresi için Adantimer içinde ayrı okuma sayfası.`,
    noscriptText: "Bu sure sayfasını okumak için JavaScript gerekmez.",
    metaTitle: surah => `${surah.nameSimple} suresini oku | Adantimer`,
    metaDescription: surah => `${surah.nameSimple} suresini Arapça oku, ayet sayısını ve nüzul türünü gör ve Kuran içinde odaklı bir okuma sayfasından ilerle.`
  },
  "zh-hans": {
    heroEyebrow: "古兰经阅读页",
    sectionEyebrow: "完整章节文本",
    sectionTitle: surah => `阅读 ${surah.nameSimple}`,
    sectionIntro: surah => `阅读 ${surah.nameSimple} 的完整阿拉伯文内容，保持可直接分享的页面，并直接前往上一章或下一章。`,
    backLabel: "返回全部章节",
    previousLabel: "上一章",
    nextLabel: "下一章",
    versesLabel: ayahs => `${ayahs} 节`,
    revelationPrefix: "启示时期",
    emptyText: "当前无法加载章节文本，请稍后重试。",
    faq: surah => [
      {
        question: `我可以直接分享 ${surah.nameSimple} 这一章的页面吗？`,
        answer: `可以。每一章都有自己的直接路由，因此你可以轻松重新打开或分享 ${surah.nameSimple} 页面。`
      },
      {
        question: "章节文本是否直接由服务器渲染在页面中？",
        answer: "是的。章节页面是服务端渲染的，因此经文内容已经出现在首个 HTML 响应中。"
      },
      {
        question: "我可以切换到上一章或下一章吗？",
        answer: "可以。每个章节页面都包含上一章和下一章的直接导航（如果存在）。"
      }
    ],
    footerText: surah => `Adantimer 内 ${surah.nameSimple} 的独立阅读页面。`,
    noscriptText: "阅读这一章页面不需要 JavaScript。",
    metaTitle: surah => `阅读 ${surah.nameSimple} | Adantimer`,
    metaDescription: surah => `阅读 ${surah.nameSimple} 的阿拉伯文内容，查看经文数量与启示时期，并在独立阅读页中继续浏览古兰经。`
  }
};

const ROOT_HOME_OVERRIDES = {
  en: {
    infoTitle: "Start with trusted prayer times, then move into the right city page",
    features: [
      "The homepage leads first to high-priority prayer pages for major cities instead of scattering attention across random routes.",
      "Today's schedule, the next-prayer countdown, and the visible calculation method stay on the same page for faster checking.",
      "Adantimer tries GPS first, falls back to IP when needed, and still keeps manual city search available.",
      "Use the method label and city route together, because prayer times can vary by calculation method or local mosque guidance."
    ],
    citiesTitle: "Priority prayer time pages for major cities",
    aboutTitle: "How Adantimer handles prayer times, location, and calculation methods",
    aboutParagraphs: [
      "Most visitors arriving on the homepage want one of two things: today's prayer schedule near them or a direct route into a known city page such as Dubai, Mecca, Medina, Riyadh, Cairo, Istanbul, Kuala Lumpur, Johor Bahru, Jakarta, London, New York, or Paris.",
      "Adantimer tries GPS first, falls back to IP-based location when needed, and still keeps manual city search available. The visible method label helps explain why times can differ between data sources, methods, or local communities.",
      "Use the homepage as the fastest discovery route, but follow your local mosque or trusted authority whenever your community uses a different timetable or calculation method."
    ],
    faqTitle: "Prayer time accuracy and location questions",
    faq: [
      {
        question: "Does the homepage adapt to my language automatically?",
        answer: "Yes. The root page can now render in the visitor's browser language on the first server response, while manual language switching stays available in the header."
      },
      {
        question: "How does Adantimer determine the prayer times shown here?",
        answer: "The homepage uses the detected or searched city and shows the active calculation method alongside the schedule. Times can still vary between methods or local authorities."
      },
      {
        question: "What happens if my location is not available?",
        answer: "Adantimer tries GPS first, falls back to IP-based detection when needed, and still keeps manual city search available."
      },
      {
        question: "Should I follow my local mosque if the timetable is different?",
        answer: "Yes. Adantimer is built for fast lookup and route discovery, but your local mosque or trusted authority should take priority when your community follows a different method or timetable."
      }
    ]
  },
  ar: {
    infoTitle: "نقطة بداية أقوى للبحث عن مواقيت الصلاة عالمياً",
    features: [
      "يتم عرض النص المناسب للغة الزائر من الخادم قبل أن تبدأ الصفحة في التفاعل.",
      "الصفحة الرئيسية مبنية لمسارين واضحين: جدول اليوم في موقعك الحالي أو الانتقال مباشرة إلى صفحة مدينة معروفة.",
      "روابط المدن المهمة وصفحات الصلاة القادمة وصفحات الفجر والظهر والعصر والمغرب والعشاء تظهر مباشرة من الشاشة الأولى.",
      "الروابط النظيفة المرتبطة باللغة تجعل الصفحة الرئيسية أفضل للبحث والمشاركة والعودة لاحقاً."
    ],
    citiesTitle: "ابدأ بأهم مدن مواقيت الصلاة",
    aboutTitle: "مصممة للغة التلقائية واكتشاف الموقع والمدينة",
    aboutParagraphs: [
      "معظم الزوار الذين يصلون إلى الصفحة الرئيسية يريدون إما جدول الصلاة لمدينتهم الحالية أو طريقاً سريعاً إلى صفحة مدينة يعرفونها. لذلك تم تنظيم الصفحة حول هذين الهدفين.",
      "اللغة والإشارات القانونية والمحتوى المرئي أصبحت الآن متوافقة مبكراً في الطلب بحيث يطابق أول HTML الزائر بشكل أفضل.",
      "هذا يجعل الصفحة الرئيسية أقوى كنقطة اكتشاف عالمية لمواقيت الصلاة مع إبقاء صفحات المدن المخصصة للمسارات الأعمق."
    ],
    faqTitle: "أسئلة شائعة عن مواقيت الصلاة التلقائية",
    faq: [
      {
        question: "هل تتكيف الصفحة الرئيسية مع لغتي تلقائياً؟",
        answer: "نعم. يمكن للصفحة الرئيسية الآن أن تُعرَض بلغة المتصفح من أول استجابة من الخادم، مع بقاء التبديل اليدوي للغة متاحاً في الأعلى."
      },
      {
        question: "هل يمكنني الانتقال من الصفحة الرئيسية إلى صفحة مدينة مباشرة؟",
        answer: "نعم. الصفحة الرئيسية تربط مباشرة بصفحات مدن مهمة وبصفحات نية الصلاة مثل الصلاة القادمة والفجر والظهر والعصر والمغرب والعشاء."
      },
      {
        question: "ماذا يحدث إذا لم يتوفر موقعي؟",
        answer: "يحاول Adantimer استخدام GPS أولاً، ثم يعتمد على IP عند الحاجة، مع بقاء البحث اليدوي عن المدينة متاحاً دائماً."
      }
    ]
  },
  de: {
    infoTitle: "Ein stärkerer Einstieg für weltweite Gebetszeit-Suchen",
    features: [
      "Serverseitige Texte passen bereits vor dem Hydrieren zur Sprache des Besuchers.",
      "Die Startseite beantwortet zwei schnelle Wege: den heutigen Plan am aktuellen Ort oder den direkten Einstieg in eine bekannte Stadtseite.",
      "Wichtige Städte sowie Seiten für nächstes Gebet, Fajr, Dhuhr, Asr, Maghrib und Isha sind direkt von der ersten Ansicht aus verlinkt.",
      "Saubere sprachabhängige URLs machen die Startseite stärker für Suche, Teilen und spätere Rückkehr."
    ],
    citiesTitle: "Starte mit wichtigen Städten für Gebetszeiten",
    aboutTitle: "Gebaut für automatische Sprache, Standort und Stadtfindung",
    aboutParagraphs: [
      "Die meisten Besucher der Startseite wollen entweder den heutigen Gebetsplan für ihren aktuellen Ort oder einen schnellen Weg zu einer bekannten Stadtseite. Darauf ist diese Route jetzt ausgerichtet.",
      "Sprache, Canonical-Signale und sichtbarer Inhalt greifen früher ineinander, sodass schon das erste HTML besser zum Besucher passt.",
      "Dadurch wird die Startseite ein stärkerer Einstieg für weltweite Gebetszeit-Suchen, während die tieferen Stadtseiten ihre eigene Suchintention behalten."
    ],
    faqTitle: "Häufige Fragen zu automatischen Gebetszeiten",
    faq: [
      {
        question: "Passt sich die Startseite automatisch an meine Sprache an?",
        answer: "Ja. Die Root-Seite kann jetzt schon in der Browsersprache serverseitig ausgeliefert werden, während die manuelle Sprachwahl im Header erhalten bleibt."
      },
      {
        question: "Kann ich von der Startseite direkt zu einer Stadtseite wechseln?",
        answer: "Ja. Die Startseite verlinkt direkt auf wichtige Städte sowie auf fokussierte Seiten für nächstes Gebet, Fajr, Dhuhr, Asr, Maghrib und Isha."
      },
      {
        question: "Was passiert, wenn mein Standort nicht verfügbar ist?",
        answer: "Adantimer versucht zuerst GPS, wechselt bei Bedarf auf IP-Erkennung und lässt die manuelle Stadtsuche weiterhin offen."
      }
    ]
  },
  fr: {
    infoTitle: "Un point d'entrée plus fort pour les recherches mondiales d'horaires de prière",
    features: [
      "Le contenu rendu côté serveur correspond à la langue du visiteur avant même l'hydratation.",
      "La page d'accueil répond à deux besoins rapides : le planning du jour à proximité ou l'accès direct à une page de ville connue.",
      "Les grandes villes ainsi que les routes prochaine prière, Fajr, Dhuhr, Asr, Maghrib et Isha sont liées dès le premier écran.",
      "Des URL propres et adaptées à la langue renforcent la page d'accueil pour la recherche, le partage et les retours."
    ],
    citiesTitle: "Commencer par les grandes villes de prière",
    aboutTitle: "Conçue pour la langue automatique, la localisation et la découverte des villes",
    aboutParagraphs: [
      "La plupart des visiteurs arrivant sur la page d'accueil veulent soit le planning du jour pour leur ville actuelle, soit un accès rapide à une page de ville connue. La route d'accueil est désormais structurée autour de ces deux objectifs.",
      "La langue, les signaux canoniques et le contenu visible sont désormais alignés plus tôt dans la requête pour que le premier HTML corresponde mieux au visiteur.",
      "La page d'accueil devient ainsi une meilleure porte d'entrée pour les recherches mondiales d'horaires de prière, tout en laissant les intentions plus précises aux pages de ville."
    ],
    faqTitle: "Questions fréquentes sur les horaires de prière automatiques",
    faq: [
      {
        question: "La page d'accueil s'adapte-t-elle automatiquement à ma langue ?",
        answer: "Oui. La page racine peut désormais être rendue côté serveur dans la langue du navigateur dès la première réponse, tout en gardant le changement manuel dans l'en-tête."
      },
      {
        question: "Puis-je passer de l'accueil à une page de ville directe ?",
        answer: "Oui. La page d'accueil relie directement les grandes villes ainsi que les routes centrées sur la prochaine prière, Fajr, Dhuhr, Asr, Maghrib et Isha."
      },
      {
        question: "Que se passe-t-il si ma position n'est pas disponible ?",
        answer: "Adantimer essaie d'abord le GPS, bascule sur la détection IP si nécessaire et laisse toujours la recherche manuelle de ville disponible."
      }
    ]
  },
  tr: {
    infoTitle: "Küresel namaz vakti aramaları için daha güçlü bir başlangıç noktası",
    features: [
      "Sayfa daha yüklenmeden önce sunucu tarafı içerik ziyaretçinin diline uyum sağlar.",
      "Ana sayfa iki hızlı yolu hedefler: bulunduğun yerde bugünün vakitleri veya bilinen bir şehir sayfasına doğrudan geçiş.",
      "Önemli şehirler ile sonraki namaz, Fajr, Dhuhr, Asr, Maghrib ve Isha sayfaları ilk ekrandan hemen erişilebilir durumdadır.",
      "Dile göre düzenlenmiş temiz URL yapısı ana sayfayı arama, paylaşım ve geri dönüş için daha güçlü hale getirir."
    ],
    citiesTitle: "Önemli namaz vakti şehirleriyle başla",
    aboutTitle: "Otomatik dil, konum ve şehir keşfi için kuruldu",
    aboutParagraphs: [
      "Ana sayfaya gelen ziyaretçilerin çoğu ya mevcut şehirleri için bugünün vakitlerini ister ya da bildiği bir şehir sayfasına hızlı geçiş arar. Ana rota artık bu iki hedef etrafında kuruldu.",
      "Dil, canonical sinyaller ve görünür içerik artık isteğin daha erken aşamasında hizalanıyor; böylece ilk HTML ziyaretçiyle daha iyi eşleşiyor.",
      "Bu da ana sayfayı küresel namaz vakti aramaları için daha güçlü bir giriş noktası yaparken, daha derin niyetleri şehir sayfalarına bırakıyor."
    ],
    faqTitle: "Otomatik namaz vakitleri hakkında sık sorulan sorular",
    faq: [
      {
        question: "Ana sayfa dilime otomatik uyum sağlıyor mu?",
        answer: "Evet. Kök sayfa artık ilk sunucu yanıtında tarayıcı dilinde render edilebiliyor; üst kısımdaki manuel dil değişimi de açık kalıyor."
      },
      {
        question: "Ana sayfadan doğrudan şehir sayfasına geçebilir miyim?",
        answer: "Evet. Ana sayfa önemli şehirleri ve sonraki namaz, Fajr, Dhuhr, Asr, Maghrib ve Isha odaklı sayfaları doğrudan bağlar."
      },
      {
        question: "Konumum alınamazsa ne olur?",
        answer: "Adantimer önce GPS'i dener, gerekirse IP tabanlı konuma geçer ve manuel şehir aramasını her zaman açık tutar."
      }
    ]
  },
  "zh-hans": {
    infoTitle: "面向全球礼拜时间搜索的更强首页入口",
    features: [
      "页面水合前，服务端内容就会先匹配访问者语言。",
      "首页围绕两个高频目标构建：查看当前位置的今日礼拜时间，或直接进入已知城市页面。",
      "重要城市以及下一次礼拜、晨礼、晌礼、晡礼、昏礼、宵礼页面都能在第一屏直接进入。",
      "按语言组织的规范 URL 让首页更适合搜索、分享和再次访问。"
    ],
    citiesTitle: "从重点礼拜城市开始",
    aboutTitle: "为自动语言、定位与城市发现而构建",
    aboutParagraphs: [
      "大多数进入首页的访问者，要么想看当前城市的今日礼拜时间，要么想快速进入一个已知城市页面。首页现在正是围绕这两个目标设计的。",
      "语言、规范链接信号与可见内容现在会在更早阶段对齐，因此第一份 HTML 就更贴近访问者。",
      "这让首页成为更强的全球礼拜时间搜索入口，同时把更深层的搜索意图继续交给专门的城市页面。"
    ],
    faqTitle: "关于自动礼拜时间的常见问题",
    faq: [
      {
        question: "首页会自动适配我的语言吗？",
        answer: "会。首页现在可以在第一次服务器响应时直接按浏览器语言渲染，同时页头仍保留手动切换语言。"
      },
      {
        question: "我可以从首页直接进入城市页面吗？",
        answer: "可以。首页直接链接到重点城市页面，以及下一次礼拜、晨礼、晌礼、晡礼、昏礼和宵礼等聚焦页面。"
      },
      {
        question: "如果无法获取我的位置会怎样？",
        answer: "Adantimer 会先尝试 GPS，需要时退回到 IP 定位，同时始终保留手动城市搜索。"
      }
    ]
  }
};

function buildEnglishPriorityHomeCityCopy(cityName, variant = "generic") {
  const variantConfig = {
    dubai: {
      infoTitle: `Prayer times in ${cityName} with the full daily schedule on one page`,
      features: [
        `See today's ${cityName} timetable for Fajr, Dhuhr, Asr, Maghrib, and Isha together with the next prayer countdown.`,
        "Use the same page to verify the current prayer, today's date, and the active calculation method.",
        `Move from ${cityName} into focused routes such as next prayer, Fajr time, or Asr time without leaving the timetable context.`,
        "Compare the shown method with your local mosque or trusted authority when your community follows a different timetable."
      ],
      aboutParagraphs: [
        `This page is built for people searching directly for prayer times in ${cityName} today, not for a generic homepage visit.`,
        "The schedule, next-prayer countdown, and visible method label stay together so you can check the timetable faster and compare it with local practice if needed.",
        `If you need a more specific angle after the first lookup, use the linked ${cityName} routes for next prayer, Fajr, Asr, and the full prayer-times view.`
      ],
      faq: [
        {
          question: `Does this ${cityName} page include all five daily prayer times?`,
          answer: "Yes. It shows Fajr, Dhuhr, Asr, Maghrib, and Isha together with the next prayer countdown."
        },
        {
          question: `Why might ${cityName} prayer times differ from another source?`,
          answer: "Prayer times can differ by calculation method or local timetable, so the visible method label and local mosque guidance both matter."
        },
        {
          question: `Can I switch from ${cityName} to another city quickly?`,
          answer: "Yes. The page links directly into other major city pages and focused prayer-intent routes."
        }
      ]
    },
    mecca: {
      infoTitle: `Prayer times in ${cityName} with the full daily schedule and next prayer`,
      features: [
        `See today's ${cityName} timetable for Fajr, Dhuhr, Asr, Maghrib, and Isha together with the next prayer countdown.`,
        "Keep the current prayer status, today's date, and active calculation method visible on the same page.",
        `Move directly from ${cityName} into focused routes such as next prayer, Fajr time, or the broader prayer-times route.`,
        "Use the visible method label together with local mosque guidance when you compare the timetable with another source."
      ],
      aboutParagraphs: [
        `This page is built for the direct search intent: prayer times in ${cityName} today with the full daily schedule and the next prayer countdown on one screen.`,
        "The page keeps method visibility and city-specific routing together so the first answer is faster and the deeper route handoff is cleaner.",
        "If your community or travel plan follows a different local timetable, treat this page as a fast lookup and compare it with the trusted local schedule."
      ],
      faq: [
        {
          question: `Does this ${cityName} page show the next prayer and the full schedule together?`,
          answer: "Yes. The next prayer countdown stays visible while the full Fajr, Dhuhr, Asr, Maghrib, and Isha schedule remains on the same page."
        },
        {
          question: `Why can prayer times in ${cityName} differ from another timetable?`,
          answer: "Timetables can differ by source or method, so the active method label and trusted local guidance should both be considered."
        },
        {
          question: `Can I move from ${cityName} to related prayer routes quickly?`,
          answer: "Yes. The page links into focused routes such as next prayer, Fajr, Asr, and other high-priority city pages."
        }
      ]
    },
    generic: {
      infoTitle: `Prayer times in ${cityName} with the full daily schedule and next prayer`,
      features: [
        `See today's ${cityName} timetable for Fajr, Dhuhr, Asr, Maghrib, and Isha together with the next prayer countdown.`,
        "Keep the current prayer status, today's date, and active calculation method visible on the same page.",
        `Move directly from ${cityName} into focused routes such as next prayer, Fajr time, Asr time, or the broader prayer-times route.`,
        "Use the visible method label together with local mosque guidance when you compare the timetable with another source."
      ],
      aboutParagraphs: [
        `This page is built for the direct search intent: prayer times in ${cityName} today with the full daily schedule and the next prayer countdown on one screen.`,
        "The page keeps method visibility and city-specific routing together so the first answer is faster and the deeper route handoff is cleaner.",
        "If your community or travel plan follows a different local timetable, treat this page as a fast lookup and compare it with the trusted local schedule."
      ],
      faq: [
        {
          question: `Does this ${cityName} page show the next prayer and the full schedule together?`,
          answer: "Yes. The next prayer countdown stays visible while the full Fajr, Dhuhr, Asr, Maghrib, and Isha schedule remains on the same page."
        },
        {
          question: `Why can prayer times in ${cityName} differ from another timetable?`,
          answer: "Timetables can differ by source or method, so the active method label and trusted local guidance should both be considered."
        },
        {
          question: `Can I move from ${cityName} to related prayer routes quickly?`,
          answer: "Yes. The page links into focused routes such as next prayer, Fajr, Asr, and other high-priority city pages."
        }
      ]
    }
  };

  const resolvedVariant = variantConfig[variant] ? variant : "generic";
  const resolved = variantConfig[resolvedVariant];

  return {
    metaTitle: `Prayer Times in ${cityName} Today | Fajr, Dhuhr, Asr, Maghrib & Isha | Adantimer`,
    metaDescription: `Check today's prayer times in ${cityName} with Fajr, Dhuhr, Asr, Maghrib, Isha, and a live next prayer countdown for ${cityName}.`,
    heroSubtitle: `Check today's prayer times in ${cityName}, follow the live next-prayer countdown, and review the full daily schedule for Fajr, Dhuhr, Asr, Maghrib, and Isha.`,
    infoTitle: resolved.infoTitle,
    features: resolved.features,
    aboutTitle: `How to use the ${cityName} prayer times page`,
    aboutParagraphs: resolved.aboutParagraphs,
    faqTitle: `Common questions about prayer times in ${cityName}`,
    faq: resolved.faq
  };
}

function buildFrenchGscWinnerHomeCityCopy(cityName, variant = "generic") {
  const variantConfig = {
    oran: {
      infoTitle: `Horaires de prière à ${cityName} avec tout le planning du jour sur une seule page`,
      features: [
        `Consultez les horaires de prière à ${cityName} aujourd'hui avec Fajr, Dhuhr, Asr, Maghrib, Isha et le compte à rebours jusqu'à la prochaine prière.`,
        "Le statut de la prière en cours, la date du jour et la méthode de calcul restent visibles sur la même page pour une vérification plus rapide.",
        `Depuis ${cityName}, vous pouvez passer directement vers des routes plus ciblées comme la prochaine prière, Fajr ou le planning complet.`,
        "Cette page couvre naturellement des formulations réelles comme horaire priere, adhan, adan, dohr, maghreb ou icha, sans créer de pages dupliquées."
      ],
      aboutParagraphs: [
        `Cette page est conçue pour la recherche directe : horaires de prière à ${cityName} aujourd'hui, avec le planning complet visible immédiatement.`,
        "Le tableau du jour, le compte à rebours et la méthode affichée restent ensemble pour que la réponse soit plus rapide à vérifier.",
        `Si vous comparez avec une mosquée locale ou un autre site, utilisez cette page comme point d'entrée rapide puis confrontez la méthode visible à l'autorité locale que vous suivez.`
      ],
      faq: [
        {
          question: `Cette page ${cityName} affiche-t-elle les cinq prières du jour ?`,
          answer: "Oui. Elle affiche Fajr, Dhuhr, Asr, Maghrib et Isha avec le compte à rebours jusqu'à la prochaine prière."
        },
        {
          question: `Pourquoi peut-on chercher ${cityName} avec horaire priere, adhan, dohr, maghreb ou icha ?`,
          answer: "Les formulations varient selon les habitudes et les claviers. Cette page reste la page canonique unique pour Oran en français."
        },
        {
          question: `Les horaires de prière à ${cityName} peuvent-ils varier selon la source ?`,
          answer: "Oui. Les horaires peuvent varier selon la méthode de calcul ou la référence locale, donc comparez aussi avec votre mosquée si nécessaire."
        }
      ]
    },
    generic: {
      infoTitle: `Horaires de prière à ${cityName} avec tout le planning du jour sur une seule page`,
      features: [
        `Consultez les horaires de prière à ${cityName} aujourd'hui avec Fajr, Dhuhr, Asr, Maghrib, Isha et le compte à rebours jusqu'à la prochaine prière.`,
        "Le statut de la prière en cours, la date du jour et la méthode de calcul restent visibles sur la même page pour une vérification plus rapide.",
        `Depuis ${cityName}, vous pouvez passer directement vers des routes plus ciblées comme la prochaine prière, Fajr ou le planning complet.`,
        "Comparez la méthode affichée avec votre mosquée locale ou une autorité fiable si votre communauté suit un autre calendrier."
      ],
      aboutParagraphs: [
        `Cette page est conçue pour la recherche directe : horaires de prière à ${cityName} aujourd'hui, avec le planning complet visible immédiatement.`,
        "Le tableau du jour, le compte à rebours et la méthode affichée restent ensemble pour que la réponse soit plus rapide à vérifier.",
        `Si vous comparez avec une mosquée locale ou un autre site, utilisez cette page comme point d'entrée rapide puis confrontez la méthode visible à l'autorité locale que vous suivez.`
      ],
      faq: [
        {
          question: `Cette page ${cityName} affiche-t-elle les cinq prières du jour ?`,
          answer: "Oui. Elle affiche Fajr, Dhuhr, Asr, Maghrib et Isha avec le compte à rebours jusqu'à la prochaine prière."
        },
        {
          question: `Pourquoi les horaires de prière à ${cityName} peuvent-ils varier selon la source ?`,
          answer: "Les horaires peuvent varier selon la méthode de calcul ou la référence locale, donc comparez aussi avec votre mosquée si nécessaire."
        },
        {
          question: `Puis-je passer rapidement de ${cityName} à d'autres routes de prière ?`,
          answer: "Oui. La page renvoie directement vers des routes ciblées comme la prochaine prière, Fajr ou d'autres villes prioritaires."
        }
      ]
    }
  };

  const resolvedVariant = variantConfig[variant] ? variant : "generic";
  const resolved = variantConfig[resolvedVariant];

  return {
    metaTitle: `Horaires de prière à ${cityName} aujourd'hui | Fajr, Dhuhr, Asr, Maghrib & Isha | Adantimer`,
    metaDescription: `Consultez les horaires de prière à ${cityName} aujourd'hui avec Fajr, Dhuhr, Asr, Maghrib, Isha et le compte à rebours jusqu'à la prochaine prière.`,
    heroSubtitle: `Consultez les horaires de prière à ${cityName} aujourd'hui, suivez le compte à rebours jusqu'à la prochaine prière et gardez le planning complet sur une seule page.`,
    infoTitle: resolved.infoTitle,
    features: resolved.features,
    aboutTitle: `Comment utiliser la page des horaires de prière à ${cityName}`,
    aboutParagraphs: resolved.aboutParagraphs,
    faqTitle: `Questions fréquentes sur les horaires de prière à ${cityName}`,
    faq: resolved.faq
  };
}

function buildEnglishPriorityIntentCopy(pageType) {
  if (pageType === "prayer-times") {
    return {
      metaTitle: "Prayer Times Today | Fajr, Dhuhr, Asr, Maghrib & Isha | Adantimer",
      metaDescription: "Check today's prayer times with Fajr, Dhuhr, Asr, Maghrib, Isha and a live next prayer countdown, then move directly into the right city page.",
      heroSubtitle: "Check today's full prayer schedule with a live next prayer countdown, then jump into major city pages such as Mecca, Dubai, Riyadh, Cairo, Kuala Lumpur, and Jakarta.",
      infoTitle: "Check today's full prayer schedule before moving into a city page",
      features: [
        "See Fajr, Dhuhr, Asr, Maghrib, and Isha together with the live next-prayer countdown.",
        "Use one route to start, then move directly into major city pages when you need a city-specific timetable.",
        "Adantimer tries GPS first, falls back to IP when needed, and still keeps manual city search available.",
        "The method label stays visible so you can compare results with your local mosque or trusted timetable."
      ],
      citiesTitle: "Priority city pages for daily prayer times",
      aboutTitle: "How this prayer times page is meant to be used",
      aboutParagraphs: [
        "This route is built for people who want today's prayer times first and a fast way into the right city page immediately after that first lookup.",
        "The page keeps the full daily schedule, the next-prayer countdown, and the active calculation method on one screen so it is easier to verify the result before moving deeper.",
        "If your community follows a different timetable or method, use the city route as the quick lookup and then follow your local mosque or trusted authority."
      ],
      faqTitle: "Common questions about today's prayer times",
      faq: [
        {
          question: "Does this page show all five daily prayer times?",
          answer: "Yes. The page is built to show Fajr, Dhuhr, Asr, Maghrib, and Isha together with the next prayer countdown."
        },
        {
          question: "Can I move from here into a city-specific prayer page?",
          answer: "Yes. This route links directly into major city pages so you can move from a general lookup to a more specific timetable quickly."
        },
        {
          question: "Why can prayer times differ from another timetable?",
          answer: "Prayer times can vary by calculation method, provider, or local community timetable, so the visible method label and your local mosque guidance both matter."
        }
      ]
    };
  }

  if (pageType === "next-prayer") {
    return {
      metaTitle: "Next Prayer Time Today | Live Salah Countdown | Adantimer",
      metaDescription: "See the next prayer time today with a live salah countdown, current prayer status, and direct links into major city prayer pages.",
      heroSubtitle: "Track the next prayer with a live countdown, see the current prayer status, and move directly into high-priority city pages when you need a local timetable.",
      infoTitle: "Use this page when the next prayer is the main question",
      features: [
        "The next-prayer countdown stays at the center of the page together with the full daily schedule.",
        "Current prayer, next prayer, and the active method stay visible on the same screen.",
        "Major city routes are linked directly so you can switch from a general countdown to a city-specific page fast.",
        "GPS, IP fallback, and manual city search all remain available for quicker route discovery."
      ],
      citiesTitle: "Priority next-prayer routes and city pages",
      aboutTitle: "What the next-prayer page should answer first",
      aboutParagraphs: [
        "This route is for the direct search intent: what is the next prayer and how long is left until it starts.",
        "The page keeps the countdown, current prayer status, full daily timetable, and active method together so the answer is visible without extra navigation.",
        "When you need a city-specific answer after the first check, the linked city routes hand off to more focused prayer pages for places like Riyadh, Mecca, Dubai, and Cairo."
      ],
      faqTitle: "Common questions about the next prayer countdown",
      faq: [
        {
          question: "Does this page only show the next prayer?",
          answer: "No. The next prayer is the main focus, but the full daily prayer schedule still stays visible on the same page."
        },
        {
          question: "Can I use this route for a specific city?",
          answer: "Yes. You can search manually, let the page detect your location, or move into a direct city route such as Riyadh or Mecca."
        },
        {
          question: "Why can the countdown differ from another source?",
          answer: "The countdown depends on the loaded timetable, and timetables can vary by method or local authority, so compare the method label and your local mosque when needed."
        }
      ]
    };
  }

  const prayerConfig = {
    fajr: {
      prayerName: "Fajr",
      metaTitle: "Fajr Time Today | Daily Fajr Prayer Time Finder | Adantimer",
      metaDescription: "Check Fajr time today, compare the current schedule by city, and move directly into major city pages for a faster Fajr lookup.",
      aboutTitle: "What the Fajr time page should answer first",
      aboutParagraphs: [
        "This route is built for the direct search intent: what time is Fajr today and how can I verify it quickly for the right city.",
        "The page keeps the Fajr result together with the full daily timetable, the next-prayer countdown, and the visible method label so the answer is easier to trust.",
        "When you need a city-specific result after the first lookup, the linked city routes take you directly into stronger prayer pages for places such as Mecca, Medina, Riyadh, and Dubai."
      ],
      faqTitle: "Common questions about Fajr time today"
    },
    dhuhr: {
      prayerName: "Dhuhr",
      metaTitle: "Dhuhr Time Today | Daily Dhuhr Prayer Time Finder | Adantimer",
      metaDescription: "Check Dhuhr time today, compare the current schedule by city, and move directly into major city pages for a faster Dhuhr lookup.",
      aboutTitle: "What the Dhuhr time page should answer first",
      aboutParagraphs: [
        "This route is built for the direct search intent: what time is Dhuhr today and how can I confirm it quickly for the right city.",
        "The page keeps the Dhuhr result together with the full daily timetable, the next-prayer countdown, and the visible method label so the answer is easier to verify.",
        "When you need a city-specific result after the first lookup, the linked city routes take you directly into stronger prayer pages for places such as Riyadh, Cairo, Dubai, Kuala Lumpur, and Johor Bahru."
      ],
      faqTitle: "Common questions about Dhuhr time today"
    },
    asr: {
      prayerName: "Asr",
      metaTitle: "Asr Time Today | Daily Asr Prayer Time Finder | Adantimer",
      metaDescription: "Check Asr time today, compare the current schedule by city, and move directly into major city pages for a faster Asr lookup.",
      aboutTitle: "What the Asr time page should answer first",
      aboutParagraphs: [
        "This route is built for the direct search intent: what time is Asr today and how can I confirm it quickly for the right city.",
        "The page keeps the Asr result together with the full daily timetable, the next-prayer countdown, and the visible method label so the answer is easier to verify.",
        "When you need a city-specific result after the first lookup, the linked city routes take you directly into stronger prayer pages for places such as Cairo, Istanbul, Dubai, and London."
      ],
      faqTitle: "Common questions about Asr time today"
    },
    maghrib: {
      prayerName: "Maghrib",
      metaTitle: "Maghrib Time Today | Daily Maghrib Prayer Time Finder | Adantimer",
      metaDescription: "Check Maghrib time today, compare the current schedule by city, and move directly into major city pages for a faster Maghrib lookup.",
      aboutTitle: "What the Maghrib time page should answer first",
      aboutParagraphs: [
        "This route is built for the direct search intent: what time is Maghrib today and how can I verify it quickly for the right city.",
        "The page keeps the Maghrib result together with the full daily timetable, the next-prayer countdown, and the visible method label so the answer is easier to trust.",
        "When you need a city-specific result after the first lookup, the linked city routes take you directly into stronger prayer pages for places such as Mecca, Paris, London, and New York."
      ],
      faqTitle: "Common questions about Maghrib time today"
    },
    isha: {
      prayerName: "Isha",
      metaTitle: "Isha Time Today | Daily Isha Prayer Time Finder | Adantimer",
      metaDescription: "Check Isha time today, compare the current schedule by city, and move directly into major city pages for a faster Isha lookup.",
      aboutTitle: "What the Isha time page should answer first",
      aboutParagraphs: [
        "This route is built for the direct search intent: what time is Isha today and how can I verify it quickly for the right city.",
        "The page keeps the Isha result together with the full daily timetable, the next-prayer countdown, and the visible method label so the answer is easier to trust.",
        "When you need a city-specific result after the first lookup, the linked city routes take you directly into stronger prayer pages for places such as Mecca, Medina, Istanbul, Kuala Lumpur, and Jakarta."
      ],
      faqTitle: "Common questions about Isha time today"
    }
  };

  const { prayerName, metaTitle, metaDescription, aboutTitle, aboutParagraphs, faqTitle } = prayerConfig[pageType];

  return {
    metaTitle,
    metaDescription,
    heroSubtitle: `Check ${prayerName} time today, keep the live next-prayer countdown visible, and move directly into major city pages when you need a stronger city-specific timetable.`,
    infoTitle: `Use this page when ${prayerName} time is the main question`,
    features: [
      `${prayerName} stays at the center of the page while the full daily timetable remains visible for context.`,
      "Current prayer, next prayer, today's date, and the active method stay on the same screen for a faster check.",
      "Major city routes are linked directly so you can switch from a general lookup to a city-specific timetable quickly.",
      "GPS, IP fallback, and manual city search remain available when you need to reach the right route faster."
    ],
    citiesTitle: `Priority city routes for ${prayerName} time lookups`,
    aboutTitle,
    aboutParagraphs,
    faqTitle,
    faq: [
      {
        question: `Does this page only show ${prayerName} time?`,
        answer: `No. ${prayerName} is the main focus, but the full daily prayer schedule stays visible on the same page.`
      },
      {
        question: `Can I use this route for a specific city when I need ${prayerName} time?`,
        answer: "Yes. You can search manually, let the page detect your location, or move into a direct city route from the linked priority pages."
      },
      {
        question: `Why can ${prayerName} time differ from another timetable?`,
        answer: "The shown time depends on the loaded timetable, and timetables can vary by method or local authority, so compare the visible method label with your local mosque when needed."
      }
    ]
  };
}

function buildArabicPriorityIntentCopy(pageType) {
    const prayerConfig = {
      fajr: {
        prayerName: "الفجر",
        metaTitle: "وقت الفجر اليوم | دليل وقت الفجر اليومي | Adantimer",
        metaDescription: "تحقق من وقت الفجر اليوم، وقارن الجدول الحالي حسب المدينة، وانتقل مباشرة إلى صفحات المدن المهمة للوصول السريع إلى وقت الفجر.",
        aboutTitle: "ما الذي يجب أن تجيب عنه صفحة وقت الفجر أولا",
        aboutParagraphs: [
          "هذه الصفحة مبنية لنية البحث المباشرة: ما وقت الفجر اليوم وكيف أتحقق منه بسرعة للمدينة الصحيحة.",
          "تعرض الصفحة وقت الفجر مع الجدول اليومي الكامل والعد التنازلي للصلاة القادمة وطريقة الحساب الظاهرة حتى تصبح النتيجة أوضح وأسهل في التحقق.",
          "عندما تحتاج إلى نتيجة أكثر دقة حسب المدينة بعد أول فحص، تنقلك الروابط إلى صفحات أقوى لمدن مثل مكة والمدينة والرياض ودبي."
        ],
        faqTitle: "أسئلة شائعة عن وقت الفجر اليوم"
      },
      dhuhr: {
        prayerName: "الظهر",
        metaTitle: "وقت الظهر اليوم | دليل وقت الظهر اليومي | Adantimer",
        metaDescription: "تحقق من وقت الظهر اليوم، وقارن الجدول الحالي حسب المدينة، وانتقل مباشرة إلى صفحات المدن المهمة للوصول السريع إلى وقت الظهر.",
        aboutTitle: "ما الذي يجب أن تجيب عنه صفحة وقت الظهر أولا",
        aboutParagraphs: [
          "هذه الصفحة مبنية لنية البحث المباشرة: ما وقت الظهر اليوم وكيف أؤكده بسرعة للمدينة الصحيحة.",
          "تعرض الصفحة وقت الظهر مع الجدول اليومي الكامل والعد التنازلي للصلاة القادمة وطريقة الحساب الظاهرة حتى تكون النتيجة أوضح وأسهل في المراجعة.",
          "عندما تحتاج إلى نتيجة أكثر دقة حسب المدينة بعد أول فحص، تنقلك الروابط إلى صفحات أقوى لمدن مثل الرياض والقاهرة ودبي وسنغافورة."
        ],
        faqTitle: "أسئلة شائعة عن وقت الظهر اليوم"
      },
      asr: {
        prayerName: "العصر",
        metaTitle: "وقت العصر اليوم | دليل وقت العصر اليومي | Adantimer",
        metaDescription: "تحقق من وقت العصر اليوم، وقارن الجدول الحالي حسب المدينة، وانتقل مباشرة إلى صفحات المدن المهمة للوصول السريع إلى وقت العصر.",
        aboutTitle: "ما الذي يجب أن تجيب عنه صفحة وقت العصر أولا",
        aboutParagraphs: [
          "هذه الصفحة مبنية لنية البحث المباشرة: ما وقت العصر اليوم وكيف أؤكده بسرعة للمدينة الصحيحة.",
          "تعرض الصفحة وقت العصر مع الجدول اليومي الكامل والعد التنازلي للصلاة القادمة وطريقة الحساب الظاهرة حتى تكون النتيجة أوضح وأسهل في المراجعة.",
          "عندما تحتاج إلى نتيجة أكثر دقة حسب المدينة بعد أول فحص، تنقلك الروابط إلى صفحات أقوى لمدن مثل القاهرة وإسطنبول ودبي ولندن."
        ],
        faqTitle: "أسئلة شائعة عن وقت العصر اليوم"
      },
      maghrib: {
        prayerName: "المغرب",
        metaTitle: "وقت المغرب اليوم | دليل وقت المغرب اليومي | Adantimer",
        metaDescription: "تحقق من وقت المغرب اليوم، وقارن الجدول الحالي حسب المدينة، وانتقل مباشرة إلى صفحات المدن المهمة للوصول السريع إلى وقت المغرب.",
        aboutTitle: "ما الذي يجب أن تجيب عنه صفحة وقت المغرب أولا",
        aboutParagraphs: [
          "هذه الصفحة مبنية لنية البحث المباشرة: ما وقت المغرب اليوم وكيف أتحقق منه بسرعة للمدينة الصحيحة.",
          "تعرض الصفحة وقت المغرب مع الجدول اليومي الكامل والعد التنازلي للصلاة القادمة وطريقة الحساب الظاهرة حتى تصبح النتيجة أوضح وأسهل في التحقق.",
          "عندما تحتاج إلى نتيجة أكثر دقة حسب المدينة بعد أول فحص، تنقلك الروابط إلى صفحات أقوى لمدن مثل مكة وباريس ولندن ونيويورك."
        ],
        faqTitle: "أسئلة شائعة عن وقت المغرب اليوم"
      },
      isha: {
        prayerName: "العشاء",
        metaTitle: "وقت العشاء اليوم | دليل وقت العشاء اليومي | Adantimer",
        metaDescription: "تحقق من وقت العشاء اليوم، وقارن الجدول الحالي حسب المدينة، وانتقل مباشرة إلى صفحات المدن المهمة للوصول السريع إلى وقت العشاء.",
        aboutTitle: "ما الذي يجب أن تجيب عنه صفحة وقت العشاء أولا",
        aboutParagraphs: [
          "هذه الصفحة مبنية لنية البحث المباشرة: ما وقت العشاء اليوم وكيف أتحقق منه بسرعة للمدينة الصحيحة.",
          "تعرض الصفحة وقت العشاء مع الجدول اليومي الكامل والعد التنازلي للصلاة القادمة وطريقة الحساب الظاهرة حتى تصبح النتيجة أوضح وأسهل في التحقق.",
          "عندما تحتاج إلى نتيجة أكثر دقة حسب المدينة بعد أول فحص، تنقلك الروابط إلى صفحات أقوى لمدن مثل مكة والمدينة وإسطنبول وسنغافورة."
        ],
        faqTitle: "أسئلة شائعة عن وقت العشاء اليوم"
      }
    };

    const { prayerName, metaTitle, metaDescription, aboutTitle, aboutParagraphs, faqTitle } = prayerConfig[pageType];

  return {
      metaTitle,
      metaDescription,
      heroSubtitle: `تحقق من وقت ${prayerName} اليوم، وأبق العد التنازلي للصلاة القادمة ظاهرا، ثم انتقل مباشرة إلى صفحات المدن المهمة عندما تحتاج إلى جدول أقوى حسب المدينة.`,
      infoTitle: `استخدم هذه الصفحة عندما يكون وقت ${prayerName} هو السؤال الأساسي`,
      features: [
        `يبقى وقت ${prayerName} في مركز الصفحة بينما يظل الجدول اليومي الكامل ظاهرا لتوفير السياق.`,
        "تبقى الصلاة الحالية والصلاة القادمة وتاريخ اليوم وطريقة الحساب الظاهرة في نفس الشاشة لسهولة الفحص السريع.",
        "روابط المدن المهمة ظاهرة مباشرة حتى تنتقل بسرعة من بحث عام إلى جدول أدق حسب المدينة.",
        "يبقى تحديد الموقع عبر GPS والسقوط إلى IP والبحث اليدوي عن المدينة متاحا للوصول إلى المسار الصحيح بسرعة أكبر."
      ],
      citiesTitle: `مسارات المدن الأساسية للبحث عن وقت ${prayerName}`,
      aboutTitle,
      aboutParagraphs,
      faqTitle,
      faq: [
        {
          question: `هل تعرض هذه الصفحة وقت ${prayerName} فقط؟`,
          answer: `لا. وقت ${prayerName} هو التركيز الرئيسي، لكن الجدول الكامل للصلوات اليومية يبقى ظاهرا في الصفحة نفسها.`
        },
        {
          question: `هل أستطيع استخدام هذا المسار لمدينة محددة عندما أبحث عن وقت ${prayerName}؟`,
          answer: "نعم. يمكنك البحث يدويا أو ترك الصفحة تحدد موقعك أو الانتقال إلى مسار مدينة مباشر من روابط المدن الأساسية."
        },
        {
          question: `لماذا قد يختلف وقت ${prayerName} عن جدول آخر؟`,
          answer: "يعتمد الوقت المعروض على الجدول المحمل، ويمكن أن تختلف الجداول بحسب طريقة الحساب أو الجهة المحلية، لذلك قارن طريقة الحساب الظاهرة مع توقيت المسجد المحلي عند الحاجة."
        }
      ]
  };
}

function buildEnglishPriorityIntentCityCopy(pageType, cityKey, place) {
  const key = `${pageType}:${cityKey}`;

  if (key === "prayer-times:kuala-lumpur") {
    return {
      metaTitle: "Prayer Times in Kuala Lumpur Today | Fajr, Dhuhr, Asr, Maghrib & Isha | Adantimer",
      metaDescription: "Check today's prayer times in Kuala Lumpur with Fajr, Dhuhr, Asr, Maghrib, Isha, and a live next prayer countdown for Kuala Lumpur.",
      heroSubtitle: "Check today's prayer times in Kuala Lumpur, keep the next-prayer countdown visible, and review the full Fajr, Dhuhr, Asr, Maghrib, and Isha schedule on one page.",
      infoTitle: "Use this Kuala Lumpur page when you need the full daily prayer schedule first",
      features: [
        "The full Kuala Lumpur schedule stays visible with Fajr, Dhuhr, Asr, Maghrib, Isha, and the next-prayer countdown together.",
        "Current prayer, next prayer, today's date, and the active calculation method remain on one screen for a faster check.",
        "The page links directly into Kuala Lumpur-specific next-prayer and single-prayer routes when you want a narrower lookup.",
        "GPS, IP fallback, and manual city search remain available when you need to compare Kuala Lumpur with another city quickly."
      ],
      citiesTitle: "Related Kuala Lumpur prayer routes",
      aboutTitle: "How to use the Kuala Lumpur prayer times page",
      aboutParagraphs: [
        "This route is built for the direct search intent: prayer times in Kuala Lumpur today, with the full daily schedule visible immediately instead of a generic overview first.",
        "The page keeps the timetable, the next-prayer countdown, and the visible calculation method together so you can verify the result before moving into a narrower prayer route.",
        "If your local mosque or community timetable differs, use this page as the fast city lookup and then compare the visible method with the local authority you follow."
      ],
      faqTitle: "Common questions about prayer times in Kuala Lumpur",
      faq: [
        {
          question: "Does this Kuala Lumpur page show all five daily prayer times?",
          answer: "Yes. The page shows Fajr, Dhuhr, Asr, Maghrib, and Isha together with the live next-prayer countdown."
        },
        {
          question: "Can I move from this page into a narrower Kuala Lumpur prayer route?",
          answer: "Yes. The page links directly into city-specific next-prayer and single-prayer routes for Kuala Lumpur."
        },
        {
          question: "Why can prayer times in Kuala Lumpur differ from another timetable?",
          answer: "Prayer times can vary by calculation method, data source, or local community timetable, so the visible method label and your local mosque guidance both matter."
        }
      ]
    };
  }

  if (key === "next-prayer:jakarta") {
    return {
      metaTitle: "Next Prayer in Jakarta Today | Live Salah Countdown | Adantimer",
      metaDescription: "See the next prayer in Jakarta today with a live salah countdown, current prayer status, and the full daily prayer schedule for Jakarta.",
      heroSubtitle: "Track the next prayer in Jakarta with a live countdown, see the current prayer status, and keep the full daily schedule available for a faster local check.",
      infoTitle: "Use this Jakarta page when the next prayer is the main question",
      features: [
        "The next-prayer countdown stays at the center of the Jakarta page together with the full daily schedule.",
        "Current prayer, next prayer, today's date, and the active method stay visible on the same screen.",
        "The page links directly into Jakarta prayer-times and single-prayer routes when you need a more focused local view.",
        "GPS, IP fallback, and manual city search remain available if you need to compare Jakarta with another city."
      ],
      citiesTitle: "Related Jakarta prayer routes",
      aboutTitle: "What the Jakarta next-prayer page should answer first",
      aboutParagraphs: [
        "This route is for the direct local intent: what is the next prayer in Jakarta and how much time is left until it starts.",
        "The page keeps the countdown, current prayer status, full daily timetable, and active method together so the local answer stays visible without extra navigation.",
        "When you need a broader or narrower view after the first check, the linked Jakarta routes let you move into the full daily page or into individual prayer pages quickly."
      ],
      faqTitle: "Common questions about the next prayer in Jakarta",
      faq: [
        {
          question: "Does this Jakarta page only show the next prayer?",
          answer: "No. The next prayer is the main focus, but the full daily prayer schedule for Jakarta still stays visible on the same page."
        },
        {
          question: "Can I switch from the Jakarta next-prayer page into other Jakarta prayer routes?",
          answer: "Yes. The page links directly into the Jakarta prayer-times route and into narrower single-prayer routes."
        },
        {
          question: "Why can the Jakarta countdown differ from another source?",
          answer: "The countdown depends on the loaded timetable, and timetables can vary by method or local authority, so compare the visible method label with your local mosque when needed."
        }
      ]
    };
  }

  if (key === "next-prayer:kuala-lumpur") {
    return {
      metaTitle: "Next Prayer in Kuala Lumpur Today | Live Salah Countdown | Adantimer",
      metaDescription: "See the next prayer in Kuala Lumpur today with a live salah countdown, current prayer status, and the full daily prayer schedule for Kuala Lumpur.",
      heroSubtitle: "Track the next prayer in Kuala Lumpur with a live countdown, see the current prayer status, and keep the full daily schedule available for a faster local check.",
      infoTitle: "Use this Kuala Lumpur page when the next prayer is the main question",
      features: [
        "The next-prayer countdown stays at the center of the Kuala Lumpur page together with the full daily schedule.",
        "Current prayer, next prayer, today's date, and the active method stay visible on the same screen.",
        "The page links directly into Kuala Lumpur prayer-times and single-prayer routes when you need a more focused local view.",
        "GPS, IP fallback, and manual city search remain available if you need to compare Kuala Lumpur with another city."
      ],
      citiesTitle: "Related Kuala Lumpur prayer routes",
      aboutTitle: "What the Kuala Lumpur next-prayer page should answer first",
      aboutParagraphs: [
        "This route is for the direct local intent: what is the next prayer in Kuala Lumpur and how much time is left until it starts.",
        "The page keeps the countdown, current prayer status, full daily timetable, and active method together so the local answer stays visible without extra navigation.",
        "When you need a broader or narrower view after the first check, the linked Kuala Lumpur routes let you move into the full daily page or into individual prayer pages quickly."
      ],
      faqTitle: "Common questions about the next prayer in Kuala Lumpur",
      faq: [
        {
          question: "Does this Kuala Lumpur page only show the next prayer?",
          answer: "No. The next prayer is the main focus, but the full daily prayer schedule for Kuala Lumpur still stays visible on the same page."
        },
        {
          question: "Can I switch from the Kuala Lumpur next-prayer page into other Kuala Lumpur prayer routes?",
          answer: "Yes. The page links directly into the Kuala Lumpur prayer-times route and into narrower single-prayer routes."
        },
        {
          question: "Why can the Kuala Lumpur countdown differ from another source?",
          answer: "The countdown depends on the loaded timetable, and timetables can vary by method or local authority, so compare the visible method label with your local mosque when needed."
        }
      ]
    };
  }

  if (key === "fajr:johor-bahru") {
    return {
      metaTitle: "Fajr Time in Johor Bahru Today | Daily Fajr Prayer Time Finder | Adantimer",
      metaDescription: "Check Fajr time in Johor Bahru today, compare the full daily schedule, and keep the live next-prayer countdown visible on one page.",
      heroSubtitle: "Check Fajr time in Johor Bahru today, keep the next-prayer countdown visible, and review the full daily schedule before moving into another route.",
      infoTitle: "Use this Johor Bahru page when Fajr time is the main question",
      features: [
        "Fajr stays at the center of the Johor Bahru page while the full daily timetable remains visible for context.",
        "Current prayer, next prayer, today's date, and the active method stay on the same screen for a faster local check.",
        "The page links directly into Johor Bahru prayer-times and next-prayer routes when you want a broader city view.",
        "GPS, IP fallback, and manual city search remain available if you need to compare Johor Bahru with another city."
      ],
      citiesTitle: "Related Johor Bahru prayer routes",
      aboutTitle: "What the Johor Bahru Fajr page should answer first",
      aboutParagraphs: [
        "This route is built for the direct local intent: what time is Fajr in Johor Bahru today and how can I verify it quickly.",
        "The page keeps Fajr time together with the full daily timetable, the next-prayer countdown, and the visible calculation method so the answer is easier to trust.",
        "When you need a broader city check after confirming Fajr, the linked Johor Bahru routes let you move into the full prayer-times page or the next-prayer page immediately."
      ],
      faqTitle: "Common questions about Fajr time in Johor Bahru",
      faq: [
        {
          question: "Does this Johor Bahru page only show Fajr time?",
          answer: "No. Fajr is the main focus, but the full daily prayer schedule for Johor Bahru stays visible on the same page."
        },
        {
          question: "Can I move from the Johor Bahru Fajr page into other Johor Bahru prayer routes?",
          answer: "Yes. The page links directly into the Johor Bahru prayer-times route and the next-prayer route."
        },
        {
          question: "Why can Fajr time in Johor Bahru differ from another timetable?",
          answer: "The shown time depends on the loaded timetable, and timetables can vary by method or local authority, so compare the visible method label with your local mosque when needed."
        }
      ]
    };
  }

  if (key === "dhuhr:johor-bahru") {
    return {
      metaTitle: "Dhuhr Time in Johor Bahru Today | Daily Dhuhr Prayer Time Finder | Adantimer",
      metaDescription: "Check Dhuhr time in Johor Bahru today, compare the full daily schedule, and keep the live next-prayer countdown visible on one page.",
      heroSubtitle: "Check Dhuhr time in Johor Bahru today, keep the next-prayer countdown visible, and review the full daily schedule before moving into another route.",
      infoTitle: "Use this Johor Bahru page when Dhuhr time is the main question",
      features: [
        "Dhuhr stays at the center of the Johor Bahru page while the full daily timetable remains visible for context.",
        "Current prayer, next prayer, today's date, and the active method stay on the same screen for a faster local check.",
        "The page links directly into Johor Bahru prayer-times and next-prayer routes when you want a broader city view.",
        "GPS, IP fallback, and manual city search remain available if you need to compare Johor Bahru with another city."
      ],
      citiesTitle: "Related Johor Bahru prayer routes",
      aboutTitle: "What the Johor Bahru Dhuhr page should answer first",
      aboutParagraphs: [
        "This route is built for the direct local intent: what time is Dhuhr in Johor Bahru today and how can I confirm it quickly.",
        "The page keeps Dhuhr time together with the full daily timetable, the next-prayer countdown, and the visible calculation method so the answer is easier to verify.",
        "When you need a broader city check after confirming Dhuhr, the linked Johor Bahru routes let you move into the full prayer-times page or the next-prayer page immediately."
      ],
      faqTitle: "Common questions about Dhuhr time in Johor Bahru",
      faq: [
        {
          question: "Does this Johor Bahru page only show Dhuhr time?",
          answer: "No. Dhuhr is the main focus, but the full daily prayer schedule for Johor Bahru stays visible on the same page."
        },
        {
          question: "Can I move from the Johor Bahru Dhuhr page into other Johor Bahru prayer routes?",
          answer: "Yes. The page links directly into the Johor Bahru prayer-times route and the next-prayer route."
        },
        {
          question: "Why can Dhuhr time in Johor Bahru differ from another timetable?",
          answer: "The shown time depends on the loaded timetable, and timetables can vary by method or local authority, so compare the visible method label with your local mosque when needed."
        }
      ]
    };
  }

  if (key === "isha:jakarta") {
    return {
      metaTitle: "Isha Time in Jakarta Today | Daily Isha Prayer Time Finder | Adantimer",
      metaDescription: "Check Isha time in Jakarta today, compare the full daily schedule, and keep the live next-prayer countdown visible on one page.",
      heroSubtitle: "Check Isha time in Jakarta today, keep the next-prayer countdown visible, and review the full daily schedule before moving into another route.",
      infoTitle: "Use this Jakarta page when Isha time is the main question",
      features: [
        "Isha stays at the center of the Jakarta page while the full daily timetable remains visible for context.",
        "Current prayer, next prayer, today's date, and the active method stay on the same screen for a faster local check.",
        "The page links directly into Jakarta prayer-times and next-prayer routes when you want a broader city view.",
        "GPS, IP fallback, and manual city search remain available if you need to compare Jakarta with another city."
      ],
      citiesTitle: "Related Jakarta prayer routes",
      aboutTitle: "What the Jakarta Isha page should answer first",
      aboutParagraphs: [
        "This route is built for the direct local intent: what time is Isha in Jakarta today and how can I verify it quickly.",
        "The page keeps Isha time together with the full daily timetable, the next-prayer countdown, and the visible calculation method so the answer is easier to trust.",
        "When you need a broader city check after confirming Isha, the linked Jakarta routes let you move into the full prayer-times page or the next-prayer page immediately."
      ],
      faqTitle: "Common questions about Isha time in Jakarta",
      faq: [
        {
          question: "Does this Jakarta page only show Isha time?",
          answer: "No. Isha is the main focus, but the full daily prayer schedule for Jakarta stays visible on the same page."
        },
        {
          question: "Can I move from the Jakarta Isha page into other Jakarta prayer routes?",
          answer: "Yes. The page links directly into the Jakarta prayer-times route and the next-prayer route."
        },
        {
          question: "Why can Isha time in Jakarta differ from another timetable?",
          answer: "The shown time depends on the loaded timetable, and timetables can vary by method or local authority, so compare the visible method label with your local mosque when needed."
        }
      ]
    };
  }

  return null;
}

function buildArabicPriorityIntentCityCopy(pageType, cityKey, place) {
  const key = `${pageType}:${cityKey}`;

  if (key === "prayer-times:mecca") {
    return {
      metaTitle: "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0641\u064a \u0645\u0643\u0629 \u0627\u0644\u064a\u0648\u0645 | \u0627\u0644\u0641\u062c\u0631 \u0648\u0627\u0644\u0638\u0647\u0631 \u0648\u0627\u0644\u0639\u0635\u0631 \u0648\u0627\u0644\u0645\u063a\u0631\u0628 \u0648\u0627\u0644\u0639\u0634\u0627\u0621 | Adantimer",
      metaDescription: `\u062a\u062d\u0642\u0642 \u0645\u0646 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0641\u064a ${place} \u0627\u0644\u064a\u0648\u0645 \u0645\u0639 \u0627\u0644\u0641\u062c\u0631 \u0648\u0627\u0644\u0638\u0647\u0631 \u0648\u0627\u0644\u0639\u0635\u0631 \u0648\u0627\u0644\u0645\u063a\u0631\u0628 \u0648\u0627\u0644\u0639\u0634\u0627\u0621 \u0648\u0627\u0644\u0639\u062f \u0627\u0644\u062a\u0646\u0627\u0632\u0644\u064a \u0644\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629.`,
      heroSubtitle: `\u062a\u062d\u0642\u0642 \u0645\u0646 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0641\u064a ${place} \u0627\u0644\u064a\u0648\u0645\u060c \u0648\u062a\u0627\u0628\u0639 \u0627\u0644\u0639\u062f \u0627\u0644\u062a\u0646\u0627\u0632\u0644\u064a \u0644\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629\u060c \u0648\u0631\u0627\u062c\u0639 \u062c\u062f\u0648\u0644 \u0627\u0644\u0641\u062c\u0631 \u0648\u0627\u0644\u0638\u0647\u0631 \u0648\u0627\u0644\u0639\u0635\u0631 \u0648\u0627\u0644\u0645\u063a\u0631\u0628 \u0648\u0627\u0644\u0639\u0634\u0627\u0621 \u0641\u064a \u0635\u0641\u062d\u0629 \u0648\u0627\u062d\u062f\u0629.`,
      infoTitle: `\u0627\u0633\u062a\u062e\u062f\u0645 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0639\u0646\u062f\u0645\u0627 \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0641\u064a ${place}`,
      aboutTitle: `\u0643\u064a\u0641 \u062a\u0633\u062a\u062e\u062f\u0645 \u0635\u0641\u062d\u0629 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0641\u064a ${place}`,
      aboutParagraphs: [
        `\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0628\u0646\u064a\u0629 \u0644\u0645\u0646 \u064a\u0628\u062d\u062b \u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0646 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0641\u064a ${place} \u0627\u0644\u064a\u0648\u0645\u060c \u0644\u0627 \u0644\u0645\u0646 \u064a\u0631\u064a\u062f \u0635\u0641\u062d\u0629 \u0639\u0627\u0645\u0629 \u0641\u0642\u0637.`,
        "\u064a\u062c\u062a\u0645\u0639 \u0641\u064a \u0627\u0644\u0635\u0641\u062d\u0629 \u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645 \u0627\u0644\u0643\u0627\u0645\u0644 \u0645\u0639 \u0627\u0644\u0639\u062f \u0627\u0644\u062a\u0646\u0627\u0632\u0644\u064a \u0644\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0648\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0638\u0627\u0647\u0631\u0629 \u062d\u062a\u0649 \u062a\u0635\u0644 \u0625\u0644\u0649 \u0627\u0644\u0625\u062c\u0627\u0628\u0629 \u0628\u0633\u0631\u0639\u0629 \u0623\u0643\u0628\u0631.",
        "\u0625\u0630\u0627 \u0627\u062e\u062a\u0644\u0641 \u0627\u0644\u062c\u062f\u0648\u0644 \u0639\u0646 \u062c\u0647\u0629 \u0623\u062e\u0631\u0649\u060c \u0641\u0642\u0627\u0631\u0646 \u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0638\u0627\u0647\u0631\u0629 \u0645\u0639 \u062a\u0648\u0642\u064a\u062a \u0627\u0644\u0645\u0633\u062c\u062f \u0627\u0644\u0645\u062d\u0644\u064a \u0623\u0648 \u0627\u0644\u062c\u0647\u0629 \u0627\u0644\u0645\u0648\u062b\u0648\u0642\u0629."
      ]
    };
  }

  if (key === "next-prayer:riyadh") {
    return {
      metaTitle: "\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0641\u064a \u0627\u0644\u0631\u064a\u0627\u0636 \u0627\u0644\u064a\u0648\u0645 | \u0639\u062f \u062a\u0646\u0627\u0632\u0644\u064a \u0645\u0628\u0627\u0634\u0631 \u0644\u0644\u0635\u0644\u0627\u0629 | Adantimer",
      metaDescription: `\u0627\u0639\u0631\u0641 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0641\u064a ${place} \u0627\u0644\u064a\u0648\u0645 \u0645\u0639 \u0639\u062f \u062a\u0646\u0627\u0632\u0644\u064a \u0645\u0628\u0627\u0634\u0631\u060c \u0648\u062d\u0627\u0644\u0629 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629\u060c \u0648\u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645\u064a \u0627\u0644\u0643\u0627\u0645\u0644.`,
      heroSubtitle: `\u062a\u0627\u0628\u0639 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0641\u064a ${place} \u0645\u0639 \u0639\u062f \u062a\u0646\u0627\u0632\u0644\u064a \u0645\u0628\u0627\u0634\u0631\u060c \u0648\u0627\u0639\u0631\u0641 \u062d\u0627\u0644\u0629 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629\u060c \u0648\u0623\u0628\u0642 \u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645\u064a \u0627\u0644\u0643\u0627\u0645\u0644 \u0645\u062a\u0627\u062d\u0627 \u0641\u064a \u0627\u0644\u0635\u0641\u062d\u0629 \u0646\u0641\u0633\u0647\u0627.`,
      infoTitle: `\u0627\u0633\u062a\u062e\u062f\u0645 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0639\u0646\u062f\u0645\u0627 \u062a\u0643\u0648\u0646 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0641\u064a ${place} \u0647\u064a \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0623\u0633\u0627\u0633\u064a`,
      aboutTitle: `\u0645\u0627 \u0627\u0644\u0630\u064a \u064a\u062c\u0628 \u0623\u0646 \u062a\u062c\u064a\u0628 \u0639\u0646\u0647 \u0635\u0641\u062d\u0629 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0641\u064a ${place} \u0623\u0648\u0644\u0627`,
      aboutParagraphs: [
        `\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0628\u0646\u064a\u0629 \u0644\u0646\u064a\u0629 \u0627\u0644\u0628\u062d\u062b \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629: \u0645\u0627 \u0647\u064a \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0641\u064a ${place} \u0648\u0643\u0645 \u064a\u0628\u0642\u0649 \u0639\u0644\u0649 \u0628\u062f\u0626\u0647\u0627.`,
        "\u062a\u062c\u0645\u0639 \u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0639\u062f \u0627\u0644\u062a\u0646\u0627\u0632\u0644\u064a\u060c \u0648\u062d\u0627\u0644\u0629 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629\u060c \u0648\u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645\u064a\u060c \u0648\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0638\u0627\u0647\u0631\u0629 \u0641\u064a \u0645\u0643\u0627\u0646 \u0648\u0627\u062d\u062f.",
        "\u0639\u0646\u062f\u0645\u0627 \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0645\u0631\u0627\u062c\u0639\u0629 \u0623\u0648\u0633\u0639 \u0623\u0648 \u0623\u062f\u0642\u060c \u062a\u0646\u0642\u0644\u0643 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0625\u0644\u0649 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0623\u0648 \u0645\u0633\u0627\u0631\u0627\u062a \u0635\u0644\u0627\u0629 \u0645\u0641\u0631\u062f\u0629 \u062f\u0627\u062e\u0644 \u0627\u0644\u0631\u064a\u0627\u0636."
      ]
    };
  }

  if (key === "fajr:medina") {
    return {
      metaTitle: "\u0648\u0642\u062a \u0627\u0644\u0641\u062c\u0631 \u0641\u064a \u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0627\u0644\u064a\u0648\u0645 | \u062f\u0644\u064a\u0644 \u0648\u0642\u062a \u0627\u0644\u0641\u062c\u0631 \u0627\u0644\u064a\u0648\u0645\u064a | Adantimer",
      metaDescription: `\u062a\u062d\u0642\u0642 \u0645\u0646 \u0648\u0642\u062a \u0627\u0644\u0641\u062c\u0631 \u0641\u064a ${place} \u0627\u0644\u064a\u0648\u0645\u060c \u0648\u0642\u0627\u0631\u0646 \u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645\u064a \u0627\u0644\u0643\u0627\u0645\u0644\u060c \u0648\u0623\u0628\u0642 \u0627\u0644\u0639\u062f \u0627\u0644\u062a\u0646\u0627\u0632\u0644\u064a \u0644\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0638\u0627\u0647\u0631\u0627.`,
      heroSubtitle: `\u062a\u062d\u0642\u0642 \u0645\u0646 \u0648\u0642\u062a \u0627\u0644\u0641\u062c\u0631 \u0641\u064a ${place} \u0627\u0644\u064a\u0648\u0645\u060c \u0648\u0623\u0628\u0642 \u0627\u0644\u0639\u062f \u0627\u0644\u062a\u0646\u0627\u0632\u0644\u064a \u0644\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0638\u0627\u0647\u0631\u0627\u060c \u0648\u0631\u0627\u062c\u0639 \u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645\u064a \u0627\u0644\u0643\u0627\u0645\u0644 \u0642\u0628\u0644 \u0627\u0644\u0627\u0646\u062a\u0642\u0627\u0644 \u0625\u0644\u0649 \u0645\u0633\u0627\u0631 \u0622\u062e\u0631.`,
      infoTitle: `\u0627\u0633\u062a\u062e\u062f\u0645 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0639\u0646\u062f\u0645\u0627 \u064a\u0643\u0648\u0646 \u0648\u0642\u062a \u0627\u0644\u0641\u062c\u0631 \u0641\u064a ${place} \u0647\u0648 \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0623\u0633\u0627\u0633\u064a`,
      aboutTitle: `\u0645\u0627 \u0627\u0644\u0630\u064a \u064a\u062c\u0628 \u0623\u0646 \u062a\u062c\u064a\u0628 \u0639\u0646\u0647 \u0635\u0641\u062d\u0629 \u0648\u0642\u062a \u0627\u0644\u0641\u062c\u0631 \u0641\u064a ${place} \u0623\u0648\u0644\u0627`,
      aboutParagraphs: [
        `\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0628\u0646\u064a\u0629 \u0644\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0645\u0628\u0627\u0634\u0631: \u0645\u0627 \u0648\u0642\u062a \u0627\u0644\u0641\u062c\u0631 \u0641\u064a ${place} \u0627\u0644\u064a\u0648\u0645 \u0648\u0643\u064a\u0641 \u0623\u062a\u062d\u0642\u0642 \u0645\u0646\u0647 \u0628\u0633\u0631\u0639\u0629.`,
        "\u062a\u0628\u0642\u064a \u0627\u0644\u0635\u0641\u062d\u0629 \u0648\u0642\u062a \u0627\u0644\u0641\u062c\u0631 \u0645\u0639 \u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645\u064a \u0627\u0644\u0643\u0627\u0645\u0644\u060c \u0648\u0627\u0644\u0639\u062f \u0627\u0644\u062a\u0646\u0627\u0632\u0644\u064a \u0644\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629\u060c \u0648\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0638\u0627\u0647\u0631\u0629 \u0641\u064a \u0645\u0643\u0627\u0646 \u0648\u0627\u062d\u062f.",
        "\u0628\u0639\u062f \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0648\u0642\u062a \u0627\u0644\u0641\u062c\u0631\u060c \u062a\u0646\u0642\u0644\u0643 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0625\u0644\u0649 \u0645\u0633\u0627\u0631\u0627\u062a \u0623\u0648\u0633\u0639 \u0644\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0623\u0648 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u062f\u0627\u062e\u0644 \u0627\u0644\u0645\u062f\u064a\u0646\u0629."
      ]
    };
  }

  return null;
}

function buildArabicPriorityHomeCityCopy(cityName, variant = "generic") {
  if (variant === "dubai") {
    return {
      metaTitle: "مواقيت الصلاة في دبي اليوم | الفجر والظهر والعصر والمغرب والعشاء | Adantimer",
      metaDescription: "تحقق من مواقيت الصلاة في دبي اليوم مع الفجر والظهر والعصر والمغرب والعشاء والعد التنازلي للصلاة القادمة.",
      heroSubtitle: "تحقق من مواقيت الصلاة في دبي اليوم، وتابع العد التنازلي للصلاة القادمة، وراجع جدول الفجر والظهر والعصر والمغرب والعشاء في صفحة واحدة.",
      infoTitle: "مواقيت الصلاة في دبي مع الجدول الكامل والصلاة القادمة",
      features: [
        "اعرض جدول دبي اليومي للفجر والظهر والعصر والمغرب والعشاء مع العد التنازلي للصلاة القادمة.",
        "تبقى الصلاة الحالية وتاريخ اليوم وطريقة الحساب الظاهرة في نفس الصفحة لسهولة المراجعة.",
        "يمكنك الانتقال مباشرة من دبي إلى صفحات أكثر تركيزا مثل الصلاة القادمة أو الفجر أو العصر.",
        "عند اختلاف الجدول عن مصدر آخر، قارن طريقة الحساب الظاهرة مع توقيت المسجد المحلي أو الجهة الموثوقة."
      ],
      aboutTitle: "كيف تستخدم صفحة مواقيت الصلاة في دبي",
      aboutParagraphs: [
        "هذه الصفحة مبنية لمن يبحث مباشرة عن مواقيت الصلاة في دبي اليوم، لا لمن يريد صفحة عامة فقط.",
        "يجتمع في الصفحة جدول اليوم الكامل مع العد التنازلي للصلاة القادمة وطريقة الحساب الظاهرة حتى تصل إلى الإجابة بسرعة أكبر.",
        "إذا كنت تحتاج إلى مقارنة النتيجة بجدول محلي مختلف، فاستخدم هذه الصفحة كنقطة وصول سريعة ثم اتبع توقيت المسجد المحلي أو الجهة الموثوقة."
      ],
      faqTitle: "أسئلة شائعة عن مواقيت الصلاة في دبي",
      faq: [
        {
          question: "هل تعرض هذه الصفحة الصلوات الخمس اليومية في دبي؟",
          answer: "نعم. تعرض الصفحة الفجر والظهر والعصر والمغرب والعشاء مع العد التنازلي للصلاة القادمة."
        },
        {
          question: "لماذا قد تختلف مواقيت الصلاة في دبي عن مصدر آخر؟",
          answer: "قد تختلف المواقيت بحسب طريقة الحساب أو الجدول المحلي، لذلك تبقى طريقة الحساب الظاهرة وإرشاد المسجد المحلي مهمين."
        },
        {
          question: "هل أستطيع الانتقال بسرعة من دبي إلى صفحات صلاة أخرى؟",
          answer: "نعم. الصفحة تربطك مباشرة بمسارات أكثر تركيزا مثل الصلاة القادمة والفجر والعصر وصفحات المدن المهمة."
        }
      ]
    };
  }

  return {
    metaTitle: `مواقيت الصلاة في ${cityName} اليوم | الفجر والظهر والعصر والمغرب والعشاء | Adantimer`,
    metaDescription: `تحقق من مواقيت الصلاة في ${cityName} اليوم مع الفجر والظهر والعصر والمغرب والعشاء والعد التنازلي للصلاة القادمة.`,
    heroSubtitle: `تحقق من مواقيت الصلاة في ${cityName} اليوم، وتابع العد التنازلي للصلاة القادمة، وراجع جدول الفجر والظهر والعصر والمغرب والعشاء في صفحة واحدة.`,
    infoTitle: `مواقيت الصلاة في ${cityName} مع الجدول الكامل والصلاة القادمة`,
    features: [
      `اعرض جدول ${cityName} اليومي للفجر والظهر والعصر والمغرب والعشاء مع العد التنازلي للصلاة القادمة.`,
      "تبقى الصلاة الحالية وتاريخ اليوم وطريقة الحساب الظاهرة في نفس الصفحة لسهولة المراجعة.",
      `يمكنك الانتقال مباشرة من ${cityName} إلى صفحات أكثر تركيزا مثل الصلاة القادمة أو الفجر أو العصر.`,
      "عند اختلاف الجدول عن مصدر آخر، قارن طريقة الحساب الظاهرة مع توقيت المسجد المحلي أو الجهة الموثوقة."
    ],
    aboutTitle: `كيف تستخدم صفحة مواقيت الصلاة في ${cityName}`,
    aboutParagraphs: [
      `هذه الصفحة مبنية لمن يبحث مباشرة عن مواقيت الصلاة في ${cityName} اليوم، لا لمن يريد صفحة عامة فقط.`,
      "يجتمع في الصفحة جدول اليوم الكامل مع العد التنازلي للصلاة القادمة وطريقة الحساب الظاهرة حتى تصل إلى الإجابة بسرعة أكبر.",
      "إذا كنت تحتاج إلى مقارنة النتيجة بجدول محلي مختلف، فاستخدم هذه الصفحة كنقطة وصول سريعة ثم اتبع توقيت المسجد المحلي أو الجهة الموثوقة."
    ],
    faqTitle: `أسئلة شائعة عن مواقيت الصلاة في ${cityName}`,
    faq: [
      {
        question: `هل تعرض هذه الصفحة الصلوات الخمس اليومية في ${cityName}؟`,
        answer: "نعم. تعرض الصفحة الفجر والظهر والعصر والمغرب والعشاء مع العد التنازلي للصلاة القادمة."
      },
      {
        question: `لماذا قد تختلف مواقيت الصلاة في ${cityName} عن مصدر آخر؟`,
        answer: "قد تختلف المواقيت بحسب طريقة الحساب أو الجدول المحلي، لذلك تبقى طريقة الحساب الظاهرة وإرشاد المسجد المحلي مهمين."
      },
      {
        question: `هل أستطيع الانتقال بسرعة من ${cityName} إلى صفحات صلاة أخرى؟`,
        answer: "نعم. الصفحة تربطك مباشرة بمسارات أكثر تركيزا مثل الصلاة القادمة والفجر والعصر وصفحات المدن المهمة."
      }
    ]
  };
}

function getPriorityHomeGenericSlugs(cities = [], language = "en") {
  const customVariants = PRIORITY_HOME_CUSTOM_VARIANTS[language] || new Map();
  return new Set(
    cities
      .map(city => city.slug)
      .filter(slug => !customVariants.has(slug))
  );
}

function getPriorityIntentSeoCopy(language, pageType, sourceCity) {
  if (sourceCity) {
    return null;
  }

  if (language === "en") {
    if (pageType === "prayer-times" || pageType === "next-prayer" || ["fajr", "dhuhr", "asr", "maghrib", "isha"].includes(pageType)) {
      return buildEnglishPriorityIntentCopy(pageType);
    }

    return null;
  }

  if (language === "ar" && ["fajr", "dhuhr", "asr", "maghrib", "isha"].includes(pageType)) {
    return buildArabicPriorityIntentCopy(pageType);
  }

  return null;
}

function getPriorityHomeCitySeoCopy(language, pageType, cityKey, place) {
  if (pageType !== "home") {
    return null;
  }

  if (language === "en") {
    const customVariant = PRIORITY_HOME_CUSTOM_VARIANTS.en.get(cityKey);
    if (customVariant) {
      return buildEnglishPriorityHomeCityCopy(customVariant.cityName, customVariant.variant);
    }

    if (ENGLISH_PRIORITY_HOME_GENERIC_SLUGS.has(cityKey)) {
      const cityName = ENGLISH_PRIORITY_HOME_CITY_BY_SLUG.get(cityKey)?.city || place;
      return buildEnglishPriorityHomeCityCopy(cityName);
    }

    return null;
  }

  if (language === "ar") {
    const customVariant = PRIORITY_HOME_CUSTOM_VARIANTS.ar.get(cityKey);
    if (customVariant) {
      return buildArabicPriorityHomeCityCopy(customVariant.cityName, customVariant.variant);
    }

    if (ARABIC_PRIORITY_HOME_GENERIC_SLUGS.has(cityKey)) {
      const cityName = localizeCityName(ARABIC_PRIORITY_HOME_CITY_BY_SLUG.get(cityKey)?.city || place, "ar");
      return buildArabicPriorityHomeCityCopy(cityName);
    }
  }

  if (language === "fr") {
    const customVariant = PRIORITY_HOME_CUSTOM_VARIANTS.fr.get(cityKey);
    if (customVariant) {
      return buildFrenchGscWinnerHomeCityCopy(customVariant.cityName, customVariant.variant);
    }
  }

  return null;
}

function applyPriorityPrayerSeoOverrides({ language, pageType, sourceCity, place, copy }) {
  const cityKey = slugify(sourceCity || "");
  const priorityIntentCityCopy = language === "en"
    ? buildEnglishPriorityIntentCityCopy(pageType, cityKey, place)
    : language === "ar"
      ? buildArabicPriorityIntentCityCopy(pageType, cityKey, place)
      : null;
  const priorityIntentCopy = getPriorityIntentSeoCopy(language, pageType, sourceCity);
  const priorityHomeCityCopy = getPriorityHomeCitySeoCopy(language, pageType, cityKey, place);

  if (priorityIntentCityCopy) {
    Object.assign(copy, priorityIntentCityCopy);
    return copy;
  }

  if (priorityIntentCopy) {
    Object.assign(copy, priorityIntentCopy);
    return copy;
  }

  if (priorityHomeCityCopy) {
    Object.assign(copy, priorityHomeCityCopy);
    return copy;
  }

  return copy;
}

const TOOL_HUB_CONTENT = {
  en: {
    eyebrow: "More Tools",
    title: "Open Qibla, Quran, Dhikr, and Hadith",
    intro: "",
    items: {
      qibla: { label: "Qibla", description: "Open a qibla direction page alongside the live prayer schedule.", cta: "Open Qibla" },
      quran: { label: "Quran", description: "Continue into a Quran page for quick daily reading and return visits.", cta: "Open Quran" },
      dhikr: { label: "Dhikr", description: "Keep a dedicated dhikr page one tap away from the main prayer experience.", cta: "Open Dhikr" },
      hadith: { label: "Hadith", description: "Jump into a hadith page for short reading and study sessions.", cta: "Open Hadith" }
    }
  },
  ar: {
    eyebrow: "أدوات إضافية",
    title: "واصل إلى القبلة والقرآن والذكر والحديث",
    intro: "أضف صفحات إسلامية يومية مباشرة أسفل جدول الصلاة حتى ينتقل الزائر إلى القبلة والقرآن والذكر والحديث من داخل Adantimer.",
    items: {
      qibla: { label: "القبلة", description: "افتح صفحة اتجاه القبلة بجانب جدول الصلاة المباشر.", cta: "افتح القبلة" },
      quran: { label: "القرآن", description: "انتقل إلى صفحة قرآن للقراءة اليومية والعودة السريعة.", cta: "افتح القرآن" },
      dhikr: { label: "الذكر", description: "اجعل صفحة الذكر متاحة مباشرة بجانب تجربة مواقيت الصلاة.", cta: "افتح الذكر" },
      hadith: { label: "الحديث", description: "انتقل إلى صفحة حديث للقراءة السريعة والمراجعة.", cta: "افتح الحديث" }
    }
  },
  de: {
    eyebrow: "Weitere Funktionen",
    title: "Weiter zu Qibla, Koran, Dhikr und Hadith",
    intro: "Füge direkt unter dem Gebetsplan weitere islamische Seiten hinzu, damit Besucher innerhalb von Adantimer zu Qibla, Koran, Dhikr und Hadith wechseln können.",
    items: {
      qibla: { label: "Qibla", description: "Öffne eine Qibla-Seite zusammen mit dem aktuellen Gebetsplan.", cta: "Qibla öffnen" },
      quran: { label: "Koran", description: "Wechsle auf eine Koran-Seite für tägliches Lesen und spätere Rückkehr.", cta: "Koran öffnen" },
      dhikr: { label: "Dhikr", description: "Halte eine eigene Dhikr-Seite direkt neben den Gebetszeiten bereit.", cta: "Dhikr öffnen" },
      hadith: { label: "Hadith", description: "Springe auf eine Hadith-Seite für kurze Lese- und Lernphasen.", cta: "Hadith öffnen" }
    }
  },
  fr: {
    eyebrow: "Autres fonctions",
    title: "Continuer vers Qibla, Coran, Dhikr et Hadith",
    intro: "Ajoute d'autres pages islamiques directement sous le planning afin que le visiteur puisse ouvrir la qibla, le Coran, le dhikr et le hadith sans quitter Adantimer.",
    items: {
      qibla: { label: "Qibla", description: "Ouvrez une page de direction de la qibla à côté du planning en direct.", cta: "Ouvrir Qibla" },
      quran: { label: "Coran", description: "Accédez à une page Coran pour la lecture quotidienne et les retours rapides.", cta: "Ouvrir Coran" },
      dhikr: { label: "Dhikr", description: "Gardez une page dhikr dédiée juste à côté des horaires de prière.", cta: "Ouvrir Dhikr" },
      hadith: { label: "Hadith", description: "Passez à une page hadith pour des lectures courtes et régulières.", cta: "Ouvrir Hadith" }
    }
  },
  tr: {
    eyebrow: "Diger Araclar",
    title: "Kible, Kuran, zikir ve hadis sayfalarina devam et",
    intro: "Namaz takviminin hemen altina ek sayfalar ekleyerek ziyaretcinin Adantimer icinde kible, Kuran, zikir ve hadis sayfalarina gecmesini sagla.",
    items: {
      qibla: { label: "Kible", description: "Canli namaz takvimiyle birlikte bir kible sayfasi ac.", cta: "Kibleyi ac" },
      quran: { label: "Kuran", description: "Gunluk okuma ve geri donusler icin bir Kuran sayfasina gec.", cta: "Kurani ac" },
      dhikr: { label: "Zikir", description: "Ana namaz deneyiminin yaninda ozel bir zikir sayfasi tut.", cta: "Zikri ac" },
      hadith: { label: "Hadis", description: "Kisa okuma ve inceleme icin bir hadis sayfasina git.", cta: "Hadisi ac" }
    }
  },
  "zh-hans": {
    eyebrow: "更多功能",
    title: "继续进入 Qibla、Quran、Dhikr 和 Hadith 页面",
    intro: "在主礼拜时间区块下方直接加入更多伊斯兰页面，让访问者可以在 Adantimer 内继续进入朝向、古兰经、记念与圣训页面。",
    items: {
      qibla: { label: "Qibla", description: "在实时礼拜时间旁打开朝向页面。", cta: "打开 Qibla" },
      quran: { label: "Quran", description: "进入古兰经页面，方便每日阅读和再次访问。", cta: "打开 Quran" },
      dhikr: { label: "Dhikr", description: "让记念页面紧贴主礼拜时间体验。", cta: "打开 Dhikr" },
      hadith: { label: "Hadith", description: "进入圣训页面，适合短时间阅读和学习。", cta: "打开 Hadith" }
    }
  }
};

const QIBLA_PANEL_CONTENT = {
  en: {
    eyebrow: "Qibla",
    title: "Qibla Compass",
    summary: "See the direction of the Kaaba from your current location or any city you search.",
    kaabaLabel: "Kaaba",
    placeFallback: "Current location",
    statusIdle: "Allow location or search for a city to calculate qibla.",
    bearingLabel: "Bearing from north",
    distanceLabel: "Distance to Makkah"
  },
  ar: {
    eyebrow: "\u0627\u0644\u0642\u0628\u0644\u0629",
    title: "\u0628\u0648\u0635\u0644\u0629 \u0627\u0644\u0642\u0628\u0644\u0629",
    summary: "\u0627\u0639\u0631\u0641 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0643\u0639\u0628\u0629 \u0645\u0646 \u0645\u0648\u0642\u0639\u0643 \u0627\u0644\u062d\u0627\u0644\u064a \u0623\u0648 \u0623\u064a \u0645\u062f\u064a\u0646\u0629 \u062a\u0628\u062d\u062b \u0639\u0646\u0647\u0627.",
    kaabaLabel: "\u0627\u0644\u0643\u0639\u0628\u0629",
    placeFallback: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u062d\u0627\u0644\u064a",
    statusIdle: "\u0627\u0633\u0645\u062d \u0628\u0627\u0644\u0645\u0648\u0642\u0639 \u0623\u0648 \u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u062f\u064a\u0646\u0629 \u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0642\u0628\u0644\u0629.",
    bearingLabel: "\u0627\u0644\u062f\u0631\u062c\u0629 \u0645\u0646 \u0627\u0644\u0634\u0645\u0627\u0644",
    distanceLabel: "\u0627\u0644\u0645\u0633\u0627\u0641\u0629 \u0625\u0644\u0649 \u0645\u0643\u0629"
  },
  de: {
    eyebrow: "Qibla",
    title: "Qibla-Kompass",
    summary: "Sieh die Richtung der Kaaba von deinem aktuellen Standort oder jeder gesuchten Stadt.",
    kaabaLabel: "Kaaba",
    placeFallback: "Aktueller Standort",
    statusIdle: "Erlaube den Standortzugriff oder suche eine Stadt, um die Qibla zu berechnen.",
    bearingLabel: "Grad von Norden",
    distanceLabel: "Entfernung nach Mekka"
  },
  fr: {
    eyebrow: "Qibla",
    title: "Boussole qibla",
    summary: "Affiche la direction de la Kaaba depuis votre position actuelle ou n'importe quelle ville recherchee.",
    kaabaLabel: "Kaaba",
    placeFallback: "Position actuelle",
    statusIdle: "Autorisez la position ou recherchez une ville pour calculer la qibla.",
    bearingLabel: "Cap depuis le nord",
    distanceLabel: "Distance jusqu'a La Mecque"
  },
  tr: {
    eyebrow: "Kible",
    title: "Kible pusulasi",
    summary: "Bulundugun konumdan veya aradigin herhangi bir sehirden Kabe yonunu gosterir.",
    kaabaLabel: "Kabe",
    placeFallback: "Guncel konum",
    statusIdle: "Kibleyi hesaplamak icin konuma izin ver veya bir sehir ara.",
    bearingLabel: "Kuzeyden derece",
    distanceLabel: "Mekke uzakligi"
  },
  "zh-hans": {
    eyebrow: "\u671d\u5411",
    title: "\u671d\u5411\u7f57\u76d8",
    summary: "\u6839\u636e\u5f53\u524d\u4f4d\u7f6e\u6216\u641c\u7d22\u7684\u57ce\u5e02\u663e\u793a\u5361\u5c14\u767d\u7684\u65b9\u5411\u3002",
    kaabaLabel: "Kaaba",
    placeFallback: "\u5f53\u524d\u4f4d\u7f6e",
    statusIdle: "\u5141\u8bb8\u5b9a\u4f4d\u6216\u641c\u7d22\u57ce\u5e02\u4ee5\u8ba1\u7b97\u671d\u5411\u3002",
    bearingLabel: "\u4ece\u6b63\u5317\u5f00\u59cb\u7684\u65b9\u5411",
    distanceLabel: "\u8ddd\u9ea6\u52a0\u7684\u8ddd\u79bb"
  }
};

for (const tools of Object.values(TOOL_HUB_CONTENT)) {
  tools.intro = "";
}

Object.assign(TOOL_HUB_CONTENT.en, { title: "Islamic Tools" });
Object.assign(TOOL_HUB_CONTENT.ar, { title: "\u0623\u062f\u0648\u0627\u062a \u0625\u0633\u0644\u0627\u0645\u064a\u0629" });
Object.assign(TOOL_HUB_CONTENT.de, { title: "Islamische Tools" });
Object.assign(TOOL_HUB_CONTENT.fr, { title: "Outils islamiques" });
Object.assign(TOOL_HUB_CONTENT.tr, { title: "Islami Araclar" });
Object.assign(TOOL_HUB_CONTENT["zh-hans"], { title: "\u4f0a\u65af\u5170\u5de5\u5177" });

Object.assign(QIBLA_PANEL_CONTENT.en, {
  sensorButton: "Enable live compass",
  sensorHintIdle: "On phones with a compass sensor, enable the live compass so the arrow turns with your device."
});
Object.assign(QIBLA_PANEL_CONTENT.ar, {
  sensorButton: "\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0627\u0644\u062d\u064a\u0629",
  sensorHintIdle: "\u0639\u0644\u0649 \u0627\u0644\u0647\u0648\u0627\u062a\u0641 \u0627\u0644\u062a\u064a \u062a\u062f\u0639\u0645 \u062d\u0633\u0627\u0633 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u064a\u0645\u0643\u0646\u0643 \u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0627\u0644\u062d\u064a\u0629 \u0644\u064a\u062a\u062d\u0631\u0643 \u0627\u0644\u0633\u0647\u0645 \u0645\u0639 \u0627\u0644\u062c\u0647\u0627\u0632."
});
Object.assign(QIBLA_PANEL_CONTENT.de, {
  sensorButton: "Live-Kompass aktivieren",
  sensorHintIdle: "Auf Handys mit Kompasssensor kannst du den Live-Kompass aktivieren, damit sich der Pfeil mit dem Geraet dreht."
});
Object.assign(QIBLA_PANEL_CONTENT.fr, {
  sensorButton: "Activer la boussole en direct",
  sensorHintIdle: "Sur les telephones avec capteur, activez la boussole en direct pour faire tourner la fleche avec l'appareil."
});
Object.assign(QIBLA_PANEL_CONTENT.tr, {
  sensorButton: "Canli pusulayi etkinlestir",
  sensorHintIdle: "Pusula sensoru olan telefonlarda oku cihazla birlikte dondurmek icin canli pusulayi etkinlestir."
});
Object.assign(QIBLA_PANEL_CONTENT["zh-hans"], {
  sensorButton: "\u542f\u7528\u5b9e\u65f6\u6307\u5357\u9488",
  sensorHintIdle: "\u5728\u5e26\u6709\u6307\u5357\u9488\u4f20\u611f\u5668\u7684\u624b\u673a\u4e0a\uff0c\u53ef\u542f\u7528\u5b9e\u65f6\u6307\u5357\u9488\uff0c\u8ba9\u7bad\u5934\u968f\u8bbe\u5907\u8f6c\u52a8\u3002"
});

const QIBLA_PAGE_COPY = {
  en: {
    submitLabel: "Show Qibla Direction",
    heroSubtitle: place => place
      ? `Use the compass below to align toward Makkah from ${place}.`
      : "Use the compass below to calculate qibla direction from your current location or any city you search.",
    description: place => place
      ? `Check qibla direction from ${place}, see the bearing to Makkah, and use the live compass on supported phones.`
      : "Check qibla direction from your current location or any city, see the bearing to Makkah, and use the live compass on supported phones.",
    faq: place => [
      {
        question: place ? `Can I share this qibla page for ${place}?` : "Can I share this qibla page?",
        answer: place
          ? `Yes. This route is a direct qibla page for ${place}, so it can be reopened and shared easily.`
          : "Yes. The qibla route is built as a direct page, so it can be reopened and shared easily."
      },
      {
        question: "Does Adantimer detect language and location automatically?",
        answer: "Yes. The page follows the browser language after load, tries GPS first, then falls back to IP-based location, and still allows manual city search."
      },
      {
        question: "What does the qibla compass show?",
        answer: "The page shows the qibla bearing from your location, the distance to Makkah, and a live compass mode on supported phones."
      }
    ]
  },
  ar: {
    submitLabel: "\u0627\u0639\u0631\u0636 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0642\u0628\u0644\u0629",
    heroSubtitle: place => place
      ? `\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0623\u062f\u0646\u0627\u0647 \u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u062a\u062c\u0627\u0647 \u0645\u0643\u0629 \u0645\u0646 ${place}.`
      : "\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0623\u062f\u0646\u0627\u0647 \u0644\u062d\u0633\u0627\u0628 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0642\u0628\u0644\u0629 \u0645\u0646 \u0645\u0648\u0642\u0639\u0643 \u0627\u0644\u062d\u0627\u0644\u064a \u0623\u0648 \u0623\u064a \u0645\u062f\u064a\u0646\u0629 \u062a\u0628\u062d\u062b \u0639\u0646\u0647\u0627.",
    description: place => place
      ? `\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0642\u0628\u0644\u0629 \u0645\u0646 ${place}\u060c \u0648\u0627\u0639\u0631\u0641 \u0632\u0627\u0648\u064a\u0629 \u0645\u0643\u0629\u060c \u0648\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0627\u0644\u062d\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u0647\u0648\u0627\u062a\u0641 \u0627\u0644\u0645\u062f\u0639\u0648\u0645\u0629.`
      : "\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0642\u0628\u0644\u0629 \u0645\u0646 \u0645\u0648\u0642\u0639\u0643 \u0627\u0644\u062d\u0627\u0644\u064a \u0623\u0648 \u0623\u064a \u0645\u062f\u064a\u0646\u0629\u060c \u0648\u0627\u0639\u0631\u0641 \u0632\u0627\u0648\u064a\u0629 \u0645\u0643\u0629\u060c \u0648\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0627\u0644\u062d\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u0647\u0648\u0627\u062a\u0641 \u0627\u0644\u0645\u062f\u0639\u0648\u0645\u0629.",
    faq: place => [
      {
        question: place ? `\u0647\u0644 \u064a\u0645\u0643\u0646\u0646\u064a \u0645\u0634\u0627\u0631\u0643\u0629 \u0635\u0641\u062d\u0629 \u0627\u0644\u0642\u0628\u0644\u0629 \u0644\u0640 ${place}\u061f` : "\u0647\u0644 \u064a\u0645\u0643\u0646\u0646\u064a \u0645\u0634\u0627\u0631\u0643\u0629 \u0635\u0641\u062d\u0629 \u0627\u0644\u0642\u0628\u0644\u0629\u061f",
        answer: place
          ? `\u0646\u0639\u0645. \u0647\u0630\u0647 \u0635\u0641\u062d\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u0639\u0631\u0636 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0642\u0628\u0644\u0629 \u0641\u064a ${place}\u060c \u0648\u064a\u0645\u0643\u0646 \u0641\u062a\u062d\u0647\u0627 \u0623\u0648 \u0645\u0634\u0627\u0631\u0643\u062a\u0647\u0627 \u0628\u0633\u0647\u0648\u0644\u0629.`
          : "\u0646\u0639\u0645. \u0645\u0633\u0627\u0631 \u0627\u0644\u0642\u0628\u0644\u0629 \u0635\u0641\u062d\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0648\u064a\u0645\u0643\u0646 \u0627\u0644\u0631\u062c\u0648\u0639 \u0625\u0644\u064a\u0647\u0627 \u0623\u0648 \u0645\u0634\u0627\u0631\u0643\u062a\u0647\u0627 \u0628\u0633\u0647\u0648\u0644\u0629."
      },
      {
        question: "\u0647\u0644 \u064a\u062d\u062f\u062f Adantimer \u0627\u0644\u0644\u063a\u0629 \u0648\u0627\u0644\u0645\u0648\u0642\u0639 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u061f",
        answer: "\u0646\u0639\u0645. \u0627\u0644\u0635\u0641\u062d\u0629 \u062a\u062a\u0628\u0639 \u0644\u063a\u0629 \u0627\u0644\u0645\u062a\u0635\u0641\u062d \u0628\u0639\u062f \u0627\u0644\u062a\u062d\u0645\u064a\u0644\u060c \u0648\u062a\u062c\u0631\u0628 GPS \u0623\u0648\u0644\u0627 \u062b\u0645 \u062a\u0639\u062a\u0645\u062f \u0639\u0644\u0649 IP \u0639\u0646\u062f \u0627\u0644\u062d\u0627\u062c\u0629\u060c \u0645\u0639 \u0628\u0642\u0627\u0621 \u0627\u0644\u0628\u062d\u062b \u0627\u0644\u064a\u062f\u0648\u064a \u0645\u062a\u0627\u062d\u0627."
      },
      {
        question: "\u0645\u0627\u0630\u0627 \u064a\u0639\u0631\u0636 \u0645\u0642\u064a\u0627\u0633 \u0627\u0644\u0642\u0628\u0644\u0629\u061f",
        answer: "\u062a\u0639\u0631\u0636 \u0627\u0644\u0635\u0641\u062d\u0629 \u0632\u0627\u0648\u064a\u0629 \u0627\u0644\u0642\u0628\u0644\u0629 \u0645\u0646 \u0645\u0648\u0642\u0639\u0643\u060c \u0648\u0645\u0633\u0627\u0641\u0629 \u0645\u0643\u0629\u060c \u0648\u0648\u0636\u0639 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0627\u0644\u062d\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u0647\u0648\u0627\u062a\u0641 \u0627\u0644\u0645\u062f\u0639\u0648\u0645\u0629."
      }
    ]
  },
  de: {
    submitLabel: "Qibla-Richtung anzeigen",
    heroSubtitle: place => place
      ? `Nutze den Kompass unten, um die Richtung nach Mekka von ${place} aus auszurichten.`
      : "Nutze den Kompass unten, um die Qibla von deinem aktuellen Standort oder jeder gesuchten Stadt aus zu berechnen.",
    description: place => place
      ? `Pr\u00fcfe die Qibla-Richtung von ${place}, sieh den Winkel nach Mekka und nutze den Live-Kompass auf unterst\u00fctzten Handys.`
      : "Pr\u00fcfe die Qibla-Richtung von deinem aktuellen Standort oder jeder gesuchten Stadt, sieh den Winkel nach Mekka und nutze den Live-Kompass auf unterst\u00fctzten Handys.",
    faq: place => [
      {
        question: place ? `Kann ich diese Qibla-Seite f\u00fcr ${place} teilen?` : "Kann ich diese Qibla-Seite teilen?",
        answer: place
          ? `Ja. Diese Route ist eine direkte Qibla-Seite f\u00fcr ${place} und l\u00e4sst sich leicht erneut aufrufen oder teilen.`
          : "Ja. Die Qibla-Route ist eine direkte Seite und l\u00e4sst sich leicht erneut aufrufen oder teilen."
      },
      {
        question: "Erkennt Adantimer Sprache und Standort automatisch?",
        answer: "Ja. Die Seite folgt nach dem Laden der Browsersprache, versucht zuerst GPS und greift bei Bedarf auf IP-basierten Standort zur\u00fcck. Eine manuelle Stadtsuche bleibt m\u00f6glich."
      },
      {
        question: "Was zeigt der Qibla-Kompass an?",
        answer: "Die Seite zeigt den Qibla-Winkel von deinem Standort, die Entfernung nach Mekka und auf unterst\u00fctzten Handys einen Live-Kompass."
      }
    ]
  },
  fr: {
    submitLabel: "Afficher la qibla",
    heroSubtitle: place => place
      ? `Utilisez la boussole ci-dessous pour vous orienter vers La Mecque depuis ${place}.`
      : "Utilisez la boussole ci-dessous pour calculer la direction de la qibla depuis votre position actuelle ou n'importe quelle ville recherch\u00e9e.",
    description: place => place
      ? `Consultez la direction de la qibla depuis ${place}, voyez l'angle vers La Mecque et utilisez la boussole en direct sur les t\u00e9l\u00e9phones compatibles.`
      : "Consultez la direction de la qibla depuis votre position actuelle ou n'importe quelle ville, voyez l'angle vers La Mecque et utilisez la boussole en direct sur les t\u00e9l\u00e9phones compatibles.",
    faq: place => [
      {
        question: place ? `Puis-je partager cette page qibla pour ${place} ?` : "Puis-je partager cette page qibla ?",
        answer: place
          ? `Oui. Cette route est une page qibla directe pour ${place}, facile \u00e0 rouvrir et \u00e0 partager.`
          : "Oui. La route qibla est une page directe, facile \u00e0 rouvrir et \u00e0 partager."
      },
      {
        question: "Adantimer d\u00e9tecte-t-il automatiquement la langue et la position ?",
        answer: "Oui. La page suit la langue du navigateur apr\u00e8s chargement, essaie d'abord le GPS puis utilise la position IP si n\u00e9cessaire. La recherche manuelle reste disponible."
      },
      {
        question: "Que montre la boussole qibla ?",
        answer: "La page affiche l'angle de la qibla depuis votre position, la distance jusqu'\u00e0 La Mecque et un mode boussole en direct sur les t\u00e9l\u00e9phones compatibles."
      }
    ]
  },
  tr: {
    submitLabel: "Kible Y\u00f6n\u00fcn\u00fc G\u00f6ster",
    heroSubtitle: place => place
      ? `A\u015fa\u011f\u0131daki pusulay\u0131 kullanarak ${place} konumundan Mekke y\u00f6n\u00fcn\u00fc hizala.`
      : "A\u015fa\u011f\u0131daki pusulay\u0131 kullanarak mevcut konumundan veya arad\u0131\u011f\u0131n herhangi bir \u015fehirden kible y\u00f6n\u00fcn\u00fc hesapla.",
    description: place => place
      ? `${place} konumundan kible y\u00f6n\u00fcn\u00fc g\u00f6r, Mekke a\u00e7\u0131s\u0131n\u0131 incele ve desteklenen telefonlarda canl\u0131 pusulay\u0131 kullan.`
      : "Mevcut konumundan veya herhangi bir \u015fehirden kible y\u00f6n\u00fcn\u00fc g\u00f6r, Mekke a\u00e7\u0131s\u0131n\u0131 incele ve desteklenen telefonlarda canl\u0131 pusulay\u0131 kullan.",
    faq: place => [
      {
        question: place ? `${place} i\u00e7in bu kible sayfas\u0131n\u0131 payla\u015fabilir miyim?` : "Bu kible sayfas\u0131n\u0131 payla\u015fabilir miyim?",
        answer: place
          ? `Evet. Bu rota ${place} i\u00e7in do\u011frudan bir kible sayfas\u0131d\u0131r; yeniden a\u00e7\u0131labilir ve kolayca payla\u015f\u0131labilir.`
          : "Evet. Kible rotas\u0131 do\u011frudan bir sayfad\u0131r; yeniden a\u00e7\u0131labilir ve kolayca payla\u015f\u0131labilir."
      },
      {
        question: "Adantimer dili ve konumu otomatik alg\u0131lar m\u0131?",
        answer: "Evet. Sayfa y\u00fcklendikten sonra taray\u0131c\u0131 dilini izler, \u00f6nce GPS dener, gerekirse IP tabanl\u0131 konuma ge\u00e7er. Manuel \u015fehir aramas\u0131 da kullan\u0131labilir."
      },
      {
        question: "Kible pusulas\u0131 ne g\u00f6sterir?",
        answer: "Sayfa bulundu\u011fun konumdan kible a\u00e7\u0131s\u0131n\u0131, Mekke'ye olan mesafeyi ve desteklenen telefonlarda canl\u0131 pusula modunu g\u00f6sterir."
      }
    ]
  },
  "zh-hans": {
    submitLabel: "\u663e\u793a Qibla \u65b9\u5411",
    heroSubtitle: place => place
      ? `\u4f7f\u7528\u4e0b\u65b9\u6307\u5357\u9488\uff0c\u4ece ${place} \u5bf9\u51c6\u9ea6\u52a0\u65b9\u5411\u3002`
      : "\u4f7f\u7528\u4e0b\u65b9\u6307\u5357\u9488\uff0c\u4ece\u5f53\u524d\u4f4d\u7f6e\u6216\u4efb\u610f\u641c\u7d22\u7684\u57ce\u5e02\u8ba1\u7b97 Qibla \u65b9\u5411\u3002",
    description: place => place
      ? `\u67e5\u770b ${place} \u7684 Qibla \u65b9\u5411\uff0c\u67e5\u770b\u6307\u5411\u9ea6\u52a0\u7684\u89d2\u5ea6\uff0c\u5e76\u5728\u652f\u6301\u7684\u624b\u673a\u4e0a\u4f7f\u7528\u5b9e\u65f6\u6307\u5357\u9488\u3002`
      : "\u67e5\u770b\u5f53\u524d\u4f4d\u7f6e\u6216\u4efb\u610f\u57ce\u5e02\u7684 Qibla \u65b9\u5411\uff0c\u67e5\u770b\u6307\u5411\u9ea6\u52a0\u7684\u89d2\u5ea6\uff0c\u5e76\u5728\u652f\u6301\u7684\u624b\u673a\u4e0a\u4f7f\u7528\u5b9e\u65f6\u6307\u5357\u9488\u3002",
    faq: place => [
      {
        question: place ? `\u6211\u53ef\u4ee5\u5206\u4eab ${place} \u7684 Qibla \u9875\u9762\u5417\uff1f` : "\u6211\u53ef\u4ee5\u5206\u4eab\u8fd9\u4e2a Qibla \u9875\u9762\u5417\uff1f",
        answer: place
          ? `\u53ef\u4ee5\u3002\u8fd9\u662f ${place} \u7684\u76f4\u63a5 Qibla \u9875\u9762\uff0c\u53ef\u4ee5\u8f7b\u677e\u91cd\u65b0\u6253\u5f00\u6216\u5206\u4eab\u3002`
          : "\u53ef\u4ee5\u3002Qibla \u8def\u7531\u662f\u4e00\u4e2a\u76f4\u63a5\u9875\u9762\uff0c\u53ef\u4ee5\u8f7b\u677e\u91cd\u65b0\u6253\u5f00\u6216\u5206\u4eab\u3002"
      },
      {
        question: "Adantimer \u4f1a\u81ea\u52a8\u68c0\u6d4b\u8bed\u8a00\u548c\u4f4d\u7f6e\u5417\uff1f",
        answer: "\u4f1a\u3002\u9875\u9762\u52a0\u8f7d\u540e\u4f1a\u8ddf\u968f\u6d4f\u89c8\u5668\u8bed\u8a00\uff0c\u4f18\u5148\u5c1d\u8bd5 GPS\uff0c\u5fc5\u8981\u65f6\u4f7f\u7528 IP \u5b9a\u4f4d\uff0c\u540c\u65f6\u4fdd\u7559\u624b\u52a8\u641c\u7d22\u57ce\u5e02\u3002"
      },
      {
        question: "Qibla \u6307\u5357\u9488\u4f1a\u663e\u793a\u4ec0\u4e48\uff1f",
        answer: "\u9875\u9762\u4f1a\u663e\u793a\u4ece\u4f60\u5f53\u524d\u4f4d\u7f6e\u8ba1\u7b97\u7684 Qibla \u89d2\u5ea6\uff0c\u5230\u9ea6\u52a0\u7684\u8ddd\u79bb\uff0c\u4ee5\u53ca\u5728\u53d7\u652f\u6301\u7684\u624b\u673a\u4e0a\u7684\u5b9e\u65f6\u6307\u5357\u9488\u6a21\u5f0f\u3002"
      }
    ]
  }
};

const COPY_LOCALES = {
  de: {
    heroEyebrowHome: "Gebetszeiten nach Stadt",
    heroEyebrowPlace: place => `Gebetsplan für ${place}`,
    heroHeadingHome: "Gebetszeiten heute und Countdown bis zum nächsten Gebet",
    heroHeadingPlace: place => `Gebetszeiten in ${place} heute`,
    heroHeadingTopic: (topic, place) => `${topic}${place ? ` in ${place}` : " heute"}`,
    heroSubtitlePlace: (topic, place) => `Nutze diese Seite, um ${topic} in ${place} zu prüfen, den Countdown bis zum nächsten Gebet zu verfolgen und den vollständigen Tagesplan ohne Umwege zu sehen.`,
    heroSubtitleHome: "Prüfe genaue Gebetszeiten, verfolge das nächste Gebet und wechsle schnell zu Städten weltweit.",
    cityLabel: "Stadt",
    cityPlaceholder: "Stadt eingeben",
    countryLabel: "Land",
    countryPlaceholder: "Land (optional)",
    submitLabel: "Gebetszeiten anzeigen",
    topCitiesAria: "Beliebte Städte",
    topCitiesMoreLabel: "Mehr Städte",
    intentAria: "Schnellzugriffe für Gebetsseiten",
    intentLinks: [
      { type: "prayer-times", label: "Gebetszeiten heute" },
      { type: "next-prayer", label: "Zeit des nächsten Gebets" },
      { type: "fajr", label: "Fajr-Zeit" },
      { type: "dhuhr", label: "Dhuhr-Zeit" },
      { type: "asr", label: "Asr-Zeit" },
      { type: "maghrib", label: "Maghrib-Zeit" },
      { type: "isha", label: "Isha-Zeit" }
    ],
    locationStatus: place => place ? `Gebetszeiten für ${place}` : "Standort wird ermittelt",
    nextPrayerTitle: "Nächstes Gebet",
    currentPrayerLabel: "Aktuelles Gebet",
    todayLabel: "Heute",
    methodLabel: "Methode",
    loadingLabel: "Wird geladen...",
    locationText: place => place ? `Der Gebetsplan für ${place} wird nach dem Seitenstart automatisch geladen.` : "Zuerst GPS, danach IP-Fallback.",
    scheduleEyebrow: "Heute",
    scheduleHeading: (pageType, topic) => pageType === "home" ? "Heutiger Gebetsplan" : `${topic} und voller Tagesplan`,
    scheduleSummary: place => place ? `Tagesplan und Countdown bis zum nächsten Gebet für ${place}.` : "Genaue Zeiten für deinen aktuellen Standort.",
    infoEyebrow: "Warum diese Seite hilft",
    infoTitle: topic => `Eine fokussierte Seite für ${topic}`,
    features: (topic, place) => [
      `Die Seite ist exakt auf die Suchintention nach ${topic}${place ? ` in ${place}` : ""} ausgerichtet.`,
      "Sie zeigt den Countdown bis zum nächsten Gebet und den vollständigen Tagesplan auf einer Seite.",
      "Sie passt sich nach dem Laden automatisch an Browsersprache und Standort an.",
      "Sie nutzt klare Canonical-URLs, die sich leicht teilen und indexieren lassen."
    ],
    citiesEyebrow: "Mehr entdecken",
    citiesTitle: topic => `Beliebte Seiten zu ${topic}`,
    cityLinkLabel: (topic, city) => `${topic} in ${city}`,
    cityIntentLinks: place => place
      ? [
          { type: "prayer-times", label: `Gebetszeiten in ${place}` },
          { type: "next-prayer", label: `Nächstes Gebet in ${place}` },
          { type: "fajr", label: `Fajr in ${place}` },
          { type: "dhuhr", label: `Dhuhr in ${place}` },
          { type: "asr", label: `Asr in ${place}` },
          { type: "maghrib", label: `Maghrib in ${place}` },
          { type: "isha", label: `Isha in ${place}` }
        ]
      : [
          { type: "prayer-times", city: "Mecca", label: "Gebetszeiten in Mekka" },
          { type: "next-prayer", city: "Riyadh", label: "Nächstes Gebet in Riad" },
          { type: "fajr", city: "Medina", label: "Fajr in Medina" },
          { type: "prayer-times", city: "Dubai", label: "Gebetszeiten in Dubai" }
        ],
    aboutEyebrow: "Über diese Seite",
    aboutTitle: (topic, place) => `${topic}${place ? ` in ${place}` : ""} ohne Umwege`,
    aboutParagraphs: (topic, place) => [
      place
        ? `Diese Seite ist gezielt für ${topic} in ${place} aufgebaut, damit Besucher schneller zur richtigen Antwort kommen als über eine generische Startseite.`
        : `Diese Seite ist gezielt für ${topic} aufgebaut, damit Besucher schneller zur richtigen Antwort kommen als über eine generische Startseite.`,
      "Das Ziel ist eine professionellere Erfahrung mit klarer Gebetsintention, automatischer Sprache, sauberer URL-Struktur und direktem Zugang zum Tagesplan.",
      "Die engere Übereinstimmung zwischen Suche, URL, Titel und sichtbarem Inhalt stärkt die SEO-Basis dieser Route."
    ],
    faqEyebrow: "FAQ",
    faqTitle: (topic, place) => `Häufige Fragen zu ${topic}${place ? ` in ${place}` : ""}`,
    faq: (topic, place) => [
      {
        question: place ? `Kann ich diese Seite für ${topic} in ${place} teilen?` : "Kann ich diese Seite teilen?",
        answer: place
          ? `Ja. Diese Route ist direkt für ${topic} in ${place} aufgebaut und kann leicht wieder aufgerufen oder geteilt werden.`
          : "Ja. Jede Route ist direkt auf eine Gebetsintention ausgerichtet und lässt sich leicht wieder aufrufen oder teilen."
      },
      {
        question: "Erkennt Adantimer Sprache und Standort automatisch?",
        answer: "Ja. Die Seite folgt nach dem Laden der Browsersprache, versucht zuerst GPS und greift bei Bedarf auf IP-basierten Standort zurück. Eine manuelle Stadtsuche bleibt trotzdem möglich."
      },
      {
        question: "Welche Gebetszeiten zeigt diese Seite an?",
        answer: `Die Seite hebt ${topic} hervor und lädt zusätzlich den vollständigen Tagesplan für Fajr, Dhuhr, Asr, Maghrib und Isha.`
      }
    ],
    footerText: place => place ? `Genaue Gebetszeiten für ${place} und weitere Städte.` : "Genaue Gebetszeiten nach Stadt.",
    noscriptText: "JavaScript wird benötigt, um Live-Gebetszeiten und den Countdown bis zum nächsten Gebet zu laden."
  },
  fr: {
    heroEyebrowHome: "Horaires de prière par ville",
    heroEyebrowPlace: place => `Planning des prières pour ${place}`,
    heroHeadingHome: "Horaires de prière aujourd'hui et compte à rebours jusqu'à la prochaine prière",
    heroHeadingPlace: place => `Horaires de prière à ${place} aujourd'hui`,
    heroHeadingTopic: (topic, place) => `${topic}${place ? ` à ${place}` : " aujourd'hui"}`,
    heroSubtitlePlace: (topic, place) => `Utilisez cette page pour consulter ${topic} à ${place}, suivre le compte à rebours de la prochaine prière et voir le planning complet du jour sans détour.`,
    heroSubtitleHome: "Consultez des horaires de prière précis, suivez la prochaine prière et passez rapidement d'une ville à l'autre.",
    cityLabel: "Ville",
    cityPlaceholder: "Entrer une ville",
    countryLabel: "Pays",
    countryPlaceholder: "Pays (optionnel)",
    submitLabel: "Voir les horaires",
    topCitiesAria: "Villes populaires",
    topCitiesMoreLabel: "Plus de villes",
    intentAria: "Raccourcis de recherche",
    intentLinks: [
      { type: "prayer-times", label: "Horaires de prière aujourd'hui" },
      { type: "next-prayer", label: "Heure de la prochaine prière" },
      { type: "fajr", label: "Heure du Fajr" },
      { type: "dhuhr", label: "Heure du Dhuhr" },
      { type: "asr", label: "Heure de l'Asr" },
      { type: "maghrib", label: "Heure du Maghrib" },
      { type: "isha", label: "Heure de l'Isha" }
    ],
    locationStatus: place => place ? `Horaires de prière pour ${place}` : "Localisation en cours",
    nextPrayerTitle: "Prochaine prière",
    currentPrayerLabel: "Prière actuelle",
    todayLabel: "Aujourd'hui",
    methodLabel: "Méthode",
    loadingLabel: "Chargement...",
    locationText: place => place ? `Le planning de prière pour ${place} se chargera automatiquement au démarrage de la page.` : "GPS d'abord, puis repli IP.",
    scheduleEyebrow: "Aujourd'hui",
    scheduleHeading: (pageType, topic) => pageType === "home" ? "Planning de prière du jour" : `${topic} et planning complet`,
    scheduleSummary: place => place ? `Planning du jour et compte à rebours jusqu'à la prochaine prière pour ${place}.` : "Horaires précis pour votre ville actuelle.",
    infoEyebrow: "Pourquoi cette page aide",
    infoTitle: topic => `Une page dédiée à ${topic}`,
    features: (topic, place) => [
      `La page correspond exactement à l'intention de recherche pour ${topic}${place ? ` à ${place}` : ""}.`,
      "Elle réunit le compte à rebours de la prochaine prière et le planning complet sur une seule page.",
      "Elle s'adapte automatiquement à la langue du navigateur et à la localisation après chargement.",
      "Elle utilise des URLs canoniques propres, faciles à partager et à indexer."
    ],
    citiesEyebrow: "Explorer plus",
    citiesTitle: topic => `Pages populaires pour ${topic}`,
    cityLinkLabel: (topic, city) => `${topic} à ${city}`,
    cityIntentLinks: place => place
      ? [
          { type: "prayer-times", label: `Horaires de prière à ${place}` },
          { type: "next-prayer", label: `Prochaine prière à ${place}` },
          { type: "fajr", label: `Fajr à ${place}` },
          { type: "dhuhr", label: `Dhuhr à ${place}` },
          { type: "asr", label: `Asr à ${place}` },
          { type: "maghrib", label: `Maghrib à ${place}` },
          { type: "isha", label: `Isha à ${place}` }
        ]
      : [
          { type: "prayer-times", city: "Mecca", label: "Horaires de prière à La Mecque" },
          { type: "next-prayer", city: "Riyadh", label: "Prochaine prière à Riyad" },
          { type: "fajr", city: "Medina", label: "Fajr à Médine" },
          { type: "prayer-times", city: "Dubai", label: "Horaires de prière à Dubaï" }
        ],
    aboutEyebrow: "À propos",
    aboutTitle: (topic, place) => `${topic}${place ? ` à ${place}` : ""} sans détour`,
    aboutParagraphs: (topic, place) => [
      place
        ? `Cette page est conçue spécifiquement pour ${topic} à ${place}, afin d'amener plus vite le visiteur à la bonne réponse qu'une page d'accueil générique.`
        : `Cette page est conçue spécifiquement pour ${topic}, afin d'amener plus vite le visiteur à la bonne réponse qu'une page d'accueil générique.`,
      "L'objectif est une expérience plus professionnelle, avec une intention de prière claire, une langue automatique, une structure d'URL propre et un accès direct au planning du jour.",
      "La cohérence plus forte entre recherche, URL, titre et contenu visible renforce la base SEO de cette route."
    ],
    faqEyebrow: "FAQ",
    faqTitle: (topic, place) => `Questions fréquentes sur ${topic}${place ? ` à ${place}` : ""}`,
    faq: (topic, place) => [
      {
        question: place ? `Puis-je partager cette page pour ${topic} à ${place} ?` : "Puis-je partager cette page ?",
        answer: place
          ? `Oui. Cette route est construite directement pour ${topic} à ${place} et peut être revisitée ou partagée facilement.`
          : "Oui. Chaque route est construite pour une intention de prière précise et peut être revisitée ou partagée facilement."
      },
      {
        question: "Adantimer détecte-t-il automatiquement la langue et la position ?",
        answer: "Oui. Après le chargement, la page suit la langue du navigateur, essaie d'abord le GPS puis bascule sur une localisation IP si nécessaire, tout en gardant la recherche manuelle."
      },
      {
        question: "Quels horaires de prière cette page affiche-t-elle ?",
        answer: `La page met en avant ${topic} tout en chargeant l'ensemble du planning quotidien pour Fajr, Dhuhr, Asr, Maghrib et Isha.`
      }
    ],
    footerText: place => place ? `Horaires de prière précis pour ${place} et d'autres villes.` : "Horaires de prière précis selon la ville.",
    noscriptText: "JavaScript est nécessaire pour charger les horaires en direct et le compte à rebours de la prochaine prière."
  },
  tr: {
    heroEyebrowHome: "Şehre göre namaz vakitleri",
    heroEyebrowPlace: place => `${place} için namaz planı`,
    heroHeadingHome: "Bugünün namaz vakitleri ve sonraki namaz için geri sayım",
    heroHeadingPlace: place => `${place} için bugünün namaz vakitleri`,
    heroHeadingTopic: (topic, place) => place ? `${place} için ${topic}` : `${topic} bugün`,
    heroSubtitlePlace: (topic, place) => `${place} için ${topic} bilgisini görmek, sonraki namaz geri sayımını takip etmek ve günün tam planını tek sayfada incelemek için bu sayfayı kullanın.`,
    heroSubtitleHome: "Doğru namaz vakitlerini görün, sonraki namazı takip edin ve dünya çapında şehirlere hızlıca geçin.",
    cityLabel: "Şehir",
    cityPlaceholder: "Şehir girin",
    countryLabel: "Ülke",
    countryPlaceholder: "Ülke (isteğe bağlı)",
    submitLabel: "Vakitleri göster",
    topCitiesAria: "Popüler şehirler",
    topCitiesMoreLabel: "Daha fazla şehir",
    intentAria: "Namaz arama kısayolları",
    intentLinks: [
      { type: "prayer-times", label: "Bugünün namaz vakitleri" },
      { type: "next-prayer", label: "Sonraki namaz vakti" },
      { type: "fajr", label: "Fajr vakti" },
      { type: "dhuhr", label: "Dhuhr vakti" },
      { type: "asr", label: "Asr vakti" },
      { type: "maghrib", label: "Maghrib vakti" },
      { type: "isha", label: "Isha vakti" }
    ],
    locationStatus: place => place ? `${place} için namaz vakitleri` : "Konum belirleniyor",
    nextPrayerTitle: "Sonraki namaz",
    currentPrayerLabel: "Güncel namaz",
    todayLabel: "Bugün",
    methodLabel: "Yöntem",
    loadingLabel: "Yükleniyor...",
    locationText: place => place ? `${place} için namaz planı sayfa açıldıktan sonra otomatik olarak yüklenecek.` : "Önce GPS, sonra IP yedeği denenir.",
    scheduleEyebrow: "Bugün",
    scheduleHeading: (pageType, topic) => pageType === "home" ? "Bugünün namaz planı" : `${topic} ve tam günlük plan`,
    scheduleSummary: place => place ? `${place} için günlük plan ve sonraki namaz geri sayımı.` : "Mevcut şehriniz için doğru vakitler.",
    infoEyebrow: "Bu sayfa neden yararlı",
    infoTitle: topic => `Günlük kullanım için ${topic} sayfası`,
    features: (topic, place) => [
      `${place ? `${place} için ` : ""}${topic} arama niyetine doğrudan uyacak şekilde hazırlanmıştır.`,
      "Sonraki namaz geri sayımını ve tam günlük çizelgeyi tek sayfada gösterir.",
      "Yüklemeden sonra tarayıcı dili ve konuma otomatik uyum sağlar.",
      "Paylaşılabilir ve indekslenebilir temiz canonical URL'ler kullanır."
    ],
    citiesEyebrow: "Daha fazlası",
    citiesTitle: topic => `${topic} için popüler sayfalar`,
    cityLinkLabel: (topic, city) => `${city} için ${topic}`,
    cityIntentLinks: place => place
      ? [
          { type: "prayer-times", label: `${place} için namaz vakitleri` },
          { type: "next-prayer", label: `${place} için sonraki namaz` },
          { type: "fajr", label: `${place} için Fajr` },
          { type: "dhuhr", label: `${place} için Dhuhr` },
          { type: "asr", label: `${place} için Asr` },
          { type: "maghrib", label: `${place} için Maghrib` },
          { type: "isha", label: `${place} için Isha` }
        ]
      : [
          { type: "prayer-times", city: "Mecca", label: "Mekke için namaz vakitleri" },
          { type: "next-prayer", city: "Riyadh", label: "Riyad için sonraki namaz" },
          { type: "fajr", city: "Medina", label: "Medine için Fajr" },
          { type: "prayer-times", city: "Dubai", label: "Dubai için namaz vakitleri" }
        ],
    aboutEyebrow: "Hakkında",
    aboutTitle: (topic, place) => place ? `${place} için ${topic} sade ve net` : `${topic} sade ve net`,
    aboutParagraphs: (topic, place) => [
      place
        ? `Bu sayfa ${place} için ${topic} aramasına özel olarak hazırlanmıştır; böylece ziyaretçi genel bir ana sayfaya göre daha hızlı doğru cevaba ulaşır.`
        : `Bu sayfa ${topic} aramasına özel olarak hazırlanmıştır; böylece ziyaretçi genel bir ana sayfaya göre daha hızlı doğru cevaba ulaşır.`,
      "Amaç daha profesyonel bir deneyim sunmaktır: net ibadet niyeti, otomatik dil, düzenli URL yapısı ve günün planına doğrudan erişim.",
      "Arama, URL, başlık ve görünür içerik arasındaki daha güçlü uyum bu rotanın SEO temelini güçlendirir."
    ],
    faqEyebrow: "SSS",
    faqTitle: (topic, place) => `${place ? `${place} için ${topic}` : topic} hakkında sık sorulan sorular`,
    faq: (topic, place) => [
      {
        question: place ? `${place} için ${topic} sayfasını paylaşabilir miyim?` : "Bu sayfayı paylaşabilir miyim?",
        answer: place
          ? `Evet. Bu rota ${place} için ${topic} amacıyla doğrudan hazırlanmıştır ve kolayca yeniden açılabilir veya paylaşılabilir.`
          : "Evet. Her rota belirli bir namaz arama niyeti için hazırlanmıştır ve kolayca yeniden açılabilir veya paylaşılabilir."
      },
      {
        question: "Adantimer dili ve konumu otomatik algılar mı?",
        answer: "Evet. Sayfa yüklendikten sonra tarayıcı dilini izler, önce GPS dener, gerekirse IP konumuna düşer ve manuel şehir aramasını da açık tutar."
      },
      {
        question: "Bu sayfada hangi namaz vakitleri gösterilir?",
        answer: `Sayfa ${topic} bilgisini öne çıkarırken Fajr, Dhuhr, Asr, Maghrib ve Isha için tam günlük planı da yükler.`
      }
    ],
    footerText: place => place ? `${place} ve diğer şehirler için doğru namaz vakitleri.` : "Şehre göre doğru namaz vakitleri.",
    noscriptText: "Canlı namaz vakitlerini ve sonraki namaz geri sayımını yüklemek için JavaScript gerekir."
  },
  "zh-hans": {
    heroEyebrowHome: "按城市查看礼拜时间",
    heroEyebrowPlace: place => `${place}礼拜安排`,
    heroHeadingHome: "今日礼拜时间与下一次礼拜倒计时",
    heroHeadingPlace: place => `${place}今日礼拜时间`,
    heroHeadingTopic: (topic, place) => place ? `${place}${topic}` : `${topic}`,
    heroSubtitlePlace: (topic, place) => `使用此页面查看${place}的${topic}、跟踪下一次礼拜倒计时，并直接查看今日完整时间表。`,
    heroSubtitleHome: "查看准确礼拜时间，跟踪下一次礼拜，并快速切换到世界各地的城市。",
    cityLabel: "城市",
    cityPlaceholder: "输入城市",
    countryLabel: "国家",
    countryPlaceholder: "国家（可选）",
    submitLabel: "查看礼拜时间",
    topCitiesAria: "热门城市",
    topCitiesMoreLabel: "更多城市",
    intentAria: "礼拜搜索快捷入口",
    intentLinks: [
      { type: "prayer-times", label: "今日礼拜时间" },
      { type: "next-prayer", label: "下一次礼拜时间" },
      { type: "fajr", label: "晨礼时间" },
      { type: "dhuhr", label: "晌礼时间" },
      { type: "asr", label: "晡礼时间" },
      { type: "maghrib", label: "昏礼时间" },
      { type: "isha", label: "宵礼时间" }
    ],
    locationStatus: place => place ? `${place}礼拜时间` : "正在检测位置",
    nextPrayerTitle: "下一次礼拜",
    currentPrayerLabel: "当前礼拜",
    todayLabel: "今天",
    methodLabel: "方法",
    loadingLabel: "加载中...",
    locationText: place => place ? `${place}的礼拜时间表将在页面启动后自动加载。` : "先尝试 GPS，再回退到 IP 定位。",
    scheduleEyebrow: "今天",
    scheduleHeading: (pageType, topic) => pageType === "home" ? "今日礼拜时间表" : `${topic}与完整时间表`,
    scheduleSummary: place => place ? `${place}的每日礼拜时间表和下一次礼拜倒计时。` : "为你当前城市提供准确时间。",
    infoEyebrow: "为什么这页有用",
    infoTitle: topic => `面向日常使用的${topic}页面`,
    features: (topic, place) => [
      `页面直接围绕${topic}${place ? `在${place}` : ""}这一搜索意图构建。`,
      "在同一页面展示下一次礼拜倒计时和完整日程。",
      "页面加载后会自动匹配浏览器语言和检测到的位置。",
      "使用清晰的规范化 URL，便于分享和收录。"
    ],
    citiesEyebrow: "继续探索",
    citiesTitle: topic => `${topic}热门页面`,
    cityLinkLabel: (topic, city) => `${city}${topic}`,
    cityIntentLinks: place => place
      ? [
          { type: "prayer-times", label: `${place}礼拜时间` },
          { type: "next-prayer", label: `${place}下一次礼拜` },
          { type: "fajr", label: `${place}晨礼` },
          { type: "dhuhr", label: `${place}晌礼` },
          { type: "asr", label: `${place}晡礼` },
          { type: "maghrib", label: `${place}昏礼` },
          { type: "isha", label: `${place}宵礼` }
        ]
      : [
          { type: "prayer-times", city: "Mecca", label: "麦加礼拜时间" },
          { type: "next-prayer", city: "Riyadh", label: "利雅得下一次礼拜" },
          { type: "fajr", city: "Medina", label: "麦地那晨礼" },
          { type: "prayer-times", city: "Dubai", label: "迪拜礼拜时间" }
        ],
    aboutEyebrow: "关于页面",
    aboutTitle: (topic, place) => place ? `${place}${topic}页面，直接清晰` : `${topic}页面，直接清晰`,
    aboutParagraphs: (topic, place) => [
      place
        ? `这个页面专门面向${place}的${topic}查询，比通用首页更快把访问者带到正确答案。`
        : `这个页面专门面向${topic}查询，比通用首页更快把访问者带到正确答案。`,
      "目标是提供更专业的体验：明确的礼拜意图、自动语言、整洁的链接结构，以及直达今日时间表的路径。",
      "搜索词、URL、标题和可见内容之间更强的一致性，会让这条路由拥有更稳固的 SEO 基础。"
    ],
    faqEyebrow: "常见问题",
    faqTitle: (topic, place) => `${topic}${place ? `${place}` : ""}常见问题`,
    faq: (topic, place) => [
      {
        question: place ? `我可以分享这个关于${place}${topic}的页面吗？` : "我可以分享这个页面吗？",
        answer: place
          ? `可以。这个路由就是为${place}${topic}而建立，方便再次访问和分享。`
          : "可以。每个路由都围绕特定礼拜搜索意图建立，便于再次访问和分享。"
      },
      {
        question: "Adantimer 会自动识别语言和位置吗？",
        answer: "会。页面加载后会跟随浏览器语言，先尝试 GPS，再在需要时回退到 IP 定位，同时仍保留手动城市搜索。"
      },
      {
        question: "这个页面显示哪些礼拜时间？",
        answer: `页面突出显示${topic}，同时加载 Fajr、Dhuhr、Asr、Maghrib 和 Isha 的完整每日时间表。`
      }
    ],
    footerText: place => place ? `${place}及其他城市的准确礼拜时间。` : "按城市提供准确礼拜时间。",
    noscriptText: "需要启用 JavaScript 才能加载实时礼拜时间和下一次礼拜倒计时。"
  }
};

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const pageType = normalizePageType(url.searchParams.get("type"));
    const city = normalizeCity(url.searchParams.get("city") || "");
    const surahSlug = normalizeSurahSlug(url.searchParams.get("surah") || "");
    const dhikrCollection = normalizeDhikrCollectionId(url.searchParams.get("collection") || "");
    const hadithCollection = normalizeHadithCollectionId(url.searchParams.get("collection") || "");
    const explicitLanguage = url.searchParams.get("lang");
    const language = resolveRequestLanguage({
      explicitLanguage,
      acceptLanguage: request.headers.get("accept-language"),
      pageType,
      city
    });
    const locale = LOCALES[language] || LOCALES.en;
    const route = ROUTES[pageType] || ROUTES.home;
    const sourceCity = city ? titleCase(city) : "";
    const place = sourceCity ? formatPlaceName(sourceCity, "", language) : "";
    const topic = route[language] || route.en;
    let surah = null;
    let surahReaderData = { ayahs: [], hasFetchError: false };

    if (pageType === "quran-surah") {
      surah = getQuranSurahBySlug(surahSlug);
      if (!surah) {
        return new Response("Not found", { status: 404 });
      }
      surahReaderData = await getQuranSurahReaderData(surah);
    }

    const detailSlug = pageType === "quran-surah"
      ? surahSlug
      : pageType === "dhikr-collection"
        ? dhikrCollection
        : hadithCollection;
    const canonicalPath = buildRoutePath(language, pageType, city, detailSlug);
    const canonical = `${SITE_URL}${canonicalPath}`;
    const alternates = getAlternates(pageType, city, detailSlug);
    const copy = applyPriorityPrayerSeoOverrides({
      language,
      pageType,
      sourceCity,
      place,
      copy: buildCopy({ language, pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection, hadithCollection })
    });
    const title = copy.metaTitle || locale.title(topic, place, pageType);
    const description = copy.metaDescription || (pageType === "qibla"
      ? (QIBLA_PAGE_COPY[language] || QIBLA_PAGE_COPY.en).description(place)
      : locale.description(topic, place));
    if (pageType === "qibla") {
      const qiblaPageCopy = QIBLA_PAGE_COPY[language] || QIBLA_PAGE_COPY.en;
      copy.heroSubtitle = qiblaPageCopy.heroSubtitle(place);
      copy.submitLabel = qiblaPageCopy.submitLabel;
      copy.faq = qiblaPageCopy.faq(place);
    }
    copy.activeLanguage = language;
    copy.brandHref = buildRoutePath(language, "home");
    copy.surahSlug = surahSlug;
    copy.dhikrCollection = dhikrCollection || copy.dhikrCollection || "";
    copy.hadithCollection = hadithCollection || copy.hadithCollection || "";
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

    const headers = {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400"
    };
    if (shouldVaryByAcceptLanguage({ explicitLanguage, pageType, city })) {
      headers.vary = "accept-language";
    }

    return new Response(html, { headers });
  } catch (error) {
    console.error("render failed", error);
    return new Response("Adantimer render failed", { status: 500 });
  }
}

function applyTemplate(template, { alternates, canonical, copy, description, locale, pageType, title }) {
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedCanonical = escapeHtml(canonical);
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url: canonical,
    description,
    inLanguage: locale.inLanguage
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faq.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return template
    .replace(/<html lang="[^"]*"(?: dir="[^"]*")?>/, `<html lang="${locale.htmlLang}" dir="${locale.dir}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapedTitle}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapedDescription}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${escapedCanonical}">`)
    .replace(/<link rel="alternate" hreflang="en" href="[^"]*">/, `<link rel="alternate" hreflang="en" href="${escapeHtml(alternates.en)}">`)
    .replace(/<link rel="alternate" hreflang="ar" href="[^"]*">/, `<link rel="alternate" hreflang="ar" href="${escapeHtml(alternates.ar)}">`)
    .replace(/<link rel="alternate" hreflang="de" href="[^"]*">/, `<link rel="alternate" hreflang="de" href="${escapeHtml(alternates.de)}">`)
    .replace(/<link rel="alternate" hreflang="fr" href="[^"]*">/, `<link rel="alternate" hreflang="fr" href="${escapeHtml(alternates.fr)}">`)
    .replace(/<link rel="alternate" hreflang="tr" href="[^"]*">/, `<link rel="alternate" hreflang="tr" href="${escapeHtml(alternates.tr)}">`)
    .replace(/<link rel="alternate" hreflang="zh-hans" href="[^"]*">/, `<link rel="alternate" hreflang="zh-hans" href="${escapeHtml(alternates["zh-hans"])}">`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*">/, `<link rel="alternate" hreflang="x-default" href="${escapeHtml(alternates.default)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapedTitle}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapedDescription}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${escapedCanonical}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapedTitle}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapedDescription}">`)
    .replace(/<script type="application\/ld\+json" id="website-schema">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="website-schema">\n${JSON.stringify(pageSchema, null, 2)}\n  </script>`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?"@type": "FAQPage"[\s\S]*?<\/script>/, `<script type="application/ld+json">\n${JSON.stringify(faqSchema, null, 2)}\n  </script>`)
    .replace(/<body data-page="[^"]*">/, `<body data-page="${pageType}"${copy.surahSlug ? ` data-surah-slug="${escapeHtml(copy.surahSlug)}"` : ""}${copy.dhikrCollection ? ` data-dhikr-collection="${escapeHtml(copy.dhikrCollection)}"` : ""}${copy.hadithCollection ? ` data-hadith-collection="${escapeHtml(copy.hadithCollection)}"` : ""}>`)
    .replace(/<a class="brand" href="[^"]*">/, `<a class="brand" href="${escapeHtml(copy.brandHref)}">`)
    .replace(/<button type="button" data-lang="en" class="[^"]*" aria-pressed="[^"]*">English<\/button>/, `<button type="button" data-lang="en" class="${copy.activeLanguage === "en" ? "lang-btn is-active" : "lang-btn"}" aria-pressed="${copy.activeLanguage === "en" ? "true" : "false"}">English</button>`)
    .replace(/<button type="button" data-lang="ar" class="[^"]*" aria-pressed="[^"]*">Arabic<\/button>/, `<button type="button" data-lang="ar" class="${copy.activeLanguage === "ar" ? "lang-btn is-active" : "lang-btn"}" aria-pressed="${copy.activeLanguage === "ar" ? "true" : "false"}">Arabic</button>`)
    .replace(/<section class="hero-copy">[\s\S]*?<\/section>/, renderHeroCopy(copy))
    .replace(/<aside class="next-prayer card featured-card" aria-live="polite">[\s\S]*?<\/aside>/, renderNextPrayerCard(copy))
    .replace(/<section class="card schedule-card" aria-labelledby="schedule-heading">[\s\S]*?<\/section>/, renderScheduleSection(copy))
    .replace(/<section class="card info-card" aria-labelledby="why-heading">[\s\S]*?<\/section>/, renderInfoSection(copy))
    .replace(/<section id="qibla-panel" class="card qibla-panel" aria-labelledby="qibla-panel-heading" hidden>[\s\S]*?<\/section>/, renderQiblaPanelSection(copy))
    .replace(/<section class="card tools-hub" aria-labelledby="tools-heading">[\s\S]*?<\/section>/, renderToolsSection(copy))
    .replace(/<section class="card prose" aria-labelledby="cities-heading">[\s\S]*?<\/section>/, renderCitiesSection(copy))
    .replace(/<article class="card prose" aria-labelledby="about-heading">[\s\S]*?<\/article>/, renderAboutArticle(copy))
    .replace(/<section class="card prose" aria-labelledby="faq-heading">[\s\S]*?<\/section>/, renderFaqSection(copy))
    .replace(/<main class="shell main-content">[\s\S]*?<\/main>/, renderMainContent(copy))
    .replace(/<footer class="shell footer">[\s\S]*?<\/footer>/, renderFooter(copy))
    .replace(/<noscript>[\s\S]*?<\/noscript>/, renderNoscript(copy));
}

function getLocalizedTopCities(language) {
  return TOP_CITIES.map(item => ({
    ...item,
    displayCity: localizeCityName(item.city, language),
    displayCountry: localizeCountryName(item.country, language)
  }));
}

function getPriorityCitiesBySlugs(slugs = []) {
  return slugs
    .map(slug => PRIORITY_CITY_BY_SLUG.get(slug))
    .filter(Boolean);
}

function getPriorityCitiesByGroupIds(groupIds = []) {
  return groupIds.flatMap(groupId => {
    const group = PRIORITY_CITY_GROUPS_BY_ID.get(groupId);
    return group ? group.cities : [];
  });
}

function getLocalizedPriorityGroups(language, groupIds = []) {
  return groupIds
    .map(groupId => PRIORITY_CITY_GROUPS_BY_ID.get(groupId))
    .filter(Boolean)
    .map(group => ({
      id: group.id,
      cities: group.cities.map(city => ({
        ...city,
        displayCity: localizeCityName(city.city, language),
        displayCountry: localizeCountryName(city.country, language)
      }))
    }));
}

function getPriorityGroupCities(language) {
  return PRIORITY_CITY_GROUPS.map(group => ({
    id: group.id,
    cities: group.cities.map(city => ({
      ...city,
      displayCity: localizeCityName(city.city, language),
      displayCountry: localizeCountryName(city.country, language)
    }))
  }));
}

function buildEnglishCopy({ pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection, hadithCollection }) {
  const isHomeRoot = pageType === "home" && !place;
  const rootOverride = ROOT_HOME_OVERRIDES.en;
  const resolvedPage = pageType === "home" ? "prayer-times" : pageType;
  const cityLinks = TOP_CITIES
    .filter(item => item.city !== sourceCity)
    .slice(0, 6)
    .map(item => ({
      label: `${topic} in ${item.city}`,
      href: buildRoutePath("en", resolvedPage, item.city)
    }));
  const intentLinks = [
    { type: "prayer-times", label: "Prayer times today", href: buildRoutePath("en", "prayer-times") },
    { type: "next-prayer", label: "Next prayer time", href: buildRoutePath("en", "next-prayer") },
    { type: "fajr", label: "Fajr time", href: buildRoutePath("en", "fajr") },
    { type: "dhuhr", label: "Dhuhr time", href: buildRoutePath("en", "dhuhr") },
    { type: "asr", label: "Asr time", href: buildRoutePath("en", "asr") },
    { type: "maghrib", label: "Maghrib time", href: buildRoutePath("en", "maghrib") },
    { type: "isha", label: "Isha time", href: buildRoutePath("en", "isha") }
  ];
  let cityIntentLinks = sourceCity
    ? [
        { label: `Prayer times in ${place}`, href: buildRoutePath("en", "prayer-times", sourceCity) },
        { label: `Next prayer in ${place}`, href: buildRoutePath("en", "next-prayer", sourceCity) },
        { label: `Fajr in ${place}`, href: buildRoutePath("en", "fajr", sourceCity) },
        { label: `Dhuhr in ${place}`, href: buildRoutePath("en", "dhuhr", sourceCity) },
        { label: `Asr in ${place}`, href: buildRoutePath("en", "asr", sourceCity) },
        { label: `Maghrib in ${place}`, href: buildRoutePath("en", "maghrib", sourceCity) },
        { label: `Isha in ${place}`, href: buildRoutePath("en", "isha", sourceCity) }
      ]
    : [
        { label: "Prayer times in Mecca", href: buildRoutePath("en", "prayer-times", "Mecca") },
        { label: "Prayer times in Dubai", href: buildRoutePath("en", "prayer-times", "Dubai") },
        { label: "Next prayer in Riyadh", href: buildRoutePath("en", "next-prayer", "Riyadh") },
        { label: "Fajr in Medina", href: buildRoutePath("en", "fajr", "Medina") },
        { label: "Asr in Cairo", href: buildRoutePath("en", "asr", "Cairo") },
        { label: "Prayer times in Kuala Lumpur", href: buildRoutePath("en", "prayer-times", "Kuala Lumpur") },
        { label: "Prayer times in Johor Bahru", href: buildRoutePath("en", "prayer-times", "Johor Bahru") },
        { label: "Prayer times in Jakarta", href: buildRoutePath("en", "prayer-times", "Jakarta") }
      ];
  if (!sourceCity && pageType === "prayer-times") {
    cityIntentLinks = [
      { label: "Prayer times in Oran", href: buildRoutePath("en", "home", "Oran") },
      { label: "Prayer times in Annaba", href: buildRoutePath("en", "home", "Annaba") },
      { label: "Prayer times in Bouira", href: buildRoutePath("en", "home", "Bouira") },
      { label: "Prayer times in Chesham", href: buildRoutePath("en", "home", "Chesham") },
      { label: "Prayer times in Mecca", href: buildRoutePath("en", "home", "Mecca") },
      { label: "Next prayer in Riyadh", href: buildRoutePath("en", "next-prayer", "Riyadh") },
      { label: "Fajr in Medina", href: buildRoutePath("en", "fajr", "Medina") },
      { label: "Prayer times in Kuala Lumpur", href: buildRoutePath("en", "home", "Kuala Lumpur") }
    ];
  }

  const copy = {
    activeLanguage: "en",
    standalonePage: pageType === "qibla" || pageType === "quran" || pageType === "quran-surah" || pageType === "dhikr" || pageType === "dhikr-collection" || pageType === "hadith" || pageType === "hadith-collection",
    standalonePageType: pageType === "qibla" || pageType === "quran" || pageType === "quran-surah" || pageType === "dhikr" || pageType === "dhikr-collection" || pageType === "hadith" || pageType === "hadith-collection" ? pageType : "",
    hideNextPrayerCard: pageType === "qibla" || pageType === "quran" || pageType === "dhikr" || pageType === "dhikr-collection" || pageType === "hadith" || pageType === "hadith-collection",
    showPopularCities: pageType !== "qibla" && pageType !== "quran" && pageType !== "dhikr" && pageType !== "dhikr-collection" && pageType !== "hadith" && pageType !== "hadith-collection",
    showIntentLinks: pageType !== "qibla" && pageType !== "quran" && pageType !== "dhikr" && pageType !== "dhikr-collection" && pageType !== "hadith" && pageType !== "hadith-collection",
    brandHref: buildRoutePath("en", "home"),
    priorityGroupLabels: PRIORITY_GROUP_LABELS.en,
    heroEyebrow: pageType === "home"
      ? (place ? `Prayer schedule for ${place}` : "Prayer times by city")
      : `${topic}${place ? ` for ${place}` : ""}`,
    heroHeading: pageType === "home"
      ? (place ? `Prayer Times in ${place} Today` : "Prayer Times Today and Your Next Salah Countdown")
      : `${topic}${place ? ` in ${place}` : " Today"}`,
    heroSubtitle: place
      ? `Use this page to check ${topic.toLowerCase()} in ${place}, follow the live next-prayer countdown, and review the full daily salah schedule without extra clicks.`
      : "Check accurate daily prayer times, follow the next prayer countdown, and switch quickly to any city worldwide.",
    cityLabel: "City",
    cityPlaceholder: "Enter city",
    countryLabel: "Country",
    countryPlaceholder: "Country (optional)",
    submitLabel: "Find Prayer Times",
    topCityGroupsPrimary: getLocalizedPriorityGroups("en", PRIORITY_CITY_CONFIG.hero?.primaryGroups || []),
    topCityGroupsOverflow: getLocalizedPriorityGroups("en", PRIORITY_CITY_CONFIG.hero?.overflowGroups || []),
    topCitiesAria: "Popular city shortcuts",
    topCitiesMoreLabel: "More cities",
    intentLinks,
    intentAria: "Prayer search shortcuts",
    locationStatus: place ? `Prayer times for ${place}` : "Detecting your location",
    nextPrayerTitle: "Next Prayer",
    currentPrayerLabel: "Current Prayer",
    todayLabel: "Today",
    methodLabel: "Method",
    loadingLabel: "Loading...",
    locationText: place ? `${place} prayer schedule will load automatically after page start.` : "Trying GPS, then IP fallback.",
    scheduleEyebrow: "Today",
    scheduleHeading: pageType === "home" ? "Today's Prayer Schedule" : `${topic} and Full Prayer Schedule`,
    scheduleSummary: place ? `Daily prayer schedule and next salah countdown for ${place}.` : "Accurate times for your current city.",
    infoEyebrow: "Why this page helps",
    infoTitle: isHomeRoot ? rootOverride.infoTitle : `A focused ${topic.toLowerCase()} page for daily use`,
    features: isHomeRoot
      ? rootOverride.features
      : [
          `Built around the exact search intent for ${topic.toLowerCase()}${place ? ` in ${place}` : ""}.`,
          "Shows the next-prayer countdown and the full daily timetable on one page.",
          "Adapts automatically to browser language and detected location after page load.",
          "Uses clean canonical URLs that can be shared, indexed, and revisited easily."
        ],
    citiesEyebrow: "Explore More",
    citiesTitle: isHomeRoot ? rootOverride.citiesTitle : `Popular ${topic.toLowerCase()} pages`,
    priorityCityGroups: getPriorityGroupCities("en"),
    cityLinks,
    cityIntentLinks,
    aboutEyebrow: "About",
    aboutTitle: isHomeRoot ? rootOverride.aboutTitle : `${topic}${place ? ` in ${place}` : ""} without the clutter`,
    aboutParagraphs: isHomeRoot
      ? rootOverride.aboutParagraphs
      : [
          place
            ? `This landing page is focused on ${topic.toLowerCase()} in ${place}, so visitors reach the right answer faster than on a generic homepage.`
            : `This landing page is focused on ${topic.toLowerCase()}, so visitors reach the right answer faster than on a generic homepage.`,
          "The goal is a more professional experience: clear prayer intent, automatic language handling, clean route structure, and a direct path to today's schedule.",
          "That stronger alignment between search query, URL, page title, and visible copy gives this route a better SEO foundation."
        ],
    faqEyebrow: "FAQ",
    faqTitle: isHomeRoot ? rootOverride.faqTitle : `Common questions about ${topic.toLowerCase()}${place ? ` in ${place}` : ""}`,
    faq: isHomeRoot
      ? rootOverride.faq
      : [
          {
            question: place ? `Can I share this ${topic.toLowerCase()} page for ${place}?` : `Can I share this ${topic.toLowerCase()} page?`,
            answer: place
              ? `Yes. This route is built as a direct page for ${topic.toLowerCase()} in ${place}, so it can be revisited and shared easily.`
              : "Yes. Each route is built as a direct page for a specific prayer intent, so it can be revisited and shared easily."
          },
          {
            question: "Does Adantimer detect language and location automatically?",
            answer: "Yes. The page follows the browser language after load, tries GPS first, then falls back to IP-based location, and still allows manual city search."
          },
          {
            question: "Which prayer times are shown on this page?",
            answer: `The page highlights ${topic.toLowerCase()} while still loading the full daily schedule for Fajr, Dhuhr, Asr, Maghrib, and Isha.`
          }
        ],
    ...buildQuranIndexCopy("en", pageType),
    ...buildQuranSurahCopy("en", pageType, surah, surahReaderData),
    ...buildDhikrIndexCopy("en", pageType, dhikrCollection),
    ...buildHadithIndexCopy("en", pageType, hadithCollection),
    ...buildQiblaPanelCopy("en", pageType),
    ...buildToolHubCopy("en", pageType),
    footerText: pageType === "quran"
      ? QURAN_INDEX_CONTENT.en.footerText
      : pageType === "hadith" || pageType === "hadith-collection"
        ? HADITH_INDEX_CONTENT.en.footerText
      : pageType === "dhikr" || pageType === "dhikr-collection"
        ? DHIKR_INDEX_CONTENT.en.footerText
        : (place ? `Accurate prayer times for ${place} and other cities.` : "Accurate prayer times by city."),
    noscriptText: pageType === "quran"
      ? QURAN_INDEX_CONTENT.en.noscriptText
      : pageType === "hadith" || pageType === "hadith-collection"
        ? HADITH_INDEX_CONTENT.en.noscriptText
      : pageType === "dhikr" || pageType === "dhikr-collection"
        ? DHIKR_INDEX_CONTENT.en.noscriptText
        : "JavaScript is required to load live prayer times and the next prayer countdown."
  };
  return copy;
}

function buildArabicCopy({ pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection, hadithCollection }) {
  const isHomeRoot = pageType === "home" && !place;
  const rootOverride = ROOT_HOME_OVERRIDES.ar;
  const resolvedPage = pageType === "home" ? "prayer-times" : pageType;
  const cityLinks = TOP_CITIES
    .filter(item => item.city !== sourceCity)
    .slice(0, 6)
    .map(item => ({
      label: `${topic} في ${item.city}`,
      href: buildRoutePath("ar", resolvedPage, item.city)
    }));
  cityLinks.forEach((link, index) => {
    const filteredCities = TOP_CITIES.filter(item => item.city !== sourceCity).slice(0, 6);
    const sourceItem = filteredCities[index];
    if (!sourceItem) return;
    link.label = link.label.replace(sourceItem.city, localizeCityName(sourceItem.city, "ar"));
  });
  const intentLinks = [
    { type: "prayer-times", label: "مواقيت الصلاة اليوم", href: buildRoutePath("ar", "prayer-times") },
    { type: "next-prayer", label: "وقت الصلاة القادمة", href: buildRoutePath("ar", "next-prayer") },
    { type: "fajr", label: "وقت الفجر", href: buildRoutePath("ar", "fajr") },
    { type: "dhuhr", label: "وقت الظهر", href: buildRoutePath("ar", "dhuhr") },
    { type: "asr", label: "وقت العصر", href: buildRoutePath("ar", "asr") },
    { type: "maghrib", label: "وقت المغرب", href: buildRoutePath("ar", "maghrib") },
    { type: "isha", label: "وقت العشاء", href: buildRoutePath("ar", "isha") }
  ];
  let cityIntentLinks = sourceCity
    ? [
        { label: `مواقيت الصلاة في ${place}`, href: buildRoutePath("ar", "prayer-times", sourceCity) },
        { label: `الصلاة القادمة في ${place}`, href: buildRoutePath("ar", "next-prayer", sourceCity) },
        { label: `الفجر في ${place}`, href: buildRoutePath("ar", "fajr", sourceCity) },
        { label: `الظهر في ${place}`, href: buildRoutePath("ar", "dhuhr", sourceCity) },
        { label: `العصر في ${place}`, href: buildRoutePath("ar", "asr", sourceCity) },
        { label: `المغرب في ${place}`, href: buildRoutePath("ar", "maghrib", sourceCity) },
        { label: `العشاء في ${place}`, href: buildRoutePath("ar", "isha", sourceCity) }
      ]
    : [
        { label: "مواقيت الصلاة في مكة", href: buildRoutePath("ar", "prayer-times", "Mecca") },
        { label: "مواقيت الصلاة في دبي", href: buildRoutePath("ar", "prayer-times", "Dubai") },
        { label: "الصلاة القادمة في الرياض", href: buildRoutePath("ar", "next-prayer", "Riyadh") },
        { label: "الفجر في المدينة", href: buildRoutePath("ar", "fajr", "Medina") },
        { label: "العصر في القاهرة", href: buildRoutePath("ar", "asr", "Cairo") },
        { label: "مواقيت الصلاة في إسطنبول", href: buildRoutePath("ar", "prayer-times", "Istanbul") }
      ];
  if (!sourceCity && pageType === "prayer-times") {
    cityIntentLinks = [
      { label: "مواقيت الصلاة في وهران", href: buildRoutePath("ar", "home", "Oran") },
      { label: "مواقيت الصلاة في عنابة", href: buildRoutePath("ar", "home", "Annaba") },
      { label: "مواقيت الصلاة في البويرة", href: buildRoutePath("ar", "home", "Bouira") },
      { label: "مواقيت الصلاة في مكة", href: buildRoutePath("ar", "home", "Mecca") },
      { label: "الصلاة القادمة في الرياض", href: buildRoutePath("ar", "next-prayer", "Riyadh") },
      { label: "الفجر في المدينة", href: buildRoutePath("ar", "fajr", "Medina") },
      { label: "العصر في القاهرة", href: buildRoutePath("ar", "asr", "Cairo") },
      { label: "مواقيت الصلاة في إسطنبول", href: buildRoutePath("ar", "home", "Istanbul") }
    ];
  }

  const copy = {
    activeLanguage: "ar",
    standalonePage: pageType === "qibla" || pageType === "quran" || pageType === "quran-surah" || pageType === "dhikr" || pageType === "dhikr-collection" || pageType === "hadith" || pageType === "hadith-collection",
    standalonePageType: pageType === "qibla" || pageType === "quran" || pageType === "quran-surah" || pageType === "dhikr" || pageType === "dhikr-collection" || pageType === "hadith" || pageType === "hadith-collection" ? pageType : "",
    hideNextPrayerCard: pageType === "qibla" || pageType === "quran" || pageType === "dhikr" || pageType === "dhikr-collection" || pageType === "hadith" || pageType === "hadith-collection",
    showPopularCities: pageType !== "qibla" && pageType !== "quran" && pageType !== "dhikr" && pageType !== "dhikr-collection" && pageType !== "hadith" && pageType !== "hadith-collection",
    showIntentLinks: pageType !== "qibla" && pageType !== "quran" && pageType !== "dhikr" && pageType !== "dhikr-collection" && pageType !== "hadith" && pageType !== "hadith-collection",
    brandHref: buildRoutePath("ar", "home"),
    priorityGroupLabels: PRIORITY_GROUP_LABELS.ar,
    heroEyebrow: pageType === "home"
      ? (place ? `جدول الصلاة في ${place}` : "مواقيت الصلاة حسب المدينة")
      : `${topic}${place ? ` في ${place}` : ""}`,
    heroHeading: pageType === "home"
      ? (place ? `مواقيت الصلاة في ${place} اليوم` : "مواقيت الصلاة اليوم والعد التنازلي للصلاة القادمة")
      : `${topic}${place ? ` في ${place}` : " اليوم"}`,
    heroSubtitle: place
      ? `استخدم هذه الصفحة لمعرفة ${topic} في ${place} ومتابعة العد التنازلي للصلاة القادمة ومراجعة جدول الصلوات الكامل لليوم.`
      : "تحقق من مواقيت الصلاة بدقة، وتابع الصلاة القادمة، وانتقل بسرعة إلى أي مدينة في العالم.",
    cityLabel: "المدينة",
    cityPlaceholder: "أدخل المدينة",
    countryLabel: "الدولة",
    countryPlaceholder: "الدولة (اختياري)",
    submitLabel: "اعرض مواقيت الصلاة",
    topCityGroupsPrimary: getLocalizedPriorityGroups("ar", PRIORITY_CITY_CONFIG.hero?.primaryGroups || []),
    topCityGroupsOverflow: getLocalizedPriorityGroups("ar", PRIORITY_CITY_CONFIG.hero?.overflowGroups || []),
    topCitiesAria: "روابط سريعة للمدن",
    topCitiesMoreLabel: "مدن إضافية",
    intentLinks,
    intentAria: "روابط سريعة لنوع البحث",
    locationStatus: place ? `مواقيت الصلاة في ${place}` : "جار تحديد موقعك",
    nextPrayerTitle: "الصلاة القادمة",
    currentPrayerLabel: "الصلاة الحالية",
    todayLabel: "اليوم",
    methodLabel: "الطريقة",
    loadingLabel: "جار التحميل...",
    locationText: place ? `سيتم تحميل جدول الصلاة في ${place} تلقائيا بعد تشغيل الصفحة.` : "يتم استخدام GPS أولا ثم الاعتماد على IP عند الحاجة.",
    scheduleEyebrow: "اليوم",
    scheduleHeading: pageType === "home" ? "جدول الصلاة اليوم" : `${topic} وجدول الصلاة الكامل`,
    scheduleSummary: place ? `جدول الصلاة اليومي والعد التنازلي للصلاة القادمة في ${place}.` : "مواقيت دقيقة لمدينتك الحالية.",
    infoEyebrow: "لماذا هذه الصفحة مفيدة",
    infoTitle: isHomeRoot ? rootOverride.infoTitle : `صفحة مركزة لعرض ${topic}${place ? ` في ${place}` : ""}`,
    features: isHomeRoot ? rootOverride.features : [
      `الصفحة مبنية حول نية البحث المباشرة عن ${topic}${place ? ` في ${place}` : ""}.`,
      "تعرض الصلاة القادمة والجدول الكامل لليوم في مكان واحد.",
      "تتكيف تلقائيا مع لغة المتصفح والموقع بعد تحميل الصفحة.",
      "تستخدم رابطا أساسيا واضحا يمكن مشاركته وأرشفته بسهولة."
    ],
    citiesEyebrow: "اكتشف المزيد",
    citiesTitle: isHomeRoot ? rootOverride.citiesTitle : `صفحات شائعة عن ${topic}`,
    priorityCityGroups: getPriorityGroupCities("ar"),
    cityLinks,
    cityIntentLinks,
    aboutEyebrow: "حول الصفحة",
    aboutTitle: isHomeRoot ? rootOverride.aboutTitle : `${topic}${place ? ` في ${place}` : ""} بدون تعقيد`,
    aboutParagraphs: isHomeRoot ? rootOverride.aboutParagraphs : [
      place
        ? `هذه الصفحة مخصصة لعرض ${topic} في ${place} حتى يصل الزائر إلى الإجابة الصحيحة بسرعة أكبر من الصفحة العامة.`
        : `هذه الصفحة مخصصة لعرض ${topic} حتى يصل الزائر إلى الإجابة الصحيحة بسرعة أكبر من الصفحة العامة.`,
      "الهدف هو تجربة أكثر احترافية: نية صلاة واضحة، ولغة تلقائية، وهيكل روابط منظم، ومسار مباشر إلى جدول اليوم.",
      "هذا التطابق الأقوى بين البحث والرابط والعنوان والمحتوى المرئي يمنح الصفحة أساسا أفضل لتحسين الظهور في محركات البحث."
    ],
    faqEyebrow: "الأسئلة الشائعة",
    faqTitle: isHomeRoot ? rootOverride.faqTitle : `أسئلة شائعة عن ${topic}${place ? ` في ${place}` : ""}`,
    faq: isHomeRoot ? rootOverride.faq : [
      {
        question: place ? `هل يمكنني مشاركة صفحة ${topic} في ${place}؟` : "هل يمكنني مشاركة هذه الصفحة؟",
        answer: place
          ? `نعم. هذه الصفحة مخصصة مباشرة لعرض ${topic} في ${place} ويمكن فتحها أو مشاركتها بسهولة.`
          : "نعم. كل رابط مخصص لنية صلاة محددة ويمكن الرجوع إليه أو مشاركته بسهولة."
      },
      {
        question: "هل يحدد Adantimer اللغة والموقع تلقائيا؟",
        answer: "نعم. الصفحة تتبع لغة المتصفح بعد التحميل، وتجرب GPS أولا ثم تعتمد على IP عند الحاجة، مع بقاء البحث اليدوي متاحا."
      },
      {
        question: "ما أوقات الصلوات التي تظهر في هذه الصفحة؟",
        answer: `تسلط الصفحة الضوء على ${topic} مع تحميل الجدول الكامل للفجر والظهر والعصر والمغرب والعشاء.`
      }
    ],
    ...buildQuranIndexCopy("ar", pageType),
    ...buildQuranSurahCopy("ar", pageType, surah, surahReaderData),
    ...buildDhikrIndexCopy("ar", pageType, dhikrCollection),
    ...buildHadithIndexCopy("ar", pageType, hadithCollection),
    ...buildQiblaPanelCopy("ar", pageType),
    ...buildToolHubCopy("ar", pageType),
    footerText: pageType === "quran"
      ? QURAN_INDEX_CONTENT.ar.footerText
      : (place ? `مواقيت صلاة دقيقة في ${place} ومدن أخرى.` : "مواقيت صلاة دقيقة حسب المدينة."),
    noscriptText: pageType === "quran"
      ? QURAN_INDEX_CONTENT.ar.noscriptText
      : "يتطلب عرض المواقيت الحية والعد التنازلي للصلاة القادمة تشغيل JavaScript."
  };
  if (pageType === "dhikr" || pageType === "dhikr-collection") {
    copy.footerText = DHIKR_INDEX_CONTENT.ar.footerText;
    copy.noscriptText = DHIKR_INDEX_CONTENT.ar.noscriptText;
  }
  if (pageType === "hadith" || pageType === "hadith-collection") {
    copy.footerText = HADITH_INDEX_CONTENT.ar.footerText;
    copy.noscriptText = HADITH_INDEX_CONTENT.ar.noscriptText;
  }
  return copy;
}

function buildCopy({ language, pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection, hadithCollection }) {
  if (language === "ar") return buildArabicCopy({ pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection, hadithCollection });
  if (language === "en") return buildEnglishCopy({ pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection, hadithCollection });
  return buildLocalizedCopy(language, { pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection, hadithCollection });
}

function buildLocalizedCopy(language, { pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection, hadithCollection }) {
  const locale = COPY_LOCALES[language];
  if (!locale) return buildEnglishCopy({ pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection, hadithCollection });
  const isHomeRoot = pageType === "home" && !place;
  const rootOverride = ROOT_HOME_OVERRIDES[language];

  const resolvedPage = pageType === "home" ? "prayer-times" : pageType;
  const cityLinks = TOP_CITIES
    .filter(item => item.city !== sourceCity)
    .slice(0, 6)
    .map(item => ({
      label: locale.cityLinkLabel(topic, localizeCityName(item.city, language)),
      href: buildRoutePath(language, resolvedPage, item.city)
    }));
  const intentLinks = locale.intentLinks.map(item => ({
    label: item.label,
    href: buildRoutePath(language, item.type)
  }));
  let cityIntentLinks = locale.cityIntentLinks(place).map(item => {
    const resolvedCity = item.city || sourceCity;
    let label = item.label;
    if (!place && item.city) {
      label = label.replace(item.city, localizeCityName(item.city, language));
    }

    return {
      type: item.type,
      city: resolvedCity,
      label,
      href: buildRoutePath(language, item.type, resolvedCity)
    };
  });

  if (!sourceCity && pageType === "prayer-times" && language === "fr") {
    cityIntentLinks = [
      { label: "Horaires de prière à Oran", href: buildRoutePath("fr", "home", "Oran") },
      { label: "Horaires de prière à Annaba", href: buildRoutePath("fr", "home", "Annaba") },
      { label: "Horaires de prière à Bouira", href: buildRoutePath("fr", "home", "Bouira") },
      { label: "Horaires de prière à La Mecque", href: buildRoutePath("fr", "home", "Mecca") },
      { label: "Prochaine prière à Riyad", href: buildRoutePath("fr", "next-prayer", "Riyadh") },
      { label: "Fajr à Médine", href: buildRoutePath("fr", "fajr", "Medina") },
      { label: "Asr au Caire", href: buildRoutePath("fr", "asr", "Cairo") },
      { label: "Horaires de prière à Paris", href: buildRoutePath("fr", "home", "Paris") }
    ];
  }

  return {
    activeLanguage: language,
    standalonePage: pageType === "qibla" || pageType === "quran" || pageType === "quran-surah" || pageType === "dhikr" || pageType === "dhikr-collection" || pageType === "hadith" || pageType === "hadith-collection",
    standalonePageType: pageType === "qibla" || pageType === "quran" || pageType === "quran-surah" || pageType === "dhikr" || pageType === "dhikr-collection" || pageType === "hadith" || pageType === "hadith-collection" ? pageType : "",
    hideNextPrayerCard: pageType === "qibla" || pageType === "quran" || pageType === "dhikr" || pageType === "dhikr-collection" || pageType === "hadith" || pageType === "hadith-collection",
    showPopularCities: pageType !== "qibla" && pageType !== "quran" && pageType !== "dhikr" && pageType !== "dhikr-collection" && pageType !== "hadith" && pageType !== "hadith-collection",
    showIntentLinks: pageType !== "qibla" && pageType !== "quran" && pageType !== "dhikr" && pageType !== "dhikr-collection" && pageType !== "hadith" && pageType !== "hadith-collection",
    brandHref: buildRoutePath(language, "home"),
    priorityGroupLabels: PRIORITY_GROUP_LABELS[language],
    heroEyebrow: pageType === "home"
      ? (place ? locale.heroEyebrowPlace(place) : locale.heroEyebrowHome)
      : locale.heroHeadingTopic(topic, place),
    heroHeading: pageType === "home"
      ? (place ? locale.heroHeadingPlace(place) : locale.heroHeadingHome)
      : locale.heroHeadingTopic(topic, place),
    heroSubtitle: place ? locale.heroSubtitlePlace(topic, place) : locale.heroSubtitleHome,
    cityLabel: locale.cityLabel,
    cityPlaceholder: locale.cityPlaceholder,
    countryLabel: locale.countryLabel,
    countryPlaceholder: locale.countryPlaceholder,
    submitLabel: locale.submitLabel,
    topCityGroupsPrimary: getLocalizedPriorityGroups(language, PRIORITY_CITY_CONFIG.hero?.primaryGroups || []),
    topCityGroupsOverflow: getLocalizedPriorityGroups(language, PRIORITY_CITY_CONFIG.hero?.overflowGroups || []),
    topCitiesAria: locale.topCitiesAria,
    topCitiesMoreLabel: locale.topCitiesMoreLabel,
    intentLinks,
    intentAria: locale.intentAria,
    locationStatus: locale.locationStatus(place),
    nextPrayerTitle: locale.nextPrayerTitle,
    currentPrayerLabel: locale.currentPrayerLabel,
    todayLabel: locale.todayLabel,
    methodLabel: locale.methodLabel,
    loadingLabel: locale.loadingLabel,
    locationText: locale.locationText(place),
    scheduleEyebrow: locale.scheduleEyebrow,
    scheduleHeading: locale.scheduleHeading(pageType, topic),
    scheduleSummary: locale.scheduleSummary(place),
    infoEyebrow: locale.infoEyebrow,
    infoTitle: isHomeRoot && rootOverride ? rootOverride.infoTitle : locale.infoTitle(topic, place),
    features: isHomeRoot && rootOverride ? rootOverride.features : locale.features(topic, place),
    citiesEyebrow: locale.citiesEyebrow,
    citiesTitle: isHomeRoot && rootOverride ? rootOverride.citiesTitle : locale.citiesTitle(topic),
    priorityCityGroups: getPriorityGroupCities(language),
    cityLinks,
    cityIntentLinks,
    aboutEyebrow: locale.aboutEyebrow,
    aboutTitle: isHomeRoot && rootOverride ? rootOverride.aboutTitle : locale.aboutTitle(topic, place),
    aboutParagraphs: isHomeRoot && rootOverride ? rootOverride.aboutParagraphs : locale.aboutParagraphs(topic, place),
    faqEyebrow: locale.faqEyebrow,
    faqTitle: isHomeRoot && rootOverride ? rootOverride.faqTitle : locale.faqTitle(topic, place),
    faq: isHomeRoot && rootOverride ? rootOverride.faq : locale.faq(topic, place),
    ...buildQuranIndexCopy(language, pageType),
    ...buildQuranSurahCopy(language, pageType, surah, surahReaderData),
    ...buildDhikrIndexCopy(language, pageType, dhikrCollection),
    ...buildHadithIndexCopy(language, pageType, hadithCollection),
    ...buildQiblaPanelCopy(language, pageType),
    ...buildToolHubCopy(language, pageType),
    footerText: pageType === "quran"
      ? (QURAN_INDEX_CONTENT[language] || QURAN_INDEX_CONTENT.en).footerText
      : pageType === "hadith" || pageType === "hadith-collection"
        ? (HADITH_INDEX_CONTENT[language] || HADITH_INDEX_CONTENT.en).footerText
      : pageType === "dhikr" || pageType === "dhikr-collection"
        ? (DHIKR_INDEX_CONTENT[language] || DHIKR_INDEX_CONTENT.en).footerText
        : locale.footerText(place),
    noscriptText: pageType === "quran"
      ? (QURAN_INDEX_CONTENT[language] || QURAN_INDEX_CONTENT.en).noscriptText
      : pageType === "hadith" || pageType === "hadith-collection"
        ? (HADITH_INDEX_CONTENT[language] || HADITH_INDEX_CONTENT.en).noscriptText
      : pageType === "dhikr" || pageType === "dhikr-collection"
        ? (DHIKR_INDEX_CONTENT[language] || DHIKR_INDEX_CONTENT.en).noscriptText
        : locale.noscriptText
  };
}

function renderHeroCopy(copy) {
  if (copy.standalonePageType === "dhikr" || copy.standalonePageType === "dhikr-collection") {
    return `        <section class="hero-copy dhikr-hero-copy">
          <p class="eyebrow">${escapeHtml(copy.heroEyebrow)}</p>
          <h1 id="hero-heading">${escapeHtml(copy.heroHeading)}</h1>
          <p id="hero-subtitle" class="hero-subtitle">
            ${escapeHtml(copy.heroSubtitle)}
          </p>

          <div class="dhikr-hero-stats" aria-label="${escapeHtml(copy.dhikrStatsAria)}">
${copy.dhikrStats.map(item => `            <div class="dhikr-hero-stat">
              <strong>${escapeHtml(item.value)}</strong>
              <span>${escapeHtml(item.label)}</span>
            </div>`).join("\n")}
          </div>
        </section>`;
  }

  if (copy.standalonePageType === "hadith" || copy.standalonePageType === "hadith-collection") {
    return `        <section class="hero-copy hadith-hero-copy">
          <p class="eyebrow">${escapeHtml(copy.heroEyebrow)}</p>
          <h1 id="hero-heading">${escapeHtml(copy.heroHeading)}</h1>
          <p id="hero-subtitle" class="hero-subtitle">
            ${escapeHtml(copy.heroSubtitle)}
          </p>

          <div class="hadith-search-bar">
            <label class="sr-only" for="hadith-search">${escapeHtml(copy.hadithSearchLabel)}</label>
            <div class="quran-search-row">
              <input type="search" id="hadith-search" class="quran-search-input" placeholder="${escapeHtml(copy.hadithSearchPlaceholder)}" autocomplete="off">
              <button type="button" id="hadith-search-clear" class="quran-search-clear" hidden aria-label="${escapeHtml(copy.hadithSearchLabel)}" title="${escapeHtml(copy.hadithSearchLabel)}">&times;</button>
            </div>
            <p class="muted quran-search-hint">${escapeHtml(copy.hadithSearchHint)}</p>
          </div>

          <div class="hadith-hero-stats" aria-label="${escapeHtml(copy.hadithStatsAria)}">
${copy.hadithStats.map(item => `            <div class="hadith-hero-stat">
              <strong>${escapeHtml(item.value)}</strong>
              <span>${escapeHtml(item.label)}</span>
            </div>`).join("\n")}
          </div>
        </section>`;
  }

  if (copy.standalonePageType === "quran") {
    return `        <section class="hero-copy quran-hero-copy">
          <p class="eyebrow">${escapeHtml(copy.heroEyebrow)}</p>
          <h1 id="hero-heading">${escapeHtml(copy.heroHeading)}</h1>
          <p id="hero-subtitle" class="hero-subtitle">
            ${escapeHtml(copy.heroSubtitle)}
          </p>

          <div class="quran-search-bar">
            <label class="sr-only" for="quran-search">${escapeHtml(copy.quranSearchLabel)}</label>
            <div class="quran-search-row">
              <input type="search" id="quran-search" class="quran-search-input" placeholder="${escapeHtml(copy.quranSearchPlaceholder)}" autocomplete="off">
              <button type="button" id="quran-search-clear" class="quran-search-clear" hidden aria-label="${escapeHtml(copy.quranClearLabel)}" title="${escapeHtml(copy.quranClearLabel)}">&times;</button>
            </div>
            <p class="muted quran-search-hint">${escapeHtml(copy.quranSearchHint)}</p>
          </div>

          <div class="quran-hero-stats" aria-label="${escapeHtml(copy.quranStatsAria)}">
${copy.quranStats.map(item => `            <div class="quran-hero-stat">
              <strong>${escapeHtml(item.value)}</strong>
              <span>${escapeHtml(item.label)}</span>
            </div>`).join("\n")}
          </div>
        </section>`;
  }

  if (copy.standalonePageType === "quran-surah") {
    return `        <section class="hero-copy quran-hero-copy quran-surah-hero">
          <p class="eyebrow">${escapeHtml(copy.heroEyebrow)}</p>
          <h1 id="hero-heading">${escapeHtml(copy.heroHeading)}</h1>
          <p id="hero-subtitle" class="hero-subtitle">
            ${escapeHtml(copy.heroSubtitle)}
          </p>
          <p class="quran-surah-arabic-hero">${escapeHtml(copy.quranArabicName || "")}</p>
          <a class="secondary-link" href="${escapeHtml(copy.quranIndexHref)}">${escapeHtml(copy.quranBackLabel)}</a>

          <div class="quran-hero-stats" aria-label="${escapeHtml(copy.quranNavigationAria || copy.heroHeading)}">
            <div class="quran-hero-stat">
              <strong>${escapeHtml(copy.quranAyahCountValue || "")}</strong>
              <span>${escapeHtml(copy.quranAyahCountStatLabel || "")}</span>
            </div>
            <div class="quran-hero-stat">
              <strong>${escapeHtml(copy.quranRevelationValue || "")}</strong>
              <span>${escapeHtml(copy.quranRevelationStatLabel || "")}</span>
            </div>
            <div class="quran-hero-stat">
              <strong>${escapeHtml(copy.quranPositionValue || "")}</strong>
              <span>${escapeHtml(copy.quranPositionStatLabel || "")}</span>
            </div>
          </div>
        </section>`;
  }

  const popularCitiesMarkup = copy.showPopularCities ? renderPopularCitiesMarkup(copy) : "";

  const intentLinksMarkup = copy.showIntentLinks
    ? `

          <div class="intent-links" aria-label="${escapeHtml(copy.intentAria)}">
${copy.intentLinks.map(item => `            <a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`).join("\n")}
          </div>`
    : "";

  return `        <section class="hero-copy">
          <p class="eyebrow">${escapeHtml(copy.heroEyebrow)}</p>
          <h1 id="hero-heading">${escapeHtml(copy.heroHeading)}</h1>
          <p id="hero-subtitle" class="hero-subtitle">
            ${escapeHtml(copy.heroSubtitle)}
          </p>

          <form id="location-form" class="location-form" novalidate>
            <label class="sr-only" for="manual-city">${escapeHtml(copy.cityLabel)}</label>
            <input type="text" id="manual-city" name="city" placeholder="${escapeHtml(copy.cityPlaceholder)}" autocomplete="address-level2">
            <label class="sr-only" for="manual-country">${escapeHtml(copy.countryLabel)}</label>
            <input type="text" id="manual-country" name="country" placeholder="${escapeHtml(copy.countryPlaceholder)}" autocomplete="country-name">
            <button id="set-location-btn" type="submit">${escapeHtml(copy.submitLabel)}</button>
          </form>
${popularCitiesMarkup}
${intentLinksMarkup}
        </section>`;
}

function renderPopularCitiesMarkup(copy) {
  const primaryGroupsMarkup = (copy.topCityGroupsPrimary || []).map(group => `            <div class="city-chip-group" data-priority-group="${escapeHtml(group.id)}">
              <span class="city-group-label" data-priority-group-label="${escapeHtml(group.id)}">${escapeHtml(copy.priorityGroupLabels?.[group.id] || group.id)}</span>
              <div class="city-chip-list">
${group.cities.map(item => `                <a class="city-chip" href="${escapeHtml(buildRoutePath(copy.activeLanguage, "home", item.city))}" data-city="${escapeHtml(item.city)}" data-country="${escapeHtml(item.country)}">${escapeHtml(item.displayCity || item.city)}</a>`).join("\n")}
              </div>
            </div>`).join("\n");

  const overflowGroups = copy.topCityGroupsOverflow || [];
  const overflowCount = overflowGroups.reduce((total, group) => total + group.cities.length, 0);
  const overflowMarkup = overflowGroups.length
    ? `
            <details class="city-chip-more">
              <summary class="city-chip-more-toggle">
                <span data-top-cities-more-label>${escapeHtml(copy.topCitiesMoreLabel || "More cities")}</span>
                <strong>${overflowCount}</strong>
              </summary>
              <div class="city-chip-overflow">
${overflowGroups.map(group => `                <div class="city-chip-group" data-priority-group="${escapeHtml(group.id)}">
                  <span class="city-group-label" data-priority-group-label="${escapeHtml(group.id)}">${escapeHtml(copy.priorityGroupLabels?.[group.id] || group.id)}</span>
                  <div class="city-chip-list">
${group.cities.map(item => `                    <a class="city-chip" href="${escapeHtml(buildRoutePath(copy.activeLanguage, "home", item.city))}" data-city="${escapeHtml(item.city)}" data-country="${escapeHtml(item.country)}">${escapeHtml(item.displayCity || item.city)}</a>`).join("\n")}
                  </div>
                </div>`).join("\n")}
              </div>
            </details>`
    : "";

  return `

          <div class="popular-cities" aria-label="${escapeHtml(copy.topCitiesAria)}">
${primaryGroupsMarkup}
${overflowMarkup}
          </div>`;
}

function renderNextPrayerCard(copy) {
  if (copy.hideNextPrayerCard) return "";
  return `        <aside class="next-prayer card featured-card" aria-live="polite">
          <p class="card-label" id="location-status">${escapeHtml(copy.locationStatus)}</p>
          <h2 id="title">${escapeHtml(copy.nextPrayerTitle)}</h2>
          <div id="next-prayer-name" class="highlight"></div>
          <div id="countdown" class="countdown">${escapeHtml(copy.loadingLabel)}</div>
          <div class="mini-stats">
            <div class="mini-stat">
              <span id="current-prayer-label">${escapeHtml(copy.currentPrayerLabel)}</span>
              <strong id="current-prayer-value">${escapeHtml(copy.loadingLabel)}</strong>
            </div>
            <div class="mini-stat">
              <span id="today-label">${escapeHtml(copy.todayLabel)}</span>
              <strong id="today-date-value">${escapeHtml(copy.loadingLabel)}</strong>
            </div>
            <div class="mini-stat">
              <span id="method-label">${escapeHtml(copy.methodLabel)}</span>
              <strong id="method-value">${escapeHtml(copy.loadingLabel)}</strong>
            </div>
          </div>
          <p id="location" class="location">${escapeHtml(copy.locationText)}</p>
        </aside>`;
}

function renderScheduleSection(copy) {
  return `      <section class="card schedule-card" aria-labelledby="schedule-heading">
        <div class="section-head">
          <div>
            <p class="eyebrow">${escapeHtml(copy.scheduleEyebrow)}</p>
            <h2 id="schedule-heading">${escapeHtml(copy.scheduleHeading)}</h2>
          </div>
          <p id="schedule-summary" class="muted">${escapeHtml(copy.scheduleSummary)}</p>
        </div>
        <div id="prayer-times" class="prayer-times"></div>
      </section>`;
}

function renderInfoSection(copy) {
  return `      <section class="card info-card" aria-labelledby="why-heading">
        <p class="eyebrow">${escapeHtml(copy.infoEyebrow)}</p>
        <h2 id="why-heading">${escapeHtml(copy.infoTitle)}</h2>
        <ul class="feature-list">
${copy.features.map(item => `          <li>${escapeHtml(item)}</li>`).join("\n")}
        </ul>
      </section>`;
}

function renderToolsSection(copy) {
  const introMarkup = copy.toolsIntro
    ? `\n        <p class="tools-intro">${escapeHtml(copy.toolsIntro)}</p>`
    : "";
  return `    <section class="card tools-hub" aria-labelledby="tools-heading">
      <div class="tools-copy">
        <p class="eyebrow">${escapeHtml(copy.toolsEyebrow)}</p>
        <h2 id="tools-heading">${escapeHtml(copy.toolsTitle)}</h2>
${introMarkup}
      </div>
      <div class="tools-grid">
${copy.toolCards.map(item => `        <a class="tool-link-card${item.active ? " is-active" : ""}" href="${escapeHtml(item.href)}" data-tool-type="${escapeHtml(item.type)}">
          <strong class="tool-label">${escapeHtml(item.label)}</strong>
          <span class="tool-description">${escapeHtml(item.description)}</span>
          <span class="tool-cta">${escapeHtml(item.cta)}</span>
        </a>`).join("\n")}
      </div>
    </section>`;
}

function renderQiblaPanelSection(copy) {
  const hiddenAttribute = copy.showQiblaPanel ? "" : " hidden";
  return `    <section id="qibla-panel" class="card qibla-panel" aria-labelledby="qibla-panel-heading"${hiddenAttribute}>
      <div class="qibla-panel-copy">
        <p class="eyebrow">${escapeHtml(copy.qiblaEyebrow)}</p>
        <h2 id="qibla-panel-heading">${escapeHtml(copy.qiblaTitle)}</h2>
        <p id="qibla-panel-summary">${escapeHtml(copy.qiblaSummary)}</p>
      </div>
      <div class="qibla-panel-grid">
        <div class="qibla-compass-card">
          <div class="qibla-compass" id="qibla-compass" aria-hidden="true">
            <div class="qibla-dial" id="qibla-dial">
              <span class="qibla-cardinal qibla-cardinal-n">N</span>
              <span class="qibla-cardinal qibla-cardinal-e">E</span>
              <span class="qibla-cardinal qibla-cardinal-s">S</span>
              <span class="qibla-cardinal qibla-cardinal-w">W</span>
              <span class="qibla-compass-ring"></span>
              <span class="qibla-needle" id="qibla-needle">
                <span class="qibla-bearing-line"></span>
              </span>
              <span class="qibla-kaaba-marker" id="qibla-kaaba-marker">
                <span class="qibla-kaaba-icon" title="${escapeHtml(copy.qiblaKaabaLabel)}"></span>
              </span>
              <span class="qibla-compass-core"></span>
            </div>
          </div>
        </div>
        <div class="qibla-readout">
          <div class="qibla-readout-head">
            <strong id="qibla-place">${escapeHtml(copy.qiblaPlaceFallback)}</strong>
            <span id="qibla-status">${escapeHtml(copy.qiblaStatusIdle)}</span>
          </div>
          <div class="qibla-sensor-controls">
            <button id="qibla-sensor-button" class="qibla-sensor-button" type="button" hidden>${escapeHtml(copy.qiblaSensorButton)}</button>
            <p id="qibla-sensor-hint" class="qibla-sensor-hint">${escapeHtml(copy.qiblaSensorHintIdle)}</p>
          </div>
          <div class="qibla-stats">
            <div class="qibla-stat">
              <span id="qibla-bearing-label">${escapeHtml(copy.qiblaBearingLabel)}</span>
              <strong id="qibla-bearing-value">-</strong>
            </div>
            <div class="qibla-stat">
              <span id="qibla-distance-label">${escapeHtml(copy.qiblaDistanceLabel)}</span>
              <strong id="qibla-distance-value">-</strong>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

function renderQuranIndexSection(copy) {
  const cardsMarkup = copy.quranSurahs.map(item => `        <article class="quran-surah-card" id="surah-${item.id}" data-search="${escapeHtml(item.search)}">
          <a class="quran-surah-link" href="${escapeHtml(item.href)}">
            <div class="quran-surah-top">
              <span class="quran-surah-number">${item.id}</span>
              <div class="quran-surah-meta">
                <h3>${escapeHtml(item.name)}</h3>
                <p>${escapeHtml(item.translatedName)}</p>
              </div>
              <strong class="quran-surah-arabic">${escapeHtml(item.arabicName)}</strong>
            </div>
            <div class="quran-surah-details">
              <span>${escapeHtml(item.revelationLabel)}</span>
              <span>${escapeHtml(item.ayahCountLabel)}</span>
            </div>
          </a>
        </article>`).join("\n");

  return `    <section class="quran-index" aria-labelledby="quran-index-heading">
      <section class="card quran-index-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">${escapeHtml(copy.quranSectionEyebrow)}</p>
            <h2 id="quran-index-heading">${escapeHtml(copy.quranSectionTitle)}</h2>
          </div>
          <p id="quran-search-count" class="muted">${escapeHtml(copy.quranSearchCountText)}</p>
        </div>
        <p class="quran-index-intro">${escapeHtml(copy.quranSectionIntro)}</p>
        <p id="quran-search-empty" class="quran-search-empty" hidden>${escapeHtml(copy.quranEmptyState)}</p>
        <div id="quran-surah-grid" class="quran-surah-grid">
${cardsMarkup}
        </div>
      </section>
    </section>`;
}

function renderQuranSurahSection(copy) {
  const ayahMarkup = copy.quranAyahs.length
    ? copy.quranAyahs.map(item => `          <article class="quran-ayah-row" id="ayah-${item.number}">
            <div class="quran-ayah-number">${item.number}</div>
            <p class="quran-ayah-text">${escapeHtml(item.text)}</p>
          </article>`).join("\n")
    : `          <div class="quran-surah-empty">${escapeHtml(copy.quranEmptyText)}</div>`;

  const previousMarkup = copy.quranPrevious
    ? `<a class="quran-nav-card" href="${escapeHtml(copy.quranPrevious.href)}">
          <span class="quran-nav-label">${escapeHtml(copy.quranPrevious.label)}</span>
          <strong>${escapeHtml(copy.quranPrevious.name)}</strong>
        </a>`
    : "";
  const nextMarkup = copy.quranNext
    ? `<a class="quran-nav-card" href="${escapeHtml(copy.quranNext.href)}">
          <span class="quran-nav-label">${escapeHtml(copy.quranNext.label)}</span>
          <strong>${escapeHtml(copy.quranNext.name)}</strong>
        </a>`
    : "";
  const indexMarkup = `<a class="quran-nav-card quran-nav-card-index" href="${escapeHtml(copy.quranIndexHref)}">
          <span class="quran-nav-label">${escapeHtml(copy.quranIndexNavLabel)}</span>
          <strong>${escapeHtml(copy.quranBackLabel)}</strong>
        </a>`;

  return `    <section class="quran-reader" aria-labelledby="quran-reader-heading">
      <section class="card quran-reader-card">
        <div class="quran-reader-head">
          <div>
            <p class="eyebrow">${escapeHtml(copy.quranSectionEyebrow)}</p>
            <h2 id="quran-reader-heading">${escapeHtml(copy.quranSectionTitle)}</h2>
            <p class="quran-reader-intro">${escapeHtml(copy.quranSectionIntro)}</p>
          </div>
          <a class="secondary-link" href="${escapeHtml(copy.quranIndexHref)}">${escapeHtml(copy.quranBackLabel)}</a>
        </div>
        <div class="quran-reader-meta">
          <span>${escapeHtml(copy.quranRevelationLabel)}</span>
          <span>${escapeHtml(copy.quranAyahCountLabel)}</span>
        </div>
        <div class="quran-ayah-list">
${ayahMarkup}
        </div>
      </section>
      <section class="quran-nav-grid" aria-label="${escapeHtml(copy.quranNavigationAria)}">
${previousMarkup}
${indexMarkup}
${nextMarkup}
      </section>
${renderFaqSection(copy)}
    </section>`;
}

function renderDhikrSection(copy) {
  const categoryMarkup = copy.dhikrCategories.map(item => `          <a class="dhikr-category-chip${item.active ? " is-active" : ""}" data-dhikr-category="${escapeHtml(item.id)}" href="${escapeHtml(item.href)}" aria-pressed="${item.active ? "true" : "false"}"${item.active ? ' aria-current="page"' : ""}>
            <span>${escapeHtml(item.label)}</span>
            <strong>${item.itemCount}</strong>
          </a>`).join("\n");

  const cardMarkup = copy.dhikrItems.map(item => `          <article class="dhikr-card" data-dhikr-card data-dhikr-item="${escapeHtml(item.id)}" data-dhikr-category="${escapeHtml(item.category)}" data-dhikr-target="${item.countTarget}">
            <div class="dhikr-card-head">
              <span class="dhikr-card-category">${escapeHtml(item.categoryLabel)}</span>
              <span class="dhikr-card-target">${escapeHtml(item.targetLabel)}</span>
            </div>
            <div class="dhikr-card-badges" aria-label="${escapeHtml(copy.dhikrEvidenceAria)}">
              <span class="dhikr-meta-badge is-grade">${escapeHtml(item.authenticityLabel)}</span>
              <span class="dhikr-meta-badge">${escapeHtml(item.reference)}</span>
              ${item.countModeLabel ? `<span class="dhikr-meta-badge is-guided">${escapeHtml(item.countModeLabel)}</span>` : ""}
            </div>
            <p class="dhikr-card-arabic">${escapeHtml(item.arabic)}</p>
            <p class="dhikr-card-transliteration">${escapeHtml(item.transliteration)}</p>
            <p class="dhikr-card-translation">${escapeHtml(item.translation)}</p>
            <p class="dhikr-card-focus">${escapeHtml(item.focus)}</p>
            <div class="dhikr-card-meta">
              <span>${escapeHtml(item.sourceLabel)}</span>
              <span>${escapeHtml(item.guidance)}</span>
            </div>
            <div class="dhikr-counter" aria-label="${escapeHtml(copy.dhikrCounterAria)}">
              <button type="button" class="dhikr-counter-btn" data-dhikr-action="decrement" aria-label="${escapeHtml(copy.dhikrDecrementLabel)}">-</button>
              <strong class="dhikr-counter-value" data-dhikr-count>0</strong>
              <button type="button" class="dhikr-counter-btn" data-dhikr-action="increment" aria-label="${escapeHtml(copy.dhikrIncrementLabel)}">+</button>
            </div>
            <div class="dhikr-progress-block">
              <div class="dhikr-progress-bar" aria-hidden="true">
                <span class="dhikr-progress-fill" data-dhikr-progress-fill style="width:0%"></span>
              </div>
              <p class="dhikr-progress-text" data-dhikr-progress-text>${escapeHtml(item.progressText)}</p>
            </div>
            <button type="button" class="dhikr-reset-btn" data-dhikr-action="reset">${escapeHtml(copy.dhikrResetItemLabel)}</button>
          </article>`).join("\n");

  return `    <section class="dhikr-dashboard" aria-labelledby="dhikr-dashboard-heading">
      <section class="card dhikr-summary-card" aria-labelledby="dhikr-summary-heading">
        <div class="section-head">
          <div>
            <p class="eyebrow">${escapeHtml(copy.dhikrSummaryEyebrow)}</p>
            <h2 id="dhikr-summary-heading">${escapeHtml(copy.dhikrSummaryTitle)}</h2>
          </div>
          <p id="dhikr-active-category" class="muted">${escapeHtml(copy.dhikrCurrentCategoryText)}</p>
        </div>
        <div class="dhikr-summary-grid">
          <div class="dhikr-summary-stat">
            <span>${escapeHtml(copy.dhikrSummaryCompletedLabel)}</span>
            <strong id="dhikr-summary-completed">${escapeHtml(copy.dhikrSummaryCompletedValue)}</strong>
          </div>
          <div class="dhikr-summary-stat">
            <span>${escapeHtml(copy.dhikrSummaryRepetitionsLabel)}</span>
            <strong id="dhikr-summary-repetitions">${escapeHtml(copy.dhikrSummaryRepetitionsValue)}</strong>
          </div>
          <div class="dhikr-summary-stat">
            <span>${escapeHtml(copy.dhikrSummaryTargetLabel)}</span>
            <strong id="dhikr-summary-target">${escapeHtml(copy.dhikrSummaryTargetValue)}</strong>
          </div>
        </div>
        <div class="dhikr-summary-actions">
          <button type="button" id="dhikr-reset-visible" class="dhikr-summary-btn">${escapeHtml(copy.dhikrResetVisibleLabel)}</button>
          <button type="button" id="dhikr-reset-all" class="dhikr-summary-btn is-secondary">${escapeHtml(copy.dhikrResetAllLabel)}</button>
        </div>
      </section>
      <section class="card dhikr-collections-card" aria-labelledby="dhikr-dashboard-heading">
        <div class="section-head">
          <div>
            <p class="eyebrow">${escapeHtml(copy.dhikrSectionEyebrow)}</p>
            <h2 id="dhikr-dashboard-heading">${escapeHtml(copy.dhikrSectionTitle)}</h2>
          </div>
          ${copy.dhikrCollection && copy.dhikrCollection !== "all" ? `<a class="secondary-link" href="${escapeHtml(copy.dhikrCollectionIntroHref)}">${escapeHtml(copy.dhikrCollectionBackLabel)}</a>` : `<p class="muted">${escapeHtml(copy.dhikrSectionIntro)}</p>`}
        </div>
        ${copy.dhikrCollection && copy.dhikrCollection !== "all" ? `<p class="muted">${escapeHtml(copy.dhikrSectionIntro)}</p>` : ""}
        <div class="dhikr-category-row" role="group" aria-label="${escapeHtml(copy.dhikrCategoriesAria)}">
${categoryMarkup}
        </div>
        <div class="dhikr-card-grid" id="dhikr-card-grid">
${cardMarkup}
        </div>
      </section>
${renderFaqSection(copy)}
    </section>`;
}

function renderHadithSection(copy) {
  const renderCategoryChip = item => `          <a class="hadith-category-chip${item.active ? " is-active" : ""}" data-hadith-category="${escapeHtml(item.id)}" aria-pressed="${item.active ? "true" : "false"}" href="${escapeHtml(item.href)}">
            <span>${escapeHtml(item.label)}</span>
            <strong>${item.itemCount}</strong>
          </a>`;
  const primaryCategoryMarkup = copy.hadithPrimaryCategories.map(renderCategoryChip).join("\n");
  const overflowCategoryMarkup = copy.hadithOverflowCategories.map(renderCategoryChip).join("\n");
  const overflowMarkup = copy.hadithOverflowCategories.length
    ? `        <details class="hadith-category-more"${copy.hadithOverflowOpen ? " open" : ""}>
          <summary class="hadith-category-more-toggle">
            <span>${escapeHtml(copy.hadithCategoryMoreLabel)}</span>
            <strong>${copy.hadithOverflowCategories.length}</strong>
          </summary>
          <div class="hadith-category-overflow">
${overflowCategoryMarkup}
          </div>
        </details>`
    : "";

  const cardMarkup = copy.hadithItems.map(item => `          <article class="hadith-card" data-hadith-card data-hadith-item="${escapeHtml(item.id)}" data-hadith-category="${escapeHtml(item.category)}" data-search="${escapeHtml(item.search)}">
            <div class="hadith-card-head">
              <span class="hadith-card-category">${escapeHtml(item.categoryLabel)}</span>
              <span class="hadith-card-grade">${escapeHtml(item.gradeLabel)}</span>
            </div>
            <div class="hadith-card-badges" aria-label="${escapeHtml(copy.hadithSourceAria)}">
              <span class="dhikr-meta-badge is-grade">${escapeHtml(item.gradeLabel)}</span>
              <span class="dhikr-meta-badge">${escapeHtml(item.source)}</span>
              <span class="dhikr-meta-badge">${escapeHtml(copy.hadithNarratorLabel)}: ${escapeHtml(item.narrator)}</span>
            </div>
            <p class="hadith-card-arabic">${escapeHtml(item.arabic)}</p>
            <p class="hadith-card-translation">${escapeHtml(item.translation)}</p>
            <div class="hadith-card-meta">
              <span>${escapeHtml(copy.hadithTakeawayLabel)}</span>
              <span>${escapeHtml(item.lesson)}</span>
            </div>
          </article>`).join("\n");

  return `    <section class="hadith-dashboard" aria-labelledby="hadith-dashboard-heading">
      <section class="card hadith-collections-card" aria-labelledby="hadith-dashboard-heading">
        <div class="section-head">
          <div>
            <p class="eyebrow">${escapeHtml(copy.hadithSectionEyebrow)}</p>
            <h2 id="hadith-dashboard-heading">${escapeHtml(copy.hadithSectionTitle)}</h2>
          </div>
          <p id="hadith-search-count" class="muted">${escapeHtml(copy.hadithSearchCountText)}</p>
        </div>
        ${copy.hadithCollection && copy.hadithCollection !== "all" ? `<a class="secondary-link" href="${escapeHtml(copy.hadithCollectionIntroHref)}">${escapeHtml(copy.hadithCollectionBackLabel)}</a>` : `<p class="muted">${escapeHtml(copy.hadithSectionIntro)}</p>`}
        ${copy.hadithCollection && copy.hadithCollection !== "all" ? `<p class="muted">${escapeHtml(copy.hadithSectionIntro)}</p>` : ""}
        <div class="hadith-category-row" role="group" aria-label="${escapeHtml(copy.hadithCategoriesAria)}">
          <div class="hadith-category-primary">
${primaryCategoryMarkup}
          </div>
${overflowMarkup}
        </div>
        <div class="hadith-card-grid" id="hadith-card-grid">
${cardMarkup}
        </div>
        <p id="hadith-search-empty" class="muted hadith-empty-state" hidden>${escapeHtml(copy.hadithEmptyState)}</p>
      </section>
${renderFaqSection(copy)}
    </section>`;
}

function renderCitiesSection(copy) {
  const cityGroupsMarkup = (copy.priorityCityGroups || []).map(group => `        <div class="priority-link-group">
          <h3 class="priority-link-heading" data-priority-group-label="${escapeHtml(group.id)}">${escapeHtml(copy.priorityGroupLabels?.[group.id] || group.id)}</h3>
          <div class="priority-link-list">
${group.cities.map(item => `            <a class="priority-link city-name-link" href="${escapeHtml(buildRoutePath(copy.activeLanguage, "home", item.city))}" data-city="${escapeHtml(item.city)}" data-country="${escapeHtml(item.country)}">${escapeHtml(item.displayCity || item.city)}</a>`).join("\n")}
          </div>
        </div>`).join("\n");

  const intentGroupMarkup = `        <div class="priority-link-group">
          <h3 class="priority-link-heading" data-priority-group-label="intents">${escapeHtml(copy.priorityGroupLabels?.intents || "Priority intents")}</h3>
          <div class="priority-link-list">
${(copy.cityIntentLinks || copy.intentLinks || []).map(item => `            <a class="priority-link" href="${escapeHtml(item.href)}" data-route-type="${escapeHtml(item.type || "")}"${item.city ? ` data-city="${escapeHtml(item.city)}"` : ""}>${escapeHtml(item.label)}</a>`).join("\n")}
          </div>
        </div>`;

  return `    <section class="card prose" aria-labelledby="cities-heading">
      <p class="eyebrow">${escapeHtml(copy.citiesEyebrow)}</p>
      <h2 id="cities-heading">${escapeHtml(copy.citiesTitle)}</h2>
      <div class="priority-link-groups">
${cityGroupsMarkup}
${intentGroupMarkup}
      </div>
    </section>`;
}

function renderAboutArticle(copy) {
  return `      <article class="card prose" aria-labelledby="about-heading">
        <p class="eyebrow">${escapeHtml(copy.aboutEyebrow)}</p>
        <h2 id="about-heading">${escapeHtml(copy.aboutTitle)}</h2>
        <p>
          ${escapeHtml(copy.aboutParagraphs[0])}
        </p>
        <p>
          ${escapeHtml(copy.aboutParagraphs[1])}
        </p>
        <p>
          ${escapeHtml(copy.aboutParagraphs[2])}
        </p>
      </article>`;
}

function renderFaqSection(copy) {
  return `      <section class="card prose" aria-labelledby="faq-heading">
        <p class="eyebrow">${escapeHtml(copy.faqEyebrow)}</p>
        <h2 id="faq-heading">${escapeHtml(copy.faqTitle)}</h2>
        <div class="faq-list">
${copy.faq.map(item => `          <div>
            <h3>${escapeHtml(item.question)}</h3>
            <p>${escapeHtml(item.answer)}</p>
          </div>`).join("\n")}
        </div>
      </section>`;
}

function renderMainContent(copy) {
  if (copy.standalonePage) {
    if (copy.standalonePageType === "hadith" || copy.standalonePageType === "hadith-collection") {
      return `  <main class="shell main-content">
${renderHadithSection(copy)}
  </main>`;
    }

    if (copy.standalonePageType === "dhikr" || copy.standalonePageType === "dhikr-collection") {
      return `  <main class="shell main-content">
${renderDhikrSection(copy)}
  </main>`;
    }

    if (copy.standalonePageType === "quran") {
      return `  <main class="shell main-content">
${renderQuranIndexSection(copy)}
  </main>`;
    }

    if (copy.standalonePageType === "quran-surah") {
      return `  <main class="shell main-content">
${renderQuranSurahSection(copy)}
  </main>`;
    }

    return `  <main class="shell main-content">
${renderQiblaPanelSection(copy)}
  </main>`;
  }

  return `  <main class="shell main-content">
    <section class="content-grid">
${renderScheduleSection(copy)}

${renderInfoSection(copy)}
    </section>

${renderToolsSection(copy)}

${renderCitiesSection(copy)}

    <section class="seo-grid">
${renderAboutArticle(copy)}

${renderFaqSection(copy)}
    </section>
  </main>`;
}

function renderFooter(copy) {
  return `  <footer class="shell footer">
    <p>&copy; 2026 Adantimer. ${escapeHtml(copy.footerText)}</p>
  </footer>`;
}

function renderNoscript(copy) {
  return `  <noscript>
    <div class="noscript-banner">
      ${escapeHtml(copy.noscriptText)}
    </div>
  </noscript>`;
}

function renderInlineLinks(items, language) {
  if (!items.length) return "";
  if (items.length === 1) {
    return `<a href="${escapeHtml(items[0].href)}">${escapeHtml(items[0].label)}</a>.`;
  }
  const connector = INLINE_LINK_CONNECTORS[language] || "and";
  const last = items[items.length - 1];
  const rest = items.slice(0, -1)
    .map(item => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
    .join(", ");
  return `${rest}, ${connector} <a href="${escapeHtml(last.href)}">${escapeHtml(last.label)}</a>.`;
}

function buildToolHubCopy(language, pageType) {
  const locale = TOOL_HUB_CONTENT[language] || TOOL_HUB_CONTENT.en;
  const toolTypes = ["qibla", "quran", "dhikr", "hadith"];
  return {
    toolsEyebrow: locale.eyebrow,
    toolsTitle: locale.title,
    toolsIntro: "",
    toolCards: toolTypes.map(type => ({
      type,
      label: locale.items[type].label,
      description: locale.items[type].description,
      cta: locale.items[type].cta,
      href: buildRoutePath(language, type),
      active: pageType === type || (type === "dhikr" && pageType === "dhikr-collection")
    }))
  };
}

async function fetchJsonWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "accept": "application/json",
        "user-agent": "AdantimerQuranRenderer/1.0"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timerId);
  }
}

function mapQuranApiAyahs(payload) {
  const ayahs = Array.isArray(payload?.data?.ayahs) ? payload.data.ayahs : [];
  return ayahs
    .map(item => ({
      number: Number(item.numberInSurah || item.number || 0),
      text: String(item.text || "").trim()
    }))
    .filter(item => item.number > 0 && item.text);
}

async function getQuranSurahReaderData(surahMeta) {
  const cached = quranSurahCache.get(surahMeta.slug);
  if (cached && (Date.now() - cached.createdAt) < QURAN_SURAH_CACHE_TTL_MS) {
    return cached.value;
  }

  const endpoint = `${QURAN_API_BASE}/surah/${surahMeta.id}/quran-uthmani`;

  try {
    const payload = await fetchJsonWithTimeout(endpoint, QURAN_API_TIMEOUT_MS);
    const value = {
      ayahs: mapQuranApiAyahs(payload),
      hasFetchError: false
    };
    quranSurahCache.set(surahMeta.slug, { createdAt: Date.now(), value });
    return value;
  } catch (error) {
    return {
      ayahs: [],
      hasFetchError: true
    };
  }
}

function buildQuranIndexCopy(language, pageType) {
  if (pageType !== "quran") {
    return {
      quranSurahs: [],
      quranStats: [],
      quranStatsAria: "",
      quranSearchLabel: "",
      quranSearchPlaceholder: "",
      quranSearchHint: "",
      quranClearLabel: "",
      quranSearchCountText: "",
      quranEmptyState: "",
      quranSectionEyebrow: "",
      quranSectionTitle: "",
      quranSectionIntro: ""
    };
  }

  const locale = QURAN_INDEX_CONTENT[language] || QURAN_INDEX_CONTENT.en;
  const revelationLocale = REVELATION_LABELS[language] || REVELATION_LABELS.en;
  const quranClearLabels = {
    en: "Clear search",
    ar: "مسح البحث",
    de: "Suche löschen",
    fr: "Effacer la recherche",
    tr: "Aramayi temizle",
    "zh-hans": "清除搜索"
  };
  const surahs = QURAN_SURAHS.map(item => {
    const revelationKey = item.revelation === "madinah" || item.revelation === "medinan"
      ? "medinan"
      : "meccan";
    const revelationLabel = revelationLocale[revelationKey];
    const localizedName = item.translatedName || item.nameSimple;
    return {
      id: item.id,
      slug: item.slug,
      name: item.nameSimple,
      translatedName: localizedName,
      arabicName: item.nameArabic,
      revelationLabel,
      ayahCountLabel: language === "ar"
        ? `${item.ayahs} آية`
        : language === "de"
          ? `${item.ayahs} Verse`
          : language === "fr"
            ? `${item.ayahs} versets`
            : language === "tr"
              ? `${item.ayahs} ayet`
              : language === "zh-hans"
                ? `${item.ayahs} 节`
                : `${item.ayahs} ayahs`,
      href: buildRoutePath(language, "quran-surah", "", item.slug),
      search: [
        item.id,
        item.slug,
        item.nameSimple,
        item.nameArabic,
        item.translatedName,
        revelationLabel,
        revelationKey
      ].join(" ").toLowerCase()
    };
  });

  return {
    heroEyebrow: locale.heroEyebrow,
    heroHeading: locale.heroHeading,
    heroSubtitle: locale.heroSubtitle,
    metaTitle: locale.metaTitle,
    metaDescription: locale.metaDescription,
    quranSearchLabel: locale.searchLabel,
    quranSearchPlaceholder: locale.searchPlaceholder,
    quranSearchHint: locale.searchHint,
    quranClearLabel: quranClearLabels[language] || quranClearLabels.en,
    quranSearchCountText: locale.searchCount(surahs.length),
    quranEmptyState: locale.emptyState,
    quranStats: locale.stats,
    quranStatsAria: locale.heroHeading,
    quranSectionEyebrow: locale.sectionEyebrow,
    quranSectionTitle: locale.sectionTitle,
    quranSectionIntro: locale.sectionIntro,
    quranSurahs: surahs,
    faq: locale.faq,
    footerText: locale.footerText,
    noscriptText: locale.noscriptText
  };
}

const HADITH_INDEX_CONTENT = {
  en: {
    heroEyebrow: "Hadith",
    heroTitle: "Build a stronger hadith reading and study habit",
    heroSubtitle: "Use a curated hadith page for short daily reading, topic-based study, and direct return visits across a growing set of themes.",
    searchLabel: "Search hadith",
    searchPlaceholder: "Search by theme, narrator, source, or keyword",
    searchHint: "Filter by theme, narrator, source, or study topic such as repentance, parents, speech, neighbors, humility, generosity, and more.",
    searchCount: count => `${count} hadith entries`,
    emptyState: "No hadith matched this search or category yet.",
    sectionEyebrow: "Collections",
    sectionTitle: "Curated hadith for daily reading and steady study",
    sectionIntro: "Move through topic pages built for repeat reading, stronger study habits, and quick return visits across core hadith themes.",
    stats: [
      { value: "6", label: "Themes" },
      { value: "6", label: "Entries" },
      { value: "Local", label: "SSR source" }
    ],
    categoryAllLabel: "All hadith",
    categoryMoreLabel: "More filters",
    sourceAria: "Hadith source details",
    narratorLabel: "Narrator",
    takeawayLabel: "Why it matters",
    metaTitle: "Daily Hadith Reading Page | Adantimer",
    metaDescription: "Read curated hadith with visible sources, short lessons, and study themes covering worship, repentance, family, speech, neighbors, generosity, humility, and more.",
    faq: [
      {
        question: "Does this hadith page focus on short daily reading?",
        answer: "Yes. The hadith page is built for quick reading, return visits, and steady topic study instead of trying to be a massive hadith database."
      },
      {
        question: "Can I filter hadith by topic?",
          answer: "Yes. You can move between a growing set of study themes covering worship, character, family, repentance, speech, neighbors, generosity, humility, and more."
      },
      {
        question: "Does each card keep its source visible?",
        answer: "Yes. Each hadith card keeps the source, grade label, and narrator visible alongside the text and lesson."
      }
    ],
    footerText: "Curated hadith reading and focused study pages inside Adantimer.",
    noscriptText: "JavaScript is only needed for the hadith filter. The hadith content itself is already visible."
  },
  ar: {
    heroEyebrow: "الحديث",
    heroTitle: "اقرأ صفحة حديث مركزة بلا تشتيت",
    heroSubtitle: "استخدم صفحة حديث منتقاة للقراءة اليومية القصيرة مع تصفية سريعة حسب الموضوع وعودة مباشرة لاحقا.",
    searchLabel: "ابحث في الحديث",
    searchPlaceholder: "ابحث حسب الموضوع أو الراوي أو المصدر أو الكلمة",
    searchHint: "يمكنك التصفية بين النيات والصلاة والأخلاق والعلم والشكر والرحمة.",
    searchCount: count => `${count} أحاديث`,
    emptyState: "لا يوجد حديث يطابق هذا البحث أو هذا الموضوع حاليا.",
    sectionEyebrow: "الموضوعات",
    sectionTitle: "أحاديث منتقاة للقراءة اليومية",
    sectionIntro: "تنقل بين الموضوعات الأساسية وابق الصفحة مركزة للقراءة السريعة والعودة المتكررة.",
    stats: [
      { value: "6", label: "موضوعات" },
      { value: "6", label: "أحاديث" },
      { value: "محلي", label: "مصدر الصفحة" }
    ],
    categoryAllLabel: "جميع الأحاديث",
    sourceAria: "تفاصيل مصدر الحديث",
    narratorLabel: "الراوي",
    takeawayLabel: "الفائدة",
    metaTitle: "صفحة حديث يومي للقراءة | Adantimer",
    metaDescription: "اقرأ أحاديث منتقاة مع موضوعات مركزة وملاحظات المصدر وفوائد قصيرة للصلاة والأخلاق والعلم والشكر والرحمة والنيات.",
    faq: [
      {
        question: "هل صفحة الحديث هذه مخصصة للقراءة اليومية القصيرة؟",
        answer: "نعم. النسخة الأولى من صفحة الحديث مبنية للقراءة السريعة والعودة المتكررة، لا كقاعدة بيانات ضخمة."
      },
      {
        question: "هل أستطيع تصفية الأحاديث حسب الموضوع؟",
        answer: "نعم. يمكنك التنقل بين النيات والصلاة والأخلاق والعلم والشكر والرحمة."
      },
      {
        question: "هل يبقى المصدر ظاهرا في كل بطاقة؟",
        answer: "نعم. كل بطاقة تعرض المصدر ودرجة الحديث واسم الراوي مع النص والفائدة المختصرة."
      }
    ],
    footerText: "قراءة حديث منتقاة وصفحات مراجعة مركزة داخل Adantimer.",
    noscriptText: "يحتاج فلتر الحديث فقط إلى JavaScript، أما محتوى الحديث نفسه فهو ظاهر بالفعل."
  },
  de: {
    heroEyebrow: "Hadith",
    heroTitle: "Eine fokussierte Hadith-Seite fuer kurze taegliche Lesemomente",
    heroSubtitle: "Nutze eine kuratierte Hadith-Seite fuer kurze taegliche Lesepausen, schnelle Themenfilter und spaetere direkte Rueckkehr.",
    searchLabel: "Hadith durchsuchen",
    searchPlaceholder: "Nach Thema, Ueberlieferer, Quelle oder Stichwort suchen",
    searchHint: "Filtere nach Thema, Ueberlieferer, Quelle oder Lernfeld wie Reue, Eltern, Sprache, Nachbarn, Demut, Grosszuegigkeit und mehr.",
    searchCount: count => `${count} Hadith-Eintraege`,
    emptyState: "Kein Hadith passt gerade zu dieser Suche oder Kategorie.",
    sectionEyebrow: "Themen",
    sectionTitle: "Kuratierte Hadithe fuer taegliches Lesen und Lernen",
    sectionIntro: "Wechsle zwischen thematischen Hadith-Seiten und halte die Seite auf kurze, wiederkehrende Lese- und Lernsitzungen ausgerichtet.",
    stats: [
      { value: "6", label: "Themen" },
      { value: "6", label: "Eintraege" },
      { value: "Lokal", label: "SSR-Quelle" }
    ],
    categoryAllLabel: "Alle Hadithe",
    categoryMoreLabel: "Weitere Filter",
    sourceAria: "Hadith-Quellenangaben",
    narratorLabel: "Ueberlieferer",
    takeawayLabel: "Warum es wichtig ist",
    metaTitle: "Hadith-Seite fuer taegliches Lesen | Adantimer",
    metaDescription: "Lies kuratierte Hadithe mit sichtbaren Quellen, kurzen Lektionen und Lernthemen zu Gottesdienst, Reue, Familie, Sprache, Nachbarn, Grosszuegigkeit, Demut und mehr.",
    faq: [
      {
        question: "Ist diese Hadith-Seite fuer kurze taegliche Lesemomente gebaut?",
        answer: "Ja. Die Hadith-Seite ist fuer schnelles Lesen, spaetere Rueckkehr und stetiges Themenlernen gebaut und nicht als riesige Hadith-Datenbank."
      },
      {
        question: "Kann ich Hadithe nach Thema filtern?",
         answer: "Ja. Du kannst zwischen einer wachsenden Menge an Lernthemen zu Gottesdienst, Charakter, Familie, Reue, Sprache, Nachbarn, Grosszuegigkeit, Demut und mehr wechseln."
      },
      {
        question: "Bleibt die Quelle in jeder Karte sichtbar?",
        answer: "Ja. Jede Karte zeigt Quelle, Bewertungslabel und Ueberlieferer zusammen mit Text und kurzer Einordnung."
      }
    ],
    footerText: "Kuratierte Hadith-Leseseiten und fokussierte Lernpfade in Adantimer.",
    noscriptText: "JavaScript wird nur fuer den Hadith-Filter benoetigt. Der Hadith-Inhalt selbst ist bereits sichtbar."
  },
  fr: {
    heroEyebrow: "Hadith",
    heroTitle: "Une page hadith concentree pour la lecture quotidienne",
    heroSubtitle: "Utilisez une page hadith selectionnee pour des lectures courtes, un filtrage rapide par theme et des retours simples.",
    searchLabel: "Rechercher un hadith",
    searchPlaceholder: "Rechercher par theme, rapporteur, source ou mot-cle",
    searchHint: "Filtrez par theme, rapporteur, source ou parcours d'etude comme le repentir, les parents, la parole, les voisins, l'humilite, la generosite et plus encore.",
    searchCount: count => `${count} hadiths`,
    emptyState: "Aucun hadith ne correspond a cette recherche ou a cette categorie.",
    sectionEyebrow: "Themes",
    sectionTitle: "Hadiths selectionnes pour la lecture quotidienne",
    sectionIntro: "Passez d'un theme central a l'autre et gardez la page orientee vers des sessions de lecture courtes et regulieres.",
    stats: [
      { value: "6", label: "Themes" },
      { value: "6", label: "Entrees" },
      { value: "Local", label: "Source SSR" }
    ],
    categoryAllLabel: "Tous les hadiths",
    categoryMoreLabel: "Plus de filtres",
    sourceAria: "Details de source du hadith",
    narratorLabel: "Rapporteur",
    takeawayLabel: "Pourquoi c'est important",
    metaTitle: "Page hadith pour la lecture quotidienne | Adantimer",
    metaDescription: "Lisez des hadiths selectionnes avec sources visibles, courtes lecons et themes d'etude sur l'adoration, le repentir, la famille, la parole, les voisins, la generosite, l'humilite et plus encore.",
    faq: [
      {
        question: "Cette page hadith est-elle faite pour une lecture quotidienne courte ?",
        answer: "Oui. Cette page hadith est concue pour la lecture rapide, les retours reguliers et une etude thematique continue, pas comme une enorme base de donnees."
      },
      {
        question: "Puis-je filtrer les hadiths par theme ?",
        answer: "Oui. Vous pouvez passer entre un ensemble croissant de themes d'etude sur l'adoration, le comportement, la famille, le repentir, la parole, les voisins, la generosite, l'humilite et plus encore."
      },
      {
        question: "La source reste-t-elle visible sur chaque carte ?",
        answer: "Oui. Chaque carte garde la source, le niveau et le rapporteur visibles avec le texte et la lecon."
      }
    ],
    footerText: "Lecture de hadiths selectionnes et pages d'etude concentrees dans Adantimer.",
    noscriptText: "JavaScript est seulement necessaire pour le filtre hadith. Le contenu des hadiths est deja visible."
  },
  tr: {
    heroEyebrow: "Hadis",
    heroTitle: "Gunluk okuma icin odakli bir hadis sayfasi",
    heroSubtitle: "Kisa gunluk okumalar, hizli konu filtreleri ve kolay geri donusler icin secilmis bir hadis sayfasi kullan.",
    searchLabel: "Hadis ara",
    searchPlaceholder: "Konu, ravi, kaynak veya anahtar kelime ara",
    searchHint: "Konu, ravi, kaynak veya tevbe, anne-baba, konusma, komsular, tevazu, comertlik ve benzeri calisma basliklarina gore filtrele.",
    searchCount: count => `${count} hadis`,
    emptyState: "Bu arama veya kategori icin eslesen hadis bulunmadi.",
    sectionEyebrow: "Temalar",
    sectionTitle: "Gunluk okuma icin secilmis hadisler",
    sectionIntro: "Temel hadis konulari arasinda gecis yap ve sayfayi kisa ama duzenli okuma oturumlari icin odakli tut.",
    stats: [
      { value: "6", label: "Tema" },
      { value: "6", label: "Giris" },
      { value: "Yerel", label: "SSR kaynagi" }
    ],
    categoryAllLabel: "Tum hadisler",
    categoryMoreLabel: "Daha fazla filtre",
    sourceAria: "Hadis kaynak bilgileri",
    narratorLabel: "Ravi",
    takeawayLabel: "Neden onemli",
    metaTitle: "Gunluk hadis okuma sayfasi | Adantimer",
    metaDescription: "Ibadet, tevbe, aile, konusma, komsular, comertlik, tevazu ve daha fazlasi hakkinda secilmis hadisleri kaynak notlari ve kisa derslerle oku.",
    faq: [
      {
        question: "Bu hadis sayfasi kisa gunluk okumalar icin mi hazirlandi?",
        answer: "Evet. Hadis sayfasi hizli okuma, tekrar donus ve surekli konu calismasi icin kuruldu; devasa bir hadis veritabani olmak icin degil."
      },
      {
        question: "Hadisleri konuya gore filtreleyebilir miyim?",
        answer: "Evet. Ibadet, ahlak, aile, tevbe, konusma, komsular, comertlik, tevazu ve daha fazlasini kapsayan buyuyen konu basliklari arasinda gecis yapabilirsin."
      },
      {
        question: "Kaynak her kartta gorunur mu?",
        answer: "Evet. Her kart, metin ve kisa dersle birlikte kaynak, derece ve ravi bilgisini gorunur tutar."
      }
    ],
    footerText: "Adantimer icinde secilmis hadis okumalari ve odakli calisma sayfalari.",
    noscriptText: "JavaScript sadece hadis filtresi icin gerekir. Hadis icerigi zaten gorunur."
  },
  "zh-hans": {
    heroEyebrow: "Hadith",
    heroTitle: "适合每日短读的圣训页面",
    heroSubtitle: "使用一页经过精选的圣训页面，进行简短每日阅读、快速主题筛选和后续回访。",
    searchLabel: "搜索圣训",
    searchPlaceholder: "按主题、传述人、来源或关键词搜索",
    searchHint: "可按举意、礼拜、品德、知识、感恩和怜悯筛选。",
    searchCount: count => `${count} 条圣训`,
    emptyState: "当前没有与这次搜索或分类匹配的圣训。",
    sectionEyebrow: "主题",
    sectionTitle: "适合每日阅读的精选圣训",
    sectionIntro: "在核心圣训主题之间切换，让页面保持适合短时、重复访问的阅读模式。",
    stats: [
      { value: "6", label: "主题" },
      { value: "6", label: "条目" },
      { value: "本地", label: "SSR来源" }
    ],
    categoryAllLabel: "全部圣训",
    sourceAria: "圣训来源信息",
    narratorLabel: "传述人",
    takeawayLabel: "核心提醒",
    metaTitle: "每日圣训阅读页面 | Adantimer",
    metaDescription: "阅读精选圣训，配有清晰主题、来源说明和简短提醒，涵盖礼拜、品德、知识、感恩、怜悯与举意。",
    faq: [
      {
        question: "这页圣训页面是为简短每日阅读设计的吗？",
        answer: "是的。第一版圣训页面主要服务于快速阅读和再次回访，而不是庞大的圣训数据库。"
      },
      {
        question: "我可以按主题筛选圣训吗？",
        answer: "可以。你可以在举意、礼拜、品德、知识、感恩和怜悯之间切换。"
      },
      {
        question: "每张卡片都会显示来源吗？",
        answer: "会。每张卡片都会同时显示来源、等级、传述人以及正文和简短提醒。"
      }
    ],
    footerText: "Adantimer 内的精选圣训阅读与专注学习页面。",
    noscriptText: "JavaScript 只用于圣训筛选，圣训内容本身已经可见。"
  }
};

const DHIKR_INDEX_CONTENT = {
  en: {
    heroEyebrow: "Dhikr",
    heroTitle: "Track daily dhikr without leaving the browser",
    heroSubtitle: "Use curated daily adhkar with source notes, move between focused collections for forgiveness, provision, ease, distress, healing, sleep, and more, and keep your progress saved locally on this device.",
    summaryEyebrow: "Today",
    summaryTitle: "Dhikr session progress",
    summaryCompletedLabel: "Completed entries",
    summaryRepetitionsLabel: "Repetitions done",
    summaryTargetLabel: "Target repetitions",
    sectionEyebrow: "Collections",
    sectionTitle: "Daily dhikr collections",
    sectionIntro: "Move between curated collections with source notes, keep one category in focus, and reset only the entries you want to revisit.",
    currentCategory: label => `Current collection: ${label}`,
    resetVisibleLabel: "Reset current collection",
    resetAllLabel: "Reset all counters",
    counterAria: "Dhikr counter controls",
    decrementLabel: "Decrease counter",
    incrementLabel: "Increase counter",
    resetItemLabel: "Reset entry",
    progressText: (value, target) => `${value} of ${target} completed`,
    targetLabel: target => `${target}x target`,
    statsLabelCollections: "Collections",
    statsLabelEntries: "Entries",
    statsLabelStorage: "Saved in browser",
    statsStorageValue: "Local",
    categoriesAria: "Dhikr collections",
    metaTitle: "Dhikr Counter and Daily Remembrance Page | Adantimer",
    metaDescription: "Track curated daily dhikr with counters, source notes, and browser-saved progress across morning, evening, after-prayer, forgiveness, provision, ease, distress, healing, sleep, and general remembrance.",
    faq: [
      {
        question: "Does this dhikr page save my progress?",
        answer: "Yes. The counters are stored in your browser on this device, so your current progress can remain available when you return."
      },
      {
        question: "Can I focus on one collection at a time?",
        answer: "Yes. The page lets you move between collections such as morning, evening, after-prayer, forgiveness, provision, ease, distress, healing, sleep, and general dhikr."
      },
      {
        question: "Do I need an app or login to use the counters?",
        answer: "No. The first dhikr version works directly in the browser and does not require an account."
      }
    ],
    footerText: "Daily dhikr counters and focused remembrance tools inside Adantimer.",
    noscriptText: "JavaScript is needed for the live dhikr counters. The dhikr text itself is already visible."
  },
  ar: {
    heroEyebrow: "الذكر",
    heroTitle: "تابع ذكرك اليومي مباشرة من المتصفح",
    heroSubtitle: "استخدم عدادات مركزة لأذكار يومية مشهورة، وانتقل بين المجموعات الأساسية، واحتفظ بتقدمك محلياً على هذا الجهاز.",
    summaryEyebrow: "اليوم",
    summaryTitle: "تقدم جلسة الذكر",
    summaryCompletedLabel: "الأذكار المكتملة",
    summaryRepetitionsLabel: "مرات التكرار",
    summaryTargetLabel: "العدد المستهدف",
    sectionEyebrow: "المجموعات",
    sectionTitle: "مجموعات الذكر اليومية",
    sectionIntro: "ابدأ بمجموعة مركزة، وتابع بالسرعة التي تناسبك، ثم أعد فقط الجزء الذي تريد تكراره من جديد.",
    currentCategory: label => `المجموعة الحالية: ${label}`,
    resetVisibleLabel: "إعادة مجموعة الحالية",
    resetAllLabel: "إعادة جميع العدادات",
    counterAria: "عناصر عداد الذكر",
    decrementLabel: "تقليل العداد",
    incrementLabel: "زيادة العداد",
    resetItemLabel: "إعادة الذكر",
    progressText: (value, target) => `${value} من ${target} مكتمل`,
    targetLabel: target => `الهدف ${target} مرة`,
    statsLabelCollections: "المجموعات",
    statsLabelEntries: "الأذكار",
    statsLabelStorage: "حفظ المتصفح",
    statsStorageValue: "محلي",
    categoriesAria: "مجموعات الذكر",
    metaTitle: "صفحة الذكر والعداد اليومي | Adantimer",
    metaDescription: "تابع الذكر اليومي بعدادات مركزة وفلاتر للمجموعات وحفظ محلي في المتصفح لأذكار الصباح والمساء وما بعد الصلاة والاستغفار والذكر العام.",
    faq: [
      {
        question: "هل تحفظ صفحة الذكر تقدمي؟",
        answer: "نعم. يتم حفظ العدادات داخل متصفحك على هذا الجهاز حتى يبقى تقدمك الحالي متاحاً عند العودة."
      },
      {
        question: "هل أستطيع التركيز على مجموعة واحدة فقط؟",
        answer: "نعم. يمكنك التنقل بين مجموعات مثل أذكار الصباح والمساء وما بعد الصلاة والاستغفار والذكر العام."
      },
      {
        question: "هل أحتاج إلى تطبيق أو تسجيل دخول؟",
        answer: "لا. النسخة الأولى من صفحة الذكر تعمل مباشرة في المتصفح ولا تحتاج إلى حساب."
      }
    ],
    footerText: "عدادات ذكر يومية وأدوات تذكير مركزة داخل Adantimer.",
    noscriptText: "يحتاج عداد الذكر التفاعلي إلى JavaScript، أما نصوص الذكر نفسها فهي ظاهرة بالفعل."
  },
  de: {
    heroEyebrow: "Dhikr",
    heroTitle: "Täglichen Dhikr direkt im Browser verfolgen",
    heroSubtitle: "Nutze kuratierte tägliche Adhkar mit Quellenhinweisen, wechsle zwischen Sammlungen für Vergebung, Rizq, Erleichterung, Bedrängnis, Heilung, Schlaf und mehr, und behalte deinen Fortschritt lokal auf diesem Gerät.",
    summaryEyebrow: "Heute",
    summaryTitle: "Fortschritt deiner Dhikr-Session",
    summaryCompletedLabel: "Erledigte Einträge",
    summaryRepetitionsLabel: "Wiederholungen",
    summaryTargetLabel: "Zielwiederholungen",
    sectionEyebrow: "Sammlungen",
    sectionTitle: "Tägliche Dhikr-Sammlungen",
    sectionIntro: "Wechsle zwischen kuratierten Sammlungen mit Quellenhinweisen, halte eine Kategorie im Fokus und setze nur die Einträge zurück, die du erneut beginnen willst.",
    currentCategory: label => `Aktive Sammlung: ${label}`,
    resetVisibleLabel: "Aktive Sammlung zurücksetzen",
    resetAllLabel: "Alle Zähler zurücksetzen",
    counterAria: "Dhikr-Zähler",
    decrementLabel: "Zähler verringern",
    incrementLabel: "Zähler erhöhen",
    resetItemLabel: "Eintrag zurücksetzen",
    progressText: (value, target) => `${value} von ${target} erledigt`,
    targetLabel: target => `${target}x Ziel`,
    statsLabelCollections: "Sammlungen",
    statsLabelEntries: "Einträge",
    statsLabelStorage: "Im Browser gespeichert",
    statsStorageValue: "Lokal",
    categoriesAria: "Dhikr-Sammlungen",
    metaTitle: "Dhikr-Zähler und tägliche Adhkar | Adantimer",
    metaDescription: "Verfolge kuratierte tägliche Adhkar mit Zählern, Quellenhinweisen und lokal gespeicherten Fortschritten für Morgen, Abend, nach dem Gebet, Vergebung, Rizq, Erleichterung, Bedrängnis, Heilung, Schlaf und allgemeinen Dhikr.",
    faq: [
      {
        question: "Speichert diese Dhikr-Seite meinen Fortschritt?",
        answer: "Ja. Die Zähler werden lokal in deinem Browser auf diesem Gerät gespeichert, damit dein aktueller Stand beim nächsten Besuch erhalten bleiben kann."
      },
      {
        question: "Kann ich nur eine Sammlung gleichzeitig nutzen?",
        answer: "Ja. Du kannst zwischen Sammlungen wie Morgen, Abend, nach dem Gebet, Vergebung, Rizq, Erleichterung, Bedrängnis, Heilung, Schlaf und allgemeinem Dhikr wechseln."
      },
      {
        question: "Brauche ich eine App oder ein Konto?",
        answer: "Nein. Die erste Dhikr-Version läuft direkt im Browser und benötigt keinen Login."
      }
    ],
    footerText: "Tägliche Dhikr-Zähler und fokussierte Erinnerungsseiten in Adantimer.",
    noscriptText: "Für die interaktiven Dhikr-Zähler wird JavaScript benötigt. Der Dhikr-Inhalt selbst ist bereits sichtbar."
  },
  fr: {
    heroEyebrow: "Dhikr",
    heroTitle: "Suivre le dhikr quotidien directement dans le navigateur",
    heroSubtitle: "Utilisez des compteurs concentres pour des adhkar quotidiens connus, passez d'une collection a l'autre et gardez votre progression enregistre localement sur cet appareil.",
    summaryEyebrow: "Aujourd'hui",
    summaryTitle: "Progression de la session de dhikr",
    summaryCompletedLabel: "Entrees terminees",
    summaryRepetitionsLabel: "Repetitions",
    summaryTargetLabel: "Objectif total",
    sectionEyebrow: "Collections",
    sectionTitle: "Collections quotidiennes de dhikr",
    sectionIntro: "Commencez avec une collection claire, avancez a votre rythme et reinitialisez seulement la partie que vous voulez recommencer.",
    currentCategory: label => `Collection active : ${label}`,
    resetVisibleLabel: "Reinitialiser la collection active",
    resetAllLabel: "Reinitialiser tous les compteurs",
    counterAria: "Compteur de dhikr",
    decrementLabel: "Diminuer le compteur",
    incrementLabel: "Augmenter le compteur",
    resetItemLabel: "Reinitialiser l'entree",
    progressText: (value, target) => `${value} sur ${target} termines`,
    targetLabel: target => `objectif ${target}x`,
    statsLabelCollections: "Collections",
    statsLabelEntries: "Entrees",
    statsLabelStorage: "Enregistre dans le navigateur",
    statsStorageValue: "Local",
    categoriesAria: "Collections de dhikr",
    metaTitle: "Compteur de dhikr et rappels quotidiens | Adantimer",
    metaDescription: "Suivez votre dhikr quotidien avec des compteurs concentres, des filtres de collection et une progression enregistree localement pour les rappels du matin, du soir, d'apres-priere et generaux.",
    faq: [
      {
        question: "Cette page de dhikr garde-t-elle ma progression ?",
        answer: "Oui. Les compteurs sont enregistres dans votre navigateur sur cet appareil afin que votre progression puisse rester disponible quand vous revenez."
      },
      {
        question: "Puis-je me concentrer sur une seule collection ?",
        answer: "Oui. Vous pouvez passer entre des collections comme matin, soir, apres la priere, pardon et dhikr general."
      },
      {
        question: "Faut-il une application ou un compte ?",
        answer: "Non. La premiere version de la page dhikr fonctionne directement dans le navigateur et ne demande aucun compte."
      }
    ],
    footerText: "Compteurs de dhikr quotidiens et pages de rappel concentrees dans Adantimer.",
    noscriptText: "JavaScript est necessaire pour les compteurs de dhikr. Le texte du dhikr reste deja visible."
  },
  tr: {
    heroEyebrow: "Zikir",
    heroTitle: "Gunluk zikri dogrudan tarayicida takip et",
    heroSubtitle: "Bilinen gunluk zikirler icin odakli sayaçlar kullan, temel koleksiyonlar arasinda gecis yap ve ilerlemeni bu cihazda yerel olarak sakla.",
    summaryEyebrow: "Bugun",
    summaryTitle: "Zikir oturumu ilerlemesi",
    summaryCompletedLabel: "Tamamlanan girisler",
    summaryRepetitionsLabel: "Tekrar sayisi",
    summaryTargetLabel: "Toplam hedef",
    sectionEyebrow: "Koleksiyonlar",
    sectionTitle: "Gunluk zikir koleksiyonlari",
    sectionIntro: "Net bir koleksiyonla basla, kendi hizinda devam et ve sadece yeniden yapmak istedigin bolumu sifirla.",
    currentCategory: label => `Aktif koleksiyon: ${label}`,
    resetVisibleLabel: "Aktif koleksiyonu sifirla",
    resetAllLabel: "Tum sayaçlari sifirla",
    counterAria: "Zikir sayaci",
    decrementLabel: "Sayaci azalt",
    incrementLabel: "Sayaci artir",
    resetItemLabel: "Girisi sifirla",
    progressText: (value, target) => `${value} / ${target} tamamlandi`,
    targetLabel: target => `${target}x hedef`,
    statsLabelCollections: "Koleksiyon",
    statsLabelEntries: "Giris",
    statsLabelStorage: "Tarayicida saklanir",
    statsStorageValue: "Yerel",
    categoriesAria: "Zikir koleksiyonlari",
    metaTitle: "Zikir sayaci ve gunluk zikir sayfasi | Adantimer",
    metaDescription: "Sabah, aksam, namaz sonrasi ve genel zikirler icin odakli sayaçlar, kategori filtreleri ve tarayicida saklanan ilerleme ile gunluk zikri takip et.",
    faq: [
      {
        question: "Bu zikir sayfasi ilerlememi saklar mi?",
        answer: "Evet. Sayaçlar bu cihazdaki tarayicinda yerel olarak saklanir; boylece geri geldiginde mevcut ilerlemen korunabilir."
      },
      {
        question: "Tek bir koleksiyona odaklanabilir miyim?",
        answer: "Evet. Sabah, aksam, namaz sonrasi, istigfar ve genel zikir gibi koleksiyonlar arasinda gecis yapabilirsin."
      },
      {
        question: "Uygulama veya hesap gerekiyor mu?",
        answer: "Hayir. Ilk zikir surumu dogrudan tarayicida calisir ve hesap istemez."
      }
    ],
    footerText: "Adantimer icinde gunluk zikir sayaçlari ve odakli hatirlatici sayfalari.",
    noscriptText: "Canli zikir sayaclari icin JavaScript gerekir. Zikir metinleri ise zaten gorunur durumdadir."
  },
  "zh-hans": {
    heroEyebrow: "Dhikr",
    heroTitle: "直接在浏览器中追踪每日记念",
    heroSubtitle: "使用专注计数器完成常见每日 dhikr，在核心分类之间切换，并将进度保存在当前设备浏览器中。",
    summaryEyebrow: "今天",
    summaryTitle: "Dhikr 进度",
    summaryCompletedLabel: "完成条目",
    summaryRepetitionsLabel: "已完成次数",
    summaryTargetLabel: "总目标次数",
    sectionEyebrow: "分类",
    sectionTitle: "每日 dhikr 分类",
    sectionIntro: "先专注一组内容，按自己的节奏完成，并且只重置你想重新开始的那一部分。",
    currentCategory: label => `当前分类：${label}`,
    resetVisibleLabel: "重置当前分类",
    resetAllLabel: "重置全部计数",
    counterAria: "Dhikr 计数器",
    decrementLabel: "减少计数",
    incrementLabel: "增加计数",
    resetItemLabel: "重置条目",
    progressText: (value, target) => `已完成 ${value} / ${target}`,
    targetLabel: target => `${target} 次目标`,
    statsLabelCollections: "分类",
    statsLabelEntries: "条目",
    statsLabelStorage: "浏览器保存",
    statsStorageValue: "本地",
    categoriesAria: "Dhikr 分类",
    metaTitle: "Dhikr 计数器与每日记念页 | Adantimer",
    metaDescription: "通过专注计数器、分类切换和浏览器本地保存进度来追踪每日 dhikr，适用于晨间、晚间、礼拜后、求饶恕和通用记念。",
    faq: [
      {
        question: "这个 dhikr 页面会保存我的进度吗？",
        answer: "会。计数会保存在当前设备的浏览器中，因此你下次回来时可以继续当前进度。"
      },
      {
        question: "我可以一次只专注一个分类吗？",
        answer: "可以。你可以在晨间、晚间、礼拜后、求饶恕和通用 dhikr 分类之间切换。"
      },
      {
        question: "需要安装应用或登录吗？",
        answer: "不需要。第一版 dhikr 页面直接在浏览器中工作，不要求账户。"
      }
    ],
    footerText: "Adantimer 内的每日 dhikr 计数器与专注记念页面。",
    noscriptText: "互动式 dhikr 计数器需要 JavaScript，但 dhikr 内容本身已经显示。"
  }
};

const FEATURED_DHIKR_COLLECTION_IDS = ["morning", "evening", "after-prayer", "forgiveness", "provision", "distress", "healing", "sleep"];

const DHIKR_COLLECTION_CONTENT = {
  en: {
    eyebrow: "Dhikr Collection",
    sectionEyebrow: "Focused collection",
    indexTitle: "Browse all daily dhikr collections",
    titles: {
      morning: "Morning adhkar collection",
      evening: "Evening adhkar collection",
      "after-prayer": "After prayer adhkar collection",
      forgiveness: "Forgiveness and istighfar collection",
      provision: "Provision and rizq collection",
      distress: "Distress and relief collection",
      healing: "Healing and shifa collection",
      sleep: "Before sleep adhkar collection"
    },
    subtitles: {
      morning: "Keep the morning adhkar together on one focused page with counters, source notes, and a clean reset flow.",
      evening: "Stay with the evening dhikr collection on its own page and keep only these adhkar in view.",
      "after-prayer": "Use the post-prayer adhkar on a dedicated page built for the tasbih sequence after salah.",
      forgiveness: "Track istighfar and repentance-focused adhkar on a dedicated forgiveness page.",
      provision: "Keep provision and rizq-focused duas together on one page for steady daily repetition.",
      distress: "Use a focused page for adhkar recited in hardship, anxiety, and moments of constriction.",
      healing: "Keep healing and shifa-focused duas together on a page built for repeated recitation.",
      sleep: "Open the before-sleep adhkar on their own page and keep only night-time remembrance in view."
    },
    metaDescriptions: {
      morning: "Read and track morning adhkar with counters, source notes, and a focused daily dhikr page.",
      evening: "Read and track evening adhkar with counters, source notes, and a focused daily dhikr page.",
      "after-prayer": "Read and track after prayer adhkar with counters, source notes, and a focused daily dhikr page.",
      forgiveness: "Read and track forgiveness dhikr, istighfar, and repentance-focused adhkar with counters and source notes.",
      provision: "Read and track provision and rizq duas with counters, source notes, and a focused daily dhikr page.",
      distress: "Read and track distress and relief adhkar with counters, source notes, and a focused daily dhikr page.",
      healing: "Read and track healing and shifa duas with counters, source notes, and a focused daily dhikr page.",
      sleep: "Read and track before-sleep adhkar with counters, source notes, and a focused night dhikr page."
    },
    faq: label => [
      {
        question: `Does this ${label.toLowerCase()} page keep only one dhikr collection in focus?`,
        answer: `Yes. This page opens the ${label.toLowerCase()} collection directly so visitors can stay with one focused dhikr session instead of browsing every category at once.`
      },
      {
        question: `Does this ${label.toLowerCase()} page save my counter progress?`,
        answer: "Yes. Counter progress stays in the browser on this device, so you can come back to the same dhikr session later."
      },
      {
        question: `Can I move from ${label.toLowerCase()} back to the full dhikr index?`,
        answer: "Yes. The collection page keeps direct links back to the main dhikr page and to the other collections."
      }
    ]
  },
  de: {
    eyebrow: "Dhikr-Sammlung",
    sectionEyebrow: "Fokussierte Sammlung",
    indexTitle: "Alle täglichen Dhikr-Sammlungen ansehen",
    titles: {
      morning: "Morgendhikr-Sammlung",
      evening: "Abenddhikr-Sammlung",
      "after-prayer": "Dhikr nach dem Gebet",
      forgiveness: "Sammlung fuer Vergebung und Istighfar",
      provision: "Sammlung fuer Rizq und Versorgung",
      distress: "Sammlung fuer Bedraengnis und Erleichterung",
      healing: "Sammlung fuer Heilung und Schifa",
      sleep: "Sammlung fuer Dhikr vor dem Schlaf"
    },
    subtitles: {
      morning: "Halte die Morgendhikr auf einer eigenen fokussierten Seite mit Zählern, Quellenhinweisen und sauberem Reset-Ablauf zusammen.",
      evening: "Nutze die Abenddhikr auf einer eigenen Seite und behalte nur diese Sammlung im Blick.",
      "after-prayer": "Nutze die Adhkar nach dem Gebet auf einer eigenen Seite für die Tasbih-Folge nach dem Salah.",
      forgiveness: "Verfolge Istighfar und Dhikr der Reue auf einer eigenen Seite fuer Vergebung.",
      provision: "Halte Duas fuer Rizq und Versorgung auf einer eigenen fokussierten Seite fuer die taegliche Wiederholung zusammen.",
      distress: "Nutze eine eigene Seite fuer Adhkar bei Bedraengnis, Sorge und schweren Momenten.",
      healing: "Bündle Heilungs- und Schifa-Duas auf einer Seite, die fuer wiederholte Rezitation gebaut ist.",
      sleep: "Oeffne den Dhikr vor dem Schlaf auf einer eigenen Seite und behalte nur die Abend- und Nachtadhkar im Blick."
    },
    metaDescriptions: {
      morning: "Lies und verfolge Morgendhikr mit Zählern, Quellenhinweisen und einer fokussierten täglichen Dhikr-Seite.",
      evening: "Lies und verfolge Abenddhikr mit Zählern, Quellenhinweisen und einer fokussierten täglichen Dhikr-Seite.",
      "after-prayer": "Lies und verfolge Dhikr nach dem Gebet mit Zählern, Quellenhinweisen und einer fokussierten täglichen Dhikr-Seite.",
      forgiveness: "Lies und verfolge Vergebungs-Dhikr, Istighfar und reuebezogene Adhkar mit Zaehlern und Quellenhinweisen.",
      provision: "Lies und verfolge Rizq- und Versorgungs-Duas mit Zaehlern, Quellenhinweisen und einer fokussierten Dhikr-Seite.",
      distress: "Lies und verfolge Adhkar fuer Bedraengnis und Erleichterung mit Zaehlern, Quellenhinweisen und einer fokussierten Dhikr-Seite.",
      healing: "Lies und verfolge Heilungs- und Schifa-Duas mit Zaehlern, Quellenhinweisen und einer fokussierten Dhikr-Seite.",
      sleep: "Lies und verfolge Dhikr vor dem Schlaf mit Zaehlern, Quellenhinweisen und einer fokussierten Nacht-Dhikr-Seite."
    },
    faq: label => [
      {
        question: `Bleibt diese Seite auf die Sammlung ${label} fokussiert?`,
        answer: `Ja. Diese Seite öffnet die Sammlung ${label} direkt, damit du mit einer klaren Dhikr-Sitzung arbeiten kannst statt alle Kategorien gleichzeitig zu sehen.`
      },
      {
        question: `Speichert diese Seite meinen Fortschritt für ${label}?`,
        answer: "Ja. Die Zähler bleiben lokal im Browser auf diesem Gerät gespeichert, damit du später an derselben Sitzung weiterarbeiten kannst."
      },
      {
        question: `Kann ich von ${label} zurück zur gesamten Dhikr-Seite wechseln?`,
        answer: "Ja. Die Sammlungsseite verlinkt zurück zum vollständigen Dhikr-Index und zu den anderen Sammlungen."
      }
    ]
  }
};

function normalizeDhikrCollectionId(value) {
  const slug = slugify(String(value || ""));
  const aliases = {
    "before-sleep": "sleep",
    sleep: "sleep",
    "after-prayer": "after-prayer"
  };
  const resolved = aliases[slug] || slug;
  return getDhikrCategories().some(item => item.id === resolved) ? resolved : "";
}

function getDhikrCollectionRouteSlug(value) {
  const normalized = normalizeDhikrCollectionId(value);
  if (normalized === "sleep") return "before-sleep";
  return slugify(normalized || value || "");
}

function getDhikrCollectionCopy(language, collectionId, label) {
  const locale = DHIKR_COLLECTION_CONTENT[language] || DHIKR_COLLECTION_CONTENT.en;
  const fallback = DHIKR_COLLECTION_CONTENT.en;
  return {
    eyebrow: locale.eyebrow || fallback.eyebrow,
    sectionEyebrow: locale.sectionEyebrow || fallback.sectionEyebrow,
    indexTitle: locale.indexTitle || fallback.indexTitle,
    title: locale.titles?.[collectionId] || fallback.titles?.[collectionId] || `${label} dhikr collection`,
    subtitle: locale.subtitles?.[collectionId] || fallback.subtitles?.[collectionId] || `${label} dhikr collection with counters and source notes.`,
    metaDescription: locale.metaDescriptions?.[collectionId] || fallback.metaDescriptions?.[collectionId] || `${label} dhikr collection with counters, source notes, and browser-saved progress.`,
    faq: (locale.faq || fallback.faq)(label)
  };
}

const HADITH_COLLECTION_CONTENT = {
  en: {
    eyebrow: "Hadith topic",
    sectionEyebrow: "Study collection",
    indexTitle: "Back to all hadith",
    title: label => `${label} hadith collection`,
    subtitle: label => `Stay on a focused ${label.toLowerCase()} track with a smaller set of hadith, visible sources, and short study notes.`,
    metaDescription: label => `Read a focused ${label.toLowerCase()} hadith collection with visible sources, quick lessons, and a cleaner study flow inside Adantimer.`,
    faq: label => ([
      {
        question: `Is this page focused only on ${label.toLowerCase()} hadith?`,
        answer: `Yes. This route narrows the study view to ${label.toLowerCase()} so readers can go deeper without jumping across every topic at once.`
      },
      {
        question: "Do the source and grade stay visible here too?",
        answer: "Yes. Each card keeps the source, grade label, narrator, and short takeaway visible."
      },
      {
        question: "Can I still go back to the full hadith page?",
        answer: "Yes. Each topic page links back to the full hadith index so you can move between focused study and broad reading."
      }
    ])
  },
  ar: {
    eyebrow: "موضوع الحديث",
    sectionEyebrow: "مجموعة للمراجعة",
    indexTitle: "العودة إلى جميع الأحاديث",
    title: label => `مجموعة أحاديث ${label}`,
    subtitle: label => `ابق على مسار ${label} مع مجموعة أصغر من الأحاديث ومصادر ظاهرة وملاحظات مراجعة مختصرة.`,
    metaDescription: label => `اقرأ مجموعة مركزة من أحاديث ${label} مع المصادر الظاهرة والفوائد المختصرة داخل Adantimer.`,
    faq: label => ([
      {
        question: `هل هذه الصفحة مخصصة فقط لأحاديث ${label}؟`,
        answer: `نعم. هذا المسار يركز العرض على أحاديث ${label} حتى يتمكن الزائر من التعمق بدون التنقل بين جميع الموضوعات دفعة واحدة.`
      },
      {
        question: "هل يبقى المصدر والدرجة ظاهرين هنا أيضا؟",
        answer: "نعم. كل بطاقة تبقي المصدر ودرجة الحديث واسم الراوي والفائدة المختصرة ظاهرة."
      },
      {
        question: "هل يمكنني العودة إلى صفحة الحديث الكاملة؟",
        answer: "نعم. كل صفحة موضوعية تتضمن رابطا للعودة إلى فهرس الحديث الكامل."
      }
    ])
  },
  de: {
    eyebrow: "Hadith-Thema",
    sectionEyebrow: "Lernsammlung",
    indexTitle: "Zurueck zu allen Hadithen",
    title: label => `${label}-Hadithsammlung`,
    subtitle: label => `Bleibe bei ${label} in einem kleineren, fokussierten Lesestrom mit sichtbaren Quellen und kurzen Lernhinweisen.`,
    metaDescription: label => `Lies eine fokussierte Hadithsammlung zu ${label} mit sichtbaren Quellen, kurzen Lektionen und klarerem Lernfluss in Adantimer.`,
    faq: label => ([
      {
        question: `Ist diese Seite nur auf Hadithe zu ${label} fokussiert?`,
        answer: `Ja. Diese Route verengt die Ansicht auf ${label}, damit man tiefer lernen kann statt zwischen allen Themen zugleich zu springen.`
      },
      {
        question: "Bleiben Quelle und Einstufung auch hier sichtbar?",
        answer: "Ja. Jede Karte zeigt weiterhin Quelle, Einstufung, Ueberlieferer und kurze Einordnung."
      },
      {
        question: "Kann ich zur gesamten Hadith-Seite zurueckgehen?",
        answer: "Ja. Jede Themenseite verlinkt zurueck auf den kompletten Hadith-Index."
      }
    ])
  },
  fr: {
    eyebrow: "Theme hadith",
    sectionEyebrow: "Collection d'etude",
    indexTitle: "Retour a tous les hadiths",
    title: label => `Collection de hadiths sur ${label}`,
    subtitle: label => `Restez sur le theme ${label.toLowerCase()} avec un ensemble plus concentre, des sources visibles et de courtes notes d'etude.`,
    metaDescription: label => `Lisez une collection de hadiths concentree sur ${label.toLowerCase()} avec sources visibles, courtes lecons et flux d'etude plus clair dans Adantimer.`,
    faq: label => ([
      {
        question: `Cette page ne montre-t-elle que des hadiths sur ${label.toLowerCase()} ?`,
        answer: `Oui. Cette route resserre l'etude sur ${label.toLowerCase()} afin d'aller plus loin sans melanger tous les themes.`
      },
      {
        question: "La source et le niveau restent-ils visibles ici ?",
        answer: "Oui. Chaque carte conserve la source, le niveau, le rapporteur et la courte lecon."
      },
      {
        question: "Puis-je revenir a la page hadith complete ?",
        answer: "Oui. Chaque page thematique renvoie vers l'index hadith complet."
      }
    ])
  },
  tr: {
    eyebrow: "Hadis konusu",
    sectionEyebrow: "Calisma koleksiyonu",
    indexTitle: "Tum hadislere don",
    title: label => `${label} hadis koleksiyonu`,
    subtitle: label => `${label} basliginda daha dar bir secki, gorunur kaynaklar ve kisa notlarla odakli sekilde kal.`,
    metaDescription: label => `${label} konusuna odaklanan, kaynaklari gorunen ve kisa dersler iceren hadis koleksiyonunu Adantimer icinde oku.`,
    faq: label => ([
      {
        question: `Bu sayfa sadece ${label} hadislerine mi odaklanir?`,
        answer: `Evet. Bu rota gorunumu ${label} konusu ile sinirlar; boylece tum basliklar arasinda atlamadan daha derin calisabilirsin.`
      },
      {
        question: "Kaynak ve derece burada da gorunur mu?",
        answer: "Evet. Her kart kaynak, derece, ravi ve kisa dersi gorunur tutar."
      },
      {
        question: "Tam hadis sayfasina geri donebilir miyim?",
        answer: "Evet. Her konu sayfasi tam hadis indeksine geri donus baglantisi tasir."
      }
    ])
  },
  "zh-hans": {
    eyebrow: "圣训主题",
    sectionEyebrow: "学习专题",
    indexTitle: "返回全部圣训",
    title: label => `${label}圣训专题`,
    subtitle: label => `围绕${label}保持更聚焦的阅读路径，配合清晰来源与简短学习提示。`,
    metaDescription: label => `在 Adantimer 中阅读围绕${label}的聚焦圣训专题，带有清晰来源、简短要点和更适合学习的页面结构。`,
    faq: label => ([
      {
        question: `这个页面只展示${label}相关的圣训吗？`,
        answer: `是的。这个路由把学习范围收窄到${label}，方便更深入地阅读，而不是一次混合所有主题。`
      },
      {
        question: "这里也会显示来源和等级吗？",
        answer: "会。每张卡片都会继续显示来源、等级、传述人和简短要点。"
      },
      {
        question: "我还能返回完整的圣训页面吗？",
        answer: "可以。每个主题页都带有返回完整圣训索引的链接。"
      }
    ])
  }
};

function normalizeHadithCollectionId(value) {
  const slug = slugify(value || "");
  return getHadithCategories().some(item => item.id === slug) ? slug : "";
}

function getHadithCollectionRouteSlug(value) {
  return slugify(normalizeHadithCollectionId(value) || value || "");
}

function getHadithCollectionCopy(language, collectionId, label) {
  const locale = HADITH_COLLECTION_CONTENT[language] || HADITH_COLLECTION_CONTENT.en;
  const fallback = HADITH_COLLECTION_CONTENT.en;
  return {
    eyebrow: locale.eyebrow || fallback.eyebrow,
    sectionEyebrow: locale.sectionEyebrow || fallback.sectionEyebrow,
    indexTitle: locale.indexTitle || fallback.indexTitle,
    title: (locale.title || fallback.title)(label),
    subtitle: (locale.subtitle || fallback.subtitle)(label),
    metaDescription: (locale.metaDescription || fallback.metaDescription)(label),
    faq: (locale.faq || fallback.faq)(label)
  };
}

function buildQuranSurahCopy(language, pageType, surah, surahReaderData) {
  if (pageType !== "quran-surah" || !surah) {
    return {
      quranAyahs: [],
      quranIndexHref: "",
      quranBackLabel: "",
      quranNavigationAria: "",
      quranSectionEyebrow: "",
      quranSectionTitle: "",
      quranSectionIntro: "",
      quranRevelationLabel: "",
      quranAyahCountLabel: "",
      quranPrevious: null,
      quranNext: null,
      quranEmptyText: ""
    };
  }

  const locale = QURAN_SURAH_CONTENT[language] || QURAN_SURAH_CONTENT.en;
  const revelationLocale = REVELATION_LABELS[language] || REVELATION_LABELS.en;
  const quranSurahUi = {
    en: { indexLabel: "All surahs", positionLabel: "Position" },
    ar: { indexLabel: "جميع السور", positionLabel: "الموضع" },
    de: { indexLabel: "Alle Suren", positionLabel: "Position" },
    fr: { indexLabel: "Toutes les sourates", positionLabel: "Position" },
    tr: { indexLabel: "Tum sureler", positionLabel: "Konum" },
    "zh-hans": { indexLabel: "全部章节", positionLabel: "位置" }
  };
  const surahUi = quranSurahUi[language] || quranSurahUi.en;
  const revelationKey = surah.revelation === "madinah" || surah.revelation === "medinan" ? "medinan" : "meccan";
  const revelationLabel = revelationLocale[revelationKey];
  const neighbors = getAdjacentQuranSurahs(surah.slug);
  const ayahCountText = locale.versesLabel(surah.ayahs);
  const ayahStatLabel = (locale.versesLabel(1) || "").replace(/[0-9٠-٩]+/g, "").trim() || ayahCountText;

  return {
    heroEyebrow: locale.heroEyebrow,
    heroHeading: surah.nameSimple,
    heroSubtitle: surah.translatedName,
    metaTitle: locale.metaTitle(surah),
    metaDescription: locale.metaDescription(surah),
    hideNextPrayerCard: true,
    showPopularCities: false,
    showIntentLinks: false,
    quranArabicName: surah.nameArabic || "",
    quranAyahCountValue: String(surah.ayahs),
    quranAyahCountStatLabel: ayahStatLabel,
    quranRevelationValue: revelationLabel,
    quranRevelationStatLabel: locale.revelationPrefix,
    quranSectionEyebrow: locale.sectionEyebrow,
    quranSectionTitle: locale.sectionTitle(surah),
    quranSectionIntro: locale.sectionIntro(surah),
    quranIndexHref: buildRoutePath(language, "quran"),
    quranBackLabel: locale.backLabel,
    quranIndexNavLabel: surahUi.indexLabel,
    quranNavigationAria: surah.nameSimple,
    quranRevelationLabel: `${locale.revelationPrefix}: ${revelationLabel}`,
    quranAyahCountLabel: ayahCountText,
    quranPositionValue: `${surah.id} / ${QURAN_SURAHS.length}`,
    quranPositionStatLabel: surahUi.positionLabel,
    quranAyahs: surahReaderData.ayahs,
    quranEmptyText: surahReaderData.hasFetchError ? locale.emptyText : locale.emptyText,
    quranPrevious: neighbors.previous
      ? {
          label: locale.previousLabel,
          name: neighbors.previous.nameSimple,
          href: buildRoutePath(language, "quran-surah", "", neighbors.previous.slug)
        }
      : null,
    quranNext: neighbors.next
      ? {
          label: locale.nextLabel,
          name: neighbors.next.nameSimple,
          href: buildRoutePath(language, "quran-surah", "", neighbors.next.slug)
        }
      : null,
    faq: locale.faq(surah),
    footerText: locale.footerText(surah),
    noscriptText: locale.noscriptText
  };
}

function buildDhikrIndexCopy(language, pageType, collectionId = "") {
  if (pageType !== "dhikr" && pageType !== "dhikr-collection") {
    return {
      dhikrStats: [],
      dhikrCategories: [],
      dhikrItems: [],
      dhikrCollection: "",
      dhikrCollectionIntroHref: "",
      dhikrCollectionBackLabel: ""
    };
  }

  const locale = DHIKR_INDEX_CONTENT[language] || DHIKR_INDEX_CONTENT.en;
  const categories = getDhikrCategories();
  const items = getDhikrItems();
  const activeCollectionId = pageType === "dhikr-collection" ? normalizeDhikrCollectionId(collectionId) : "all";
  const visibleItems = activeCollectionId === "all"
    ? items
    : items.filter(item => item.category === activeCollectionId);
  const activeCollectionLabel = DHIKR_CATEGORIES_LABEL(language, activeCollectionId);
  const collectionCopy = activeCollectionId !== "all"
    ? getDhikrCollectionCopy(language, activeCollectionId, activeCollectionLabel)
    : null;
  const authenticityLabels = {
    en: { sahih: "Sahih source", hasan: "Hasan source", authenticated: "Authenticated source", quran: "Quran source" },
    ar: { sahih: "مصدر صحيح", hasan: "مصدر حسن", authenticated: "مصدر موثق", quran: "مصدر قرآني" },
    de: { sahih: "Sahih-Quelle", hasan: "Hasan-Quelle", authenticated: "Verifizierte Quelle", quran: "Quran-Quelle" },
    fr: { sahih: "Source sahih", hasan: "Source hasan", authenticated: "Source authentifiee", quran: "Source coranique" },
    tr: { sahih: "Sahih kaynak", hasan: "Hasan kaynak", authenticated: "Dogrulanmis kaynak", quran: "Kur'an kaynagi" },
    "zh-hans": { sahih: "可靠圣训来源", hasan: "良好圣训来源", authenticated: "已核实来源", quran: "古兰经来源" }
  };
  const countModeLabels = {
    en: { fixed: "Fixed count", guided: "Guided starting target" },
    ar: { fixed: "عدد ثابت", guided: "هدف إرشادي" },
    de: { fixed: "Feste Anzahl", guided: "Gefuehrtes Startziel" },
    fr: { fixed: "Compte fixe", guided: "Objectif guide" },
    tr: { fixed: "Sabit sayi", guided: "Yonlendirilmis hedef" },
    "zh-hans": { fixed: "固定次数", guided: "引导目标" }
  };
  const sourceLabels = {
    en: "Use and source note",
    ar: "ملاحظة الاستخدام والمصدر",
    de: "Nutzungs- und Quellenhinweis",
    fr: "Note d'usage et de source",
    tr: "Kullanim ve kaynak notu",
    "zh-hans": "用途与来源说明"
  };
  const localizedAuthenticity = authenticityLabels[language] || authenticityLabels.en;
  const localizedCountModes = countModeLabels[language] || countModeLabels.en;

  const copy = {
    heroEyebrow: collectionCopy?.eyebrow || locale.heroEyebrow,
    heroHeading: collectionCopy?.title || locale.heroTitle,
    heroSubtitle: collectionCopy?.subtitle || locale.heroSubtitle,
    metaTitle: collectionCopy ? `${collectionCopy.title} | Adantimer` : locale.metaTitle,
    metaDescription: collectionCopy?.metaDescription || locale.metaDescription,
    dhikrStatsAria: collectionCopy?.title || locale.heroTitle,
    dhikrStats: [
      { value: String(activeCollectionId === "all" ? categories.length : 1), label: locale.statsLabelCollections },
      { value: String(visibleItems.length), label: locale.statsLabelEntries },
      { value: locale.statsStorageValue, label: locale.statsLabelStorage }
    ],
    dhikrSummaryEyebrow: locale.summaryEyebrow,
    dhikrSummaryTitle: locale.summaryTitle,
    dhikrSummaryCompletedLabel: locale.summaryCompletedLabel,
    dhikrSummaryRepetitionsLabel: locale.summaryRepetitionsLabel,
    dhikrSummaryTargetLabel: locale.summaryTargetLabel,
    dhikrSummaryCompletedValue: "0",
    dhikrSummaryRepetitionsValue: "0",
    dhikrSummaryTargetValue: String(visibleItems.reduce((sum, item) => sum + item.countTarget, 0)),
    dhikrCurrentCategoryText: locale.currentCategory(activeCollectionLabel),
    dhikrResetVisibleLabel: locale.resetVisibleLabel,
    dhikrResetAllLabel: locale.resetAllLabel,
    dhikrCounterAria: locale.counterAria,
    dhikrDecrementLabel: locale.decrementLabel,
    dhikrIncrementLabel: locale.incrementLabel,
    dhikrResetItemLabel: locale.resetItemLabel,
    dhikrSectionEyebrow: collectionCopy?.sectionEyebrow || locale.sectionEyebrow,
    dhikrSectionTitle: collectionCopy?.title || locale.sectionTitle,
    dhikrSectionIntro: collectionCopy?.subtitle || locale.sectionIntro,
    dhikrCategoriesAria: locale.categoriesAria,
    dhikrEvidenceAria: sourceLabels[language] || sourceLabels.en,
    dhikrCollection: activeCollectionId,
    dhikrCollectionIntroHref: buildRoutePath(language, "dhikr"),
    dhikrCollectionBackLabel: collectionCopy?.indexTitle || locale.sectionTitle,
    dhikrCategories: [
      {
        id: "all",
        label: DHIKR_CATEGORIES_LABEL(language, "all"),
        itemCount: items.length,
        active: activeCollectionId === "all",
        href: buildRoutePath(language, "dhikr")
      },
      ...categories.map(category => ({
        id: category.id,
        label: category.labels[language] || category.labels.en,
        itemCount: items.filter(item => item.category === category.id).length,
        active: activeCollectionId === category.id,
        href: buildRoutePath(language, "dhikr-collection", "", category.id)
      }))
    ],
    dhikrItems: visibleItems.map(item => ({
      id: item.id,
      category: item.category,
      categoryLabel: DHIKR_CATEGORIES_LABEL(language, item.category),
      countTarget: item.countTarget,
      targetLabel: locale.targetLabel(item.countTarget),
      arabic: item.arabic,
      transliteration: item.transliteration,
      translation: item.translations[language] || item.translations.en,
      focus: (item.focus?.[language] || item.focus?.en || ""),
      guidance: (item.guidance?.[language] || item.guidance?.en || ""),
      sourceLabel: sourceLabels[language] || sourceLabels.en,
      reference: item.reference,
      authenticityLabel: localizedAuthenticity[item.authenticity] || localizedAuthenticity.authenticated,
      countModeLabel: item.countMode === "guided" ? localizedCountModes.guided : localizedCountModes.fixed,
      progressText: locale.progressText(0, item.countTarget)
    })),
    faq: collectionCopy?.faq || locale.faq,
    footerText: locale.footerText,
    noscriptText: locale.noscriptText
  };
  return copy;
}

function buildHadithIndexCopy(language, pageType, collectionId = "") {
  if (pageType !== "hadith" && pageType !== "hadith-collection") {
    return {
      hadithStats: [],
      hadithCategories: [],
      hadithPrimaryCategories: [],
      hadithOverflowCategories: [],
      hadithItems: [],
      hadithSearchLabel: "",
      hadithSearchPlaceholder: "",
      hadithSearchHint: "",
      hadithSearchCountText: "",
      hadithEmptyState: "",
      hadithCategoryMoreLabel: "",
      hadithOverflowOpen: false,
      hadithCollection: "",
      hadithCollectionIntroHref: "",
      hadithCollectionBackLabel: ""
    };
  }

  const locale = HADITH_INDEX_CONTENT[language] || HADITH_INDEX_CONTENT.en;
  const categories = getHadithCategories();
  const items = getHadithItems();
  const activeCollectionId = pageType === "hadith-collection" ? normalizeHadithCollectionId(collectionId) : "all";
  const visibleItems = activeCollectionId === "all"
    ? items
    : items.filter(item => item.category === activeCollectionId);
  const activeCollectionLabel = HADITH_CATEGORIES_LABEL(language, activeCollectionId);
  const collectionCopy = activeCollectionId !== "all"
    ? getHadithCollectionCopy(language, activeCollectionId, activeCollectionLabel)
    : null;
  const gradeLabels = {
    en: { sahih: "Sahih", hasan: "Hasan", "muttafaqun-alayh": "Agreed upon" },
    ar: { sahih: "صحيح", hasan: "حسن", "muttafaqun-alayh": "متفق عليه" },
    de: { sahih: "Sahih", hasan: "Hasan", "muttafaqun-alayh": "Beiderseits ueberliefert" },
    fr: { sahih: "Sahih", hasan: "Hasan", "muttafaqun-alayh": "Rapporte par les deux" },
    tr: { sahih: "Sahih", hasan: "Hasen", "muttafaqun-alayh": "Muttefekun aleyh" },
    "zh-hans": { sahih: "可靠", hasan: "良好", "muttafaqun-alayh": "两大圣训实录共载" }
  };
  const moreFilterLabels = {
    en: "More filters",
    ar: "مزيد من الفلاتر",
    de: "Weitere Filter",
    fr: "Plus de filtres",
    tr: "Daha fazla filtre",
    "zh-hans": "更多筛选"
  };
  const localizedGrades = gradeLabels[language] || gradeLabels.en;
  const categoryEntries = [
    {
      id: "all",
      label: locale.categoryAllLabel,
      itemCount: items.length,
      active: activeCollectionId === "all",
      href: buildRoutePath(language, "hadith")
    },
    ...categories.map(category => ({
      id: category.id,
      label: category.labels[language] || category.labels.en,
      itemCount: items.filter(item => item.category === category.id).length,
      active: activeCollectionId === category.id,
      href: buildRoutePath(language, "hadith-collection", "", category.id)
    }))
  ];
  const categoryById = new Map(categoryEntries.map(item => [item.id, item]));
  const preferredPrimaryIds = ["all", "intentions", "prayer", "character", "knowledge", "repentance", "family", "speech"];
  const primaryCategoryIds = [...preferredPrimaryIds];
  if (activeCollectionId !== "all" && !primaryCategoryIds.includes(activeCollectionId)) {
    primaryCategoryIds[primaryCategoryIds.length - 1] = activeCollectionId;
  }
  const primaryCategories = primaryCategoryIds
    .map(id => categoryById.get(id))
    .filter(Boolean);
  const primaryCategoryIdSet = new Set(primaryCategories.map(item => item.id));
  const overflowCategories = categoryEntries.filter(item => !primaryCategoryIdSet.has(item.id));

  return {
    heroEyebrow: collectionCopy?.eyebrow || locale.heroEyebrow,
    heroHeading: collectionCopy?.title || locale.heroTitle,
    heroSubtitle: collectionCopy?.subtitle || locale.heroSubtitle,
    metaTitle: collectionCopy ? `${collectionCopy.title} | Adantimer` : locale.metaTitle,
    metaDescription: collectionCopy?.metaDescription || locale.metaDescription,
    hadithSearchLabel: locale.searchLabel,
    hadithSearchPlaceholder: locale.searchPlaceholder,
    hadithSearchHint: locale.searchHint,
    hadithSearchCountText: locale.searchCount(visibleItems.length),
    hadithEmptyState: locale.emptyState,
    hadithCategoryMoreLabel: locale.categoryMoreLabel || moreFilterLabels[language] || moreFilterLabels.en,
    hadithSectionEyebrow: collectionCopy?.sectionEyebrow || locale.sectionEyebrow,
    hadithSectionTitle: collectionCopy?.title || locale.sectionTitle,
    hadithSectionIntro: collectionCopy?.subtitle || locale.sectionIntro,
    hadithStats: [
      {
        value: String(activeCollectionId === "all" ? categories.length : 1),
        label: locale.stats?.[0]?.label || "Themes"
      },
      {
        value: String(visibleItems.length),
        label: locale.stats?.[1]?.label || "Entries"
      },
      locale.stats?.[2] || { value: "Local", label: "SSR source" }
    ],
    hadithStatsAria: collectionCopy?.title || locale.heroTitle,
    hadithCategoriesAria: locale.categoryAllLabel,
    hadithSourceAria: locale.sourceAria,
    hadithNarratorLabel: locale.narratorLabel,
    hadithTakeawayLabel: locale.takeawayLabel,
    hadithOverflowOpen: activeCollectionId !== "all" && overflowCategories.some(item => item.id === activeCollectionId),
    hadithCollection: activeCollectionId === "all" ? "" : activeCollectionId,
    hadithCollectionIntroHref: buildRoutePath(language, "hadith"),
    hadithCollectionBackLabel: collectionCopy?.indexTitle || locale.sectionTitle,
    hadithCategories: categoryEntries,
    hadithPrimaryCategories: primaryCategories,
    hadithOverflowCategories: overflowCategories,
    hadithItems: visibleItems.map(item => ({
      id: item.id,
      category: item.category,
      categoryLabel: HADITH_CATEGORIES_LABEL(language, item.category),
      arabic: item.arabic,
      translation: item.translation[language] || item.translation.en,
      lesson: item.lesson[language] || item.lesson.en,
      narrator: item.narrator,
      source: item.source,
      gradeLabel: localizedGrades[item.grade] || localizedGrades.sahih,
      search: [
        item.id,
        item.category,
        item.narrator,
        item.source,
        item.translation[language] || item.translation.en,
        item.lesson[language] || item.lesson.en,
        ...(item.search || [])
      ].join(" ").toLowerCase()
    })),
    faq: collectionCopy?.faq || locale.faq,
    footerText: locale.footerText,
    noscriptText: locale.noscriptText
  };
}

function buildQiblaPanelCopy(language, pageType) {
  const locale = QIBLA_PANEL_CONTENT[language] || QIBLA_PANEL_CONTENT.en;
  return {
    showQiblaPanel: pageType === "qibla",
    qiblaEyebrow: locale.eyebrow,
    qiblaTitle: locale.title,
    qiblaSummary: locale.summary,
    qiblaKaabaLabel: locale.kaabaLabel || QIBLA_PANEL_CONTENT.en.kaabaLabel,
    qiblaPlaceFallback: locale.placeFallback,
    qiblaStatusIdle: locale.statusIdle,
    qiblaSensorButton: locale.sensorButton || QIBLA_PANEL_CONTENT.en.sensorButton,
    qiblaSensorHintIdle: locale.sensorHintIdle || QIBLA_PANEL_CONTENT.en.sensorHintIdle,
    qiblaBearingLabel: locale.bearingLabel,
    qiblaDistanceLabel: locale.distanceLabel
  };
}

function normalizeLanguage(value) {
  const normalized = String(value || "en").toLowerCase();
  return LANGUAGE_ALIASES[normalized] || LANGUAGE_ALIASES[normalized.split("-")[0]] || "en";
}

function parseAcceptLanguage(value) {
  return String(value || "")
    .split(",")
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const [tag, qualityPart] = part.split(";q=");
      const quality = Number(qualityPart);
      return {
        tag: tag.trim().toLowerCase(),
        quality: Number.isFinite(quality) ? quality : 1
      };
    })
    .sort((left, right) => right.quality - left.quality);
}

function detectRequestLanguage(acceptLanguage) {
  for (const candidate of parseAcceptLanguage(acceptLanguage)) {
    const normalized = normalizeLanguage(candidate.tag);
    if (SUPPORTED_RENDER_LANGUAGES.includes(normalized)) {
      return normalized;
    }
  }
  return "en";
}

function resolveRequestLanguage({ explicitLanguage, acceptLanguage, pageType, city }) {
  if (explicitLanguage) {
    return normalizeLanguage(explicitLanguage);
  }

  if (pageType === "home" && !city) {
    return detectRequestLanguage(acceptLanguage);
  }

  return "en";
}

function shouldVaryByAcceptLanguage({ explicitLanguage, pageType, city }) {
  return !explicitLanguage && pageType === "home" && !city;
}

function localizeCityName(city, language) {
  if (!city) return "";
  const localeKey = normalizeLanguage(language);
  const key = slugify(city);
  return CITY_NAME_LOCALIZATIONS[key]?.[localeKey] || city;
}

function localizeCountryName(country, language) {
  if (!country) return "";
  const localeKey = normalizeLanguage(language);
  const key = String(country).trim().toLowerCase();
  return COUNTRY_NAME_LOCALIZATIONS[key]?.[localeKey] || country;
}

function formatPlaceName(city, country, language) {
  const localizedCity = localizeCityName(city, language);
  const localizedCountry = localizeCountryName(country, language);
  return localizedCity && localizedCountry ? `${localizedCity}, ${localizedCountry}` : localizedCity || localizedCountry || "";
}

function getAlternates(pageType, city, surahSlug = "") {
  const alternates = {};
  for (const language of SUPPORTED_RENDER_LANGUAGES) {
    alternates[language] = `${SITE_URL}${buildRoutePath(language, pageType, city, surahSlug)}`;
  }
  alternates.default = alternates.en;
  return alternates;
}

function buildRoutePath(language, pageType, city = "", surahSlug = "") {
  const route = ROUTES[pageType] || ROUTES.home;
  const pathName = route.path(city, surahSlug);
  const prefix = LANGUAGE_PREFIXES[language] || "";
  return `${prefix}${pathName === "/" && prefix ? "" : pathName}`;
}

function normalizePageType(value) {
  return Object.prototype.hasOwnProperty.call(ROUTES, value) ? value : "home";
}

function normalizeCity(value) {
  return decodeURIComponent(String(value || "")).replace(/\+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeSurahSlug(value) {
  return slugify(decodeURIComponent(String(value || "")).replace(/\+/g, " ").trim());
}

function titleCase(value) {
  return value.split("-").filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function DHIKR_CATEGORIES_LABEL(language, id) {
  const category = [{ id: "all", labels: { en: "All", ar: "الكل", de: "Alle", fr: "Toutes", tr: "Tümü", "zh-hans": "全部" } }, ...getDhikrCategories()]
    .find(entry => entry.id === id);
  return category?.labels?.[language] || category?.labels?.en || id;
}

function HADITH_CATEGORIES_LABEL(language, id) {
  const category = [{ id: "all", labels: { en: "All", ar: "Ø§Ù„ÙƒÙ„", de: "Alle", fr: "Toutes", tr: "Tumu", "zh-hans": "å…¨éƒ¨" } }, ...getHadithCategories()]
    .find(entry => entry.id === id);
  return category?.labels?.[language] || category?.labels?.en || id;
}
