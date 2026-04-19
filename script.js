const countdownEl = document.getElementById("countdown");
const prayerTimesEl = document.getElementById("prayer-times");
const titleEl = document.getElementById("title");
const locationEl = document.getElementById("location");
const nextPrayerNameEl = document.getElementById("next-prayer-name");
const locationStatusEl = document.getElementById("location-status");
const heroHeadingEl = document.getElementById("hero-heading");
const heroSubtitleEl = document.getElementById("hero-subtitle");
const scheduleSummaryEl = document.getElementById("schedule-summary");
const currentPrayerLabelEl = document.getElementById("current-prayer-label");
const currentPrayerValueEl = document.getElementById("current-prayer-value");
const todayLabelEl = document.getElementById("today-label");
const todayDateValueEl = document.getElementById("today-date-value");
const methodLabelEl = document.getElementById("method-label");
const methodValueEl = document.getElementById("method-value");
const cityInput = document.getElementById("manual-city");
const countryInput = document.getElementById("manual-country");
const locationForm = document.getElementById("location-form");
const setLocationButtonEl = document.getElementById("set-location-btn");
const langButtons = Array.from(document.querySelectorAll(".lang-btn"));
const canonicalEl = document.querySelector("link[rel='canonical']");
const websiteSchemaEl = document.getElementById("website-schema");
const pageType = document.body.dataset.page || "home";

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

