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
  const alternateLinks = renderAlternateLinks(alternates);
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
    .replace(/<link rel="alternate" hreflang="en" href="[^"]*">\s*<link rel="alternate" hreflang="ar" href="[^"]*">\s*<link rel="alternate" hreflang="x-default" href="[^"]*">/, alternateLinks)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapedTitle}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapedDescription}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${escapedCanonical}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapedTitle}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapedDescription}">`)
    .replace(/<script type="application\/ld\+json" id="website-schema">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="website-schema">\n${JSON.stringify(pageSchema, null, 2)}\n  </script>`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?"@type": "FAQPage"[\s\S]*?<\/script>/, `<script type="application/ld+json">\n${JSON.stringify(faqSchema, null, 2)}\n  </script>`)
    .replace(/<body data-page="[^"]*">/, `<body data-page="${pageType}">`)
    .replace(/<a class="brand" href="[^"]*">/, `<a class="brand" href="${escapeHtml(copy.brandHref)}">`)
    .replace(/<button type="button" data-lang="en" class="[^"]*">EN<\/button>/, `<button type="button" data-lang="en" class="${copy.activeLanguage === "en" ? "lang-btn is-active" : "lang-btn"}">EN</button>`)
    .replace(/<button type="button" data-lang="ar" class="[^"]*">AR<\/button>/, `<button type="button" data-lang="ar" class="${copy.activeLanguage === "ar" ? "lang-btn is-active" : "lang-btn"}">AR</button>`)
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

function getServerCopy({ canonical, city, language, pageType, place, topic }) {
  if (language === "ar") {
    return buildArabicCopy({ canonical, city, pageType, place, topic });
  }
  if (language === "en") {
    return buildEnglishCopy({ canonical, city, pageType, place, topic });
  }
  return buildLocalizedCopy(language, { canonical, city, pageType, place, topic });
}

function buildEnglishCopy({ city, pageType, place, topic }) {
  const brandHref = buildRoutePath("en", "home");
  const cityLinks = getLocalizedCityLinks("en", pageType, place, topic);
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
        { label: `Isha in ${place}`, href: build