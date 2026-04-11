import { readFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://www.adantimer.com";
const INDEX_PATH = path.join(process.cwd(), "index.html");

const TOP_CITIES = [
  { city: "Berlin", country: "Germany" },
  { city: "London", country: "United Kingdom" },
  { city: "Makkah", country: "Saudi Arabia" },
  { city: "Madinah", country: "Saudi Arabia" },
  { city: "Buraydah", country: "Saudi Arabia" },
  { city: "Dubai", country: "United Arab Emirates" },
  { city: "Cairo", country: "Egypt" },
  { city: "Istanbul", country: "Turkey" },
  { city: "Sydney", country: "Australia" }
];

const ROUTES = {
  home: { label: "Gebetszeiten", path: city => (city ? `/${slugify(city)}` : "/") },
  "prayer-times": { label: "Gebetszeiten", path: city => (city ? `/prayer-times/${slugify(city)}` : "/prayer-times") },
  "next-prayer": { label: "Zeit des naechsten Gebets", path: city => (city ? `/next-prayer/${slugify(city)}` : "/next-prayer") },
  fajr: { label: "Fajr-Zeit", path: city => (city ? `/fajr-time/${slugify(city)}` : "/fajr-time") },
  dhuhr: { label: "Dhuhr-Zeit", path: city => (city ? `/dhuhr-time/${slugify(city)}` : "/dhuhr-time") },
  asr: { label: "Asr-Zeit", path: city => (city ? `/asr-time/${slugify(city)}` : "/asr-time") },
  maghrib: { label: "Maghrib-Zeit", path: city => (city ? `/maghrib-time/${slugify(city)}` : "/maghrib-time") },
  isha: { label: "Isha-Zeit", path: city => (city ? `/isha-time/${slugify(city)}` : "/isha-time") }
};

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const pageType = normalizePageType(url.searchParams.get("type"));
    const city = normalizeCity(url.searchParams.get("city") || "");
    const route = ROUTES[pageType];
    const place = city ? titleCase(city) : "";
    const topic = route.label;
    const canonicalPath = buildGermanPath(pageType, city);
    const canonical = `${SITE_URL}${canonicalPath}`;
    const alternates = getAlternates(pageType, city);
    const title = buildTitle(pageType, topic, place);
    const description = buildDescription(pageType, topic, place);
    const copy = buildCopy(pageType, topic, place);
    const template = await readFile(INDEX_PATH, "utf8");
    const html = applyTemplate(template, {
      alternates,
      canonical,
      copy,
      description,
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
    console.error("render-de failed", error);
    return new Response("Adantimer render-de failed", { status: 500 });
  }
}

function applyTemplate(template, { alternates, canonical, copy, description, pageType, title }) {
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedCanonical = escapeHtml(canonical);
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url: canonical,
    description,
    inLanguage: "de"
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
    .replace(/<html lang="[^"]*"(?: dir="[^"]*")?>/, '<html lang="de" dir="ltr">')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapedTitle}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapedDescription}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${escapedCanonical}">`)
    .replace(
      /<link rel="alternate" hreflang="en" href="[^"]*">\s*<link rel="alternate" hreflang="ar" href="[^"]*">\s*<link rel="alternate" hreflang="x-default" href="[^"]*">/,
      [
        `<link rel="alternate" hreflang="en" href="${escapeHtml(alternates.en)}">`,
        `<link rel="alternate" hreflang="ar" href="${escapeHtml(alternates.ar)}">`,
        `<link rel="alternate" hreflang="de" href="${escapeHtml(alternates.de)}">`,
        `<link rel="alternate" hreflang="x-default" href="${escapeHtml(alternates.default)}">`
      ].join("\n  ")
    )
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapedTitle}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapedDescription}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${escapedCanonical}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapedTitle}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapedDescription}">`)
    .replace(
      /<script type="application\/ld\+json" id="website-schema">[\s\S]*?<\/script>/,
      `<script type="application/ld+json" id="website-schema">\n${JSON.stringify(pageSchema, null, 2)}\n  </script>`
    )
    .replace(
      /<script type="application\/ld\+json">[\s\S]*?"@type": "FAQPage"[\s\S]*?<\/script>/,
      `<script type="application/ld+json">\n${JSON.stringify(faqSchema, null, 2)}\n  </script>`
    )
    .replace(/<body data-page="[^"]*">/, `<body data-page="${pageType}">`)
    .replace(/<a class="brand" href="[^"]*">/, '<a class="brand" href="/de">')
    .replace(/<section class="hero-copy">[\s\S]*?<\/section>/, renderHero(copy))
    .replace(/<aside class="next-prayer card featured-card" aria-live="polite">[\s\S]*?<\/aside>/, renderNextPrayer(copy))
    .replace(/<section class="card schedule-card" aria-labelledby="schedule-heading">[\s\S]*?<\/section>/, renderSchedule(copy))
    .replace(/<section class="card info-card" aria-labelledby="why-heading">[\s\S]*?<\/section>/, renderInfo(copy))
    .replace(/<section class="card prose" aria-labelledby="cities-heading">[\s\S]*?<\/section>/, renderCities(copy))
    .replace(/<article class="card prose" aria-labelledby="about-heading">[\s\S]*?<\/article>/, renderAbout(copy))
    .replace(/<section class="card prose" aria-labelledby="faq-heading">[\s\S]*?<\/section>/, renderFaq(copy))
    .replace(/<footer class="shell footer">[\s\S]*?<\/footer>/, renderFooter(copy))
    .replace(/<noscript>[\s\S]*?<\/noscript>/, renderNoscript(copy))
    .replace(
      /<script src="\/script\.js"><\/script>/,
      `${buildGermanClientPatch()}\n  <script src="/script.js"></script>`
    );
}