const LOCALES = {
  en: {
    code: "en", dir: "ltr",
    button: "Find Prayer Times", cityPlaceholder: "Enter city", countryPlaceholder: "Country (optional)",
    nextPrayer: "Next Prayer", currentPrayer: "Current Prayer", today: "Today", method: "Method",
    loading: "Loading...", locating: "Trying GPS, then IP fallback.", detect: "Detecting your location",
    noCurrentPrayer: "Between prayers", searchPrompt: "Enter a city to update the schedule.",
    permissionError: "We couldn't load your location. Search for a city to continue.",
    locationNotFound: "City not found. Try a larger nearby city.",
    fetchError: "We couldn't load prayer times right now. Please try again.",
    timezone: tz => `Timezone: ${tz}`, locationPrefix: "Prayer times for", countdown: "starts in",
    prayers: { Fajr: "Fajr", Dhuhr: "Dhuhr", Asr: "Asr", Maghrib: "Maghrib", Isha: "Isha" },
    topics: { home: "Prayer Times", "prayer-times": "Prayer Times", "next-prayer": "Next Prayer Time", fajr: "Fajr Time", dhuhr: "Dhuhr Time", asr: "Asr Time", maghrib: "Maghrib Time", isha: "Isha Time" },
    eyebrow: "Prayer times by city", infoEyebrow: "Automatic", aboutEyebrow: "About", faqEyebrow: "FAQ", citiesEyebrow: "Popular Cities",
    footer: "Accurate prayer times by city.",
    citiesTitle: "Prayer times in major cities",
    citiesLine1: 'Browse popular city pages directly: <a href="/new-york">New York prayer times</a>, <a href="/sydney">Sydney prayer times</a>, <a href="/london">London prayer times</a>, <a href="/berlin">Berlin prayer times</a>, <a href="/dubai">Dubai prayer times</a>, and <a href="/cairo">Cairo prayer times</a>.',
    citiesLine2: 'Jump into specific searches like <a href="/asr-time/new-york">Asr time in New York</a>, <a href="/dhuhr-time/sydney">Dhuhr time in Sydney</a>, or <a href="/next-prayer/london">next prayer in London</a>.',
    heroTitle: (type, place, topic) => type === "home" ? (place ? `Prayer Times in ${place} Today` : "Prayer Times Today and Your Next Salah Countdown") : (place ? `${topic} in ${place}` : `${topic} Today`),
    heroSubtitle: (type, place, topic) => type === "home" ? (place ? `See accurate prayer times in ${place}, follow the next salah countdown, and review the full daily schedule.` : "The page now adapts automatically to the visitor's browser language and location.") : (place ? `See ${topic.toLowerCase()} in ${place}, then review the full daily prayer schedule below.` : `Load ${topic.toLowerCase()} automatically, then review the full daily prayer schedule below.`),
    infoTitle: topic => `Built for fast ${topic.toLowerCase()} checks`,
    features: topic => ["Detects your language and location automatically.", `Shows ${topic.toLowerCase()} with a live countdown and clear status.`, "Works directly in the browser without installing an app.", "Manual English and Arabic buttons remain available at the top right."],
    aboutTitle: topic => `${topic} without unnecessary friction`,
    about: (topic, place) => [place ? `This page is focused on ${topic.toLowerCase()} in ${place}, so visitors can reach the right information immediately.` : `This page is focused on ${topic.toLowerCase()}, so visitors can reach the right information immediately.`, "The goal is a more professional experience: automatic language selection, automatic location detection, and a clear prayer schedule.", "That helps both users and search engines understand the page intent more clearly."],
    faqTitle: "Common questions",
    faq: [["Does it detect my city automatically?", "Yes. The page tries browser GPS first and falls back to IP-based detection."], ["Can I switch to another city?", "Yes. You can search any city manually and the page will update immediately."], ["Does it follow the visitor's language automatically?", "Yes. The page now follows the browser language automatically, while manual English and Arabic buttons remain available."]],
    pageTitle: (type, place, topic) => type === "home" ? (place ? `Prayer Times in ${place} Today | Fajr, Dhuhr, Asr, Maghrib, Isha | Adantimer` : "Adantimer | Accurate Prayer Times and Next Salah Countdown") : (place ? `${topic} in ${place} Today | Adantimer` : `${topic} Today | Adantimer`),
    pageDescription: (type, place, topic) => type === "home" ? (place ? `Check accurate prayer times in ${place}, view the next salah countdown, and follow today's Fajr, Dhuhr, Asr, Maghrib, and Isha schedule.` : "Check accurate prayer times for your city and let Adantimer adapt automatically to the browser language.") : (place ? `Check ${topic.toLowerCase()} in ${place}, see the next prayer countdown, and review today's full daily prayer schedule.` : `Check ${topic.toLowerCase()}, see the next prayer countdown, and review today's full daily prayer schedule.`)
  },
  de: {
    code: "de", dir: "ltr",
    button: "Gebetszeiten laden", cityPlaceholder: "Stadt eingeben", countryPlaceholder: "Land (optional)",
    nextPrayer: "Nächstes Gebet", currentPrayer: "Aktuelles Gebet", today: "Heute", method: "Methode",
    loading: "Wird geladen...", locating: "GPS wird versucht, danach IP als Fallback.", detect: "Standort wird erkannt",
    noCurrentPrayer: "Zwischen zwei Gebeten", searchPrompt: "Gib eine Stadt ein, um den Plan zu aktualisieren.",
    permissionError: "Dein Standort konnte nicht geladen werden. Suche nach einer Stadt, um fortzufahren.",
    locationNotFound: "Stadt nicht gefunden. Versuche eine größere Stadt in der Nähe.",
    fetchError: "Die Gebetszeiten konnten gerade nicht geladen werden. Bitte versuche es erneut.",
    timezone: tz => `Zeitzone: ${tz}`, locationPrefix: "Gebetszeiten für", countdown: "beginnt in",
    prayers: { Fajr: "Fajr", Dhuhr: "Dhuhr", Asr: "Asr", Maghrib: "Maghrib", Isha: "Isha" },
    topics: { home: "Gebetszeiten", "prayer-times": "Gebetszeiten", "next-prayer": "Zeit des nächsten Gebets", fajr: "Fajr-Zeit", dhuhr: "Dhuhr-Zeit", asr: "Asr-Zeit", maghrib: "Maghrib-Zeit", isha: "Isha-Zeit" },
    eyebrow: "Gebetszeiten nach Stadt", infoEyebrow: "Automatisch", aboutEyebrow: "Überblick", faqEyebrow: "FAQ", citiesEyebrow: "Beliebte Städte",
    footer: "Genaue Gebetszeiten nach Stadt.",
    citiesTitle: "Gebetszeiten in wichtigen Städten",
    citiesLine1: 'Direkt zu Stadtseiten: <a href="/new-york">New York</a>, <a href="/sydney">Sydney</a>, <a href="/london">London</a>, <a href="/berlin">Berlin</a>, <a href="/dubai">Dubai</a> und <a href="/cairo">Kairo</a>.',
    citiesLine2: 'Direkt zu Suchintentionen wie <a href="/asr-time/new-york">Asr in New York</a>, <a href="/dhuhr-time/sydney">Dhuhr in Sydney</a> oder <a href="/next-prayer/london">nächstes Gebet in London</a>.',
    heroTitle: (type, place, topic) => type === "home" ? (place ? `Gebetszeiten in ${place} heute` : "Gebetszeiten heute und Countdown zum nächsten Gebet") : (place ? `${topic} in ${place}` : `${topic} heute`),
    heroSubtitle: (type, place, topic) => type === "home" ? (place ? `Sieh genaue Gebetszeiten in ${place}, den Countdown zum nächsten Gebet und den kompletten Tagesplan.` : "Die Seite passt sich jetzt automatisch an die Browsersprache und den Standort an.") : (place ? `Sieh ${topic} in ${place} und darunter den vollständigen Gebetsplan.` : `Lade ${topic} automatisch und prüfe darunter den vollständigen Gebetsplan.`),
    infoTitle: topic => `Für schnelle Abfragen zu ${topic} gebaut`,
    features: topic => ["Erkennt Sprache und Standort automatisch.", `Zeigt ${topic} mit Live-Countdown und klarer Statusanzeige.`, "Funktioniert direkt im Browser ohne App.", "Manuelle Buttons für Englisch und Arabisch bleiben oben rechts verfügbar."],
    aboutTitle: topic => `${topic} ohne unnötige Umwege`,
    about: (topic, place) => [place ? `Diese Seite ist auf ${topic} in ${place} ausgerichtet, damit Besucher sofort die richtige Information sehen.` : `Diese Seite ist auf ${topic} ausgerichtet, damit Besucher sofort die richtige Information sehen.`, "Ziel ist ein professionelleres Erlebnis: automatische Sprachwahl, automatische Standorterkennung und ein klarer Gebetsplan.", "So verstehen sowohl Nutzer als auch Suchmaschinen die Seite deutlicher."],
    faqTitle: "Häufige Fragen",
    faq: [["Erkennt die Seite meine Stadt automatisch?", "Ja. Zuerst wird GPS versucht, danach eine IP-basierte Erkennung."], ["Kann ich auf eine andere Stadt wechseln?", "Ja. Du kannst jede Stadt manuell suchen und die Seite aktualisiert sich sofort."], ["Folgt die Seite automatisch der Besuchersprache?", "Ja. Die Seite folgt jetzt automatisch der Browsersprache, während die manuellen Buttons für Englisch und Arabisch erhalten bleiben."]],
    pageTitle: (type, place, topic) => type === "home" ? (place ? `Gebetszeiten in ${place} heute | Fajr, Dhuhr, Asr, Maghrib, Isha | Adantimer` : "Adantimer | Genaue Gebetszeiten und Countdown zum nächsten Gebet") : (place ? `${topic} in ${place} heute | Adantimer` : `${topic} heute | Adantimer`),
    pageDescription: (type, place, topic) => type === "home" ? (place ? `Prüfe genaue Gebetszeiten in ${place}, sieh den Countdown zum nächsten Gebet und den heutigen Tagesplan.` : "Prüfe genaue Gebetszeiten für deine Stadt und lasse Adantimer automatisch die Browsersprache übernehmen.") : (place ? `Prüfe ${topic} in ${place}, sieh den Countdown zum nächsten Gebet und den vollständigen Tagesplan.` : `Prüfe ${topic}, sieh den Countdown zum nächsten Gebet und den vollständigen Tagesplan.`)
  },
  fr: {
    code: "fr", dir: "ltr",
    button: "Voir les horaires", cityPlaceholder: "Entrer une ville", countryPlaceholder: "Pays (optionnel)",
    nextPrayer: "Prochaine prière", currentPrayer: "Prière actuelle", today: "Aujourd'hui", method: "Méthode",
    loading: "Chargement...", locating: "GPS en cours, puis IP en secours.", detect: "Détection de votre position",
    noCurrentPrayer: "Entre deux prières", searchPrompt: "Entrez une ville pour mettre à jour l'horaire.",
    permissionError: "Impossible de charger votre position. Recherchez une ville pour continuer.",
    locationNotFound: "Ville introuvable. Essayez une grande ville proche.", fetchError: "Impossible de charger les horaires maintenant. Réessayez.",
    timezone: tz => `Fuseau horaire : ${tz}`, locationPrefix: "Horaires pour", countdown: "commence dans",
    prayers: { Fajr: "Fajr", Dhuhr: "Dhuhr", Asr: "Asr", Maghrib: "Maghrib", Isha: "Isha" },
    topics: { home: "Horaires de prière", "prayer-times": "Horaires de prière", "next-prayer": "Heure de la prochaine prière", fajr: "Heure du Fajr", dhuhr: "Heure du Dhuhr", asr: "Heure de l'Asr", maghrib: "Heure du Maghrib", isha: "Heure de l'Isha" },
    eyebrow: "Horaires par ville", infoEyebrow: "Automatique", aboutEyebrow: "À propos", faqEyebrow: "FAQ", citiesEyebrow: "Villes populaires",
    footer: "Horaires de prière précis par ville.",
    citiesTitle: "Horaires de prière dans les grandes villes",
    citiesLine1: 'Accédez directement aux pages villes : <a href="/new-york">New York</a>, <a href="/sydney">Sydney</a>, <a href="/london">Londres</a>, <a href="/berlin">Berlin</a>, <a href="/dubai">Dubaï</a> et <a href="/cairo">Le Caire</a>.',
    citiesLine2: 'Accédez aussi à des recherches précises comme <a href="/asr-time/new-york">Asr à New York</a>, <a href="/dhuhr-time/sydney">Dhuhr à Sydney</a> ou <a href="/next-prayer/london">prochaine prière à Londres</a>.',
    heroTitle: (type, place, topic) => type === "home" ? (place ? `Horaires de prière à ${place} aujourd'hui` : "Horaires de prière aujourd'hui et compte à rebours") : (place ? `${topic} à ${place}` : `${topic} aujourd'hui`),
    heroSubtitle: (type, place, topic) => type === "home" ? (place ? `Consultez les horaires précis à ${place}, la prochaine prière et le planning complet du jour.` : "La page s'adapte désormais automatiquement à la langue du navigateur et à la localisation.") : (place ? `Consultez ${topic} à ${place}, puis le planning complet ci-dessous.` : `Chargez ${topic} automatiquement, puis consultez le planning complet ci-dessous.`),
    infoTitle: topic => `Conçu pour vérifier rapidement ${topic}`,
    features: topic => ["Détecte automatiquement la langue et la position.", `Affiche ${topic} avec un compte à rebours en direct.`, "Fonctionne directement dans le navigateur sans application.", "Les boutons manuels anglais et arabe restent disponibles en haut à droite."],
    aboutTitle: topic => `${topic} sans friction inutile`,
    about: (topic, place) => [place ? `Cette page vise directement ${topic} à ${place}, afin que le visiteur obtienne immédiatement la bonne information.` : `Cette page vise directement ${topic}, afin que le visiteur obtienne immédiatement la bonne information.`, "L'objectif est une expérience plus professionnelle : langue automatique, localisation automatique et planning clair.", "Cela aide à la fois l'utilisateur et les moteurs de recherche."],
    faqTitle: "Questions fréquentes",
    faq: [["La page détecte-t-elle ma ville automatiquement ?", "Oui. La page essaie d'abord le GPS puis un fallback par IP."], ["Puis-je changer de ville ?", "Oui. Vous pouvez rechercher n'importe quelle ville manuellement."], ["La page suit-elle automatiquement la langue du visiteur ?", "Oui. La page suit désormais la langue du navigateur, avec les boutons anglais et arabe toujours disponibles."]],
    pageTitle: (type, place, topic) => type === "home" ? (place ? `Horaires de prière à ${place} aujourd'hui | Fajr, Dhuhr, Asr, Maghrib, Isha | Adantimer` : "Adantimer | Horaires de prière précis et prochaine prière") : (place ? `${topic} à ${place} aujourd'hui | Adantimer` : `${topic} aujourd'hui | Adantimer`),
    pageDescription: (type, place, topic) => type === "home" ? (place ? `Consultez les horaires précis à ${place}, la prochaine prière et le planning complet du jour.` : "Consultez les horaires de prière de votre ville et laissez Adantimer suivre automatiquement la langue du navigateur.") : (place ? `Consultez ${topic} à ${place}, la prochaine prière et le planning complet du jour.` : `Consultez ${topic}, la prochaine prière et le planning complet du jour.`)
  },
  tr: {
    code: "tr", dir: "ltr",
    button: "Vakitleri göster", cityPlaceholder: "Şehir girin", countryPlaceholder: "Ülke (isteğe bağlı)",
    nextPrayer: "Sonraki namaz", currentPrayer: "Güncel namaz", today: "Bugün", method: "Yöntem",
    loading: "Yükleniyor...", locating: "Önce GPS, sonra IP yedeği deneniyor.", detect: "Konumunuz algılanıyor",
    noCurrentPrayer: "Namazlar arasında", searchPrompt: "Takvimi güncellemek için bir şehir girin.",
    permissionError: "Konum yüklenemedi. Devam etmek için bir şehir arayın.",
    locationNotFound: "Şehir bulunamadı. Daha büyük bir yakın şehir deneyin.", fetchError: "Namaz vakitleri şu anda yüklenemedi. Lütfen tekrar deneyin.",
    timezone: tz => `Saat dilimi: ${tz}`, locationPrefix: "Vakitler", countdown: "başlıyor",
    prayers: { Fajr: "Fajr", Dhuhr: "Dhuhr", Asr: "Asr", Maghrib: "Maghrib", Isha: "Isha" },
    topics: { home: "Namaz Vakitleri", "prayer-times": "Namaz Vakitleri", "next-prayer": "Sonraki Namaz Vakti", fajr: "Fajr Vakti", dhuhr: "Dhuhr Vakti", asr: "Asr Vakti", maghrib: "Maghrib Vakti", isha: "Isha Vakti" },
    eyebrow: "Şehre göre namaz vakitleri", infoEyebrow: "Otomatik", aboutEyebrow: "Hakkında", faqEyebrow: "SSS", citiesEyebrow: "Popüler şehirler",
    footer: "Şehre göre doğru namaz vakitleri.",
    citiesTitle: "Büyük şehirlerde namaz vakitleri",
    citiesLine1: 'Şehir sayfalarına doğrudan gidin: <a href="/new-york">New York</a>, <a href="/sydney">Sydney</a>, <a href="/london">Londra</a>, <a href="/berlin">Berlin</a>, <a href="/dubai">Dubai</a> ve <a href="/cairo">Kahire</a>.',
    citiesLine2: 'Ayrıca <a href="/asr-time/new-york">New York Asr</a>, <a href="/dhuhr-time/sydney">Sydney Dhuhr</a> veya <a href="/next-prayer/london">Londra sonraki namaz</a> gibi aramalara gidin.',
    heroTitle: (type, place, topic) => type === "home" ? (place ? `${place} için bugünün namaz vakitleri` : "Bugünün namaz vakitleri ve sonraki namaz geri sayımı") : (place ? `${place} için ${topic}` : `${topic}`),
    heroSubtitle: (type, place, topic) => type === "home" ? (place ? `${place} için doğru vakitleri, sonraki namaz geri sayımını ve günlük takvimi görün.` : "Sayfa artık tarayıcı diline ve konuma otomatik uyum sağlar.") : (place ? `${place} için ${topic} bilgisini görün ve aşağıda tam takvimi inceleyin.` : `${topic} bilgisini otomatik yükleyin ve aşağıda tam takvimi inceleyin.`),
    infoTitle: topic => `${topic} için hızlı kullanım`,
    features: topic => ["Dil ve konumu otomatik algılar.", `${topic} bilgisini canlı geri sayımla gösterir.`, "Uygulama kurmadan tarayıcıda çalışır.", "Sağ üstte manuel İngilizce ve Arapça düğmeleri kalır."],
    aboutTitle: topic => `Gereksiz kalabalık olmadan ${topic}`,
    about: (topic, place) => [place ? `Bu sayfa ${place} için ${topic} amacına odaklanır ve ziyaretçinin doğru bilgiye hemen ulaşmasını sağlar.` : `Bu sayfa ${topic} amacına odaklanır ve ziyaretçinin doğru bilgiye hemen ulaşmasını sağlar.`, "Amaç daha profesyonel bir deneyim: otomatik dil seçimi, otomatik konum algılama ve net bir namaz takvimi.", "Bu sayfanın amacını hem kullanıcıların hem arama motorlarının daha iyi anlamasına yardım eder."],
    faqTitle: "Sık sorulan sorular",
    faq: [["Sayfa şehrimi otomatik algılıyor mu?", "Evet. Önce GPS denenir, sonra IP tabanlı yedek kullanılır."], ["Başka bir şehre geçebilir miyim?", "Evet. Herhangi bir şehri manuel olarak arayabilirsiniz."], ["Sayfa otomatik olarak ziyaretçinin dilini takip ediyor mu?", "Evet. Sayfa artık tarayıcı dilini otomatik takip eder; İngilizce ve Arapça düğmeleri yine de mevcuttur."]],
    pageTitle: (type, place, topic) => type === "home" ? (place ? `${place} için bugünün namaz vakitleri | Fajr, Dhuhr, Asr, Maghrib, Isha | Adantimer` : "Adantimer | Doğru namaz vakitleri ve sonraki namaz") : (place ? `${place} için ${topic} | Adantimer` : `${topic} | Adantimer`),
    pageDescription: (type, place, topic) => type === "home" ? (place ? `${place} için doğru namaz vakitlerini, sonraki namaz geri sayımını ve günlük takvimi görün.` : "Şehriniz için doğru namaz vakitlerini görün ve Adantimer'in tarayıcı dilini otomatik kullanmasına izin verin.") : (place ? `${place} için ${topic} bilgisini, sonraki namaz geri sayımını ve günlük takvimi görün.` : `${topic} bilgisini, sonraki namaz geri sayımını ve günlük takvimi görün.`)
  },
  "zh-hans": {
    code: "zh-CN", dir: "ltr",
    button: "查看礼拜时间", cityPlaceholder: "输入城市", countryPlaceholder: "国家（可选）",
    nextPrayer: "下一次礼拜", currentPrayer: "当前礼拜", today: "今天", method: "计算方式",
    loading: "加载中...", locating: "正在尝试 GPS，然后使用 IP 备用。", detect: "正在识别你的位置",
    noCurrentPrayer: "两次礼拜之间", searchPrompt: "输入城市以更新时间表。",
    permissionError: "无法获取你的位置。请输入城市继续。",
    locationNotFound: "未找到该城市。请尝试附近更大的城市。", fetchError: "暂时无法加载礼拜时间，请稍后再试。",
    timezone: tz => `时区：${tz}`, locationPrefix: "礼拜时间", countdown: "开始于",
    prayers: { Fajr: "晨礼", Dhuhr: "晌礼", Asr: "晡礼", Maghrib: "昏礼", Isha: "宵礼" },
    topics: { home: "礼拜时间", "prayer-times": "礼拜时间", "next-prayer": "下一次礼拜时间", fajr: "晨礼时间", dhuhr: "晌礼时间", asr: "晡礼时间", maghrib: "昏礼时间", isha: "宵礼时间" },
    eyebrow: "按城市查看礼拜时间", infoEyebrow: "自动", aboutEyebrow: "关于", faqEyebrow: "常见问题", citiesEyebrow: "热门城市",
    footer: "按城市提供准确礼拜时间。",
    citiesTitle: "主要城市礼拜时间",
    citiesLine1: '可直接打开城市页面：<a href="/new-york">纽约</a>、<a href="/sydney">悉尼</a>、<a href="/london">伦敦</a>、<a href="/berlin">柏林</a>、<a href="/dubai">迪拜</a>、<a href="/cairo">开罗</a>。',
    citiesLine2: '也可以直接进入具体搜索，例如 <a href="/asr-time/new-york">纽约晡礼时间</a>、<a href="/dhuhr-time/sydney">悉尼晌礼时间</a>、<a href="/next-prayer/london">伦敦下一次礼拜</a>。',
    heroTitle: (type, place, topic) => type === "home" ? (place ? `${place} 今日礼拜时间` : "今日礼拜时间与下一次礼拜倒计时") : (place ? `${place}${topic}` : `${topic}`),
    heroSubtitle: (type, place, topic) => type === "home" ? (place ? `查看 ${place} 的准确礼拜时间、下一次礼拜以及完整日程。` : "页面现在会自动根据浏览器语言和位置进行适配。") : (place ? `查看 ${place} 的${topic}，并在下方查看完整礼拜时间表。` : `自动加载${topic}，并在下方查看完整礼拜时间表。`),
    infoTitle: topic => `为快速查看${topic}而设计`,
    features: topic => ["自动识别语言和位置。", `显示${topic}并提供实时倒计时。`, "无需安装应用，直接在浏览器中使用。", "右上角仍保留英语和阿拉伯语手动按钮。"],
    aboutTitle: topic => `${topic}，更清晰更直接`,
    about: (topic, place) => [place ? `此页面聚焦于 ${place} 的${topic}，让访问者能够立即看到最相关的信息。` : `此页面聚焦于${topic}，让访问者能够立即看到最相关的信息。`, "目标是提供更专业的体验：自动语言、自动定位，以及清晰的礼拜时间表。", "这也更有利于用户和搜索引擎理解页面意图。"],
    faqTitle: "常见问题",
    faq: [["页面会自动识别我的城市吗？", "会。页面会先尝试 GPS，然后使用 IP 作为备用。"], ["我可以切换到其他城市吗？", "可以。你可以手动搜索任何城市。"], ["页面会自动使用访问者的语言吗？", "会。页面现在会自动跟随浏览器语言，同时仍保留英语和阿拉伯语手动按钮。"]],
    pageTitle: (type, place, topic) => type === "home" ? (place ? `${place} 今日礼拜时间 | 晨礼 晌礼 晡礼 昏礼 宵礼 | Adantimer` : "Adantimer | 准确礼拜时间与下一次礼拜") : (place ? `${place}${topic} | Adantimer` : `${topic} | Adantimer`),
    pageDescription: (type, place, topic) => type === "home" ? (place ? `查看 ${place} 的准确礼拜时间、下一次礼拜倒计时以及今日完整礼拜日程。` : "查看你所在城市的礼拜时间，并让 Adantimer 自动使用浏览器语言。") : (place ? `查看 ${place} 的${topic}、下一次礼拜倒计时以及今日完整礼拜日程。` : `查看${topic}、下一次礼拜倒计时以及今日完整礼拜日程。`)
  },
  ar: {
    code: "ar", dir: "rtl",
    button: "اعرض المواقيت", cityPlaceholder: "أدخل المدينة", countryPlaceholder: "الدولة (اختياري)",
    nextPrayer: "الصلاة القادمة", currentPrayer: "الصلاة الحالية", today: "اليوم", method: "طريقة الحساب",
    loading: "جار التحميل...", locating: "جارٍ محاولة تحديد الموقع عبر GPS ثم عبر IP.", detect: "جارٍ تحديد موقعك",
    noCurrentPrayer: "بين الصلوات", searchPrompt: "أدخل مدينة لتحديث الجدول.",
    permissionError: "تعذر تحميل موقعك. ابحث عن مدينة للمتابعة.",
    locationNotFound: "لم يتم العثور على المدينة. جرّب مدينة أكبر قريبة.", fetchError: "تعذر تحميل مواقيت الصلاة الآن. حاول مرة أخرى.",
    timezone: tz => `المنطقة الزمنية: ${tz}`, locationPrefix: "مواقيت الصلاة في", countdown: "تبدأ خلال",
    prayers: { Fajr: "الفجر", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" },
    topics: { home: "مواقيت الصلاة", "prayer-times": "مواقيت الصلاة", "next-prayer": "وقت الصلاة القادمة", fajr: "وقت الفجر", dhuhr: "وقت الظهر", asr: "وقت العصر", maghrib: "وقت المغرب", isha: "وقت العشاء" },
    eyebrow: "مواقيت الصلاة حسب المدينة", infoEyebrow: "تلقائي", aboutEyebrow: "عن الصفحة", faqEyebrow: "الأسئلة الشائعة", citiesEyebrow: "مدن شائعة",
    footer: "مواقيت الصلاة الدقيقة حسب المدينة.",
    citiesTitle: "مواقيت الصلاة في المدن الكبرى",
    citiesLine1: 'تصفح صفحات المدن مباشرة: <a href="/new-york">نيويورك</a>، <a href="/sydney">سيدني</a>، <a href="/london">لندن</a>، <a href="/berlin">برلين</a>، <a href="/dubai">دبي</a>، و<a href="/cairo">القاهرة</a>.',
    citiesLine2: 'يمكنك أيضاً الانتقال إلى صفحات دقيقة مثل <a href="/asr-time/new-york">وقت العصر في نيويورك</a>، <a href="/dhuhr-time/sydney">وقت الظهر في سيدني</a>، أو <a href="/next-prayer/london">الصلاة القادمة في لندن</a>.',
    heroTitle: (type, place, topic) => type === "home" ? (place ? `مواقيت الصلاة في ${place} اليوم` : "مواقيت الصلاة اليوم والعد التنازلي للصلاة القادمة") : (place ? `${topic} في ${place}` : `${topic} اليوم`),
    heroSubtitle: (type, place, topic) => type === "home" ? (place ? `شاهد المواقيت الدقيقة في ${place} وتابع الصلاة القادمة وجدول اليوم الكامل.` : "تتكيّف الصفحة الآن تلقائياً مع لغة المتصفح وموقع الزائر.") : (place ? `شاهد ${topic} في ${place} ثم راجع جدول الصلاة الكامل بالأسفل.` : `حمّل ${topic} تلقائياً ثم راجع جدول الصلاة الكامل بالأسفل.`),
    infoTitle: topic => `مصممة للوصول السريع إلى ${topic}`,
    features: topic => ["تتعرف على اللغة والموقع تلقائياً.", `تعرض ${topic} مع عد تنازلي مباشر وحالة واضحة.`, "تعمل مباشرة في المتصفح من دون تطبيق.", "تبقى أزرار الإنجليزية والعربية متاحة يدوياً أعلى اليمين."],
    aboutTitle: topic => `${topic} من دون تعقيد`,
    about: (topic, place) => [place ? `هذه الصفحة موجهة إلى ${topic} في ${place} حتى يصل الزائر إلى المعلومة الصحيحة مباشرة.` : `هذه الصفحة موجهة إلى ${topic} حتى يصل الزائر إلى المعلومة الصحيحة مباشرة.`, "الهدف هو تجربة أكثر احترافية: لغة تلقائية، موقع تلقائي، وجدول صلاة واضح.", "وهذا يساعد المستخدم ومحركات البحث على فهم الصفحة بشكل أوضح."],
    faqTitle: "الأسئلة الشائعة",
    faq: [["هل تتعرف الصفحة على مدينتي تلقائياً؟", "نعم. تحاول الصفحة استخدام GPS أولاً ثم تعتمد على IP كخيار احتياطي."], ["هل يمكنني التبديل إلى مدينة أخرى؟", "نعم. يمكنك البحث عن أي مدينة يدوياً وسيتم تحديث الصفحة فوراً."], ["هل تتبع الصفحة لغة الزائر تلقائياً؟", "نعم. تتبع الصفحة الآن لغة المتصفح تلقائياً، مع بقاء أزرار الإنجليزية والعربية متاحة يدوياً."]],
    pageTitle: (type, place, topic) => type === "home" ? (place ? `مواقيت الصلاة في ${place} اليوم | الفجر والظهر والعصر والمغرب والعشاء | Adantimer` : "Adantimer | مواقيت الصلاة والعد التنازلي للصلاة القادمة") : (place ? `${topic} في ${place} اليوم | Adantimer` : `${topic} اليوم | Adantimer`),
    pageDescription: (type, place, topic) => type === "home" ? (place ? `تحقق من مواقيت الصلاة الدقيقة في ${place} وتابع الصلاة القادمة وجدول اليوم الكامل.` : "تحقق من مواقيت الصلاة لمدينتك ودع Adantimer يتبع لغة المتصفح تلقائياً.") : (place ? `تحقق من ${topic} في ${place} وتابع الصلاة القادمة وجدول اليوم الكامل.` : `تحقق من ${topic} وتابع الصلاة القادمة وجدول اليوم الكامل.`)
  }
};

let language = "en";
let currentLocationType = null;
let currentCoords = null;
let currentTimezone = "";
let currentMethod = "";
let cityName = "";
let countryName = "";
let countdownInterval = null;
let nextPrayerData = null;
let prayerSchedule = [];
let loadingWatchdogId = null;

const REQUEST_TIMEOUTS = {
  ipLocation: 4000,
  geocode: 5000,
  citySearch: 6000,
  prayerTimes: 8000,
  loadingWatchdog: 12000
};

function slugifyCity(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function unslugifyCity(value) {
  return value.split("-").filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function resolveLanguageTag(input) {
  if (!input) return "";
  const normalized = String(input).toLowerCase();
  return LANGUAGE_ALIASES[normalized] || LANGUAGE_ALIASES[normalized.split("-")[0]] || "";
}

function getRequestedLanguage() {
  const params = new URLSearchParams(window.location.search);
  const query = resolveLanguageTag(params.get("lang"));
  if (query) return query;
  const first = window.location.pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean)[0] || "";
  return resolveLanguageTag(first);
}

function getPreferredLanguage() {
  const forced = getRequestedLanguage();
  if (forced) return forced;
  const stored = resolveLanguageTag(localStorage.getItem("adantimer-language"));
  if (stored) return stored;
  const browserLanguages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  for (const entry of browserLanguages) {
    const match = resolveLanguageTag(entry);
    if (match) return match;
  }
  return "en";
}

function getRequestedCity() {
  const params = new URLSearchParams(window.location.search);
  const queryCity = params.get("city");
  if (queryCity) {
    const decodedQueryCity = decodeURIComponent(queryCity).trim();
    return decodedQueryCity.includes("-") ? unslugifyCity(decodedQueryCity) : decodedQueryCity;
  }
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (!path || path.toLowerCase() === "index.html") return "";
  const parts = path.split("/").filter(Boolean);
  const clean = resolveLanguageTag(parts[0]) ? parts.slice(1) : parts;
  const keywordRoots = new Set(["prayer-times", "next-prayer", "fajr-time", "dhuhr-time", "asr-time", "maghrib-time", "isha-time"]);
  if (!clean.length) return "";
  if (keywordRoots.has(clean[0])) return clean[1] ? unslugifyCity(decodeURIComponent(clean[1])) : "";
  return unslugifyCity(decodeURIComponent(clean[0]));
}

function getLocale() {
  return LOCALES[language] || LOCALES.en;
}

function getTopic(locale) {
  return locale.topics[pageType] || locale.topics.home;
}

function localizeCityName(city, lang = language) {
  if (!city) return "";
  const localeKey = resolveLanguageTag(lang) || lang || "en";
  const key = slugifyCity(city);
  return CITY_NAME_LOCALIZATIONS[key]?.[localeKey] || city;
}

function localizeCountryName(country, lang = language) {
  if (!country) return "";
  const localeKey = resolveLanguageTag(lang) || lang || "en";
  const key = String(country).trim().toLowerCase();
  return COUNTRY_NAME_LOCALIZATIONS[key]?.[localeKey] || country;
}

function getPlaceName(city = "", country = "") {
  const localizedCity = localizeCityName(city, language);
  const localizedCountry = localizeCountryName(country, language);
  return localizedCity && localizedCountry ? `${localizedCity}, ${localizedCountry}` : localizedCity || localizedCountry || "";
}

function getLanguagePrefix(lang) {
  return LANGUAGE_PREFIXES[lang] || "";
}

function buildRelativeUrl(lang, type, city = "") {
  const prefix = getLanguagePrefix(lang);
  const slug = city ? encodeURIComponent(slugifyCity(city)) : "";
  const pathMap = {
    home: slug ? `/${slug}` : "/",
    "prayer-times": slug ? `/prayer-times/${slug}` : "/prayer-times",
    "next-prayer": slug ? `/next-prayer/${slug}` : "/next-prayer",
    fajr: slug ? `/fajr-time/${slug}` : "/fajr-time",
    dhuhr: slug ? `/dhuhr-time/${slug}` : "/dhuhr-time",
    asr: slug ? `/asr-time/${slug}` : "/asr-time",
    maghrib: slug ? `/maghrib-time/${slug}` : "/maghrib-time",
    isha: slug ? `/isha-time/${slug}` : "/isha-time"
  };
  const path = pathMap[type] || pathMap.home;
  const basePath = `${prefix}${path === "/" && prefix ? "" : path}`;
  return basePath;
}

function buildPageUrl(lang, type, city = "") {
  return `https://www.adantimer.com${buildRelativeUrl(lang, type, city)}`;
}

function setMetaContent(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute("content", value);
}

function renderFeatureList(items) {
  document.querySelectorAll(".info-card .feature-list li").forEach((node, index) => {
    node.textContent = items[index] || "";
  });
}

function renderFaq(items) {
  document.querySelectorAll(".seo-grid section.prose .faq-list > div").forEach((entry, index) => {
    const item = items[index];
    if (!item) return;
    const h3 = entry.querySelector("h3");
    const p = entry.querySelector("p");
    if (h3) h3.textContent = item[0];
    if (p) p.textContent = item[1];
  });
}

function renderStaticContent() {
  const locale = getLocale();
  const topic = getTopic(locale);
  const place = getPlaceName(cityName, countryName);
  document.documentElement.lang = locale.code;
  document.documentElement.dir = locale.dir;
  document.body.setAttribute("dir", locale.dir);
  if (setLocationButtonEl) setLocationButtonEl.textContent = locale.button;
  if (cityInput) cityInput.placeholder = locale.cityPlaceholder;
  if (countryInput) countryInput.placeholder = locale.countryPlaceholder;
  const cityLabel = document.querySelector('label[for="manual-city"]');
  const countryLabel = document.querySelector('label[for="manual-country"]');
  if (cityLabel) cityLabel.textContent = locale.cityPlaceholder;
  if (countryLabel) countryLabel.textContent = locale.countryPlaceholder;
  langButtons.forEach(button => button.classList.toggle("is-active", button.dataset.lang === language));
  const brandLink = document.querySelector(".brand");
  if (brandLink) brandLink.setAttribute("href", buildRelativeUrl(language, "home"));
  const heroEyebrow = document.querySelector(".hero-copy .eyebrow");
  if (heroEyebrow) heroEyebrow.textContent = pageType === "home" ? locale.eyebrow : topic;
  if (heroHeadingEl) heroHeadingEl.textContent = locale.heroTitle(pageType, place, topic);
  if (heroSubtitleEl) heroSubtitleEl.textContent = locale.heroSubtitle(pageType, place, topic);
  const scheduleEyebrow = document.querySelector(".schedule-card .eyebrow");
  if (scheduleEyebrow) scheduleEyebrow.textContent = locale.today;
  const scheduleHeading = document.querySelector("#schedule-heading");
  if (scheduleHeading) {
    const headingByLanguage = {
      en: "Today's Prayer Schedule",
      de: "Heutiger Gebetsplan",
      fr: "Horaires de prière du jour",
      tr: "Bugünün namaz takvimi",
      "zh-hans": "今日礼拜时间表",
      ar: "جدول الصلاة اليوم"
    };
    scheduleHeading.textContent = headingByLanguage[language] || headingByLanguage.en;
  }
  const keywordToPage = {
    "prayer-times": "prayer-times",
    "next-prayer": "next-prayer",
    "fajr-time": "fajr",
    "dhuhr-time": "dhuhr",
    "asr-time": "asr",
    "maghrib-time": "maghrib",
    "isha-time": "isha"
  };
  document.querySelectorAll(".intent-links a").forEach(link => {
    const href = link.getAttribute("href") || "";
    const parts = href.replace(/^\/+/, "").split("/").filter(Boolean);
    const cleanParts = resolveLanguageTag(parts[0]) ? parts.slice(1) : parts;
    const intent = keywordToPage[cleanParts[0]];
    if (!intent) return;
    link.textContent = locale.topics[intent] || locale.topics.home;
    link.setAttribute("href", buildRelativeUrl(language, intent));
  });
  document.querySelectorAll(".popular-cities a.city-chip[data-city]").forEach(link => {
    link.textContent = localizeCityName(link.dataset.city || "", language);
    link.setAttribute("href", buildRelativeUrl(language, "home", link.dataset.city || ""));
  });
  const infoEyebrow = document.querySelector(".info-card .eyebrow");
  const infoTitle = document.querySelector(".info-card h2");
  if (infoEyebrow) infoEyebrow.textContent = locale.infoEyebrow;
  if (infoTitle) infoTitle.textContent = locale.infoTitle(topic);
  renderFeatureList(locale.features(topic));
  const aboutArticle = document.querySelector(".seo-grid article.prose");
  if (aboutArticle) {
    const eyebrow = aboutArticle.querySelector(".eyebrow");
    const heading = aboutArticle.querySelector("h2");
    const paragraphs = Array.from(aboutArticle.querySelectorAll("p")).slice(1);
    if (eyebrow) eyebrow.textContent = locale.aboutEyebrow;
    if (heading) heading.textContent = locale.aboutTitle(topic);
    locale.about(topic, place).forEach((text, index) => {
      if (paragraphs[index]) paragraphs[index].textContent = text;
    });
  }
  const faqSection = document.querySelector(".seo-grid section.prose");
  if (faqSection) {
    const eyebrow = faqSection.querySelector(".eyebrow");
    const heading = faqSection.querySelector("h2");
    if (eyebrow) eyebrow.textContent = locale.faqEyebrow;
    if (heading) heading.textContent = locale.faqTitle;
    renderFaq(locale.faq);
  }
  const citiesSection = document.querySelector('[aria-labelledby="cities-heading"]');
  if (citiesSection) {
    const eyebrow = citiesSection.querySelector(".eyebrow");
    const heading = citiesSection.querySelector("h2");
    const paragraphs = citiesSection.querySelectorAll("p");
    if (eyebrow) eyebrow.textContent = locale.citiesEyebrow;
    if (heading) heading.textContent = locale.citiesTitle;
    if (paragraphs[0]) paragraphs[0].innerHTML = locale.citiesLine1;
    if (paragraphs[1]) paragraphs[1].innerHTML = locale.citiesLine2;
    citiesSection.querySelectorAll("a[href]").forEach(link => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("/")) return;
      const parts = href.replace(/^\/+/, "").split("/").filter(Boolean);
      if (!parts.length) return;
      const page = keywordToPage[parts[0]] || "home";
      const city = page === "home" ? parts[0] : (parts[1] || "");
      link.setAttribute("href", buildRelativeUrl(language, page, unslugifyCity(city)));
    });
  }
  const footerText = document.querySelector(".footer p");
  if (footerText) footerText.textContent = `\u00A9 2026 Adantimer. ${locale.footer}`;
}

