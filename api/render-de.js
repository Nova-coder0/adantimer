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
      "Ziel ist ein professionelleres Erlebnis: automatische Sprache, automatische Standorterkennung und ein klarer Tagesplan.",
      "So verstehen Nutzer und Suchmaschinen die Seitenabsicht deutlicher."
    ],
    faqEyebrow: "FAQ",
    faqTitle: `${topic}${place ? ` in ${place}` : ""}: haeufige Fragen`,
    faq: [
      {
        question: "Erkennt die Seite meine Stadt automatisch?",
        answer: "Ja. Zuerst wird GPS versucht, danach eine IP-basierte Erkennung als Fallback."
      },
      {
        question: "Kann ich auf eine andere Stadt wechseln?",
        answer: "Ja. Du kannst jede Stadt manuell suchen und die Seite aktualisiert sich direkt."
      },
      {
        question: "Welche Gebetszeiten sehe ich hier?",
        answer: `Die Seite hebt ${topic.toLowerCase()} hervor und laedt zusaetzlich den kompletten Tagesplan fuer Fajr, Dhuhr, Asr, Maghrib und Isha.`
      }
    ],
    footerText: place ? `Genaue Gebetszeiten fuer ${place} und weitere Staedte.` : "Genaue Gebetszeiten nach Stadt.",
    noscriptText: "JavaScript wird benoetigt, um Live-Gebetszeiten und den Countdown zu laden."
  };
}

function getAlternates(pageType, city) {
  const route = ROUTES[pageType];
  const basePath = route.path(city);
  const arPath = `/ar${basePath === "/" ? "" : basePath}`;
  const dePath = buildGermanPath(pageType, city);
  return {
    en: `${SITE_URL}${basePath}`,
    ar: `${SITE_URL}${arPath}`,
    de: `${SITE_URL}${dePath}`,
    default: `${SITE_URL}${basePath}`
  };
}

function buildGermanPath(pageType, city = "") {
  const route = ROUTES[pageType] || ROUTES.home;
  const pathName = route.path(city);
  return `/de${pathName === "/" ? "" : pathName}`;
}

