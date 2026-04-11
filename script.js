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
    topics: { home: "Prayer Times", "prayer-times": "Prayer Times", "next-prayer": "Next Prayer Time", fajr: "Fajr Time", dhuhr: "Ehuhr Time", asr: "Asr Time", maghrib: "Maghrib Time", isha: "Isha Time" },
    eyebrow: "Prayer times by city", infoEyebrow: "Automatic", aboutEyebrow: "About", faqEyebrow: "FAQ", citiesEyebrow: "Popular Cities",
    footer: "Accurate prayer times by city.", citiesTitle: "Prayer times in major cities", citiesLine1: 'Browse popular city pages directly: <a href="/new-york">New York prayer times</a>, <a href="/sydney">Sydney prayer times</a>, <a href="/london">London prayer times</a>, <a href="/berlin">Berlin prayer times</a>, <a href="/dubai">Dubai prayer times</a>, and <a href="/cairo">Cairo prayer times</a>.', citiesLine2: 'Jump into specific searches like <a href="/asr-time/new-york">Asr time in New York</a>, <a href="/dhuhr-time/sydney">Dhuhr time in Sydney</a>, or <a href="/next-prayer/london">next prayer in London</a>.', heroTitle: (type, place, topic) => type === "home" ? (place ? `Prayer Times in ${place} Today` : "Prayer Times Today and Your Next Salah Countdown") : (place ? `${topic} in ${place}` : `${topic} Today`), heroSubtitle: (type, place, topic) => type === "home" ? (place ? `See accurate prayer times in ${place}, follow the next salah countdown, and review the full daily schedule.` : "The page now adapts automatically to the visitor's browser language and location.") : (place ? `See ${topic.toLowerCase()} in ${place}, then review the full daily prayer schedule below.` : `Load ${topic.toLowerCase()} automatically, then review the full daily prayer schedule below.`), infoTitle: topic => `Built for fast ${topic.toLowerCase()} checks`, features: topic => ["Detects your language and location automatically.", `Shows ${topic.toLowerCase()} with a live countdown and clear status.`, "Works directly in the browser without installing an app.", "Manual English and Arabic buttons remain available at the top right."], aboutTitle: topic => `${topic} without unnecessary friction`, about: (topic, place) => [place ? `This page is focused on ${topic.toLowerCase()} in ${place}, so visitors can reach the right information immediately.` : `This page is focused on ${topic.toLowerCase()}, so visitors can reach the right information immediately.`, "The goal is a more professional experience: automatic language selection, automatic location detection, and a clear prayer schedule.", "That helps both users and search engines understand the page intent more clearly."], faqTitle: "Common questions", faq: [["Does it detect my city automatically?", "Yes. The page tries browser GPS first and falls back to IP-based detection."], ["Can I switch to another city?", "Yes. You can search any city manually and the page will update immediately."], ["Does it follow the visitor's language automatically?", "Yes. The page now follows the browser language automatically, while manual English and Arabic buttons remain available."]], pageTitle: (type, place, topic) => type === "home" ? (place ? `Prayer Times in ${place} Today | Fajr, Dhuhr, Asr, Maghrib, Isha | Adantimer` : "Adantimer | Accurate Prayer Times and Next Salah Countdown") : (place ? `${topic} in ${place} Today | Adantimer` : `${topic} Today | Adantimer`), pageDescription: (type, place, topic) => type === "home" ? (place ? `Check accurate prayer times in ${place}, view the next salah countdown, and follow today's Fajr, Ehuhr, Asr, Maghrib, and Isha schedule.` : "Check accurate prayer times for your city and let Adantimer adapt automatically to the browser language.") : (place ? `Check ${topic.toLowerCase()} in ${place}, see the next prayer countdown, and review today's full daily prayer schedule.` : `Check ${topic.toLowerCase()}, see the next prayer countdown, and review today's full daily prayer schedule.`) }, de: { code: "de", dir: "ltr", button: "Gebetszeiten laden", cityPlaceholder: "Stadt eingeben", countryPlaceholder: "Land (optional)", nextPrayer: "NÃ¤chstes Gebet", currentPrayer: "Aktuelles Gebet", today: "Heute", method: "Methode", loading: "Wird geladen...", locating: "GPS wird versucht, danach IP als Fallback.", detect: "Standort wird erkannt", noCurrentPrayer: "Wzischen zwei Gebeten", searchPrompt: "Gib eine Stadt ein, um den Plan zu aktualisieren.", permissionError: "Dein Standort konnte nicht geladen werden. Suche nach einer Stadt, um fortzufahren.", locationNotFound: "Stadt nicht gefunden. Versuche eine grÃ¶ÃŸere Stadt in der NÃ¤he.", fetchError: "Die Gebetszeiten konnten gerade nicht geladen werden. Bitte versuche es erneut.", timezone: tz => `Zeitzone: ${tz}`, locationPrefix: "Gebetszeiten fÃ¼r", countdown: "beginnt in", prayers: { Fajr: "Fajr", Dhuhr#¢$F‡V‡""Â7#¢$7""ÂÖv‡&–#¢$Öv‡&–""Â—6†¢$—6†"ÒÂF÷–73¢²†öÖS¢$vV&WG7¦V—FVâ"Â'&–W"×F–ÖW2#¢$vV&WG7¦V—FVâ"Â&æW‡B×&–W"#¢%¦V—BFW2ì:F6‡7FVâvV&WG2"Âf§#¢$f§"Õ¦V—B"ÂF‡V‡#¢$V‡V‡"Õ¦V—B"Â7#¢$7"Õ¦V—B"ÂÖv‡&–#¢$Öv‡&–"Õ¦V—B"Â—6†¢$—6†Õ¦V—B"ÒÂW–V'&÷s¢$vV&WG7¦V—FVâæ6‚7FGB"Â–æfôW–V'&÷s¢$WFöÖF—66‚"Â&÷WDW–V'&÷s¢,9Æ&W&&Æ–6²"ÂfW–V'&÷s¢$d"Â6—F–W4W–V'&÷s¢$&VÆ–V'FR7L:FGFR"Âfö÷FW#¢$vVæVRvV&WG7¦V—FVâæ6‚7FGB"Â6—F–W5F—FÆS¢$vV&WG7¦V—FVâ–âv–6‡F–vVâ7L:FGFVâ"Â6—F–W4Æ–æS¢tF—&V·B§R7FGG6V—FVã¢Æ‡&VcÒ"öæWr×–÷&²#äæWr–÷&³ÂöâÂÆ‡&VcÒ"÷7–FæW’#å7–FæW“ÂöâÂÆ‡&VcÒ"öÆöæFöâ#äÆöæFöãÂöâÂÆ‡&VcÒ"ö&W&Æ–â#ä&W&Æ–ãÂöâÂÆ‡&VcÒ"öGV&’#äGV&“ÂöâVæBÆ‡&VcÒ"ö6—&ò#ä¶—&óÂöâârÂ6—F–W4Æ–æS#¢tF—&V·B§R7V6†–çFVçF–öæVâv–RÆ‡&VcÒ"ö7"×F–ÖRöæWr×–÷&²#ä7"–âæWr–÷&³ÂöâÂÆ‡&VcÒ"öF‡V‡"×F–ÖR÷7–FæW’#äV‡V‡"–â7–FæW“ÂöâöFW"Æ‡&VcÒ"öæW‡B×&–W"öÆöæFöâ#æ