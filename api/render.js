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
    html: "ar", dir: "rtl", in: "في", home: "مواقيت الصلاة", prayer: "مواقيت الصلاة", next: "وقت الصلاة القادمة", fajr: "وقت الفجر", dhuhr: "وقت الظهر", asr: "وقت العصر", maghrib: "وقت المغرب", isha: "وقت العشاء",
    homeTitle: "Adantimer | مواقيت الصلاة ووقت الصلاة القادمة",
    homeDesc: "تحقق من مواقيت الصلاة واعرف الصلاة القادمة وجدول اليوم حسب موقعك.",
    hero: "مواقيت الصلاة حسب المدينة", sub: "تحقق من المواقيت الدقيقة وتابع الصلاة القادمة وانتقل بسرعة إلى أي مدينة.",
    city: "المدينة", country: "الدولة", cityPh: "أدخل المدينة", countryPh: "الدولة (اختياري)", submit: "اعرض مواقيت الصلاة",
    nextPrayer: "الصلاة القادمة", current: "الصلاة الحالية", today: "اليوم", method: "الطريقة", loading: "جار التحميل...",
    why: "لماذا هذه الصفحة مفيدة", info: "هذه الصفحة مبنية لنية البحث المباشرة عن الصلاة مع رابط واضح ومحتوى ظاهر وجدول يومي كامل.",
    explore: "اكتشف المزيد", about: "حول الصفحة", aboutText: "تجمع الصفحة بين نية البحث والرابط والعنوان والمحتوى الظاهر حتى يصل الزائر إلى الإجابة الصحيحة بسرعة.",
    faq: "الأسئلة الشائعة", footer: "مواقيت صلاة دقيقة حسب المدينة.", noscript: "يتطلب عرض المواقيت الحية تشغيل JavaScript."
  },
  de: {
    html: "de", dir: "ltr", in: "in", home: "Gebetszeiten", prayer: "Gebetszeiten", next: "Naechstes Gebet", fajr: "Fajr Zeit", dhuhr: "Dhuhr Zeit", asr: "Asr Zeit", maghrib: "Maghrib Zeit", isha: "Isha Zeit",
    homeTitle: "Adantimer | Genaue Gebetszeiten und naechstes Gebet",
    homeDesc: "Pruefe genaue Gebetszeiten, den Countdown zum naechsten Gebet und den Tagesplan automatisch nach Standort.",
    hero: "Gebetszeiten nach Stadt", sub: "Pruefe genaue Gebetszeiten, verfolge den Countdown und wechsle schnell zu jeder Stadt.",
    city: "Stadt", country: "Land", cityPh: "Stadt eingeben", countryPh: "Land (optional)", submit: "Gebetszeiten laden",
    nextPrayer: "Naechstes Gebet", current: "Aktuelles Gebet", today: "Heute", method: "Methode", loading: "Wird geladen...",
    why: "Darum hilft diese Seite", info: "Diese Route passt zu direkter Gebetszeit-Suche mit sauberer Stadt-URL und sichtbarem Tagesplan.",
    explore: "Mehr entdecken", about: "Ueberblick", aboutText: "Diese Seite stimmt Suchintention, URL, Seitentitel und sichtbaren Inhalt besser aufeinander ab und schafft damit eine staerkere SEO-Basis.",
    faq: "FAQ", footer: "Genaue Gebetszeiten nach Stadt.", noscript: "JavaScript wird benoetigt, um Live-Gebetszeiten und den Countdown zu laden.",
    shareQ: "Kann ich diese Seite teilen?", shareA: "Ja. Jede URL ist als direkte Zielseite fuer eine konkrete Gebetszeit-Suche aufgebaut.",
    autoQ: "Erkennt Adantimer Sprache und Standort automatisch?", autoA: "Ja. Die Seite folgt nach dem Laden der Browsersprache und versucht zuerst GPS, danach IP als Fallback."
  },
  fr: {
    html: "fr", dir: "ltr", in: "a", home: "Horaires de priere", prayer: "Horaires de priere", next: "Prochaine priere", fajr: "Heure du Fajr", dhuhr: "Heure du Dhuhr", asr: "Heure du Asr", maghrib: "Heure du Maghrib", isha: "Heure du Isha",
    homeTitle: "Adantimer | Horaires de priere et prochaine priere",
    homeDesc: "Consultez les horaires de priere, le compte a rebours de la prochaine priere et le planning du jour selon la position.",
    hero: "Horaires par ville", sub: "Consultez les horaires precis, la prochaine priere et passez vite a n'importe quelle ville.",
    city: "Ville", country: "Pays", cityPh: "Entrer une ville", countryPh: "Pays (optionnel)", submit: "Voir les horaires",
    nextPrayer: "Prochaine priere", current: "Priere actuelle", today: "Aujourd'hui", method: "Methode", loading: "Chargement...",
    why: "Pourquoi cette page aide", info: "Cette route cible la recherche directe d'horaires de priere avec une URL propre et un planning visible.",
    explore: "Explorer plus", about: "A propos", aboutText: "La page aligne mieux la requete, l'URL, le titre et le contenu visible pour renforcer la base SEO.",
    faq: "FAQ", footer: "Horaires de priere precis par ville.", noscript: "JavaScript est requis pour charger les horaires en direct.",
    shareQ: "Puis-je partager cette page ?", shareA: "Oui. Chaque URL est construite comme une page directe pour une recherche precise sur les horaires de priere.",
    autoQ: "Adantimer detecte-t-il automatiquement la langue et la position ?", autoA: "Oui. La page suit la langue du navigateur apres le chargement et essaie d'abord le GPS, puis l'IP en secours."
  },
  tr: {
    html: "tr", dir: "ltr", in: "icin", home: "Namaz Vakitleri", prayer: "Namaz Vakitleri", next: "Sonraki Namaz", fajr: "Fajr Vakti", dhuhr: "Dhuhr Vakti", asr: "Asr Vakti", maghrib: "Maghrib Vakti", isha: "Isha Vakti",
    homeTitle: "Adantimer | Dogru namaz vakitleri ve sonraki namaz",
    homeDesc: "Namaz vakitlerini, sonraki namaz geri sayimini ve gunluk takvimi konuma gore otomatik gorun.",
    hero: "Sehre gore namaz vakitleri", sub: "Dogru vakitleri, sonraki namaz geri sayimini ve sehir sayfalarini hizli gorun.",
    city: "Sehir", country: "Ulke", cityPh: "Sehir girin", countryPh: "Ulke (istege bagli)", submit: "Vakitleri goster",
    nextPrayer: "Sonraki namaz", current: "Guncel namaz", today: "Bugun", method: "Yontem", loading: "Yukleniyor...",
    why: "Bu sayfa neden yararli", info: "Bu rota dogrudan namaz vakti aramasina uygun temiz URL ve gorunur takvim sunar.",
    explore: "Daha fazlasi", about: "Hakkinda", aboutText: "Arama, URL, baslik ve gorunur metin arasindaki uyum bu sayfanin SEO temelini guclendirir.",
    faq: "SSS", footer: "Sehre gore dogru namaz vakitleri.", noscript: "Canli vakitleri yuklemek icin JavaScript gerekir."
  },
  "zh-hans": {
    html: "zh-CN", dir: "ltr", in: "", home: "礼拜时间", prayer: "礼拜时间", next: "下一次礼拜", fajr: "晨礼时间", dhuhr: "晌礼时间", asr: "晡礼时间", maghrib: "昏礼时间", isha: "宵礼时间",
    homeTitle: "Adantimer | 准确礼拜时间与下一次礼拜",
    homeDesc: "查看准确礼拜时间、下一次礼拜倒计时以及根据位置自动加载的每日时间表。",
    hero: "按城市查看礼拜时间", sub: "查看准确礼拜时间、下一次礼拜倒计时，并快速切换到任何城市。",
    city: "城市", country: "国家", cityPh: "输入城市", countryPh: "国家（可选）", submit: "查看礼拜时间",
    nextPrayer: "下一次礼拜", current: "当前礼拜", today: "今天", method: "计算方式", loading: "加载中...",
    why: "为什么这页有用", info: "这条路由对应直接礼拜时间搜索，带有清晰 URL 和可见的每日时间表。",
    explore: "继续探索", about: "关于", aboutText: "搜索词、URL、标题与可见内容的一致性，会让这条页面拥有更强的 SEO 基础。",
    faq: "常见问题", footer: "按城市提供准确礼拜时间。", noscript: "需要启用 JavaScript 才能加载实时礼拜时间。"
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
      .replace(/<div class="language-switch" aria-label="Language switcher">[\s\S]*?<\/nav>/, `${languageSwitch(lang)}\n      </nav>`)
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
  if (key.startsWith("tr")) return "tr";
  if (key.startsWith("zh")) return "zh-hans";
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
  if (copy.html === "zh-CN") return `${place}${topic} | Adantimer`;
  return `${topic} ${copy.in} ${place} | Adantimer`;
}

