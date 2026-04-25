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
const qiblaPanelEl = document.getElementById("qibla-panel");
const qiblaPanelEyebrowEl = qiblaPanelEl ? qiblaPanelEl.querySelector(".eyebrow") : null;
const qiblaPanelHeadingEl = document.getElementById("qibla-panel-heading");
const qiblaPanelSummaryEl = document.getElementById("qibla-panel-summary");
const qiblaPlaceEl = document.getElementById("qibla-place");
const qiblaStatusEl = document.getElementById("qibla-status");
const qiblaBearingLabelEl = document.getElementById("qibla-bearing-label");
const qiblaBearingValueEl = document.getElementById("qibla-bearing-value");
const qiblaDistanceLabelEl = document.getElementById("qibla-distance-label");
const qiblaDistanceValueEl = document.getElementById("qibla-distance-value");
const qiblaDialEl = document.getElementById("qibla-dial");
const qiblaNeedleEl = document.getElementById("qibla-needle");
const qiblaKaabaMarkerEl = document.getElementById("qibla-kaaba-marker");
const qiblaSensorButtonEl = document.getElementById("qibla-sensor-button");
const qiblaSensorHintEl = document.getElementById("qibla-sensor-hint");
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

const QIBLA_PAGE_COPY = {
  en: {
    button: "Show Qibla Direction",
    heroSubtitle: place => place
      ? `Use the compass below to align toward Makkah from ${place}.`
      : "Use the compass below to calculate qibla direction from your current location or any city you search.",
    pageDescription: place => place
      ? `Check qibla direction from ${place}, see the bearing to Makkah, and use the live compass on supported phones.`
      : "Check qibla direction from your current location or any city, see the bearing to Makkah, and use the live compass on supported phones."
  },
  ar: {
    button: "\u0627\u0639\u0631\u0636 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0642\u0628\u0644\u0629",
    heroSubtitle: place => place
      ? `\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0623\u062f\u0646\u0627\u0647 \u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u062a\u062c\u0627\u0647 \u0645\u0643\u0629 \u0645\u0646 ${place}.`
      : "\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0623\u062f\u0646\u0627\u0647 \u0644\u062d\u0633\u0627\u0628 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0642\u0628\u0644\u0629 \u0645\u0646 \u0645\u0648\u0642\u0639\u0643 \u0627\u0644\u062d\u0627\u0644\u064a \u0623\u0648 \u0623\u064a \u0645\u062f\u064a\u0646\u0629 \u062a\u0628\u062d\u062b \u0639\u0646\u0647\u0627.",
    pageDescription: place => place
      ? `\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0642\u0628\u0644\u0629 \u0645\u0646 ${place}\u060c \u0648\u0627\u0639\u0631\u0641 \u0632\u0627\u0648\u064a\u0629 \u0645\u0643\u0629\u060c \u0648\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0627\u0644\u062d\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u0647\u0648\u0627\u062a\u0641 \u0627\u0644\u0645\u062f\u0639\u0648\u0645\u0629.`
      : "\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0642\u0628\u0644\u0629 \u0645\u0646 \u0645\u0648\u0642\u0639\u0643 \u0627\u0644\u062d\u0627\u0644\u064a \u0623\u0648 \u0623\u064a \u0645\u062f\u064a\u0646\u0629\u060c \u0648\u0627\u0639\u0631\u0641 \u0632\u0627\u0648\u064a\u0629 \u0645\u0643\u0629\u060c \u0648\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0627\u0644\u062d\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u0647\u0648\u0627\u062a\u0641 \u0627\u0644\u0645\u062f\u0639\u0648\u0645\u0629."
  },
  de: {
    button: "Qibla-Richtung anzeigen",
    heroSubtitle: place => place
      ? `Nutze den Kompass unten, um die Richtung nach Mekka von ${place} aus auszurichten.`
      : "Nutze den Kompass unten, um die Qibla von deinem aktuellen Standort oder jeder gesuchten Stadt aus zu berechnen.",
    pageDescription: place => place
      ? `Pr\u00fcfe die Qibla-Richtung von ${place}, sieh den Winkel nach Mekka und nutze den Live-Kompass auf unterst\u00fctzten Handys.`
      : "Pr\u00fcfe die Qibla-Richtung von deinem aktuellen Standort oder jeder gesuchten Stadt, sieh den Winkel nach Mekka und nutze den Live-Kompass auf unterst\u00fctzten Handys."
  },
  fr: {
    button: "Afficher la qibla",
    heroSubtitle: place => place
      ? `Utilisez la boussole ci-dessous pour vous orienter vers La Mecque depuis ${place}.`
      : "Utilisez la boussole ci-dessous pour calculer la direction de la qibla depuis votre position actuelle ou n'importe quelle ville recherch\u00e9e.",
    pageDescription: place => place
      ? `Consultez la direction de la qibla depuis ${place}, voyez l'angle vers La Mecque et utilisez la boussole en direct sur les t\u00e9l\u00e9phones compatibles.`
      : "Consultez la direction de la qibla depuis votre position actuelle ou n'importe quelle ville, voyez l'angle vers La Mecque et utilisez la boussole en direct sur les t\u00e9l\u00e9phones compatibles."
  },
  tr: {
    button: "Kible Y\u00f6n\u00fcn\u00fc G\u00f6ster",
    heroSubtitle: place => place
      ? `A\u015fa\u011f\u0131daki pusulay\u0131 kullanarak ${place} konumundan Mekke y\u00f6n\u00fcn\u00fc hizala.`
      : "A\u015fa\u011f\u0131daki pusulay\u0131 kullanarak mevcut konumundan veya arad\u0131\u011f\u0131n herhangi bir \u015fehirden kible y\u00f6n\u00fcn\u00fc hesapla.",
    pageDescription: place => place
      ? `${place} konumundan kible y\u00f6n\u00fcn\u00fc g\u00f6r, Mekke a\u00e7\u0131s\u0131n\u0131 incele ve desteklenen telefonlarda canl\u0131 pusulay\u0131 kullan.`
      : "Mevcut konumundan veya herhangi bir \u015fehirden kible y\u00f6n\u00fcn\u00fc g\u00f6r, Mekke a\u00e7\u0131s\u0131n\u0131 incele ve desteklenen telefonlarda canl\u0131 pusulay\u0131 kullan."
  },
  "zh-hans": {
    button: "\u663e\u793a Qibla \u65b9\u5411",
    heroSubtitle: place => place
      ? `\u4f7f\u7528\u4e0b\u65b9\u6307\u5357\u9488\uff0c\u4ece ${place} \u5bf9\u51c6\u9ea6\u52a0\u65b9\u5411\u3002`
      : "\u4f7f\u7528\u4e0b\u65b9\u6307\u5357\u9488\uff0c\u4ece\u5f53\u524d\u4f4d\u7f6e\u6216\u4efb\u610f\u641c\u7d22\u7684\u57ce\u5e02\u8ba1\u7b97 Qibla \u65b9\u5411\u3002",
    pageDescription: place => place
      ? `\u67e5\u770b ${place} \u7684 Qibla \u65b9\u5411\uff0c\u67e5\u770b\u6307\u5411\u9ea6\u52a0\u7684\u89d2\u5ea6\uff0c\u5e76\u5728\u652f\u6301\u7684\u624b\u673a\u4e0a\u4f7f\u7528\u5b9e\u65f6\u6307\u5357\u9488\u3002`
      : "\u67e5\u770b\u5f53\u524d\u4f4d\u7f6e\u6216\u4efb\u610f\u57ce\u5e02\u7684 Qibla \u65b9\u5411\uff0c\u67e5\u770b\u6307\u5411\u9ea6\u52a0\u7684\u89d2\u5ea6\uff0c\u5e76\u5728\u652f\u6301\u7684\u624b\u673a\u4e0a\u4f7f\u7528\u5b9e\u65f6\u6307\u5357\u9488\u3002"
  }
};