function applySeoMeta(city = "") {
  const locale = getLocale();
  const topic = getTopic(locale);
  const place = getPlaceName(city.trim(), countryName);
  const title = locale.pageTitle(pageType, place, topic);
  const description = locale.pageDescription(pageType, place, topic);
  const url = buildPageUrl(language, pageType, city);
  document.title = title;
  setMetaContent("meta[name='description']", description);
  setMetaContent("meta[property='og:title']", title);
  setMetaContent("meta[property='og:description']", description);
  setMetaContent("meta[property='og:url']", url);
  setMetaContent("meta[name='twitter:title']", title);
  setMetaContent("meta[name='twitter:description']", description);
  if (canonicalEl) canonicalEl.href = url;
  if (websiteSchemaEl) {
    websiteSchemaEl.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: title, url, description, inLanguage: [locale.code] });
  }
}

function setLanguage(lang, persist = true) {
  language = LOCALES[lang] ? lang : "en";
  const activeCity = cityName || getRequestedCity();
  if (persist) localStorage.setItem("adantimer-language", language);
  window.language = language;
  renderStaticContent();
  renderScheduleSummary();
  renderPrayerRows();
  renderNextPrayer();
  applySeoMeta(activeCity);
  updateHistory(activeCity);
}

window.setLanguage = setLanguage;

