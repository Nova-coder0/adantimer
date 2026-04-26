import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getDhikrCategories,
  getDhikrItems
} from "../data/dhikr-entries.js";
import {
  QURAN_SURAHS,
  getAdjacentQuranSurahs,
  getQuranSurahBySlug
} from "../data/quran-surahs.js";

const SITE_URL = "https://www.adantimer.com";
const INDEX_PATH = path.join(process.cwd(), "templates", "index.html");
const QURAN_API_BASE = "https://api.alquran.cloud/v1";
const QURAN_API_TIMEOUT_MS = 12000;
const QURAN_SURAH_CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const quranSurahCache = new Map();

const TOP_CITIES = [
  { city: "Makkah", country: "Saudi Arabia" },
  { city: "Madinah", country: "Saudi Arabia" },
  { city: "Buraydah", country: "Saudi Arabia" },
  { city: "Cairo", country: "Egypt" },
  { city: "Dubai", country: "United Arab Emirates" },
  { city: "Istanbul", country: "Turkey" },
  { city: "London", country: "United Kingdom" },
  { city: "New York", country: "United States" },
  { city: "Sydney", country: "Australia" }
];

const CITY_NAME_LOCALIZATIONS = {
  "makkah": { ar: "\u0645\u0643\u0629", de: "Mekka", fr: "La Mecque", tr: "Mekke", "zh-hans": "\u9ea6\u52a0" },
  "madinah": { ar: "\u0627\u0644\u0645\u062f\u064a\u0646\u0629", de: "Medina", fr: "Medine", tr: "Medine", "zh-hans": "\u9ea6\u5730\u90a3" },
  "buraydah": { ar: "\u0628\u0631\u064a\u062f\u0629", de: "Buraida", fr: "Buraidah", tr: "Bureyde", "zh-hans": "\u5e03\u8d56\u8fbe" },
  "cairo": { ar: "\u0627\u0644\u0642\u0627\u0647\u0631\u0629", de: "Kairo", fr: "Le Caire", tr: "Kahire", "zh-hans": "\u5f00\u7f57" },
  "dubai": { ar: "\u062f\u0628\u064a", de: "Dubai", fr: "Duba\u00ef", tr: "Dubai", "zh-hans": "\u8fea\u62dc" },
  "istanbul": { ar: "\u0625\u0633\u0637\u0646\u0628\u0648\u0644", de: "Istanbul", fr: "Istanbul", tr: "\u0130stanbul", "zh-hans": "\u4f0a\u65af\u5766\u5e03\u5c14" },
  "london": { ar: "\u0644\u0646\u062f\u0646", de: "London", fr: "Londres", tr: "Londra", "zh-hans": "\u4f26\u6566" },
  "new-york": { ar: "\u0646\u064a\u0648\u064a\u0648\u0631\u0643", de: "New York", fr: "New York", tr: "New York", "zh-hans": "\u7ebd\u7ea6" },
  "sydney": { ar: "\u0633\u064a\u062f\u0646\u064a", de: "Sydney", fr: "Sydney", tr: "Sidney", "zh-hans": "\u6089\u5c3c" },
  "berlin": { ar: "\u0628\u0631\u0644\u064a\u0646", de: "Berlin", fr: "Berlin", tr: "Berlin", "zh-hans": "\u67cf\u6797" },
  "paris": { ar: "\u0628\u0627\u0631\u064a\u0633", de: "Paris", fr: "Paris", tr: "Paris", "zh-hans": "\u5df4\u9ece" },
  "shanghai": { ar: "\u0634\u0646\u063a\u0647\u0627\u064a", de: "Shanghai", fr: "Shanghai", tr: "\u015eanhay", "zh-hans": "\u4e0a\u6d77" }
};

