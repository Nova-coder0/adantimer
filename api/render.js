import { readFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://www.adantimer.com";
const INDEX_PATH = path.join(process.cwd(), "index.html");

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
  fr: "Heure du Asr",
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
  fr: "Heure du Isha",
  tr: "Isha Vakti",
  "zh-hans": "宵礼时间"
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
      ? `Prüfe ${topic.toLowerCase()} in ${place}, sieh das nächste Gebet und den heutigen Gebetsplan.`
      : `Prüfe ${topic.toLowerCase()} und den heutigen Gebetsplan automatisch nach Standort.`
  },
  fr: {
    htmlLang: "fr",
    dir: "ltr",
    inLanguage: "fr",
    title: (topic, place, pageType) => pageType === "home" && !place
      ? "Adantimer | Horaires de prière précis et prochaine prière"
      : `${topic}${place ? ` à ${place}` : ""} aujourd'hui | Adantimer`,
    description: (topic, place) => place
      ? `Consultez ${topic.toLowerCase()} à ${place}, la prochaine prière et le planning du jour.`
      : `Consultez ${topic.toLowerCase()} et le planning du jour selon la localisation.`
  },
  tr: {
    htmlLang: "tr",
    dir: "ltr",
    inLanguage: "tr",
    title: (topic, place, pageType) => pageType === "home" && !place
      ? "Adantimer | Doğru namaz vakitleri ve sonraki namaz"
      : `${topic}${place ? ` ${place} için` : ""} bugün | Adantimer`,
    description: (topic, place) => place
      ? `${place} için ${topic.toLowerCase()} bilgisini, sonraki namazı ve günlük takvimi görüntüleyin.`
      : `${topic.toLowerCase()} bilgisini ve günlük namaz takvimini konuma göre görüntüleyin.`
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

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const language = normalizeLanguage(url.searchParams.get("lang"));
    const locale = LOCALES[language] || LOCALES.en;
    const pageType = normalizePageType(url.searchParams.get("type"));
    const route = ROUTES[pageType] || ROUTES.home;
    const city = normalizeCity(url.searchParams.get("city") || "");
    const place = city ? titleCase(city) : "";
    const topic = route[language] || route.en;
    const canonicalPath = buildRoutePath(language, pageType, city);
    const canonical = `${SITE_URL}${canonicalPath}`;
    const alternates = getAlternates(pageType, city);
    const title = locale.title(topic, place, pageType);
    const description = locale.description(topic, place);
    const copy = language === "ar"
      ? buildArabicCopy({ pageType, place, topic })
      : buildEnglishCopy({ pageType, place, topic });
    copy.activeLanguage = language;
    copy.brandHref = buildRoutePath(language, "home");
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
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400"
      }
    });
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
    .replace(/<body data-page="[^"]*">/, `<body data-page="${pageType}">`)
    .replace(/<a class="brand" href="[^"]*">/, `<a class="brand" href="${escapeHtml(copy.brandHref)}">`)
    .replace(/<button type="button" data-lang="en" class="[^"]*" aria-pressed="[^"]*">English<\/button>/, `<button type="button" data-lang="en" class="${copy.activeLanguage === "en" ? "lang-btn is-active" : "lang-btn"}" aria-pressed="${copy.activeLanguage === "en" ? "true" : "false"}">English</button>`)
    .replace(/<button type="button" data-lang="ar" class="[^"]*" aria-pressed="[^"]*">Arabic<\/button>/, `<button type="button" data-lang="ar" class="${copy.activeLanguage === "ar" ? "lang-btn is-active" : "lang-btn"}" aria-pressed="${copy.activeLanguage === "ar" ? "true" : "false"}">Arabic</button>`)
    .replace(/<section class="hero-copy">[\s\S]*?<\/section>/, renderHeroCopy(copy))
    .replace(/<aside class="next-prayer card featured-card" aria-live="polite">[\s\S]*?<\/aside>/, renderNextPrayerCard(copy))
    .replace(/<section class="card schedule-card" aria-labelledby="schedule-heading">[\s\S]*?<\/section>/, renderScheduleSection(copy))
    .replace(/<section class="card info-card" aria-labelledby="why-heading">[\s\S]*?<\/section>/, renderInfoSection(copy))
    .replace(/<section class="card prose" aria-labelledby="cities-heading">[\s\S]*?<\/section>/, renderCitiesSection(copy))
    .replace(/<article class="card prose" aria-labelledby="about-heading">[\s\S]*?<\/article>/, renderAboutArticle(copy))
    .replace(/<section class="card prose" aria-labelledby="faq-heading">[\s\S]*?<\/section>/, renderFaqSection(copy))
    .replace(/<footer class="shell footer">[\s\S]*?<\/footer>/, renderFooter(copy))
    .replace(/<noscript>[\s\S]*?<\/noscript>/, renderNoscript(copy));
}