const LOCALES = {
  en: {
    code: "en", dir: "ltr",
    button: "Find Prayer Times", cityPlaceholder: "Enter city", countryPlaceholder: "Country (optional)",
    currentLocationName: "Current location",
    nextPrayer: "Next Prayer", currentPrayer: "Current Prayer", today: "Today", method: "Method",
    loading: "Loading...", locating: "Trying GPS, then IP fallback.", detect: "Detecting your location",
    resolvingGpsStatus: "Checking browser location",
    resolvingGpsDetail: "Trying your device location first.",
    resolvingIpStatus: "Trying fallback location",
    resolvingIpDetail: "Using network-based location as a backup.",
    resolvingRecent: place => `Refreshing prayer times for ${place}`,
    resolvingManual: place => `Loading prayer times for ${place}`,
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
    currentLocationName: "Aktueller Standort",
    nextPrayer: "Nächstes Gebet", currentPrayer: "Aktuelles Gebet", today: "Heute", method: "Methode",
    loading: "Wird geladen...", locating: "GPS wird versucht, danach IP als Fallback.", detect: "Standort wird erkannt",
    resolvingGpsStatus: "Browser-Standort wird gepr\u00fcft",
    resolvingGpsDetail: "Zuerst wird dein Ger\u00e4testandort versucht.",
    resolvingIpStatus: "Fallback-Standort wird versucht",
    resolvingIpDetail: "Als Reserve wird die Netzwerkposition verwendet.",
    resolvingRecent: place => `Gebetszeiten f\u00fcr ${place} werden aktualisiert`,
    resolvingManual: place => `Gebetszeiten f\u00fcr ${place} werden geladen`,
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
    currentLocationName: "Position actuelle",
    nextPrayer: "Prochaine prière", currentPrayer: "Prière actuelle", today: "Aujourd'hui", method: "Méthode",
    loading: "Chargement...", locating: "GPS en cours, puis IP en secours.", detect: "Détection de votre position",
    resolvingGpsStatus: "V\u00e9rification de la position du navigateur",
    resolvingGpsDetail: "Essai de la position de l'appareil en premier.",
    resolvingIpStatus: "Tentative de position de secours",
    resolvingIpDetail: "Utilisation de la position r\u00e9seau en secours.",
    resolvingRecent: place => `Actualisation des horaires pour ${place}`,
    resolvingManual: place => `Chargement des horaires pour ${place}`,
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
    resolvingGpsStatus: "Taray\u0131c\u0131 konumu kontrol ediliyor",
    resolvingGpsDetail: "\u00d6nce cihaz konumu deneniyor.",
    resolvingIpStatus: "Yedek konum deneniyor",
    resolvingIpDetail: "A\u011f tabanl\u0131 konum yedek olarak kullan\u0131l\u0131yor.",
    resolvingRecent: place => `${place} i\u00e7in vakitler yenileniyor`,
    resolvingManual: place => `${place} i\u00e7in vakitler y\u00fckleniyor`,
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
    resolvingGpsStatus: "\u6b63\u5728\u68c0\u67e5\u6d4f\u89c8\u5668\u5b9a\u4f4d",
    resolvingGpsDetail: "\u5148\u5c1d\u8bd5\u8bbe\u5907\u5b9a\u4f4d\u3002",
    resolvingIpStatus: "\u6b63\u5728\u5c1d\u8bd5\u5907\u7528\u5b9a\u4f4d",
    resolvingIpDetail: "\u6b63\u5728\u4f7f\u7528\u7f51\u7edc\u5b9a\u4f4d\u4f5c\u4e3a\u5907\u7528\u65b9\u6848\u3002",
    resolvingRecent: place => `${place}\u7684\u793c\u62dc\u65f6\u95f4\u6b63\u5728\u5237\u65b0`,
    resolvingManual: place => `\u6b63\u5728\u52a0\u8f7d${place}\u7684\u793c\u62dc\u65f6\u95f4`,
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
    resolvingGpsStatus: "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u062a\u0635\u0641\u062d",
    resolvingGpsDetail: "\u0646\u062d\u0627\u0648\u0644 \u0623\u0648\u0644\u0627\u064b \u062a\u062d\u062f\u064a\u062f \u0645\u0648\u0642\u0639 \u0627\u0644\u062c\u0647\u0627\u0632.",
    resolvingIpStatus: "\u062c\u0627\u0631\u064d \u0645\u062d\u0627\u0648\u0644\u0629 \u062a\u062d\u062f\u064a\u062f \u0645\u0648\u0642\u0639 \u0628\u062f\u064a\u0644",
    resolvingIpDetail: "\u064a\u062c\u0631\u064a \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0645\u0648\u0642\u0639 \u0627\u0644\u0634\u0628\u0643\u0629 \u0643\u062e\u064a\u0627\u0631 \u0627\u062d\u062a\u064a\u0627\u0637\u064a.",
    resolvingRecent: place => `\u062c\u0627\u0631\u064d \u062a\u062d\u062f\u064a\u062b \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0641\u064a ${place}`,
    resolvingManual: place => `\u062c\u0627\u0631\u064d \u062a\u062d\u0645\u064a\u0644 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0641\u064a ${place}`,
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

const TOPIC_EXTENSIONS = {
  en: { qibla: "Qibla Direction", quran: "Quran", dhikr: "Dhikr", hadith: "Hadith" },
  ar: { qibla: "اتجاه القبلة", quran: "القرآن", dhikr: "الذكر", hadith: "الحديث" },
  de: { qibla: "Qibla-Richtung", quran: "Koran", dhikr: "Dhikr", hadith: "Hadith" },
  fr: { qibla: "Direction de la Qibla", quran: "Coran", dhikr: "Dhikr", hadith: "Hadith" },
  tr: { qibla: "Kible Yonu", quran: "Kuran", dhikr: "Zikir", hadith: "Hadis" },
  "zh-hans": { qibla: "Qibla方向", quran: "古兰经", dhikr: "记念", hadith: "圣训" }
};

const TOOL_HUB_LOCALES = {
  en: {
    eyebrow: "More Tools",
    title: "Open Qibla, Quran, Dhikr, and Hadith",
    intro: "",
    items: {
      qibla: { label: "Qibla", description: "Open a qibla direction page alongside the live prayer schedule.", cta: "Open Qibla" },
      quran: { label: "Quran", description: "Continue into a Quran page for quick daily reading and return visits.", cta: "Open Quran" },
      dhikr: { label: "Dhikr", description: "Keep a dedicated dhikr page one tap away from the main prayer experience.", cta: "Open Dhikr" },
      hadith: { label: "Hadith", description: "Jump into a hadith page for short reading and study sessions.", cta: "Open Hadith" }
    }
  },
  ar: {
    eyebrow: "أدوات إضافية",
    title: "واصل إلى القبلة والقرآن والذكر والحديث",
    intro: "أضف صفحات إسلامية يومية مباشرة أسفل جدول الصلاة حتى ينتقل الزائر إلى القبلة والقرآن والذكر والحديث من داخل Adantimer.",
    items: {
      qibla: { label: "القبلة", description: "افتح صفحة اتجاه القبلة بجانب جدول الصلاة المباشر.", cta: "افتح القبلة" },
      quran: { label: "القرآن", description: "انتقل إلى صفحة قرآن للقراءة اليومية والعودة السريعة.", cta: "افتح القرآن" },
      dhikr: { label: "الذكر", description: "اجعل صفحة الذكر متاحة مباشرة بجانب تجربة مواقيت الصلاة.", cta: "افتح الذكر" },
      hadith: { label: "الحديث", description: "انتقل إلى صفحة حديث للقراءة السريعة والمراجعة.", cta: "افتح الحديث" }
    }
  },
  de: {
    eyebrow: "Weitere Funktionen",
    title: "Weiter zu Qibla, Koran, Dhikr und Hadith",
    intro: "Füge direkt unter dem Gebetsplan weitere islamische Seiten hinzu, damit Besucher innerhalb von Adantimer zu Qibla, Koran, Dhikr und Hadith wechseln können.",
    items: {
      qibla: { label: "Qibla", description: "Öffne eine Qibla-Seite zusammen mit dem aktuellen Gebetsplan.", cta: "Qibla öffnen" },
      quran: { label: "Koran", description: "Wechsle auf eine Koran-Seite für tägliches Lesen und spätere Rückkehr.", cta: "Koran öffnen" },
      dhikr: { label: "Dhikr", description: "Halte eine eigene Dhikr-Seite direkt neben den Gebetszeiten bereit.", cta: "Dhikr öffnen" },
      hadith: { label: "Hadith", description: "Springe auf eine Hadith-Seite für kurze Lese- und Lernphasen.", cta: "Hadith öffnen" }
    }
  },
  fr: {
    eyebrow: "Autres fonctions",
    title: "Continuer vers Qibla, Coran, Dhikr et Hadith",
    intro: "Ajoute d'autres pages islamiques directement sous le planning afin que le visiteur puisse ouvrir la qibla, le Coran, le dhikr et le hadith sans quitter Adantimer.",
    items: {
      qibla: { label: "Qibla", description: "Ouvrez une page de direction de la qibla à côté du planning en direct.", cta: "Ouvrir Qibla" },
      quran: { label: "Coran", description: "Accédez à une page Coran pour la lecture quotidienne et les retours rapides.", cta: "Ouvrir Coran" },
      dhikr: { label: "Dhikr", description: "Gardez une page dhikr dédiée juste à côté des horaires de prière.", cta: "Ouvrir Dhikr" },
      hadith: { label: "Hadith", description: "Passez à une page hadith pour des lectures courtes et régulières.", cta: "Ouvrir Hadith" }
    }
  },
  tr: {
    eyebrow: "Diger Araclar",
    title: "Kible, Kuran, zikir ve hadis sayfalarina devam et",
    intro: "Namaz takviminin hemen altina ek sayfalar ekleyerek ziyaretcinin Adantimer icinde kible, Kuran, zikir ve hadis sayfalarina gecmesini sagla.",
    items: {
      qibla: { label: "Kible", description: "Canli namaz takvimiyle birlikte bir kible sayfasi ac.", cta: "Kibleyi ac" },
      quran: { label: "Kuran", description: "Gunluk okuma ve geri donusler icin bir Kuran sayfasina gec.", cta: "Kurani ac" },
      dhikr: { label: "Zikir", description: "Ana namaz deneyiminin yaninda ozel bir zikir sayfasi tut.", cta: "Zikri ac" },
      hadith: { label: "Hadis", description: "Kisa okuma ve inceleme icin bir hadis sayfasina git.", cta: "Hadisi ac" }
    }
  },
  "zh-hans": {
    eyebrow: "更多功能",
    title: "继续进入 Qibla、Quran、Dhikr 和 Hadith 页面",
    intro: "在主礼拜时间区块下方直接加入更多伊斯兰页面，让访问者可以在 Adantimer 内继续进入朝向、古兰经、记念与圣训页面。",
    items: {
      qibla: { label: "Qibla", description: "在实时礼拜时间旁打开朝向页面。", cta: "打开 Qibla" },
      quran: { label: "Quran", description: "进入古兰经页面，方便每日阅读和再次访问。", cta: "打开 Quran" },
      dhikr: { label: "Dhikr", description: "让记念页面紧贴主礼拜时间体验。", cta: "打开 Dhikr" },
      hadith: { label: "Hadith", description: "进入圣训页面，适合短时间阅读和学习。", cta: "打开 Hadith" }
    }
  }
};

const QIBLA_PANEL_LOCALES = {
  en: {
    eyebrow: "Qibla",
    title: "Qibla Compass",
    summary: "See the direction of the Kaaba from your current location or any city you search.",
    placeFallback: "Current location",
    statusIdle: "Allow location or search for a city to calculate qibla.",
    statusResolving: "Calculating qibla direction...",
    statusError: "We couldn't calculate qibla right now. Search for a city and try again.",
    statusReady: (place, bearing) => `${place} faces the qibla at ${bearing}\u00b0 from north.`,
    bearingLabel: "Bearing from north",
    distanceLabel: "Distance to Makkah"
  },
  ar: {
    eyebrow: "\u0627\u0644\u0642\u0628\u0644\u0629",
    title: "\u0628\u0648\u0635\u0644\u0629 \u0627\u0644\u0642\u0628\u0644\u0629",
    summary: "\u0627\u0639\u0631\u0641 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0643\u0639\u0628\u0629 \u0645\u0646 \u0645\u0648\u0642\u0639\u0643 \u0627\u0644\u062d\u0627\u0644\u064a \u0623\u0648 \u0623\u064a \u0645\u062f\u064a\u0646\u0629 \u062a\u0628\u062d\u062b \u0639\u0646\u0647\u0627.",
    placeFallback: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u062d\u0627\u0644\u064a",
    statusIdle: "\u0627\u0633\u0645\u062d \u0628\u0627\u0644\u0645\u0648\u0642\u0639 \u0623\u0648 \u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u062f\u064a\u0646\u0629 \u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0642\u0628\u0644\u0629.",
    statusResolving: "\u062c\u0627\u0631\u064d \u062d\u0633\u0627\u0628 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0642\u0628\u0644\u0629...",
    statusError: "\u062a\u0639\u0630\u0631 \u062d\u0633\u0627\u0628 \u0627\u0644\u0642\u0628\u0644\u0629 \u0627\u0644\u0622\u0646. \u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u062f\u064a\u0646\u0629 \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
    statusReady: (place, bearing) => `\u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0642\u0628\u0644\u0629 \u0645\u0646 ${place} \u0647\u0648 ${bearing}\u00b0 \u0645\u0646 \u0627\u0644\u0634\u0645\u0627\u0644.`,
    bearingLabel: "\u0627\u0644\u062f\u0631\u062c\u0629 \u0645\u0646 \u0627\u0644\u0634\u0645\u0627\u0644",
    distanceLabel: "\u0627\u0644\u0645\u0633\u0627\u0641\u0629 \u0625\u0644\u0649 \u0645\u0643\u0629"
  },
  de: {
    eyebrow: "Qibla",
    title: "Qibla-Kompass",
    summary: "Sieh die Richtung der Kaaba von deinem aktuellen Standort oder jeder gesuchten Stadt.",
    placeFallback: "Aktueller Standort",
    statusIdle: "Erlaube den Standortzugriff oder suche eine Stadt, um die Qibla zu berechnen.",
    statusResolving: "Qibla-Richtung wird berechnet...",
    statusError: "Die Qibla konnte gerade nicht berechnet werden. Suche nach einer Stadt und versuche es erneut.",
    statusReady: (place, bearing) => `Die Qibla liegt von ${place} bei ${bearing}\u00b0 von Norden.`,
    bearingLabel: "Grad von Norden",
    distanceLabel: "Entfernung nach Mekka"
  },
  fr: {
    eyebrow: "Qibla",
    title: "Boussole qibla",
    summary: "Affiche la direction de la Kaaba depuis votre position actuelle ou n'importe quelle ville recherchee.",
    placeFallback: "Position actuelle",
    statusIdle: "Autorisez la position ou recherchez une ville pour calculer la qibla.",
    statusResolving: "Calcul de la direction de la qibla...",
    statusError: "Impossible de calculer la qibla pour le moment. Recherchez une ville et reessayez.",
    statusReady: (place, bearing) => `Depuis ${place}, la qibla est a ${bearing}\u00b0 depuis le nord.`,
    bearingLabel: "Cap depuis le nord",
    distanceLabel: "Distance jusqu'a La Mecque"
  },
  tr: {
    eyebrow: "Kible",
    title: "Kible pusulasi",
    summary: "Bulundugun konumdan veya aradigin herhangi bir sehirden Kabe yonunu gosterir.",
    placeFallback: "Guncel konum",
    statusIdle: "Kibleyi hesaplamak icin konuma izin ver veya bir sehir ara.",
    statusResolving: "Kible yonu hesaplaniyor...",
    statusError: "Kible su anda hesaplanamadi. Bir sehir ara ve tekrar dene.",
    statusReady: (place, bearing) => `${place} icin kible, kuzeyden ${bearing}\u00b0 yonundedir.`,
    bearingLabel: "Kuzeyden derece",
    distanceLabel: "Mekke uzakligi"
  },
  "zh-hans": {
    eyebrow: "\u671d\u5411",
    title: "\u671d\u5411\u7f57\u76d8",
    summary: "\u6839\u636e\u5f53\u524d\u4f4d\u7f6e\u6216\u641c\u7d22\u7684\u57ce\u5e02\u663e\u793a\u5361\u5c14\u767d\u65b9\u5411\u3002",
    placeFallback: "\u5f53\u524d\u4f4d\u7f6e",
    statusIdle: "\u5141\u8bb8\u5b9a\u4f4d\u6216\u641c\u7d22\u57ce\u5e02\u4ee5\u8ba1\u7b97\u671d\u5411\u3002",
    statusResolving: "\u6b63\u5728\u8ba1\u7b97\u671d\u5411...",
    statusError: "\u76ee\u524d\u65e0\u6cd5\u8ba1\u7b97\u671d\u5411\u3002\u8bf7\u641c\u7d22\u57ce\u5e02\u540e\u91cd\u8bd5\u3002",
    statusReady: (place, bearing) => `${place}\u7684\u671d\u5411\u4e3a\u76f8\u5bf9\u6b63\u5317 ${bearing}\u00b0\u3002`,
    bearingLabel: "\u76f8\u5bf9\u6b63\u5317\u7684\u65b9\u5411",
    distanceLabel: "\u8ddd\u79bb\u9ea6\u52a0"
  }
};

for (const tools of Object.values(TOOL_HUB_LOCALES)) {
  tools.intro = "";
}

Object.assign(TOOL_HUB_LOCALES.en, { title: "Islamic Tools" });
Object.assign(TOOL_HUB_LOCALES.ar, { title: "\u0623\u062f\u0648\u0627\u062a \u0625\u0633\u0644\u0627\u0645\u064a\u0629" });
Object.assign(TOOL_HUB_LOCALES.de, { title: "Islamische Tools" });
Object.assign(TOOL_HUB_LOCALES.fr, { title: "Outils islamiques" });
Object.assign(TOOL_HUB_LOCALES.tr, { title: "Islami Araclar" });
Object.assign(TOOL_HUB_LOCALES["zh-hans"], { title: "\u4f0a\u65af\u5170\u5de5\u5177" });

Object.assign(QIBLA_PANEL_LOCALES.en, {
  sensorButton: "Enable live compass",
  sensorHintIdle: "On phones with a compass sensor, enable the live compass so the qibla arrow turns as you rotate your device.",
  sensorHintActive: "Live compass is active. Turn your device until the qibla arrow points at the Kaaba symbol.",
  sensorHintPrompt: "Tap the button to allow compass access on this device.",
  sensorHintUnavailable: "Live compass is unavailable here. The page is showing the qibla bearing from north.",
  sensorHintDenied: "Compass access was denied. The page is showing the qibla bearing from north."
});

Object.assign(QIBLA_PANEL_LOCALES.ar, {
  sensorButton: "\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0627\u0644\u062d\u064a\u0629",
  sensorHintIdle: "\u0639\u0644\u0649 \u0627\u0644\u0647\u0648\u0627\u062a\u0641 \u0627\u0644\u062a\u064a \u062a\u062f\u0639\u0645 \u062d\u0633\u0627\u0633 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u064a\u0645\u0643\u0646\u0643 \u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0627\u0644\u062d\u064a\u0629 \u0644\u064a\u062f\u0648\u0631 \u0633\u0647\u0645 \u0627\u0644\u0642\u0628\u0644\u0629 \u0645\u0639 \u062d\u0631\u0643\u0629 \u0627\u0644\u062c\u0647\u0627\u0632.",
  sensorHintActive: "\u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0627\u0644\u062d\u064a\u0629 \u062a\u0639\u0645\u0644 \u0627\u0644\u0622\u0646. \u062d\u0631\u0651\u0643 \u062c\u0647\u0627\u0632\u0643 \u062d\u062a\u0649 \u064a\u0634\u064a\u0631 \u0633\u0647\u0645 \u0627\u0644\u0642\u0628\u0644\u0629 \u0625\u0644\u0649 \u0631\u0645\u0632 \u0627\u0644\u0643\u0639\u0628\u0629.",
  sensorHintPrompt: "\u0627\u0636\u063a\u0637 \u0627\u0644\u0632\u0631 \u0644\u0644\u0633\u0645\u0627\u062d \u0628\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062c\u0647\u0627\u0632.",
  sensorHintUnavailable: "\u0627\u0644\u0628\u0648\u0635\u0644\u0629 \u0627\u0644\u062d\u064a\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u0647\u0646\u0627. \u064a\u062a\u0645 \u0627\u0644\u0622\u0646 \u0639\u0631\u0636 \u0632\u0627\u0648\u064a\u0629 \u0627\u0644\u0642\u0628\u0644\u0629 \u0645\u0646 \u0627\u0644\u0634\u0645\u0627\u0644.",
  sensorHintDenied: "\u062a\u0645 \u0631\u0641\u0636 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0628\u0648\u0635\u0644\u0629. \u064a\u062a\u0645 \u0627\u0644\u0622\u0646 \u0639\u0631\u0636 \u0632\u0627\u0648\u064a\u0629 \u0627\u0644\u0642\u0628\u0644\u0629 \u0645\u0646 \u0627\u0644\u0634\u0645\u0627\u0644."
});

Object.assign(QIBLA_PANEL_LOCALES.de, {
  sensorButton: "Live-Kompass aktivieren",
  sensorHintIdle: "Auf Handys mit Kompasssensor kannst du den Live-Kompass aktivieren, damit sich der Qibla-Zeiger mit der Geraeteausrichtung dreht.",
  sensorHintActive: "Der Live-Kompass ist aktiv. Drehe dein Geraet, bis der Qibla-Zeiger auf das Kaaba-Symbol zeigt.",
  sensorHintPrompt: "Tippe auf den Button, um den Kompasszugriff auf diesem Geraet zu erlauben.",
  sensorHintUnavailable: "Hier ist kein Live-Kompass verfuegbar. Es wird nur die Qibla-Richtung von Norden angezeigt.",
  sensorHintDenied: "Der Kompasszugriff wurde abgelehnt. Es wird nur die Qibla-Richtung von Norden angezeigt."
});

Object.assign(QIBLA_PANEL_LOCALES.fr, {
  sensorButton: "Activer la boussole en direct",
  sensorHintIdle: "Sur les telephones avec capteur, activez la boussole en direct pour que la fleche qibla tourne avec l'appareil.",
  sensorHintActive: "La boussole en direct est active. Tournez l'appareil jusqu'a ce que la fleche qibla pointe vers le symbole de la Kaaba.",
  sensorHintPrompt: "Touchez le bouton pour autoriser l'acces a la boussole sur cet appareil.",
  sensorHintUnavailable: "La boussole en direct n'est pas disponible ici. La page affiche seulement l'angle depuis le nord.",
  sensorHintDenied: "L'acces a la boussole a ete refuse. La page affiche seulement l'angle depuis le nord."
});

Object.assign(QIBLA_PANEL_LOCALES.tr, {
  sensorButton: "Canli pusulayi etkinlestir",
  sensorHintIdle: "Pusula sensoru olan telefonlarda canli pusulayi etkinlestir; boylece kible oku cihazla birlikte doner.",
  sensorHintActive: "Canli pusula aktif. Kible oku Kabe simgesini gosterecek sekilde cihazi dondur.",
  sensorHintPrompt: "Bu cihazda pusula erisimine izin vermek icin dugmeye dokun.",
  sensorHintUnavailable: "Canli pusula burada kullanilamiyor. Sayfa yalnizca kuzeye gore kible acisini gosteriyor.",
  sensorHintDenied: "Pusula erisimi reddedildi. Sayfa yalnizca kuzeye gore kible acisini gosteriyor."
});

Object.assign(QIBLA_PANEL_LOCALES["zh-hans"], {
  sensorButton: "\u542f\u7528\u5b9e\u65f6\u6307\u5357\u9488",
  sensorHintIdle: "\u5728\u5e26\u6709\u6307\u5357\u9488\u4f20\u611f\u5668\u7684\u624b\u673a\u4e0a\uff0c\u53ef\u542f\u7528\u5b9e\u65f6\u6307\u5357\u9488\uff0c\u8ba9 Qibla \u7bad\u5934\u968f\u8bbe\u5907\u65b9\u5411\u4e00\u8d77\u65cb\u8f6c\u3002",
  sensorHintActive: "\u5b9e\u65f6\u6307\u5357\u9488\u5df2\u542f\u7528\u3002\u8bf7\u8f6c\u52a8\u8bbe\u5907\uff0c\u76f4\u5230 Qibla \u7bad\u5934\u6307\u5411 Kaaba \u7b26\u53f7\u3002",
  sensorHintPrompt: "\u70b9\u51fb\u6309\u94ae\uff0c\u5141\u8bb8\u6b64\u8bbe\u5907\u8bbf\u95ee\u6307\u5357\u9488\u3002",
  sensorHintUnavailable: "\u6b64\u5904\u65e0\u6cd5\u4f7f\u7528\u5b9e\u65f6\u6307\u5357\u9488\u3002\u5f53\u524d\u663e\u793a\u7684\u662f\u76f8\u5bf9\u6b63\u5317\u7684 Qibla \u65b9\u4f4d\u3002",
  sensorHintDenied: "\u6307\u5357\u9488\u6743\u9650\u88ab\u62d2\u7edd\u3002\u5f53\u524d\u663e\u793a\u7684\u662f\u76f8\u5bf9\u6b63\u5317\u7684 Qibla \u65b9\u4f4d\u3002"
});

Object.entries(TOPIC_EXTENSIONS).forEach(([lang, topics]) => {
  LOCALES[lang].topics = { ...LOCALES[lang].topics, ...topics };
});

Object.entries(TOOL_HUB_LOCALES).forEach(([lang, tools]) => {
  LOCALES[lang].tools = tools;
});

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
let qiblaPanelState = "idle";
let qiblaBearing = null;
let deviceHeading = null;
let compassState = "unknown";
let compassListenerAttached = false;

const KAABA_COORDS = { lat: 21.4225, lng: 39.8262 };

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
  const keywordRoots = new Set(["prayer-times", "next-prayer", "fajr-time", "dhuhr-time", "asr-time", "maghrib-time", "isha-time", "qibla", "quran", "dhikr", "hadith"]);
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

function formatPlaceName(city = "", country = "", lang = language) {
  const localizedCity = localizeCityName(city, lang);
  const localizedCountry = localizeCountryName(country, lang);
  if (!localizedCity && !localizedCountry) return "";
  if (!localizedCity) return localizedCountry;
  if (!localizedCountry) return localizedCity;
  const separator = (resolveLanguageTag(lang) || lang) === "ar" ? "، " : ", ";
  return `${localizedCity}${separator}${localizedCountry}`;
}

function getPlaceName(city = "", country = "") {
  return formatPlaceName(city, country, language);
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
    isha: slug ? `/isha-time/${slug}` : "/isha-time",
    qibla: "/qibla",
    quran: "/quran",
    dhikr: "/dhikr",
    hadith: "/hadith"
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

function renderToolsHub(locale) {
  const toolsSection = document.querySelector('[aria-labelledby="tools-heading"]');
  if (!toolsSection || !locale.tools) return;
  const eyebrow = toolsSection.querySelector(".eyebrow");
  const heading = toolsSection.querySelector("h2");
  const intro = toolsSection.querySelector(".tools-copy .tools-intro");
  const grid = toolsSection.querySelector(".tools-grid");
  const order = ["qibla", "quran", "dhikr", "hadith"];

  if (eyebrow) eyebrow.textContent = locale.tools.eyebrow;
  if (heading) heading.textContent = locale.tools.title;
  if (intro) {
    if (locale.tools.intro) {
      intro.textContent = locale.tools.intro;
      intro.hidden = false;
    } else {
      intro.hidden = true;
      intro.textContent = "";
    }
  }
  if (!grid) return;

  grid.innerHTML = order.map(type => {
    const item = locale.tools.items[type];
    if (!item) return "";
    const activeClass = pageType === type ? " is-active" : "";
    return `<a class="tool-link-card${activeClass}" href="${buildRelativeUrl(language, type)}" data-tool-type="${type}">
      <strong class="tool-label">${item.label}</strong>
      <span class="tool-description">${item.description}</span>
      <span class="tool-cta">${item.cta}</span>
    </a>`;
  }).join("");
}

function toRadians(value) {
  return value * (Math.PI / 180);
}

function toDegrees(value) {
  return value * (180 / Math.PI);
}

function normalizeDegrees(value) {
  return (value % 360 + 360) % 360;
}

function calculateQiblaBearing(lat, lng) {
  const latitude = toRadians(lat);
  const longitude = toRadians(lng);
  const kaabaLatitude = toRadians(KAABA_COORDS.lat);
  const deltaLongitude = toRadians(KAABA_COORDS.lng - lng);
  const y = Math.sin(deltaLongitude);
  const x = Math.cos(latitude) * Math.tan(kaabaLatitude) - Math.sin(latitude) * Math.cos(deltaLongitude);
  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}

function calculateDistanceKm(lat, lng) {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(KAABA_COORDS.lat - lat);
  const deltaLng = toRadians(KAABA_COORDS.lng - lng);
  const latitude = toRadians(lat);
  const kaabaLatitude = toRadians(KAABA_COORDS.lat);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(latitude) * Math.cos(kaabaLatitude) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function getScreenHeadingOffset() {
  if (window.screen && window.screen.orientation && Number.isFinite(window.screen.orientation.angle)) {
    return window.screen.orientation.angle;
  }
  if (Number.isFinite(window.orientation)) {
    return Number(window.orientation);
  }
  return 0;
}

function readDeviceHeading(event) {
  if (Number.isFinite(event.webkitCompassHeading)) {
    return normalizeDegrees(event.webkitCompassHeading);
  }
  if (!Number.isFinite(event.alpha)) {
    return null;
  }
  return normalizeDegrees(360 - event.alpha + getScreenHeadingOffset());
}

function supportsLiveCompass() {
  return typeof window.DeviceOrientationEvent !== "undefined";
}

function requiresLiveCompassPermission() {
  return supportsLiveCompass() && typeof window.DeviceOrientationEvent.requestPermission === "function";
}

function attachCompassListener() {
  if (compassListenerAttached || !supportsLiveCompass()) return;
  const handleOrientation = event => {
    const heading = readDeviceHeading(event);
    if (!Number.isFinite(heading)) return;
    deviceHeading = heading;
    compassState = "active";
    renderQiblaPanel(qiblaPanelState);
  };

  window.addEventListener("deviceorientationabsolute", handleOrientation, true);
  window.addEventListener("deviceorientation", handleOrientation, true);
  compassListenerAttached = true;
}

function syncCompassState() {
  if (pageType !== "qibla") return;
  if (!supportsLiveCompass()) {
    if (compassState === "unknown") compassState = "unsupported";
    return;
  }
  if (requiresLiveCompassPermission()) {
    if (compassState === "unknown") compassState = "prompt";
    return;
  }
  if (compassState === "unknown") compassState = "available";
  attachCompassListener();
}

async function enableLiveCompass() {
  if (!supportsLiveCompass()) {
    compassState = "unsupported";
    renderQiblaPanel(qiblaPanelState);
    return;
  }

  if (requiresLiveCompassPermission()) {
    try {
      const permission = await window.DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") {
        compassState = "denied";
        renderQiblaPanel(qiblaPanelState);
        return;
      }
    } catch {
      compassState = "denied";
      renderQiblaPanel(qiblaPanelState);
      return;
    }
  }

  compassState = "available";
  attachCompassListener();
  renderQiblaPanel(qiblaPanelState);
}

function setQiblaCompassVisualState(bearing = null) {
  if (qiblaDialEl) {
    qiblaDialEl.style.transform = "translate(-50%, -50%)";
  }

  if (qiblaNeedleEl) {
    qiblaNeedleEl.style.transform = "translate(-50%, -50%) rotate(0deg)";
    qiblaNeedleEl.hidden = true;
  }

  if (!Number.isFinite(bearing)) {
    if (qiblaKaabaMarkerEl) {
      qiblaKaabaMarkerEl.style.transform = "translate(-50%, -50%) rotate(0deg)";
      qiblaKaabaMarkerEl.hidden = true;
    }
    return;
  }

  const relativeBearing = Number.isFinite(deviceHeading)
    ? normalizeDegrees(bearing - deviceHeading)
    : bearing;

  if (qiblaNeedleEl) {
    qiblaNeedleEl.style.transform = `translate(-50%, -50%) rotate(${relativeBearing}deg)`;
    qiblaNeedleEl.hidden = false;
  }

  if (qiblaKaabaMarkerEl) {
    qiblaKaabaMarkerEl.style.transform = `translate(-50%, -50%) rotate(${relativeBearing}deg)`;
    qiblaKaabaMarkerEl.hidden = false;
  }
}

function renderQiblaPanel(state = qiblaPanelState) {
  if (!qiblaPanelEl) return;

  if (pageType !== "qibla") {
    qiblaPanelEl.hidden = true;
    return;
  }

  qiblaPanelEl.hidden = false;
  qiblaPanelState = state;
  const locale = QIBLA_PANEL_LOCALES[language] || QIBLA_PANEL_LOCALES.en;
  const fallbackLocale = QIBLA_PANEL_LOCALES.en;
  const numberLocale = (LOCALES[language] || LOCALES.en).code;
  const place = getPlaceName(cityName, countryName);

  syncCompassState();

  if (qiblaPanelEyebrowEl) qiblaPanelEyebrowEl.textContent = locale.eyebrow;
  if (qiblaPanelHeadingEl) qiblaPanelHeadingEl.textContent = locale.title;
  if (qiblaPanelSummaryEl) qiblaPanelSummaryEl.textContent = locale.summary;
  if (qiblaBearingLabelEl) qiblaBearingLabelEl.textContent = locale.bearingLabel;
  if (qiblaDistanceLabelEl) qiblaDistanceLabelEl.textContent = locale.distanceLabel;
  if (qiblaPlaceEl) qiblaPlaceEl.textContent = place || locale.placeFallback;
  if (qiblaSensorButtonEl) {
    qiblaSensorButtonEl.textContent = locale.sensorButton || fallbackLocale.sensorButton;
    qiblaSensorButtonEl.hidden = !(compassState === "prompt" || compassState === "available");
  }

  if (currentCoords && Number.isFinite(currentCoords.lat) && Number.isFinite(currentCoords.lng)) {
    const bearing = calculateQiblaBearing(currentCoords.lat, currentCoords.lng);
    const distanceKm = calculateDistanceKm(currentCoords.lat, currentCoords.lng);
    const formattedBearing = new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 0 }).format(bearing);
    const formattedDistance = new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 0 }).format(distanceKm);
    qiblaBearing = bearing;

    setQiblaCompassVisualState(bearing);
    if (qiblaBearingValueEl) qiblaBearingValueEl.textContent = `${formattedBearing}\u00b0`;
    if (qiblaDistanceValueEl) qiblaDistanceValueEl.textContent = `${formattedDistance} km`;
    if (qiblaStatusEl) qiblaStatusEl.textContent = locale.statusReady(place || locale.placeFallback, formattedBearing);
    if (qiblaSensorHintEl) {
      const sensorHint = compassState === "active"
        ? (locale.sensorHintActive || fallbackLocale.sensorHintActive)
        : (compassState === "prompt"
          ? (locale.sensorHintPrompt || fallbackLocale.sensorHintPrompt)
          : (compassState === "denied"
            ? (locale.sensorHintDenied || fallbackLocale.sensorHintDenied)
            : ((compassState === "unsupported")
              ? (locale.sensorHintUnavailable || fallbackLocale.sensorHintUnavailable)
              : (locale.sensorHintIdle || fallbackLocale.sensorHintIdle))));
      qiblaSensorHintEl.textContent = sensorHint;
    }
    qiblaPanelEl.dataset.state = "ready";
    return;
  }

  qiblaBearing = null;
  setQiblaCompassVisualState(null);
  if (qiblaBearingValueEl) qiblaBearingValueEl.textContent = "\u2014";
  if (qiblaDistanceValueEl) qiblaDistanceValueEl.textContent = "\u2014";

  const fallbackStatus = state === "error"
    ? locale.statusError
    : (state === "gps" || state === "ip" || state === "manual" || state === "recent"
      ? locale.statusResolving
      : locale.statusIdle);

  if (qiblaStatusEl) qiblaStatusEl.textContent = fallbackStatus;
  if (qiblaSensorHintEl) {
    const sensorHint = compassState === "prompt"
      ? (locale.sensorHintPrompt || fallbackLocale.sensorHintPrompt)
      : (compassState === "denied"
        ? (locale.sensorHintDenied || fallbackLocale.sensorHintDenied)
        : ((compassState === "unsupported")
          ? (locale.sensorHintUnavailable || fallbackLocale.sensorHintUnavailable)
          : (locale.sensorHintIdle || fallbackLocale.sensorHintIdle)));
    qiblaSensorHintEl.textContent = sensorHint;
  }
  qiblaPanelEl.dataset.state = state;
}