async function fetchJsonWithTimeout(url, timeoutMs, options = {}) {
  const controller = new AbortController();
  const timerId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.json();
  } finally {
    window.clearTimeout(timerId);
  }
}

function clearLoadingWatchdog() {
  if (loadingWatchdogId) {
    window.clearTimeout(loadingWatchdogId);
    loadingWatchdogId = null;
  }
}

function renderAutoLoadFallback(locale) {
  currentCoords = null;
  currentTimezone = "";
  currentMethod = "";
  cityName = "";
  countryName = "";
  prayerSchedule = [];
  nextPrayerData = null;
  nextPrayerNameEl.textContent = "";
  countdownEl.textContent = locale.searchPrompt;
  currentPrayerValueEl.textContent = "—";
  todayDateValueEl.textContent = "—";
  methodValueEl.textContent = "—";
  locationStatusEl.textContent = locale.searchPrompt;
  locationEl.textContent = locale.searchPrompt;
  scheduleSummaryEl.textContent = locale.searchPrompt;
  prayerTimesEl.innerHTML = "";
  if (cityInput) cityInput.value = "";
  if (countryInput) countryInput.value = "";
}

function armLoadingWatchdog(locale, softFail = false) {
  clearLoadingWatchdog();
  loadingWatchdogId = window.setTimeout(() => {
    if (nextPrayerData || countdownEl.textContent !== locale.loading) return;
    if (softFail) {
      renderAutoLoadFallback(locale);
      return;
    }
    countdownEl.textContent = locale.fetchError;
    locationStatusEl.textContent = locale.fetchError;
    locationEl.textContent = locale.searchPrompt;
  }, REQUEST_TIMEOUTS.loadingWatchdog);
}