function renderHero(copy) {
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
${TOP_CITIES.map(item => `            <a class="city-chip" href="${escapeHtml(buildGermanPath("home", item.city))}" data-city="${escapeHtml(item.city)}" data-country="${escapeHtml(item.country)}">${escapeHtml(item.city)}</a>`).join("\n")}
          </div>

          <div class="intent-links" aria-label="${escapeHtml(copy.intentAria)}">
            <a href="${escapeHtml(buildGermanPath("prayer-times"))}">Gebetszeiten heute</a>
            <a href="${escapeHtml(buildGermanPath("next-prayer"))}">Naechstes Gebet</a>
            <a href="${escapeHtml(buildGermanPath("fajr"))}">Fajr-Zeit</a>
            <a href="${escapeHtml(buildGermanPath("dhuhr"))}">Dhuhr-Zeit</a>
            <a href="${escapeHtml(buildGermanPath("asr"))}">Asr-Zeit</a>
            <a href="${escapeHtml(buildGermanPath("maghrib"))}">Maghrib-Zeit</a>
            <a href="${escapeHtml(buildGermanPath("isha"))}">Isha-Zeit</a>
          </div>
        </section>`;
}

function renderNextPrayer(copy) {
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

function renderSchedule(copy) {
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

function renderInfo(copy) {
  return `      <section class="card info-card" aria-labelledby="why-heading">
        <p class="eyebrow">${escapeHtml(copy.infoEyebrow)}</p>
        <h2 id="why-heading">${escapeHtml(copy.infoTitle)}</h2>
        <ul class="feature-list">
${copy.features.map(item => `          <li>${escapeHtml(item)}</li>`).join("\n")}
        </ul>
      </section>`;
}

function renderCities(copy) {
  return `    <section class="card prose" aria-labelledby="cities-heading">
      <p class="eyebrow">${escapeHtml(copy.citiesEyebrow)}</p>
      <h2 id="cities-heading">${escapeHtml(copy.citiesTitle)}</h2>
      <p>${renderInlineLinks(copy.cityLinks)}</p>
      <p>${renderInlineLinks(copy.cityIntentLinks)}</p>
    </section>`;
}

function renderAbout(copy) {
  return `      <article class="card prose" aria-labelledby="about-heading">
        <p class="eyebrow">${escapeHtml(copy.aboutEyebrow)}</p>
        <h2 id="about-heading">${escapeHtml(copy.aboutTitle)}</h2>
        <p>${escapeHtml(copy.aboutParagraphs[0])}</p>
        <p>${escapeHtml(copy.aboutParagraphs[1])}</p>
        <p>${escapeHtml(copy.aboutParagraphs[2])}</p>
      </article>`;
}

function renderFaq(copy) {
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

function renderInlineLinks(items) {
  if (!items.length) return "";
  if (items.length === 1) return `<a href="${escapeHtml(items[0].href)}">${escapeHtml(items[0].label)}</a>.`;
  const last = items[items.length - 1];
  const rest = items
    .slice(0, -1)
    .map(item => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
    .join(", ");
  return `${rest} und <a href="${escapeHtml(last.href)}">${escapeHtml(last.label)}</a>.`;
}

function buildGermanClientPatch() {
  return `  <script>
    (() => {
      if (!window.location.pathname.startsWith("/de")) return;

      let pendingFix = false;

      const rewriteGermanUrl = input => {
        if (typeof input !== "string") return input;
        if (!input.includes("lang=de")) return input;
        const parsed = new URL(input, window.location.origin);
        parsed.searchParams.delete("lang");
        const nextPath = parsed.pathname === "/" ? "/de" : "/de" + parsed.pathname;
        const search = parsed.searchParams.toString();
        return nextPath + (search ? "?" + search : "") + parsed.hash;
      };

      const fixGermanLinks = () => {
        pendingFix = false;
        const canonical = document.querySelector("link[rel='canonical']");
        if (canonical) canonical.href = rewriteGermanUrl(canonical.getAttribute("href") || canonical.href);
        const ogUrl = document.querySelector("meta[property='og:url']");
        if (ogUrl) ogUrl.setAttribute("content", rewriteGermanUrl(ogUrl.getAttribute("content") || ""));
        document.querySelectorAll("link[rel='alternate']").forEach(link => {
          const hreflang = link.getAttribute("hreflang");
          if (hreflang === "de") link.href = rewriteGermanUrl(link.getAttribute("href") || link.href);
        });
        document.querySelectorAll("a[href*='lang=de']").forEach(link => {
          link.setAttribute("href", rewriteGermanUrl(link.getAttribute("href")));
        });
        const websiteSchema = document.getElementById("website-schema");
        if (websiteSchema) {
          try {
            const schema = JSON.parse(websiteSchema.textContent || "{}");
            if (schema && schema.url) {
              schema.url = rewriteGermanUrl(schema.url);
              websiteSchema.textContent = JSON.stringify(schema);
            }
          } catch {}
        }
      };

      const scheduleFix = () => {
        if (pendingFix) return;
        pendingFix = true;
        window.requestAnimationFrame(fixGermanLinks);
      };

      const originalReplaceState = history.replaceState.bind(history);
      history.replaceState = (state, title, url) => {
        const nextUrl = rewriteGermanUrl(url);
        const result = originalReplaceState(state, title, nextUrl);
        scheduleFix();
        return result;
      };

      const observer = new MutationObserver(scheduleFix);
      observer.observe(document.head, { subtree: true, childList: true, attributes: true, attributeFilter: ["href", "content"] });
      observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["href"] });

      window.addEventListener("DOMContentLoaded", scheduleFix);
      window.addEventListener("load", scheduleFix);
      scheduleFix();
    })();
  </script>`;
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