function renderStaticContent() {
  const locale = getLocale();
  const topic = getTopic(locale);
  const place = getPlaceName(cityName, countryName);
  const qiblaPageCopy = QIBLA_PAGE_COPY[language] || QIBLA_PAGE_COPY.en;
  document.documentElement.lang = locale.code;
  document.documentElement.dir = locale.dir;
  document.body.setAttribute("dir", locale.dir);
  if (setLocationButtonEl) {
    setLocationButtonEl.textContent = pageType === "qibla" ? qiblaPageCopy.button : locale.button;
  }
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
  if (heroSubtitleEl) {
    heroSubtitleEl.textContent = pageType === "qibla"
      ? qiblaPageCopy.heroSubtitle(place)
      : locale.heroSubtitle(pageType, place, topic);
  }
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
    const localizedCity = localizeCityName(link.dataset.city || "", language);
    const localizedPlace = formatPlaceName(link.dataset.city || "", link.dataset.country || "", language);
    link.textContent = localizedCity;
    link.setAttribute("aria-label", localizedPlace || localizedCity);
    link.setAttribute("title", localizedPlace || localizedCity);
    link.setAttribute("href", buildRelativeUrl(language, "home", link.dataset.city || ""));
  });
  const infoEyebrow = document.querySelector(".info-card .eyebrow");
  const infoTitle = document.querySelector(".info-card h2");
  if (infoEyebrow) infoEyebrow.textContent = locale.infoEyebrow;
  if (infoTitle) infoTitle.textContent = locale.infoTitle(topic);
  renderFeatureList(locale.features(topic));
  renderToolsHub(locale);
  renderQiblaPanel(currentCoords ? "ready" : qiblaPanelState);
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
  const qiblaPageCopy = QIBLA_PAGE_COPY[language] || QIBLA_PAGE_COPY.en;
  const title = locale.pageTitle(pageType, place, topic);
  const description = pageType === "qibla"
    ? qiblaPageCopy.pageDescription(place)
    : locale.pageDescription(pageType, place, topic);
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
  if (pageType === "qibla") {
    renderQiblaPanel(currentCoords ? "ready" : qiblaPanelState);
  } else {
    renderScheduleSummary();
    renderPrayerRows();
    renderNextPrayer();
  }
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
  renderQiblaPanel("idle");
}