function makeDescription(copy, topic, place) {
  if (copy.html === "ar") return `${topic}${place ? ` ${copy.in} ${place}` : ""}، اطلع على الصلاة القادمة وجدول اليوم في صفحة واضحة.`;
  if (copy.html === "de") return `${topic}${place ? ` in ${place}` : ""}, Countdown zum naechsten Gebet und kompletter Tagesplan auf einer fokussierten Seite.`;
  if (copy.html === "fr") return `${topic}${place ? ` a ${place}` : ""}, compte a rebours de la prochaine priere et planning complet du jour sur une page claire.`;
  if (copy.html === "zh-CN") return `查看${place ? `${place}的` : ""}${topic}、下一次礼拜倒计时以及今日完整时间表。`;
  return `${topic}${place ? ` ${copy.in} ${place}` : ""}, next prayer countdown, and the full daily schedule on one focused page.`;
}

function alternates(type, city) {
  const langs = ["en", "ar", "de", "fr", "tr", "zh-hans"];
  const links = langs.map(lang => `<link rel="alternate" hreflang="${lang}" href="${SITE}${routePath(lang, type, city)}">`);
  links.push(`<link rel="alternate" hreflang="x-default" href="${SITE}${routePath("en", type, city)}">`);
  return links.join("\n  ");
}

