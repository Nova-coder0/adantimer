import { readFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://www.adantimer.com";
const INDEX = path.join(process.cwd(), "index.html");
const CITY_SET = ["Makkah", "Buraydah", "Cairo", "Dubai", "Istanbul", "London", "Sydney"];
const ROUTES = { home: "", "prayer-times": "prayer-times", "next-prayer": "next-prayer", fajr: "fajr-time", dhuhr: "dhuhr-time", asr: "asr-time", maghrib: "maghrib-time", isha: "isha-time" };

const I18N = {
  en: {
    html: "en", dir: "ltr", in: "in", home: "Prayer Times", prayer: "Prayer Times", next: "Next Prayer Time", fajr: "Fajr Time", dhuhr: "Dhuhr Time", asr: "Asr Time", maghrib: "Maghrib Time", isha: "Isha Time",
    homeTitle: "Adantimer | Accurate Prayer Times and Next Salah Countdown",
    homeDesc: "Check accurate prayer times, see the next salah countdown, and review the full daily schedule automatically by location.",
    hero: "Prayer times by city", sub: "Check accurate daily prayer times, follow the next prayer countdown, and switch quickly to any city worldwide.",
    city: "City", country: "Country", cityPh: "Enter city", countryPh: "Country (optional)", submit: "Find Prayer Times",
    nextPrayer: "Next Prayer", current: "Current Prayer", today: "Today", method: "Method", loading: "Loading...",
    why: "Why this page helps", info: "Built for direct prayer-time searches with a clean city URL, visible schedule content, and automatic location support.",
    explore: "Explore More", about: "About", aboutText: "This page matches prayer-time intent, city-based routes, and visible on-page copy so search engines and visitors both land on the right answer faster.",
    faq: "FAQ", footer: "Accurate prayer times by city.", noscript: "JavaScript is required to load live prayer times and the next prayer countdown."
  },
  ar: {
    html: "ar", dir: "rtl", in: "\u0641\u064a", home: "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629", prayer: "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629", next: "\u0648\u0642\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629", fajr: "\u0648\u0642\u062a \u0627\u0644\u0641\u062c\u0631", dhuhr: "\u0648\u0642\u062a \u0627\u0644\u0638\u0647\u0631", asr: "\u0648\u0642\u062a \u0627\u0644\u0639\u0635\u0631", maghrib: "\u0648\u0642\u062a \u0627\u0644\u0645\u063a\u0631\u0628", isha: "\u0648\u0642\u062a \u0627\u0644\u0639\u0634\u0627\u0621",
    homeTitle: "Adantimer | \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0648\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629",
    homeDesc: "\u062a\u062d\u0642\u0642 \u0645\u0646 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0648\u0627\u0639\u0631\u0641 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0648\u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645 \u062d\u0633\u0628 \u0645\u0648\u0642\u0639\u0643.",
    hero: "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u062d\u0633\u0628 \u0627\u0644\u0645\u062f\u064a\u0646\u0629", sub: "\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u062f\u0642\u064a\u0642\u0629 \u0648\u062a\u0627\u0628\u0639 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0648\u0627\u0646\u062a\u0642\u0644 \u0628\u0633\u0631\u0639\u0629 \u0625\u0644\u0649 \u0623\u064a \u0645\u062f\u064a\u0646\u0629.",
    city: "\u0627\u0644\u0645\u062f\u064a\u0646\u0629", country: "\u0627\u0644\u062f\u0648\u0644\u0629", cityPh: "\u0623\u062f\u062e\u0644 \u0627\u0644\u0645\u062f\u064a\u0646\u0629", countryPh: "\u0627\u0644\u062f\u0648\u0644\u0629 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)", submit: "\u0627\u0639\u0631\u0636 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629",
    nextPrayer: "\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629", current: "\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629", today: "\u0627\u0644\u064a\u0648\u0645", method: "\u0627\u0644\u0637\u0631\u064a\u0642\u0629", loading: "\u062c\u0627\u0631 \u0627\u0644\u062a\u062d\u0645\u064a\u0644...",
    why: "\u0644\u0645\u0627\u0630\u0627 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0641\u064a\u062f\u0629", info: "\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0628\u0646\u064a\u0629 \u0644\u0628\u062d\u062b \u0645\u0628\u0627\u0634\u0631 \u0639\u0646 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0645\u0639 \u0631\u0627\u0628\u0637 \u0648\u0627\u0636\u062d \u0648\u0645\u062d\u062a\u0648\u0649 \u0638\u0627\u0647\u0631.",
    explore: "\u0627\u0643\u062a\u0634\u0641 \u0627\u0644\u0645\u0632\u064a\u062f", about: "\u062d\u0648\u0644", aboutText: "\u062a\u062c\u0645\u0639 \u0627\u0644\u0635\u0641\u062d\u0629 \u0628\u064a\u0646 \u0627\u0644\u0628\u062d\u062b \u0648\u0627\u0644\u0631\u0627\u0628\u0637 \u0648\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u062d\u062a\u0649 \u064a\u0635\u0644 \u0627\u0644\u0632\u0627\u0626\u0631 \u0627\u0644\u0649 \u0627\u0644\u0627\u062c\u0627\u0628\u0629 \u0628\u0633\u0631\u0639\u0629.",
    faq: "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629", footer: "\u0645\u0648\u0627\u0642\u064a\u062a \u0635\u0644\u0627\u0629 \u062f\u0642\u064a\u0642\u0629 \u062d\u0633\u0628 \u0627\u0644\u0645\u062f\u064a\u0646\u0629.", noscript: "\u064a\u062a\u0637\u0644\u0628 \u0639\u0631\u0636 \u0627\u0644\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u062d\u064a\u0629 \u062a\u0634\u063a\u064a\u0644 JavaScript."
  },
  de: {
    html: "de", dir: "ltr", in: "in", home: "Gebetszeiten", prayer: "Gebetszeiten", next: "Naechstes Gebet", fajr: "Fajr Zeit", dhuhr: "Dhuhr Zeit", asr: "Asr Zeit", maghrib: "Maghrib Zeit", isha: "Isha Zeit",
    homeTitle: "Adantimer | Genaue Gebetszeiten und naechstes Gebet",
    homeDesc: "Pruefe genaue Gebetszeiten, den Countdown zum naechsten Gebet und den Tagesplan automatisch nach Standort.",
    hero: "Gebetszeiten nach Stadt", sub: "Pruefe genaue Gebetszeiten, verfolge den Countdown und wechsle schnell zu jeder Stadt.",
    city: "Stadt", country: "Land", cityPh: "Stadt eingeben", countryPh: "Land (optional)", submit: "Gebetszeiten laden",
    nextPrayer: "Naechstes Gebet", current: "Aktuelles Gebet", today: "Heute", method: "Methode", loading: "Wird geladen...",
    why: "Warum diese Seite hilft", info: "Diese Route passt zu direkter Gebetszeit-Suche mit sauberer Stadt-URL und sichtbarem Tagesplan.",
    explore: "Mehr entdecken", about: "Ueberblick", aboutText: "Diese Seite stimmt Suchintention, URL, Titel und sichtbaren Inhalt besser aufeinander ab und schafft damit eine staerkere SEO-Basis.",
    faq: "FAQ", footer: "Genaue Gebetszeiten nach Stadt.", noscript: "JavaScript wird benoetigt, um Live-Gebetszeiten und den Countdown zu laden."
  },
  fr: {
    html: "fr", dir: "ltr", in: "a", home: "Horaires de priere", prayer: "Horaires de priere", next: "Prochaine priere", fajr: "Heure du Fajr", dhuhr: "Heure du Dhuhr", asr: "Heure du Asr", maghrib: "Heure du Maghrib", isha: "Heure du Isha",
    homeTitle: "Adantimer | Horaires de priere et prochaine priere",
    homeDesc: "Consultez les horaires de priere, le compte a rebours de la prochaine priere et le planning du jour selon la localisation.",
    hero: "Horaires par ville", sub: "Consultez les horaires precis, la prochaine priere et passez vite a n'importe quelle ville.",
    city: "Ville", country: "Pays", cityPh: "Entrer une ville", countryPh: "Pays (optionnel)", submit: "Voir les horaires",
    nextPrayer: "Prochaine priere", current: "Priere actuelle", today: "Aujourd'hui", method: "Methode", loading: "Chargement...",
    why: "Pourquoi cette page aide", info: "Cette route cible la recherche directe d'horaires de priere avec une URL propre et un planning visible.",
    explore: "Explorer plus", about: "A propos", aboutText: "La page aligne mieux la requete, l'URL, le titre et le contenu visible pour renforcer la base SEO.",
    faq: "FAQ", footer: "Horaires de priere precis par ville.", noscript: "JavaScript est requis pour charger les horaires en direct."
  }
};

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const lang = pickLang(url.searchParams.get("lang") || url.searchParams.get("locale"));
    const type = ROUTES[url.searchParams.get("type")] !== undefined ? url.searchParams.get("type") : "home";
    const city = cleanCity(url.searchParams.get("city"));
    const copy = I18N[lang];
    const topic = copy[type === "prayer-times" ? "prayer" : type];
    const place = city ? titleize(city) : "";
    const canonical = SITE + routePath(lang, type, city);
    const title = !place && type === "home" ? copy.homeTitle : makeTitle(copy, topic, place);
    const description = !place && type === "home" ? copy.homeDesc : makeDescription(copy, topic, place);
    const template = await readFile(INDEX, "utf8");
    const html = template
      .replace(/<html lang="[^"]*"(?: dir="[^"]*")?>/, `<html lang="${copy.html}" dir="${copy.dir}">`)
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`)
      .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${esc(canonical)}">`)
      .replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*">(?:\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">)+/, alternates(type, city))
      .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`)
      .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`)
      .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${esc(canonical)}">`)
      .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`)
      .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(description)}">`)
      .replace(/<script type="application\/ld\+json" id="website-schema">[\s\S]*?<\/script>/, schema("website-schema", { "@context": "https://schema.org", "@type": "WebPage", name: title, url: canonical, description, inLanguage: copy.html }))
      .replace(/<script type="application\/ld\+json">[\s\S]*?"@type": "FAQPage"[\s\S]*?<\/script>/, schema(null, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems(copy, topic, place).map(x => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) }))
      .replace(/<body data-page="[^"]*">/, `<body data-page="${type}">`)
      .replace(/<a class="brand" href="[^"]*">/, `<a class="brand" href="${esc(routePath(lang, "home"))}">`)
      .replace(/<section class="hero-copy">[\s\S]*?<\/section>/, hero(copy, topic, place, lang))
      .replace(/<aside class="next-prayer card featured-card" aria-live="polite">[\s\S]*?<\/aside>/, nextCard(copy, topic, place))
      .replace(/<section class="card schedule-card" aria-labelledby="schedule-heading">[\s\S]*?<\/section>/, schedule(copy, topic, place))
      .replace(/<section class="card info-card" aria-labelledby="why-heading">[\s\S]*?<\/section>/, info(copy))
      .replace(/<section class="card prose" aria-labelledby="cities-heading">[\s\S]*?<\/section>/, cities(copy, lang, type))
      .replace(/<article class="card prose" aria-labelledby="about-heading">[\s\S]*?<\/article>/, about(copy, topic, place))
      .replace(/<section class="card prose" aria-labelledby="faq-heading">[\s\S]*?<\/section>/, faq(copy, topic, place))
      .replace(/<footer class="shell footer">[\s\S]*?<\/footer>/, `<footer class="shell footer"><p>&copy; 2026 Adantimer. ${esc(copy.footer)}</p></footer>`)
      .replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript><div class="noscript-banner">${esc(copy.noscript)}</div></noscript>`);
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch (error) {
    console.error("render failed", error);
    return new Response("Adantimer render failed", { status: 500 });
  }
}

function pickLang(value) {
  const key = String(value || "en").toLowerCase();
  if (key.startsWith("ar")) return "ar";
  if (key.startsWith("de")) return "de";
  if (key.startsWith("fr")) return "fr";
  return "en";
}

function cleanCity(value) {
  return decodeURIComponent(String(value || "")).replace(/\+/g, " ").replace(/\s+/g, " ").trim();
}

function routePath(lang, type, city = "") {
  const slug = city ? slugify(city) : "";
  const segment = ROUTES[type] || "";
  const base = segment ? (slug ? `/${segment}/${slug}` : `/${segment}`) : (slug ? `/${slug}` : "/");
  return lang === "en" ? base : `/${lang}${base === "/" ? "" : base}`;
}

function makeTitle(copy, topic, place) {
  if (!place) return `${topic} | Adantimer`;
  return `${topic} ${copy.in} ${place} | Adantimer`;
}

function makeDescription(copy, topic, place) {
  if (copy.html === "ar") return `\u062a\u062d\u0642\u0642 \u0645\u0646 ${topic}${place ? ` \u0641\u064a ${place}` : ""}\u060c \u0648\u0627\u0639\u0631\u0641 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0648\u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645 \u0627\u0644\u0643\u0627\u0645\u0644.`;
  return `${topic}${place ? ` ${copy.in} ${place}` : ""}, next prayer countdown, and the full daily schedule on one focused page.`;
}

function alternates(type, city) {
  const langs = ["en", "ar", "de", "fr"];
  const links = langs.map(lang => `<link rel="alternate" hreflang="${lang}" href="${SITE}${routePath(lang, type, city)}">`);
  links.push(`<link rel="alternate" hreflang="x-default" href="${SITE}${routePath("en", type, city)}">`);
  return links.join("\n  ");
}

function hero(copy, topic, place, lang) {
  const heading = place ? makeTitle(copy, topic, place).replace(" | Adantimer", "") : copy.homeTitle.replace("Adantimer | ", "");
  const chips = CITY_SET.slice(0, 5).map(city => `<a class="city-chip" href="${esc(routePath(lang, "home", city))}" data-city="${esc(city)}">${esc(city)}</a>`).join("\n");
  return `        <section class="hero-copy">\n          <p class="eyebrow">${esc(copy.hero)}</p>\n          <h1 id="hero-heading">${esc(heading)}</h1>\n          <p id="hero-subtitle" class="hero-subtitle">${esc(copy.sub)}</p>\n          <form id="location-form" class="location-form" novalidate>\n            <label class="sr-only" for="manual-city">${esc(copy.city)}</label>\n            <input type="text" id="manual-city" name="city" placeholder="${esc(copy.cityPh)}" autocomplete="address-level2">\n            <label class="sr-only" for="manual-country">${esc(copy.country)}</label>\n            <input type="text" id="manual-country" name="country" placeholder="${esc(copy.countryPh)}" autocomplete="country-name">\n            <button id="set-location-btn" type="submit">${esc(copy.submit)}</button>\n          </form>\n          <div class="popular-cities" aria-label="${esc(copy.explore)}">\n${chips}\n          </div>\n        </section>`;
}

function nextCard(copy, topic, place) {
  const location = place || copy.hero;
  const lead = place ? `${topicLead(copy)} ${place}` : copy.sub;
  return `        <aside class="next-prayer card featured-card" aria-live="polite">\n          <p class="card-label" id="location-status">${esc(location)}</p>\n          <h2 id="title">${esc(copy.nextPrayer)}</h2>\n          <div id="next-prayer-name" class="highlight"></div>\n          <div id="countdown" class="countdown">${esc(copy.loading)}</div>\n          <div class="mini-stats">\n            <div class="mini-stat"><span id="current-prayer-label">${esc(copy.current)}</span><strong id="current-prayer-value">${esc(copy.loading)}</strong></div>\n            <div class="mini-stat"><span id="today-label">${esc(copy.today)}</span><strong id="today-date-value">${esc(copy.loading)}</strong></div>\n            <div class="mini-stat"><span id="method-label">${esc(copy.method)}</span><strong id="method-value">${esc(copy.loading)}</strong></div>\n          </div>\n          <p id="location" class="location">${esc(lead)}</p>\n        </aside>`;
}

function schedule(copy, topic, place) {
  const summary = makeDescription(copy, topic, place);
  return `      <section class="card schedule-card" aria-labelledby="schedule-heading">\n        <div class="section-head">\n          <div><p class="eyebrow">${esc(copy.today)}</p><h2 id="schedule-heading">${esc(topic)}</h2></div>\n          <p id="schedule-summary" class="muted">${esc(summary)}</p>\n        </div>\n        <div id="prayer-times" class="prayer-times"></div>\n      </section>`;
}

function info(copy) {
  return `      <section class="card info-card" aria-labelledby="why-heading">\n        <p class="eyebrow">${esc(copy.why)}</p>\n        <h2 id="why-heading">${esc(copy.hero)}</h2>\n        <ul class="feature-list"><li>${esc(copy.info)}</li></ul>\n      </section>`;
}

function cities(copy, lang, type) {
  const links = CITY_SET.slice(0, 4).map(city => `<a href="${esc(routePath(lang, type, city))}">${esc(city)}</a>`).join(", ");
  return `    <section class="card prose" aria-labelledby="cities-heading">\n      <p class="eyebrow">${esc(copy.explore)}</p>\n      <h2 id="cities-heading">${esc(copy.hero)}</h2>\n      <p>${links}</p>\n    </section>`;
}

function about(copy, topic, place) {
  const heading = place ? `${topic} ${copy.in} ${place}` : topic;
  return `      <article class="card prose" aria-labelledby="about-heading">\n        <p class="eyebrow">${esc(copy.about)}</p>\n        <h2 id="about-heading">${esc(heading)}</h2>\n        <p>${esc(copy.aboutText)}</p>\n      </article>`;
}

function faq(copy, topic, place) {
  const items = faqItems(copy, topic, place).map(item => `<div><h3>${esc(item.q)}</h3><p>${esc(item.a)}</p></div>`).join("\n");
  return `      <section class="card prose" aria-labelledby="faq-heading">\n        <p class="eyebrow">${esc(copy.faq)}</p>\n        <h2 id="faq-heading">${esc(topic)}</h2>\n        <div class="faq-list">${items}</div>\n      </section>`;
}

function faqItems(copy, topic, place) {
  return [
    { q: copy.html === "ar" ? "\u0647\u0644 \u064a\u0645\u0643\u0646\u0646\u064a \u0645\u0634\u0627\u0631\u0643\u0629 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629\u061f" : "Can I share this page?", a: copy.html === "ar" ? "\u0646\u0639\u0645. \u0643\u0644 \u0631\u0627\u0628\u0637 \u0645\u062e\u0635\u0635 \u0644\u0628\u062d\u062b \u0648\u0627\u0636\u062d \u0639\u0646 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629." : "Yes. Each route is built as a direct page for a specific prayer-time intent and city." },
    { q: copy.html === "ar" ? "\u0647\u0644 \u064a\u062d\u062f\u062f Adantimer \u0627\u0644\u0644\u063a\u0629 \u0648\u0627\u0644\u0645\u0648\u0642\u0639 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u061f" : "Does Adantimer detect language and location automatically?", a: copy.html === "ar" ? "\u0646\u0639\u0645. \u062a\u062a\u0628\u0639 \u0627\u0644\u0635\u0641\u062d\u0629 \u0644\u063a\u0629 \u0627\u0644\u0645\u062a\u0635\u0641\u062d \u0628\u0639\u062f \u0627\u0644\u062a\u062d\u0645\u064a\u0644 \u0648\u062a\u062c\u0631\u0628 GPS \u0623\u0648\u0644\u0627 \u062b\u0645 IP \u0639\u0646\u062f \u0627\u0644\u062d\u0627\u062c\u0629." : "Yes. The page follows browser language after load and tries GPS first, then IP fallback." },
    { q: place ? `${topic} ${copy.in} ${place}?` : topic, a: makeDescription(copy, topic, place) }
  ];
}

function schema(id, data) {
  const attr = id ? ` id="${id}"` : "";
  return `<script type="application/ld+json"${attr}>\n${JSON.stringify(data, null, 2)}\n  </script>`;
}

function topicLead(copy) {
  if (copy.html === "ar") return "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0641\u064a";
  return copy.hero;
}

function titleize(value) {
  return value.split("-").filter(Boolean).map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(" ");
}

function slugify(value) {
  return String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-").toLowerCase();
}

function esc(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