async function getGPSLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }), reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 });
  });
}

async function getIPLocation() {
  try {
    const data = await fetchJsonWithTimeout("https://ipapi.co/json/", REQUEST_TIMEOUTS.ipLocation);
    if (!data || !data.latitude || !data.longitude) return null;
    return { lat: Number(data.latitude), lng: Number(data.longitude), city: data.city || "", country: data.country_name || "" };
  } catch {
    return null;
  }
}

async function reverseGeocode(lat, lng) {
  try {
    const data = await fetchJsonWithTimeout(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, REQUEST_TIMEOUTS.geocode);
    const address = data.address || {};
    return { city: address.city || address.town || address.village || address.hamlet || "", country: address.country || "" };
  } catch {
    return { city: "", country: "" };
  }
}

async function searchCity(city, country = "") {
  const params = new URLSearchParams({ format: "json", limit: "1", city });
  if (country) params.set("country", country);
  const data = await fetchJsonWithTimeout(`https://nominatim.openstreetmap.org/search?${params.toString()}`, REQUEST_TIMEOUTS.citySearch);
  if (!Array.isArray(data) || !data.length) return null;
  const first = data[0];
  const displayParts = String(first.display_name || "").split(",").map(part => part.trim()).filter(Boolean);
  return { lat: Number(first.lat), lng: Number(first.lon), city, country: country || displayParts[displayParts.length - 1] || "" };
}