function hero(copy, topic, place, lang) {
  const heading = place ? makeTitle(copy, topic, place).replace(" | Adantimer", "") : copy.homeTitle.replace("Adantimer | ", "");
  const chips = CITY_SET.slice(0, 5).map(city => `<a class="city-chip" href="${esc(routePath(lang, "home", city))}" data-city="${esc(city)}">${esc(city)}</a>`).join("\n");
  return `        <section class="hero-copy">
          <p class="eyebrow">${esc(copy.hero)}</p>
          <h1 id="hero-heading">${esc(heading)}</h1>
          <p id="hero-subtitle" class="hero-subtitle">${esc(copy.sub)}</p>
          <form id="location-form" class="location-form" novalidate>
            <label class="sr-only" for="manual-city">${esc(copy.city)}</label>
            <input type="text" id="manual-city" name="city" placeholder="${esc(copy.cityPh)}" autocomplete="address-level2">
            <label class="sr-only" for="manual-country">${esc(copy.country)}</label>
            <input type="text" id="manual-country" name="country" placeholder="${esc(copy.countryPh)}" autocomplete="country-name">
            <button id="set-location-btn" type="submit">${esc(copy.submit)}</button>
          </form>
          <div class="popular-cities" aria-label="${esc(copy.explore)}">
${chips}
          </div>
        </section>`;
}

function nextCard(copy, topic, place) {
  const location = place || copy.hero;
  const lead = place ? `${topicLead(copy)} ${place}` : copy.sub;
  return `        <aside class="next-prayer card featured-card" aria-live="polite">
          <p class="card-label" id="location-status">${esc(location)}</p>
          <h2 id="title">${esc(copy.nextPrayer)}</h2>
          <div id="next-prayer-name" class="highlight"></div>
          <div id="countdown" class="countdown">${esc(copy.loading)}</div>
          <div class="mini-stats">
            <div class="mini-stat"><span id="current-prayer-label">${esc(copy.current)}</span><strong id="current-prayer-value">${esc(copy.loading)}</strong></div>
            <div class="mini-stat"><span id="today-label">${esc(copy.today)}</span><strong id="today-date-value">${esc(copy.loading)}</strong></div>
            <div class="mini-stat"><span id="method-label">${esc(copy.method)}</span><strong id="method-value">${esc(copy.loading)}</strong></div>
          </div>
          <p id="location" class="location">${esc(lead)}</p>
        </aside>`;
}

function schedule(copy, topic, place) {
  const summary = makeDescription(copy, topic, place);
  return `      <section class="card schedule-card" aria-labelledby="schedule-heading">
        <div class="section-head">
          <div><p class="eyebrow">${esc(copy.today)}</p><h2 id="schedule-heading">${esc(topic)}</h2></div>
          <p id="schedule-summary" class="muted">${esc(summary)}</p>
        </div>
        <div id="prayer-times" class="prayer-times"></div>
      </section>`;
}

function info(copy) {
  return `      <section class="card info-card" aria-labelledby="why-heading">
        <p class="eyebrow">${esc(copy.why)}</p>
        <h2 id="why-heading">${esc(copy.hero)}</h2>
        <ul class="feature-list"><li>${esc(copy.info)}</li></ul>
      </section>`;
}

function cities(copy, lang, type) {
  const links = CITY_SET.slice(0, 4).map(city => `<a href="${esc(routePath(lang, type, city))}">${esc(city)}</a>`).join(", ");
  return `    <section class="card prose" aria-labelledby="cities-heading">
      <p class="eyebrow">${esc(copy.explore)}</p>
      <h2 id="cities-heading">${esc(copy.hero)}</h2>
      <p>${links}</p>
    </section>`;
}