function buildEnglishCopy({ pageType, place, topic }) {
  const resolvedPage = pageType === "home" ? "prayer-times" : pageType;
  const cityLinks = TOP_CITIES
    .filter(item => item.city !== place)
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
  const cityIntentLinks = place
    ? [
        { label: `Prayer times in ${place}`, href: buildRoutePath("en", "prayer-times", place) },
        { label: `Next prayer in ${place}`, href: buildRoutePath("en", "next-prayer", place) },
        { label: `Fajr in ${place}`, href: buildRoutePath("en", "fajr", place) },
        { label: `Dhuhr in ${place}`, href: buildRoutePath("en", "dhuhr", place) },
        { label: `Asr in ${place}`, href: buildRoutePath("en", "asr", place) },
        { label: `Maghrib in ${place}`, href: buildRoutePath("en", "maghrib", place) },
        { label: `Isha in ${place}`, href: buildRoutePath("en", "isha", place) }
      ]
    : [
        { label: "Prayer times in Makkah", href: buildRoutePath("en", "prayer-times", "Makkah") },
        { label: "Asr in Cairo", href: buildRoutePath("en", "asr", "Cairo") },
        { label: "Dhuhr in Dubai", href: buildRoutePath("en", "dhuhr", "Dubai") },
        { label: "Next prayer in London", href: buildRoutePath("en", "next-prayer", "London") }
      ];

  return {
    activeLanguage: "en",
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
    topCities: TOP_CITIES,
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
    infoTitle: `A focused ${topic.toLowerCase()} page for daily use`,
    features: [
      `Built around the exact search intent for ${topic.toLowerCase()}${place ? ` in ${place}` : ""}.`,
      "Shows the next-prayer countdown and the full daily timetable on one page.",
      "Adapts automatically to browser language and detected location after page load.",
      "Uses clean canonical URLs that can be shared, indexed, and revisited easily."
    ],
    citiesEyebrow: "Explore More",
    citiesTitle: `Popular ${topic.toLowerCase()} pages`,
    cityLinks,
    cityIntentLinks,
    aboutEyebrow: "About",
    aboutTitle: `${topic}${place ? ` in ${place}` : ""} without the clutter`,
    aboutParagraphs: [
      place
        ? `This landing page is focused on ${topic.toLowerCase()} in ${place}, so visitors reach the right answer faster than on a generic homepage.`
        : `This landing page is focused on ${topic.toLowerCase()}, so visitors reach the right answer faster than on a generic homepage.`,
      "The goal is a more professional experience: clear prayer intent, automatic language handling, clean route structure, and a direct path to today's schedule.",
      "That stronger alignment between search query, URL, page title, and visible copy gives this route a better SEO foundation."
    ],
    faqEyebrow: "FAQ",
    faqTitle: `Common questions about ${topic.toLowerCase()}${place ? ` in ${place}` : ""}`,
    faq: [
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
    footerText: place ? `Accurate prayer times for ${place} and other cities.` : "Accurate prayer times by city.",
    noscriptText: "JavaScript is required to load live prayer times and the next prayer countdown."
  };
}

function buildArabicCopy({ pageType, place, topic }) {
  const resolvedPage = pageType === "home" ? "prayer-times" : pageType;
  const cityLinks = TOP_CITIES
    .filter(item => item.city !== place)
    .slice(0, 6)
    .map(item => ({
      label: `${topic} في ${item.city}`,
      href: buildRoutePath("ar", resolvedPage, item.city)
    }));
  const intentLinks = [
    { label: "مواقيت الصلاة اليوم", href: buildRoutePath("ar", "prayer-times") },
    { label: "وقت الصلاة القادمة", href: buildRoutePath("ar", "next-prayer") },
    { label: "وقت الفجر", href: buildRoutePath("ar", "fajr") },
    { label: "وقت الظهر", href: buildRoutePath("ar", "dhuhr") },
    { label: "وقت العصر", href: buildRoutePath("ar", "asr") },
    { label: "وقت المغرب", href: buildRoutePath("ar", "maghrib") },
    { label: "وقت العشاء", href: buildRoutePath("ar", "isha") }
  ];
  const cityIntentLinks = place
    ? [
        { label: `مواقيت الصلاة في ${place}`, href: buildRoutePath("ar", "prayer-times", place) },
        { label: `الصلاة القادمة في ${place}`, href: buildRoutePath("ar", "next-prayer", place) },
        { label: `الفجر في ${place}`, href: buildRoutePath("ar", "fajr", place) },
        { label: `الظهر في ${place}`, href: buildRoutePath("ar", "dhuhr", place) },
        { label: `العصر في ${place}`, href: buildRoutePath("ar", "asr", place) },
        { label: `المغرب في ${place}`, href: buildRoutePath("ar", "maghrib", place) },
        { label: `العشاء في ${place}`, href: buildRoutePath("ar", "isha", place) }
      ]
    : [
        { label: "مواقيت الصلاة في مكة", href: buildRoutePath("ar", "prayer-times", "Makkah") },
        { label: "العصر في القاهرة", href: buildRoutePath("ar", "asr", "Cairo") },
        { label: "الظهر في دبي", href: buildRoutePath("ar", "dhuhr", "Dubai") },
        { label: "الصلاة القادمة في لندن", href: buildRoutePath("ar", "next-prayer", "London") }
      ];

  return {
    activeLanguage: "ar",
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
    topCities: TOP_CITIES,
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
    infoTitle: `صفحة مركزة لعرض ${topic}${place ? ` في ${place}` : ""}`,
    features: [
      `الصفحة مبنية حول نية البحث المباشرة عن ${topic}${place ? ` في ${place}` : ""}.`,
      "تعرض الصلاة القادمة والجدول الكامل لليوم في مكان واحد.",
      "تتكيف تلقائيا مع لغة المتصفح والموقع بعد تحميل الصفحة.",
      "تستخدم رابطا أساسيا واضحا يمكن مشاركته وأرشفته بسهولة."
    ],
    citiesEyebrow: "اكتشف المزيد",
    citiesTitle: `صفحات شائعة عن ${topic}`,
    cityLinks,
    cityIntentLinks,
    aboutEyebrow: "حول الصفحة",
    aboutTitle: `${topic}${place ? ` في ${place}` : ""} بدون تعقيد`,
    aboutParagraphs: [
      place
        ? `هذه الصفحة مخصصة لعرض ${topic} في ${place} حتى يصل الزائر إلى الإجابة الصحيحة بسرعة أكبر من الصفحة العامة.`
        : `هذه الصفحة مخصصة لعرض ${topic} حتى يصل الزائر إلى الإجابة الصحيحة بسرعة أكبر من الصفحة العامة.`,
      "الهدف هو تجربة أكثر احترافية: نية صلاة واضحة، ولغة تلقائية، وهيكل روابط منظم، ومسار مباشر إلى جدول اليوم.",
      "هذا التطابق الأقوى بين البحث والرابط والعنوان والمحتوى المرئي يمنح الصفحة أساسا أفضل لتحسين الظهور في محركات البحث."
    ],
    faqEyebrow: "الأسئلة الشائعة",
    faqTitle: `أسئلة شائعة عن ${topic}${place ? ` في ${place}` : ""}`,
    faq: [
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
    footerText: place ? `مواقيت صلاة دقيقة في ${place} ومدن أخرى.` : "مواقيت صلاة دقيقة حسب المدينة.",
    noscriptText: "يتطلب عرض المواقيت الحية والعد التنازلي للصلاة القادمة تشغيل JavaScript."
  };
}

function renderHeroCopy(copy) {
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

          <div class="popular-cities" aria-label="${escapeHtml(copy.topCitiesAria)}">
${copy.topCities.map(item => `            <a class="city-chip" href="${escapeHtml(buildRoutePath(copy.activeLanguage, "home", item.city))}" data-city="${escapeHtml(item.city)}" data-country="${escapeHtml(item.country)}">${escapeHtml(item.city)}</a>`).join("\n")}
          </div>

          <div class="intent-links" aria-label="${escapeHtml(copy.intentAria)}">
${copy.intentLinks.map(item => `            <a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`).join("\n")}
          </div>
        </section>`;
}

function renderNextPrayerCard(copy) {
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
  const connector = language === "ar" ? "و" : "and";
  const last = items[items.length - 1];
  const rest = items.slice(0, -1)
    .map(item => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
    .join(", ");
  return `${rest}, ${connector} <a href="${escapeHtml(last.href)}">${escapeHtml(last.label)}</a>.`;
}

function normalizeLanguage(value) {
  const normalized = String(value || "en").toLowerCase();
  return LANGUAGE_ALIASES[normalized] || LANGUAGE_ALIASES[normalized.split("-")[0]] || "en";
}

function getAlternates(pageType, city) {
  const alternates = {};
  for (const language of SUPPORTED_RENDER_LANGUAGES) {
    alternates[language] = `${SITE_URL}${buildRoutePath(language, pageType, city)}`;
  }
  alternates.default = alternates.en;
  return alternates;
}

function buildRoutePath(language, pageType, city = "") {
  const route = ROUTES[pageType] || ROUTES.home;
  const pathName = route.path(city);
  const prefix = LANGUAGE_PREFIXES[language] || "";
  return `${prefix}${pathName === "/" && prefix ? "" : pathName}`;
}

function normalizePageType(value) {
  return Object.prototype.hasOwnProperty.call(ROUTES, value) ? value : "home";
}

function normalizeCity(value) {
  return decodeURIComponent(String(value || "")).replace(/\+/g, " ").replace(/\s+/g, " ").trim();
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