function buildTitle(pageType, topic, place) {
  if (pageType === "home" && !place) return "Adantimer | Genaue Gebetszeiten und naechstes Gebet";
  return `${topic}${place ? ` in ${place}` : ""} heute | Adantimer`;
}

function buildDescription(pageType, topic, place) {
  if (pageType === "home" && !place) {
    return "Pruefe genaue Gebetszeiten, den Countdown zum naechsten Gebet und den Tagesplan automatisch nach Standort.";
  }
  return place
    ? `Pruefe ${topic.toLowerCase()} in ${place}, sieh den Countdown zum naechsten Gebet und den vollstaendigen Tagesplan.`
    : `Pruefe ${topic.toLowerCase()}, sieh den Countdown zum naechsten Gebet und den vollstaendigen Tagesplan.`;
}

function buildCopy(pageType, topic, place) {
  const cityLinks = TOP_CITIES
    .filter(item => item.city !== place)
    .slice(0, 6)
    .map(item => ({
      label: `${topic} in ${item.city}`,
      href: buildGermanPath(pageType === "home" ? "prayer-times" : pageType, item.city)
    }));
  const cityIntentLinks = place
    ? [
        { label: `Gebetszeiten in ${place}`, href: buildGermanPath("prayer-times", place) },
        { label: `Naechstes Gebet in ${place}`, href: buildGermanPath("next-prayer", place) },
        { label: `Asr-Zeit in ${place}`, href: buildGermanPath("asr", place) },
        { label: `Dhuhr-Zeit in ${place}`, href: buildGermanPath("dhuhr", place) }
      ]
    : [
        { label: "Gebetszeiten in Berlin", href: buildGermanPath("prayer-times", "Berlin") },
        { label: "Naechstes Gebet in London", href: buildGermanPath("next-prayer", "London") },
        { label: "Asr-Zeit in Dubai", href: buildGermanPath("asr", "Dubai") },
        { label: "Dhuhr-Zeit in Buraydah", href: buildGermanPath("dhuhr", "Buraydah") }
      ];

  return {
    heroEyebrow: pageType === "home" ? (place ? `Gebetsplan fuer ${place}` : "Gebetszeiten nach Stadt") : topic,
    heroHeading: pageType === "home" ? (place ? `Gebetszeiten in ${place} heute` : "Gebetszeiten heute und Countdown zum naechsten Gebet") : `${topic}${place ? ` in ${place}` : ""}`,
    heroSubtitle: pageType === "home"
      ? (place
          ? `Sieh genaue Gebetszeiten in ${place}, den Countdown zum naechsten Gebet und den kompletten Tagesplan.`
          : "Die Seite passt sich an die Browsersprache an und liefert Gebetszeiten direkt fuer den aktuellen Standort.")
      : (place
          ? `Sieh ${topic.toLowerCase()} in ${place} und darunter den vollstaendigen Gebetsplan.`
          : `Lade ${topic.toLowerCase()} automatisch und pruefe darunter den vollstaendigen Gebetsplan.`),
    cityLabel: "Stadt",
    cityPlaceholder: "Stadt eingeben",
    countryLabel: "Land",
    countryPlaceholder: "Land (optional)",
    submitLabel: "Gebetszeiten laden",
    topCitiesAria: "Beliebte Staedte",
    intentAria: "Gebets-Suchkuerzel",
    locationStatus: place ? `Gebetszeiten fuer ${place}` : "Standort wird erkannt",
    nextPrayerTitle: "Naechstes Gebet",
    currentPrayerLabel: "Aktuelles Gebet",
    todayLabel: "Heute",
    methodLabel: "Methode",
    loadingLabel: "Wird geladen...",
    locationText: place ? `Der Gebetsplan fuer ${place} wird automatisch nach dem Start geladen.` : "Zuerst wird GPS versucht, danach der IP-Fallback.",
    scheduleEyebrow: "Heute",
    scheduleHeading: pageType === "home" ? "Heutiger Gebetsplan" : `${topic} und vollstaendiger Gebetsplan`,
    scheduleSummary: place ? `Taeglicher Gebetsplan und Countdown fuer ${place}.` : "Praezise Zeiten fuer deine aktuelle Stadt.",
    infoEyebrow: "Warum diese Seite hilft",
    infoTitle: `Fuer schnelle ${topic.toLowerCase()}-Abfragen gebaut`,
    features: [
      "Erkennt Sprache und Standort automatisch.",
      `${topic} wird mit Live-Countdown und klarer Statusanzeige gezeigt.`,
      "Funktioniert direkt im Browser ohne App.",
      "Die Seite bleibt direkt teilbar und indexierbar."
    ],
    citiesEyebrow: "Mehr entdecken",
    citiesTitle: `Beliebte Seiten zu ${topic.toLowerCase()}`,
    cityLinks,
    cityIntentLinks,
    aboutEyebrow: "Ueberblick",
    aboutTitle: `${topic}${place ? ` in ${place}` : ""} ohne unnoetige Umwege`,
    aboutParagraphs: [
      place
        ? `Diese Seite ist auf ${topic.toLowerCase()} in ${place} ausgerichtet, damit Besucher sofort die richtige Information sehen.`
        : `Diese Seite ist auf ${topic.toLowerCase()} ausgerichtet, damit Besucher sofort die richtige Information sehen.`,
      "Ziel ist ein professionelleres Erlebnis: automatische Sprache, automatische Standorterkenu