function about(copy, topic, place) {
  const heading = place ? (copy.html === "zh-CN" ? `${place}${topic}` : `${topic} ${copy.in} ${place}`) : topic;
  return `      <article class="card prose" aria-labelledby="about-heading">
        <p class="eyebrow">${esc(copy.about)}</p>
        <h2 id="about-heading">${esc(heading)}</h2>
        <p>${esc(copy.aboutText)}</p>
      </article>`;
}

function faq(copy, topic, place) {
  const items = faqItems(copy, topic, place).map(item => `<div><h3>${esc(item.q)}</h3><p>${esc(item.a)}</p></div>`).join("\n");
  return `      <section class="card prose" aria-labelledby="faq-heading">
        <p class="eyebrow">${esc(copy.faq)}</p>
        <h2 id="faq-heading">${esc(topic)}</h2>
        <div class="faq-list">${items}</div>
      </section>`;
}

function faqItems(copy, topic, place) {
  return [
    { q: copy.shareQ || (copy.html === "ar" ? "هل يمكنني مشاركة هذه الصفحة؟" : copy.html === "zh-CN" ? "我可以分享这个页面吗？" : "Can I share this page?"), a: copy.shareA || (copy.html === "ar" ? "نعم. كل رابط مخصص مباشرة لنية بحث واضحة عن مواقيت الصلاة." : copy.html === "zh-CN" ? "可以。每条路由都是为明确的礼拜时间搜索意图建立的直接页面。" : "Yes. Each route is built as a direct page for a specific prayer-time intent and city.") },
    { q: copy.autoQ || (copy.html === "ar" ? "هل يحدد Adantimer اللغة والموقع تلقائيا؟" : copy.html === "zh-CN" ? "Adantimer 会自动识别语言和位置吗？" : "Does Adantimer detect language and location automatically?"), a: copy.autoA || (copy.html === "ar" ? "نعم. تتبع الصفحة لغة المتصفح بعد التحميل وتجرب GPS أولا ثم IP عند الحاجة." : copy.html === "zh-CN" ? "会。页面会跟随浏览器语言，先尝试 GPS，再使用 IP 备用。" : "Yes. The page follows browser language after load and tries GPS first, then IP fallback.") },
    { q: place ? (copy.html === "zh-CN" ? `${place}${topic}是什么时候？` : `${topic}${place ? ` ${copy.in} ${place}` : ""}?`) : topic, a: makeDescription(copy, topic, place) }
  ];
}

function languageSwitch(lang) {
  const primary = [
    buttonMarkup("en", "English", lang === "en"),
    buttonMarkup("ar", "Arabic", lang === "ar")
  ].join("\n");
  const otherLanguages = [
    { key: "zh-hans", label: "Chinese" },
    { key: "fr", label: "French" },
    { key: "de", label: "German" },
    { key: "tr", label: "Turkish" }
  ];
  const other = otherLanguages.map(item => menuOptionMarkup(item.key, item.label, lang === item.key)).join("\n");
  const activeOtherLanguage = otherLanguages.find(item => item.key === lang);
  const label = activeOtherLanguage ? activeOtherLanguage.label : "Other languages";
  const activeClass = activeOtherLanguage ? " is-active" : "";
  return `        <div class="language-switch" aria-label="Language switcher">
          <div class="language-pills" role="group" aria-label="Primary language switch">
${primary}
          </div>
          <details class="language-menu${activeClass}">
            <summary class="language-menu-toggle" aria-label="Other languages">
              <span id="language-menu-label">${label}</span>
              <span class="language-menu-caret" aria-hidden="true">+</span>
            </summary>
            <div class="language-menu-list">
${other}
            </div>
          </details>
        </div>`;
}

function buttonMarkup(lang, label, active) {
  return `            <button type="button" data-lang="${lang}" class="lang-btn${active ? " is-active" : ""}" aria-pressed="${active ? "true" : "false"}">${label}</button>`;
}

function menuOptionMarkup(lang, label, active) {
  return `              <button type="button" data-lang="${lang}" class="lang-option${active ? " is-active" : ""}" aria-pressed="${active ? "true" : "false"}">${label}</button>`;
}

function schema(id, data) {
  const attr = id ? ` id="${id}"` : "";
  return `<script type="application/ld+json"${attr}>\n${JSON.stringify(data, null, 2)}\n  </script>`;
}

function topicLead(copy) {
  if (copy.html === "ar") return "مواقيت الصلاة في";
  if (copy.html === "zh-CN") return "礼拜时间";
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