const COUNTRY_NAME_LOCALIZATIONS = {
  "saudi arabia": { ar: "\u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629", de: "Saudi-Arabien", fr: "Arabie saoudite", tr: "Suudi Arabistan", "zh-hans": "\u6c99\u7279\u963f\u62c9\u4f2f" },
  "egypt": { ar: "\u0645\u0635\u0631", de: "\u00c4gypten", fr: "\u00c9gypte", tr: "M\u0131s\u0131r", "zh-hans": "\u57c3\u53ca" },
  "united arab emirates": { ar: "\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a", de: "Vereinigte Arabische Emirate", fr: "\u00c9mirats arabes unis", tr: "Birle\u015fik Arap Emirlikleri", "zh-hans": "\u963f\u8054\u914b" },
  "turkey": { ar: "\u062a\u0631\u0643\u064a\u0627", de: "T\u00fcrkei", fr: "Turquie", tr: "T\u00fcrkiye", "zh-hans": "\u571f\u8033\u5176" },
  "united kingdom": { ar: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629", de: "Vereinigtes K\u00f6nigreich", fr: "Royaume-Uni", tr: "Birle\u015fik Krall\u0131k", "zh-hans": "\u82f1\u56fd" },
  "united states": { ar: "\u0627\u0644\u0648\u0644\u0627\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u062d\u062f\u0629", de: "Vereinigte Staaten", fr: "\u00c9tats-Unis", tr: "Amerika Birle\u015fik Devletleri", "zh-hans": "\u7f8e\u56fd" },
  "australia": { ar: "\u0623\u0633\u062a\u0631\u0627\u0644\u064a\u0627", de: "Australien", fr: "Australie", tr: "Avustralya", "zh-hans": "\u6fb3\u5927\u5229\u4e9a" },
  "germany": { ar: "\u0623\u0644\u0645\u0627\u0646\u064a\u0627", de: "Deutschland", fr: "Allemagne", tr: "Almanya", "zh-hans": "\u5fb7\u56fd" },
  "france": { ar: "\u0641\u0631\u0646\u0633\u0627", de: "Frankreich", fr: "France", tr: "Fransa", "zh-hans": "\u6cd5\u56fd" },
  "china": { ar: "\u0627\u0644\u0635\u064a\u0646", de: "China", fr: "Chine", tr: "\u00c7in", "zh-hans": "\u4e2d\u56fd" }
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
  hadith: { en: "Hadith", ar: "الحديث", path: () => "/hadith" }
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
    infoTitle: "A stronger starting point for global prayer time searches",
    features: [
      "Server-rendered copy matches the visitor's language before the page hydrates.",
      "The homepage is structured to answer two fast paths: today's schedule near you or a direct city prayer page.",
      "Major cities, next-prayer routes, and individual prayer routes are linked immediately from the first screen.",
      "Clean language-aware URLs make the homepage a better entry point for search, sharing, and return visits."
    ],
    citiesTitle: "Start with major prayer time cities",
    aboutTitle: "Built for automatic language, location, and city discovery",
    aboutParagraphs: [
      "Most visitors arriving on the homepage want either today's prayer schedule for their current city or a fast route into a known city page. The root page is structured around both goals.",
      "Language, canonical signals, and visible copy now align earlier in the request so the first HTML already matches the visitor more closely.",
      "That makes the homepage a stronger discovery page for global prayer-time searches while still handing off deeper intent to dedicated city routes."
    ],
    faqTitle: "Common questions about automatic prayer times",
    faq: [
      {
        question: "Does the homepage adapt to my language automatically?",
        answer: "Yes. The root page can now render in the visitor's browser language on the first server response, while manual language switching stays available in the header."
      },
      {
        question: "Can I jump from the homepage to a direct city page?",
        answer: "Yes. The homepage links directly to major city pages and to focused prayer-intent routes such as next prayer, Fajr, Dhuhr, Asr, Maghrib, and Isha."
      },
      {
        question: "What happens if my location is not available?",
        answer: "Adantimer tries GPS first, falls back to IP-based detection when needed, and still keeps manual city search available."
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
          { type: "prayer-times", city: "Makkah", label: "Gebetszeiten in Makkah" },
          { type: "asr", city: "Cairo", label: "Asr in Cairo" },
          { type: "dhuhr", city: "Dubai", label: "Dhuhr in Dubai" },
          { type: "next-prayer", city: "London", label: "Nächstes Gebet in London" }
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
          { type: "prayer-times", city: "Makkah", label: "Horaires de prière à Makkah" },
          { type: "asr", city: "Cairo", label: "Asr à Cairo" },
          { type: "dhuhr", city: "Dubai", label: "Dhuhr à Dubai" },
          { type: "next-prayer", city: "London", label: "Prochaine prière à London" }
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
          { type: "prayer-times", city: "Makkah", label: "Makkah için namaz vakitleri" },
          { type: "asr", city: "Cairo", label: "Cairo için Asr" },
          { type: "dhuhr", city: "Dubai", label: "Dubai için Dhuhr" },
          { type: "next-prayer", city: "London", label: "London için sonraki namaz" }
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
          { type: "prayer-times", city: "Makkah", label: "Makkah礼拜时间" },
          { type: "asr", city: "Cairo", label: "Cairo晡礼" },
          { type: "dhuhr", city: "Dubai", label: "Dubai晌礼" },
          { type: "next-prayer", city: "London", label: "London下一次礼拜" }
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

    const detailSlug = pageType === "quran-surah" ? surahSlug : dhikrCollection;
    const canonicalPath = buildRoutePath(language, pageType, city, detailSlug);
    const canonical = `${SITE_URL}${canonicalPath}`;
    const alternates = getAlternates(pageType, city, detailSlug);
    const copy = buildCopy({ language, pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection });
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
    .replace(/<body data-page="[^"]*">/, `<body data-page="${pageType}"${copy.surahSlug ? ` data-surah-slug="${escapeHtml(copy.surahSlug)}"` : ""}${copy.dhikrCollection ? ` data-dhikr-collection="${escapeHtml(copy.dhikrCollection)}"` : ""}>`)
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

function buildEnglishCopy({ pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection }) {
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
    { label: "Prayer times today", href: buildRoutePath("en", "prayer-times") },
    { label: "Next prayer time", href: buildRoutePath("en", "next-prayer") },
    { label: "Fajr time", href: buildRoutePath("en", "fajr") },
    { label: "Dhuhr time", href: buildRoutePath("en", "dhuhr") },
    { label: "Asr time", href: buildRoutePath("en", "asr") },
    { label: "Maghrib time", href: buildRoutePath("en", "maghrib") },
    { label: "Isha time", href: buildRoutePath("en", "isha") }
  ];
  const cityIntentLinks = sourceCity
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
        { label: "Prayer times in Makkah", href: buildRoutePath("en", "prayer-times", "Makkah") },
        { label: "Asr in Cairo", href: buildRoutePath("en", "asr", "Cairo") },
        { label: "Dhuhr in Dubai", href: buildRoutePath("en", "dhuhr", "Dubai") },
        { label: "Next prayer in London", href: buildRoutePath("en", "next-prayer", "London") }
      ];

  const copy = {
    activeLanguage: "en",
    standalonePage: pageType === "qibla" || pageType === "quran" || pageType === "quran-surah" || pageType === "dhikr" || pageType === "dhikr-collection",
    standalonePageType: pageType === "qibla" || pageType === "quran" || pageType === "quran-surah" || pageType === "dhikr" || pageType === "dhikr-collection" ? pageType : "",
    hideNextPrayerCard: pageType === "qibla" || pageType === "quran" || pageType === "dhikr" || pageType === "dhikr-collection",
    showPopularCities: pageType !== "qibla" && pageType !== "quran" && pageType !== "dhikr" && pageType !== "dhikr-collection",
    showIntentLinks: pageType !== "qibla" && pageType !== "quran" && pageType !== "dhikr" && pageType !== "dhikr-collection",
    brandHref: buildRoutePath("en", "home"),
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
    topCities: getLocalizedTopCities("en"),
    topCitiesAria: "Popular city shortcuts",
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
    ...buildQiblaPanelCopy("en", pageType),
    ...buildToolHubCopy("en", pageType),
    footerText: pageType === "quran"
      ? QURAN_INDEX_CONTENT.en.footerText
      : pageType === "dhikr" || pageType === "dhikr-collection"
        ? DHIKR_INDEX_CONTENT.en.footerText
        : (place ? `Accurate prayer times for ${place} and other cities.` : "Accurate prayer times by city."),
    noscriptText: pageType === "quran"
      ? QURAN_INDEX_CONTENT.en.noscriptText
      : pageType === "dhikr" || pageType === "dhikr-collection"
        ? DHIKR_INDEX_CONTENT.en.noscriptText
        : "JavaScript is required to load live prayer times and the next prayer countdown."
  };
  return copy;
}

function buildArabicCopy({ pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection }) {
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
    { label: "مواقيت الصلاة اليوم", href: buildRoutePath("ar", "prayer-times") },
    { label: "وقت الصلاة القادمة", href: buildRoutePath("ar", "next-prayer") },
    { label: "وقت الفجر", href: buildRoutePath("ar", "fajr") },
    { label: "وقت الظهر", href: buildRoutePath("ar", "dhuhr") },
    { label: "وقت العصر", href: buildRoutePath("ar", "asr") },
    { label: "وقت المغرب", href: buildRoutePath("ar", "maghrib") },
    { label: "وقت العشاء", href: buildRoutePath("ar", "isha") }
  ];
  const cityIntentLinks = sourceCity
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
        { label: "مواقيت الصلاة في مكة", href: buildRoutePath("ar", "prayer-times", "Makkah") },
        { label: "العصر في القاهرة", href: buildRoutePath("ar", "asr", "Cairo") },
        { label: "الظهر في دبي", href: buildRoutePath("ar", "dhuhr", "Dubai") },
        { label: "الصلاة القادمة في لندن", href: buildRoutePath("ar", "next-prayer", "London") }
      ];

  const copy = {
    activeLanguage: "ar",
    standalonePage: pageType === "qibla" || pageType === "quran" || pageType === "quran-surah" || pageType === "dhikr" || pageType === "dhikr-collection",
    standalonePageType: pageType === "qibla" || pageType === "quran" || pageType === "quran-surah" || pageType === "dhikr" || pageType === "dhikr-collection" ? pageType : "",
    hideNextPrayerCard: pageType === "qibla" || pageType === "quran" || pageType === "dhikr" || pageType === "dhikr-collection",
    showPopularCities: pageType !== "qibla" && pageType !== "quran" && pageType !== "dhikr" && pageType !== "dhikr-collection",
    showIntentLinks: pageType !== "qibla" && pageType !== "quran" && pageType !== "dhikr" && pageType !== "dhikr-collection",
    brandHref: buildRoutePath("ar", "home"),
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
    topCities: getLocalizedTopCities("ar"),
    topCitiesAria: "روابط سريعة للمدن",
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
  return copy;
}

function buildCopy({ language, pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection }) {
  if (language === "ar") return buildArabicCopy({ pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection });
  if (language === "en") return buildEnglishCopy({ pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection });
  return buildLocalizedCopy(language, { pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection });
}

function buildLocalizedCopy(language, { pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection }) {
  const locale = COPY_LOCALES[language];
  if (!locale) return buildEnglishCopy({ pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection });
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
  const cityIntentLinks = locale.cityIntentLinks(place).map(item => {
    const resolvedCity = item.city || sourceCity;
    let label = item.label;
    if (!place && item.city) {
      label = label.replace(item.city, localizeCityName(item.city, language));
    }

    return {
      label,
      href: buildRoutePath(language, item.type, resolvedCity)
    };
  });

  return {
    activeLanguage: language,
    standalonePage: pageType === "qibla" || pageType === "quran" || pageType === "quran-surah" || pageType === "dhikr" || pageType === "dhikr-collection",
    standalonePageType: pageType === "qibla" || pageType === "quran" || pageType === "quran-surah" || pageType === "dhikr" || pageType === "dhikr-collection" ? pageType : "",
    hideNextPrayerCard: pageType === "qibla" || pageType === "quran" || pageType === "dhikr" || pageType === "dhikr-collection",
    showPopularCities: pageType !== "qibla" && pageType !== "quran" && pageType !== "dhikr" && pageType !== "dhikr-collection",
    showIntentLinks: pageType !== "qibla" && pageType !== "quran" && pageType !== "dhikr" && pageType !== "dhikr-collection",
    brandHref: buildRoutePath(language, "home"),
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
    topCities: getLocalizedTopCities(language),
    topCitiesAria: locale.topCitiesAria,
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
    ...buildQiblaPanelCopy(language, pageType),
    ...buildToolHubCopy(language, pageType),
    footerText: pageType === "quran"
      ? (QURAN_INDEX_CONTENT[language] || QURAN_INDEX_CONTENT.en).footerText
      : pageType === "dhikr" || pageType === "dhikr-collection"
        ? (DHIKR_INDEX_CONTENT[language] || DHIKR_INDEX_CONTENT.en).footerText
        : locale.footerText(place),
    noscriptText: pageType === "quran"
      ? (QURAN_INDEX_CONTENT[language] || QURAN_INDEX_CONTENT.en).noscriptText
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

  const popularCitiesMarkup = copy.showPopularCities
    ? `

          <div class="popular-cities" aria-label="${escapeHtml(copy.topCitiesAria)}">
${copy.topCities.map(item => `            <a class="city-chip" href="${escapeHtml(buildRoutePath(copy.activeLanguage, "home", item.city))}" data-city="${escapeHtml(item.city)}" data-country="${escapeHtml(item.country)}">${escapeHtml(item.displayCity || item.city)}</a>`).join("\n")}
          </div>`
    : "";

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

function renderCitiesSection(copy) {
  return `    <section class="card prose" aria-labelledby="cities-heading">
      <p class="eyebrow">${escapeHtml(copy.citiesEyebrow)}</p>
      <h2 id="cities-heading">${escapeHtml(copy.citiesTitle)}</h2>
      <p>
        ${renderInlineLinks(copy.cityLinks, copy.activeLanguage)}
      </p>
      <p>
        ${renderInlineLinks(copy.cityIntentLinks, copy.activeLanguage)}
      </p>
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