function updateHistory(city = "") {
  history.replaceState({}, "", buildRelativeUrl(language, pageType, city));
}

function renderScheduleSummary() {
  const locale = getLocale();
  const place = getPlaceName(cityName, countryName);
  titleEl.textContent = locale.nextPrayer;
  currentPrayerLabelEl.textContent = locale.currentPrayer;
  todayLabelEl.textContent = locale.today;
  methodLabelEl.textContent = locale.method;
  scheduleSummaryEl.textContent = place ? (locale.scheduleSummary ? locale.scheduleSummary(place) : `${locale.locationPrefix} ${place}`) : locale.searchPrompt;
  locationStatusEl.textContent = place ? `${locale.locationPrefix} ${place}` : locale.detect;
  locationEl.textContent = currentTimezone ? `${place || locale.detect} - ${locale.timezone(currentTimezone)}` : (place || locale.locating);
}

function getCurrentPrayer() {
  if (!prayerSchedule.length) return null;
  const now = new Date();
  let active = null;
  prayerSchedule.forEach((prayer, index) => {
    const next = prayerSchedule[index + 1];
    if (now >= prayer.time && (!next || now < next.time)) active = prayer;
  });
  return active;
}

function formatTodayDate() {
  return new Intl.DateTimeFormat(getLocale().code, { weekday: "short", day: "numeric", month: "short" }).format(new Date());
}

