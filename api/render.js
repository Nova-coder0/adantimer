import { readFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://www.adantimer.com";
const INDEX_PATH = path.join(process.cwd(), "index.html");

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
    const place = city ? titleCase(city) : "";
    const topic = route[language] || route.en;
    const canonicalPath = language === "ar"
      ? `/ar${route.path(city) === "/" ? "" : route.path(city)}`
      : route.path(city);
    const canonical = `${SITE_URL}${canonicalPath}`;
    const alternates = getAlternates(route, city);
    const title = locale.title(topic, place, pageType);
    const description = locale.description(topic, place);
    const template = await readFile(INDEX_PATH, "utf8");
    const html = applyHead(template, { alternates, canonical, description, locale, pageType, title });

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

function applyHead(template, { alternates, canonical, description, locale, pageType, title }) {
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedCanonical = escapeHtml(canonical);
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url: canonical,
    description,
    inLanguage: locale.inLanguage
  };

  return template
    .replace(/<html lang="[^"]*"(?: dir="[^"]*")?>/, `<html lang="${locale.htmlLang}" dir="${locale.dir}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapedTitle}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapedDescription}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${escapedCanonical}">`)
    .replace(/<link rel="alternate" hreflang="en" href="[^"]*">/, `<link rel="alternate" hreflang="en" href="${escapeHtml(alternates.en)}">`)
    .replace(/<link rel="alternate" hreflang="ar" href="[^"]*">/, `<link rel="alternate" hreflang="ar" href="${escapeHtml(alternates.ar)}">`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*">/, `<link rel="alternate" hreflang="x-default" href="${escapeHtml(alternates.default)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapedTitle}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapedDescription}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${escapedCanonical}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapedTitle}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapedDescription}">`)
    .replace(/<script type="application\/ld\+json" id="website-schema">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="website-schema">\n${JSON.stringify(schema, null, 2)}\n  </script>`)
    .replace(/<body data-page="[^"]*">/, `<body data-page="${pageType}">`);
}

function normalizeLanguage(value) {
  return String(value || "en").toLowerCase().startsWith("ar") ? "ar" : "en";
}

function getAlternates(route, city) {
  const enPath = route.path(city);
  const arPath = `/ar${enPath === "/" ? "" : enPath}`;
  return {
    en: `${SITE_URL}${enPath}`,
    ar: `${SITE_URL}${arPath}`,
    default: `${SITE_URL}${enPath}`
  };
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
