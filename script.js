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
const INTENT_PAGE_MAP = {
  "prayer-times": "prayer-times",
  "next-prayer": "next-prayer",
  "fajr-time": "fajr",
  "dhuhr-time": "dhuhr",
  "asr-time": "asr",
  "maghrib-time": "maghrib",
  "isha-time": "isha"
};

let pageType = document.body.dataset.page || "home";

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
    heroSubtitle: (type, place, topic) => type === "home" ? (place ? `Sieh genaue Gebetszeiten in ${place}, den Countdown zum nächsten Gebet und den kompletten Tagesplan.` : "Die Seite passt sich jetzt automatisch an die Browsersprache und den Standort an.") : (place ? `Sieh ${topic.toLowerCase()} in ${place} und darunter den vollständigen Gebetsplan.` : `Lade ${topic.toLowerCase()} automatisch und prüfe darunter den vollständigen Gebetsplan.`),
    infoTitle: topic => `Für schnelle ${topic.toLowerCase()}-Abfragen gebaut`,
    features: topic => ["Erkennt Sprache und Standort automatisch.", `Zeigt ${topic.toLowerCase()} mit Live-Countdown und klarer Statusanzeige.`, "Funktioniert direkt im Browser ohne App.", "Manuelle Buttons für Englisch und Arabisch bleiben oben rechts verfügbar."],
    aboutTitle: topic => `${topic} ohne unnötige Umwege`,
    about: (topic, place) => [place ? `Diese Seite ist auf ${topic.toLowerCase()} in ${place} ausgerichtet, damit Besucher sofort die richtige Information sehen.` : `Diese Seite ist auf ${topic.toLowerCase()} ausgerichtet, damit Besucher sofort die richtige Information sehen.`, "Ziel ist ein professionelleres Erlebnis: automatische Sprachwahl, automatische Standorterkennung und ein klarer Gebetsplan.", "So verstehen sowohl Nutzer als auch Suchmaschinen die Seite deutlicher."],
    faqTitle: "Häufige Fragen",
    faq: [["Erkennt die Seite meine Stadt automatisch?", "Ja. Zuerst wird GPS versucht, danach eine IP-basierte Erkennung."], ["Kann ich auf eine andere Stadt wechseln?", "Ja. Du kannst jede Stadt manuell suchen und die Seite aktualisiert sich sofort."], ["Folgt die Seite automatisch der Besuchersprache?", "Ja. Die Seite folgt jetzt automatisch der Browsersprache, während die manuellen Buttons für Englisch und Arabisch erhalten bleiben."]],
    pageTitle: (type, place, topic) => type === "home" ? (place ? `Gebetszeiten in ${place} heute | Fajr, Dhuhr, Asr, Maghrib, Isha | Adantimer` : "Adantimer | Genaue Gebetszeiten und Countdown zum nächsten Gebet") : (place ? `${topic} in ${place} heute | Adantimer` : `${topic} heute | Adantimer`),
    pageDescription: (type, place, topic) => type === "home" ? (place ? `Prüfe genaue Gebetszeiten in ${place}, sieh den Countdown zum nächsten Gebet und den heutigen Tagesplan.` : "Prüfe genaue Gebetszeiten für deine Stadt und lasse Adantimer automatisch die Browsersprache übernehmen.") : (place ? `Prüfe ${topic.toLowerCase()} in ${place}, sieh den Countdown zum nächsten Gebet und den vollständigen Tagesplan.` : `Prüfe ${topic.toLowerCase()}, sieh den Countdown zum nächsten Gebet und den vollständigen Tagesplan.`)
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
    topics: { home: "Horaires de prière", "prayer-times": "Horaires de prière", "next-prayer": "Heure de la prochaine prière", fajr: "Heure du Fajr", dhuhr: "Heure du Dhuhr", asr: "Heure du Asr", maghrib: "Heure du Maghrib", isha: "Heure du Isha" },
    eyebrow: "Horaires par ville", infoEyebrow: "Automatique", aboutEyebrow: "À propos", faqEyebrow: "FAQ", citiesEyebrow: "Villes populaires",
    footer: "Horaires de prière précis par ville.",
    citiesTitle: "Horaires de prière dans les grandes villes",
    citiesLine1: 'Accédez directement aux pages villes : <a href="/new-york">New York</a>, <a href="/sydney">Sydney</a>, <a href="/london">Londres</a>, <a href="/berlin">Berlin</a>, <a href="/dubai">Dubaï</a> et <a href="/cairo">Le Caire</a>.',
    citiesLine2: 'Accédez aussi à des recherches précises comme <a href="/asr-time/new-york">Asr à New York</a>, <a href="/dhuhr-time/sydney">Dhuhr à Sydney</a> ou <a href="/next-prayer/london">prochaine prière à Londres</a>.',
    heroTitle: (type, place, topic) => type === "home" ? (place ? `Horaires de prière à ${place} aujourd'hui` : "Horaires de prière aujourd'hui et compte à rebours") : (place ? `${topic} à ${place}` : `${topic} aujourd'hui`),
    heroSubtitle: (type, place, topic) => type === "home" ? (place ? `Consultez les horaires précis à ${place}, la prochaine prière et le planning complet du jour.` : "La page s'adapte désormais automatiquement à la langue du navigateur et à la localisation.") : (place ? `Consultez ${topic.toLowerCase()} à ${place}, puis le planning complet ci-dessous.` : `Chargez ${topic.toLowerCase()} automatiquement, puis consultez le planning complet ci-dessous.`),
    infoTitle: topic => `Conçu pour vérifier rapidement ${topic.toLowerCase()}`,
    features: topic => ["Détecte automatiquement la langue et la position.", `Affiche ${topic.toLowerCase()} avec un compte à rebours en direct.`, "Fonctionne directement dans le navigateur sans application.", "Les boutons manuels anglais et arabe restent disponibles en haut à droite."],
    aboutTitle: topic => `${topic} sans friction inutile`,
    about: (topic, place) => [place ? `Cette page vise directement ${topic.toLowerCase()} à ${place}, afin que le visiteur obtienne immédiatement la bonne information.` : `Cette page vise directement ${topic.toLowerCase()}, afin que le visiteur obtienne immédiatement la bonne information.`, "L'objectif est une expérience plus professionnelle : langue automatique, localisation automatique et planning clair.", "Cel