function renderPrayerRows() {
  if (!prayerSchedule.length) {
    prayerTimesEl.innerHTML = "";
    return;
  }
  const locale = getLocale();
  prayerTimesEl.innerHTML = "";
  prayerSchedule.forEach(prayer => {
    const row = document.createElement("div");
    row.className = `prayer-row${nextPrayerData && nextPrayerData.key === prayer.key ? " is-next" : ""}`;
    const name = document.createElement("span");
    name.className = "prayer-name";
    name.textContent = locale.prayers[prayer.key] || prayer.key;
    const time = document.createElement("span");
    time.className = "prayer-time";
    time.textContent = prayer.timeText;
    row.append(name, time);
    prayerTimesEl.appendChild(row);
  });
}

function renderNextPrayer() {
  const locale = getLocale();
  titleEl.textContent = locale.nextPrayer;
  if (!nextPrayerData) {
    nextPrayerNameEl.textContent = "";
    countdownEl.textContent = locale.loading;
    currentPrayerValueEl.textContent = locale.loading;
    todayDateValueEl.textContent = locale.loading;
    methodValueEl.textContent = locale.loading;
    return;
  }
  const currentPrayer = getCurrentPrayer();
  nextPrayerNameEl.textContent = locale.prayers[nextPrayerData.key] || nextPrayerData.key;
  currentPrayerValueEl.textContent = currentPrayer ? (locale.prayers[currentPrayer.key] || currentPrayer.key) : locale.noCurrentPrayer;
  todayDateValueEl.textContent = formatTodayDate();
  methodValueEl.textContent = currentMethod || "Aladhan";
}