function renderResolvingState(locale, mode = "detect", previewLocation = null) {
  const place = previewLocation ? formatPlaceName(previewLocation.city || "", previewLocation.country || "", locale.code) : "";
  const currentLocationLabel = locale.currentLocationName || locale.locationPrefix;
  const gpsStatus = locale.resolvingGpsStatus || locale.detect;
  const gpsDetail = locale.resolvingGpsDetail || locale.locating;
  const ipStatus = locale.resolvingIpStatus || locale.loading;
  const ipDetail = locale.resolvingIpDetail || locale.locating;
  titleEl.textContent = locale.nextPrayer;
  currentPrayerLabelEl.textContent = locale.currentPrayer;
  todayLabelEl.textContent = locale.today;
  methodLabelEl.textContent = locale.method;
  prayerTimesEl.innerHTML = "";
  nextPrayerNameEl.textContent = "";
  currentPrayerValueEl.textContent = "—";
  todayDateValueEl.textContent = "—";
  methodValueEl.textContent = "—";

  if (mode === "recent" && place) {
    countdownEl.textContent = locale.loading;
    scheduleSummaryEl.textContent = locale.resolvingRecent ? locale.resolvingRecent(place) : `${currentLocationLabel}: ${place}`;
    locationStatusEl.textContent = `${locale.locationPrefix} ${place}`;
    locationEl.textContent = locale.loading;
    renderQiblaPanel("recent");
    return;
  }

  if (mode === "manual" && place) {
    countdownEl.textContent = locale.loading;
    scheduleSummaryEl.textContent = locale.resolvingManual ? locale.resolvingManual(place) : `${locale.locationPrefix} ${place}`;
    locationStatusEl.textContent = `${locale.locationPrefix} ${place}`;
    locationEl.textContent = locale.loading;
    renderQiblaPanel("manual");
    return;
  }

  countdownEl.textContent = mode === "ip" ? locale.loading : gpsStatus;
  scheduleSummaryEl.textContent = mode === "ip" ? ipDetail : gpsDetail;
  locationStatusEl.textContent = mode === "ip" ? ipStatus : gpsStatus;
  locationEl.textContent = mode === "ip" ? ipDetail : gpsDetail;
  renderQiblaPanel(mode === "ip" ? "ip" : "gps");
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
  renderQiblaPanel(currentCoords ? "ready" : qiblaPanelState);
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

async function resolveInitialLocation(onStage = null) {
  const requestedCity = getRequestedCity();
  const params = new URLSearchParams(window.location.search);
  const requestedCountry = params.get("country") || "";
  if (requestedCity) {
    if (onStage) onStage("manual", { city: requestedCity, country: requestedCountry });
    const result = await searchCity(requestedCity, requestedCountry);
    if (result) {
      currentLocationType = "manual";
      return result;
    }
  }
  const recent = readRecentLocation();
  if (recent && recent.lat && recent.lng) {
    if (onStage) onStage("recent", recent);
    currentLocationType = "recent";
    return recent;
  }
  try {
    if (onStage) onStage("gps");
    currentLocationType = "gps";
    return await getGPSLocation();
  } catch {
    if (onStage) onStage("ip");
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
  const explicitRequestedCity = getRequestedCity();
  clearInterval(countdownInterval);
  nextPrayerData = null;
  if (resolvedLocation) {
    renderResolvingState(locale, currentLocationType === "manual" ? "manual" : "recent", resolvedLocation);
  } else if (shouldSoftFail) {
    renderResolvingState(locale, "gps");
  } else {
    renderResolvingState(locale, explicitRequestedCity ? "manual" : "gps", explicitRequestedCity ? { city: explicitRequestedCity, country: new URLSearchParams(window.location.search).get("country") || "" } : null);
  }
  armLoadingWatchdog(locale, shouldSoftFail);
  const source = resolvedLocation || await resolveInitialLocation((mode, previewLocation) => {
    if (shouldSoftFail || mode === "manual" || mode === "recent") {
      renderResolvingState(locale, mode, previewLocation);
      return;
    }
    renderResolvingState(locale, mode);
  });
  if (!source) {
    clearLoadingWatchdog();
    if (shouldSoftFail) {
      renderAutoLoadFallback(locale);
      return;
    }
    countdownEl.textContent = locale.permissionError;
    locationStatusEl.textContent = locale.permissionError;
    locationEl.textContent = locale.searchPrompt;
    renderQiblaPanel("error");
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
      cityName = resolved.city || "";
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
    renderQiblaPanel("error");
  }
}

async function loadQiblaCompass(resolvedLocation) {
  const locale = getLocale();
  const explicitRequestedCity = getRequestedCity();

  if (resolvedLocation) {
    renderQiblaPanel(currentLocationType === "manual" ? "manual" : "recent");
  } else {
    renderQiblaPanel(explicitRequestedCity ? "manual" : "gps");
  }

  const source = resolvedLocation || await resolveInitialLocation((mode) => {
    renderQiblaPanel(mode === "ip" ? "ip" : mode);
  });

  if (!source) {
    currentCoords = null;
    cityName = "";
    countryName = "";
    renderQiblaPanel("error");
    return;
  }

  currentCoords = { lat: Number(source.lat), lng: Number(source.lng) };

  if (source.city) {
    cityName = source.city;
    countryName = source.country || "";
  } else {
    const resolved = await reverseGeocode(currentCoords.lat, currentCoords.lng);
    cityName = resolved.city || "";
    countryName = resolved.country || "";
  }

  if (cityInput) cityInput.value = cityName || "";
  if (countryInput) countryInput.value = countryName || "";

  currentTimezone = "";
  currentMethod = "";
  prayerSchedule = [];
  nextPrayerData = null;
  clearInterval(countdownInterval);

  renderStaticContent();
  renderQiblaPanel("ready");
  applySeoMeta(cityName);
  saveRecentLocation();
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
    if (pageType === "qibla") {
      await loadQiblaCompass(result);
    } else {
      await loadPrayerTimes(result);
    }
  } catch {
    if (pageType === "qibla") {
      renderQiblaPanel("error");
    } else {
      locationStatusEl.textContent = locale.fetchError;
      countdownEl.textContent = locale.fetchError;
    }
  }
}

if (locationForm) {
  locationForm.addEventListener("submit", event => {
    event.preventDefault();
    handleManualLocation(cityInput.value, countryInput.value);
  });
}

if (qiblaSensorButtonEl) {
  qiblaSensorButtonEl.addEventListener("click", () => {
    enableLiveCompass();
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
if (pageType === "qibla") {
  loadQiblaCompass();
} else {
  loadPrayerTimes();
}
