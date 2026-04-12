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
    homeTitle: "Adantimer | \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0648\u0648\u0642\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629",
    homeDesc: "\u062a\u062d\u0642\u0642 \u0645\u0646 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0648\u0627\u0639\u0631\u0641 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0648\u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645 \u062d\u0633\u0628 \u0645\u0648\u0642\u0639\u0643.",
    hero: "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u062d\u0633\u0628 \u0627\u0644\u0645\u062f\u064a\u0646\u0629", sub: "\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u062f\u0642\u064a\u0642\u0629 \u0648\u062a\u0627\u0628\u0639 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0648\u0627\u0646\u062a\u0642\u0644 \u0628\u0633\u0631\u0639\u0629 \u0625\u0644\u0649 \u0623\u064a \u0645\u062f\u064a\u0646\u0629.",
    city: "\u0627\u0644\u0645\u062f\u064a\u0646\u0629", country: "\u0627\u0644\u062f\u0648\u0644\u0629", cityPh: "\u0623\u062f\u062e\u0644 \u0627\u0644\u0645\u062f\u064a\u0646\u0629", countryPh: "\u0627\u0644\u062f\u0648\u0644\u0629 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)", submit: "\u0627\u0639\u0631\u0636 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629",
    nextPrayer: "\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629", current: "\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629", today: "\u0627\u0644\u064a\u0648\u0645", method: "\u0627\u0644\u0637\u0631\u064a\u0642\u0629", loading: "\u062c\u0627\u0631 \u0627\u0644\u062a\u062d\u0645\u064a\u0644...",
    why: "\u0644\u0645\u0627\u0630\u0627 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0641\u064a\u062f\u0629", info: "\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0628\u0646\u064a\u0629 \u0644\u0646\u064a\u0629 \u0627\u0644\u0628\u062d\u062b \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0646 \u0627\u0644\u0635\u0644\u0627\u0629 \u0645\u0639 \u0631\u0627\u0628\u0637 \u0648\u0627\u0636\u062d \u0648\u0645\u062d\u062a\u0648\u0649 \u0638\u0627\u0647\u0631 \u0648\u062c\u062f\u0648\u0644 \u064a\u0648\u0645\u064a \u0643\u0627\u0645\u0644.",
    explore: "\u0627\u0643\u062a\u0634\u0641 \u0627\u0644\u0645\u0632\u064a\u062f", about: "\u062d\u0648\u0644 \u0627\u0644\u0635\u0641\u062d\u0629", aboutText: "\u062a\u062c\u0645\u0639 \u0627\u0644\u0635\u0641\u062d\u0629 \u0628\u064a\u0646 \u0646\u064a\u0629 \u0627\u0644\u0628\u062d\u062b \u0648\u0627\u0644\u0631\u0627\u0628\u0637 \u0648\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0638\u0627\u0647\u0631 \u062d\u062a\u0649 \u064a\u0635\u0644 \u0627\u0644\u0632\u0627\u0626\u0631 \u0625\u0644\u0649 \u0627\u0644\u0625\u062c\u0627\u0628\u0629 \u0627\u0644\u0635\u062d\u064a\u062d\u0629 \u0628\u0633\u0631\u0639\u0629.",
    faq: "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629", footer: "\u0645\u0648\u0627\u0642\u064a\u062a \u0635\u0644\u0627\u0629 \u062f\u0642\u064a\u0642\u0629 \u062d\u0633\u0628 \u0627\u0644\u0645\u062f\u064a\u0646\u0629.", noscript: "\u064a\u062a\u0637\u0644\u0628 \u0639\u0631\u0636 \u0627\u0644\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u062d\u064a\u0629 \u062a\u0634\u063a\u064a\u0644 JavaScript.",
    shareQ: "\u0647\u0644 \u064a\u0645\u0643\u0646\u0646\u064a \u0645\u0634\u0627\u0631\u0643\u0629 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629\u061f", shareA: "\u0646\u0639\u0645. \u0643\u0644 \u0631\u0627\u0628\u0637 \u0645\u0628\u0646\u064a \u0643\u0635\u0641\u062d\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u0646\u064a\u0629 \u0628\u062d\u062b \u0645\u062d\u062f\u062f\u0629 \u0639\u0646 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0648\u0627\u0644\u0645\u062f\u064a\u0646\u0629.",
    autoQ: "\u0647\u0644 \u064a\u062d\u062f\u062f Adantimer \u0627\u0644\u0644\u063a\u0629 \u0648\u0627\u0644\u0645\u0648\u0642\u0639 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u061f", autoA: "\u0646\u0639\u0645. \u062a\u062a\u0628\u0639 \u0627\u0644\u0635\u0641\u062d\u0629 \u0644\u063a\u0629 \u0627\u0644\u0645\u062a\u0635\u0641\u062d \u0628\u0639\u062f \u0627\u0644\u062a\u062d\u0645\u064a\u0644\u060c \u0648\u062a\u062d\u0627\u0648\u0644 GPS \u0623\u0648\u0644\u0627\u064b \u062b\u0645 \u062a\u0646\u062a\u0642\u0644 \u0625\u0644\u0649 IP \u0643\u0628\u062f\u064a\u0644 \u0639\u0646\u062f \u0627\u0644\u062d\u0627\u062c\u0629."
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
    homeDesc: "Consultez les horaires de priere precis, le compte a rebours de la prochaine priere et le planning du jour selon la position.",
    hero: "Horaires par ville", sub: "Consultez les horaires precis, suivez la prochaine priere et accedez vite a n'importe quelle ville.",
    city: "Ville", country: "Pays", cityPh: "Entrer une ville", countryPh: "Pays (optionnel)", submit: "Voir les horaires",
    nextPrayer: "Prochaine priere", current: "Priere actuelle", today: "Aujourd'hui", method: "Methode", loading: "Chargement...",
    why: "Pourquoi cette page aide", info: "Cette route vise la recherche directe d'horaires de priere avec une URL de ville claire et un planning visible.",
    explore: "Explorer plus", about: "A propos", aboutText: "La page aligne mieux l'intention de recherche, l'URL, le titre et le contenu visible pour renforcer la base SEO.",
    faq: "FAQ", footer: "Horaires de priere precis par ville.", noscript: "JavaScript est requis pour charger les horaires en direct.",
    shareQ: "Puis-je partager cette page ?", shareA: "Oui. Chaque URL est construite comme une page directe pour une recherche precise sur les horaires de priere.",
    autoQ: "Adantimer detecte-t-il automatiquement la langue et la position ?", autoA: "Oui. La page suit la langue du navigateur apres le chargement et essaie d'abord le GPS, puis l'IP en secours."
  },
  tr: {
    html: "tr", dir: "ltr", in: "icin", home: "Namaz Vakitleri", prayer: "Namaz Vakitleri", next: "Sonraki Namaz", fajr: "Fajr Vakti", dhuhr: "Dhuhr Vakti", asr: "Asr Vakti", maghrib: "Maghrib Vakti", isha: "Isha Vakti",
    homeTitle: "Adantimer | Dogru namaz vakitleri ve sonraki namaz",
    homeDesc: "Dogru namaz vakitlerini, bir sonraki namaz geri sayimini ve konuma gore gunluk vakit cizelgesini gorun.",
    hero: "Sehre gore namaz vakitleri", sub: "Dogru vakitleri gorun, bir sonraki namaz geri sayimini takip edin ve istediginiz sehre hizla gecin.",
    city: "Sehir", country: "Ulke", cityPh: "Sehir girin", countryPh: "Ulke (istege bagli)", submit: "Vakitleri goster",
    nextPrayer: "Sonraki namaz", current: "Guncel namaz", today: "Bugun", method: "Yontem", loading: "Yukleniyor...",
    why: "Bu sayfa neden yararli", info: "Bu rota, dogrudan namaz vakti aramalarina uygun temiz bir sehir URL'si ve gorunur gunluk takvim sunar.",
    explore: "Daha fazlasi", about: "Hakkinda", aboutText: "Arama niyeti, URL, baslik ve gorunur icerik ayni hedefe hizalanarak bu sayfanin SEO temelini guclendirir.",
    faq: "SSS", footer: "Sehre gore dogru namaz vakitleri.", noscript: "Canli vakitleri yuklemek icin JavaScript gerekir.",
    shareQ: "Bu sayfayi paylasabilir miyim?", shareA: "Evet. Her URL, belirli bir namaz vakti arama niyeti ve sehir icin dogrudan acilan sayfa olarak kurulmustur.",
    autoQ: "Adantimer dili ve konumu otomatik algilar mi?", autoA: "Evet. Sayfa yuklendikten sonra tarayici dilini izler, once GPS'i dener ve gerekirse IP yedegine gecer."
  },
  "zh-hans": {
    html: "zh-CN", dir: "ltr", in: "", home: "\u793c\u62dc\u65f6\u95f4", prayer: "\u793c\u62dc\u65f6\u95f4", next: "\u4e0b\u4e00\u6b21\u793c\u62dc", fajr: "\u6668\u793c\u65f6\u95f4", dhuhr: "\u664c\u793c\u65f6\u95f4", asr: "\u665a\u793c\u65f6\u95f4", maghrib: "\u660f\u793c\u65f6\u95f4", isha: "\u5bb5\u793c\u65f6\u95f4",
    homeTitle: "Adantimer | \u51c6\u786e\u793c\u62dc\u65f6\u95f4\u4e0e\u4e0b\u4e00\u6b21\u793c\u62dc",
    homeDesc: "\u67e5\u770b\u51c6\u786e\u793c\u62dc\u65f6\u95f4\u3001\u4e0b\u4e00\u6b21\u793c\u62dc\u5012\u8ba1\u65f6\u4ee5\u53ca\u6839\u636e\u4f4d\u7f6e\u81ea\u52a8\u52a0\u8f7d\u7684\u6bcf\u65e5\u65f6\u95f4\u8868\u3002",
    hero: "\u6309\u57ce\u5e02\u67e5\u770b\u793c\u62dc\u65f6\u95f4", sub: "\u67e5\u770b\u51c6\u786e\u793c\u62dc\u65f6\u95f4\u3001\u4e0b\u4e00\u6b21\u793c\u62dc\u5012\u8ba1\u65f6\uff0c\u5e76\u5feb\u901f\u5207\u6362\u5230\u4efb\u4f55\u57ce\u5e02\u3002",
    city: "\u57ce\u5e02", country: "\u56fd\u5bb6", cityPh: "\u8f93\u5165\u57ce\u5e02", countryPh: "\u56fd\u5bb6\uff08\u53ef\u9009\uff09", submit: "\u67e5\u770b\u793c\u62dc\u65f6\u95f4",
    nextPrayer: "\u4e0b\u4e00\u6b21\u793c\u62dc", current: "\u5f53\u524d\u793c\u62dc", today: "\u4eca\u5929", method: "\u8ba1\u7b97\u65b9\u5f0f", loading: "\u52a0\u8f7d\u4e2d...",
    why: "\u4e3a\u4ec0\u4e48\u8fd9\u9875\u6709\u7528", info: "\u8fd9\u6761\u8def\u7531\u5bf9\u5e94\u76f4\u63a5\u793c\u62dc\u65f6\u95f4\u641c\u7d22\uff0c\u5e26\u6709\u6e05\u6670 URL \u548c\u53ef\u89c1\u7684\u6bcf\u65e5\u65f6\u95f4\u8868\u3002",
    explore: "\u7ee7\u7eed\u63a2\u7d22", about: "\u5173\u4e8e", aboutText: "\u641c\u7d22\u8bcd\u3001URL\u3001\u6807\u9898\u4e0e\u53ef\u89c1\u5185\u5bb9\u7684\u4e00\u81f4\u6027\uff0c\u4f1a\u8ba9\u8fd9\u6761\u9875\u9762\u62e5\u6709\u66f4\u5f3a\u7684 SEO \u57fa\u7840\u3002",
    faq: "\u5e38\u89c1\u95ee\u9898", footer: "\u6309\u57ce\u5e02\u63d0\u4f9b\u51c6\u786e\u793c\u62dc\u65f6\u95f4\u3002", noscript: "\u9700\u8981\u542f\u7528 JavaScript \u624d\u80fd\u52a0\u8f7d\u5b9e\u65f6\u793c\u62dc\u65f6\u95f4\u3002",
    shareQ: "\u6211\u53ef\u4ee5\u5206\u4eab\u8fd9\u4e2a\u9875\u9762\u5417\uff1f", shareA: "\u53ef\u4ee5\u3002\u6bcf\u6761 URL \u90fd\u662f\u4e3a\u5177\u4f53\u7684\u793c\u62dc\u65f6\u95f4\u641c\u7d22\u610f\u56fe\u548c\u57ce\u5e02\u800c\u8bbe\u8ba1\u7684\u76f4\u8fbe\u9875\u9762\u3002",
    autoQ: "Adantimer \u4f1a\u81ea\u52a8\u8bc6\u522b\u8bed\u8a00\u548c\u4f4d\u7f6e\u5417\uff1f", autoA: "\u4f1a\u3002\u9875\u9762\u52a0\u8f7d\u540e\u4f1a\u8ddf\u968f\u6d4f\u89c8\u5668\u8bed\u8a00\uff0c\u4f18\u5148\u5c1d\u8bd5 GPS\uff0c\u5fc5\u8981\u65f6\u518d\u4f7f\u7528 IP \u5907\u7528\u3002"
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
  if (copy.html === "ar") return `${topic}${place ? ` ${copy.in} ${place}` : ""}\u060c \u0627\u0637\u0644\u0639 \u0639\u0644\u0649 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0648\u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645 \u0641\u064a \u0635\u0641\u062d\u0629 \u0648\u0627\u0636\u062d\u0629.`;
  if (copy.html === "de") return `${topic}${place ? ` in ${place}` : ""}, Countdown zum naechsten Gebet und kompletter Tagesplan auf einer fokussierten Seite.`;
  if (copy.html === "fr") return `${topic}${place ? ` a ${place}` : ""}, compte a rebours de la prochaine priere et planning complet du jour sur une page claire.`;
  if (copy.html === "tr") return `${topic}${place ? ` ${place} icin` : ""}, bir sonraki namaz geri sayimi ve gunun tam vakit cizelgesi tek bir odakli sayfada.`;
  if (copy.html === "zh-CN") return `\u67e5\u770b${place ? `${place}\u7684` : ""}${topic}\u3001\u4e0b\u4e00\u6b21\u793c\u62dc\u5012\u8ba1\u65f6\u4ee5\u53ca\u4eca\u65e5\u5b8c\u6574\u65f6\u95f4\u8868\u3002`;
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
    { q: copy.shareQ || (copy.html === "ar" ? "\u0647\u0644 \u064a\u0645\u0643\u0646\u0646\u064a \u0645\u0634\u0627\u0631\u0643\u0629 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629\u061f" : copy.html === "zh-CN" ? "\u6211\u53ef\u4ee5\u5206\u4eab\u8fd9\u4e2a\u9875\u9762\u5417\uff1f" : "Can I share this page?"), a: copy.shareA || (copy.html === "ar" ? "\u0646\u0639\u0645. \u0643\u0644 \u0631\u0627\u0628\u0637 \u0645\u062e\u0635\u0635 \u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u0646\u064a\u0629 \u0628\u062d\u062b \u0648\u0627\u0636\u062d\u0629 \u0639\u0646 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629." : copy.html === "zh-CN" ? "\u53ef\u4ee5\u3002\u6bcf\u6761\u8def\u7531\u90fd\u662f\u4e3a\u660e\u786e\u7684\u793c\u62dc\u65f6\u95f4\u641c\u7d22\u610f\u56fe\u5efa\u7acb\u7684\u76f4\u63a5\u9875\u9762\u3002" : "Yes. Each route is built as a direct page for a specific prayer-time intent and city.") },
    { q: copy.autoQ || (copy.html === "ar" ? "\u0647\u0644 \u064a\u062d\u062f\u062f Adantimer \u0627\u0644\u0644\u063a\u0629 \u0648\u0627\u0644\u0645\u0648\u0642\u0639 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u061f" : copy.html === "zh-CN" ? "Adantimer \u4f1a\u81ea\u52a8\u8bc6\u522b\u8bed\u8a00\u548c\u4f4d\u7f6e\u5417\uff1f" : "Does Adantimer detect language and location automatically?"), a: copy.autoA || (copy.html === "ar" ? "\u0646\u0639\u0645. \u062a\u062a\u0628\u0639 \u0627\u0644\u0635\u0641\u062d\u0629 \u0644\u063a\u0629 \u0627\u0644\u0645\u062a\u0635\u0641\u062d \u0628\u0639\u062f \u0627\u0644\u062a\u062d\u0645\u064a\u0644 \u0648\u062a\u062c\u0631\u0628 GPS \u0623\u0648\u0644\u0627 \u062b\u0645 IP \u0639\u0646\u062f \u0627\u0644\u062d\u0627\u062c\u0629." : copy.html === "zh-CN" ? "\u4f1a\u3002\u9875\u9762\u4f1a\u8ddf\u968f\u6d4f\u89c8\u5668\u8bed\u8a00\uff0c\u5148\u5c1d\u8bd5 GPS\uff0c\u518d\u4f7f\u7528 IP \u5907\u7528\u3002" : "Yes. The page follows browser language after load and tries GPS first, then IP fallback.") },
    { q: place ? (copy.html === "zh-CN" ? `${place}${topic}\u662f\u4ec0\u4e48\u65f6\u5019\uff1f` : `${topic}${place ? ` ${copy.in} ${place}` : ""}?`) : topic, a: makeDescription(copy, topic, place) }
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
  if (copy.html === "ar") return "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0641\u064a";
  if (copy.html === "zh-CN") return "\u793c\u62dc\u65f6\u95f4";
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