function startCountdown(prayer) {
  clearInterval(countdownInterval);
  nextPrayerData = prayer;
  renderPrayerRows();
  renderNextPrayer();
  const tick = () => {
    const locale = getLocale();
    const diff = prayer.time - new Date();
    if (diff <= 0) {
      loadPrayerTimes();
      return;
    }
    const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    countdownEl.textContent = `${locale.prayers[prayer.key] || prayer.key} ${locale.countdown} ${hours}:${minutes}:${seconds}`;
  };
  tick();
  countdownInterval = window.setInterval(tick, 1000);
}

function saveRecentLocation() {
  if (!cityName || !currentCoords) return;
  localStorage.setItem("adantimer-last-location", JSON.stringify({ city: cityName, country: countryName, lat: currentCoords.lat, lng: currentCoords.lng }));
}

function readRecentLocation() {
  try {
    const raw = localStorage.getItem("adantimer-last-location");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function resolveInitialLocation() {
  const requestedCity = getRequestedCity();
  const params = new URLSearchParams(window.location.search);
  const requestedCountry = params.get("country") || "";
  if (requestedCity) {
    const result = await searchCity(requestedCity, requestedCountry);
    if (result) {
      currentLocationType = "manual";
      return result;
    }
  }
  const recent = readRecentLocation();
  if (recent && recent.lat && recent.lng) {
    currentLocationType = "recent";
    return recent;
  }
  try {
    currentLocationType = "gps";
    return await getGPSLocation();
  } catch {
    const ipResult = await getIPLocation();
    if (ipResult) {
      currentLocationType = "ip";
      return ipResult;
    }
  }
  return null;
}

async function loadPrayerTimes(resolvedLocation) {
  const locale = getLocale();
  const shouldSoftFail = !resolvedLocation && !getRequestedCity();
  clearInterval(countdownInterval);
  countdownEl.textContent = locale.loading;
  prayerTimesEl.innerHTML = "";
  nextPrayerData = null;
  renderNextPrayer();
  armLoadingWatchdog(locale, shouldSoftFail);
  const source = resolvedLocation || await resolveInitialLocation();
  if (!source) {
    clearLoadingWatchdog();
    if (shouldSoftFail) {
      renderAutoLoadFallback(locale);
      return;
    }
    countdownEl.textContent = locale.permissionError;
    locationStatusEl.textContent = locale.permissionError;
    locationEl.textContent = locale.searchPrompt;
    return;
  }
  currentCoords = { lat: Number(source.lat), lng: Number(source.lng) };
  try {
    const prayerJson = await fetchJsonWithTimeout(`https://api.aladhan.com/v1/timings?latitude=${currentCoords.lat}&longitude=${currentCoords.lng}&method=2`, REQUEST_TIMEOUTS.prayerTimes);
    const data = prayerJson.data;
    const timings = data.timings;
    currentTimezone = data.meta.timezone || "";
    currentMethod = data.meta.method && data.meta.method.name ? data.meta.method.name : "Aladhan";
    if (source.city) {
      cityName = source.city;
      countryName = source.country || "";
    } else {
      const resolved = await reverseGeocode(currentCoords.lat, currentCoords.lng);
      cityName = resolved.city || "Your location";
      countryName = resolved.country || "";
    }
    if (cityInput) cityInput.value = cityName || "";
    if (countryInput) countryInput.value = countryName || "";
    const prayerKeys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const now = new Date();
    prayerSchedule = prayerKeys.map(key => {
      const parts = timings[key].split(":");
      const prayerTime = new Date();
      prayerTime.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
      return { key, time: prayerTime, timeText: timings[key] };
    });
    let nextPrayer = prayerSchedule.find(prayer => prayer.time > now);
    if (!nextPrayer) {
      const fajr = prayerSchedule[0];
      nextPrayer = { ...fajr, time: new Date(fajr.time.getTime() + 86400000) };
    }
    clearLoadingWatchdog();
    renderStaticContent();
    renderScheduleSummary();
    renderPrayerRows();
    startCountdown(nextPrayer);
    applySeoMeta(cityName);
    saveRecentLocation();
    if (currentLocationType === "manual") updateHistory(cityName);
  } catch {
    clearLoadingWatchdog();
    if (shouldSoftFail) {
      renderAutoLoadFallback(locale);
      return;
    }
    countdownEl.textContent = locale.fetchError;
    locationStatusEl.textContent = locale.fetchError;
    locationEl.textContent = locale.searchPrompt;
  }
}

async function handleManualLocation(city, country = "") {
  const locale = getLocale();
  if (!city.trim()) {
    cityInput.focus();
    return;
  }
  countdownEl.textContent = locale.loading;
  locationStatusEl.textContent = getPlaceName(city.trim(), country.trim()) || `${locale.locationPrefix} ${city}`;
  try {
    const result = await searchCity(city.trim(), country.trim());
    if (!result) {
      locationStatusEl.textContent = locale.locationNotFound;
      countdownEl.textContent = locale.locationNotFound;
      return;
    }
    currentLocationType = "manual";
    await loadPrayerTimes(result);
  } catch {
    locationStatusEl.textContent = locale.fetchError;
    countdownEl.textContent = locale.fetchError;
  }
}

if (locationForm) {
  locationForm.addEventListener("submit", event => {
    event.preventDefault();
    handleManualLocation(cityInput.value, countryInput.value);
  });
}

langButtons.forEach(button => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang, true));
});

document.querySelectorAll("button.city-chip").forEach(button => {
  button.addEventListener("click", () => {
    cityInput.value = button.dataset.city || "";
    countryInput.value = button.dataset.country || "";
    handleManualLocation(cityInput.value, countryInput.value);
  });
});

language = getPreferredLanguage();
setLanguage(language, false);
loadPrayerTimes();
