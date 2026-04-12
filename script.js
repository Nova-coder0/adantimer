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
const langOptionButtons = Array.from(document.querySelectorAll(".lang-option"));
const languageMenuEl = document.querySelector(".language-menu");
const languageMenuLabelEl = document.getElementById("language-menu-label");
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
    nextPrayer: "NÃ¤chstes Gebet", currentPrayer: "Aktuelles Gebet", today: "Heute", method: "Methode",
    loading: "Wird geladen...", locating: "GPS wird versucht, danach IP als Fallback.", detect: "Standort wird erkannt",
    noCurrentPrayer: "Zwischen zwei Gebeten", searchPrompt: "Gib eine Stadt ein, um den Plan zu aktualisieren.",
    permissionError: "Dein Standort konnte nicht geladen werden. Suche nach einer Stadt, um fortzufahren.",
    locationNotFound: "Stadt nicht gefunden. Versuche eine grÃ¶ÃŸere Stadt in der NÃ¤he.",
    fetchError: "Die Gebetszeiten konnten gerade nicht geladen werden. Bitte versuche es erneut.",
    timezone: tz => `Zeitzone: ${tz}`, locationPrefix: "Gebetszeiten fÃ¼r", countdown: "beginnt in",
    prayers: { Fajr: "Fajr", Dhuhr: "Dhuhr", Asr: "Asr", Maghrib: "Maghrib", Isha: "Isha" },
    topics: { home: "Gebetszeiten", "prayer-times": "Gebetszeiten", "next-prayer": "Zeit des nÃ¤chsten Gebets", fajr: "Fajr-Zeit", dhuhr: "Dhuhr-Zeit", asr: "Asr-Zeit", maghrib: "Maghrib-Zeit", isha: "Isha-Zeit" },
    eyebrow: "Gebetszeiten nach Stadt", infoEyebrow: "Automatisch", aboutEyebrow: "Ãœberblick", faqEyebrow: "FAQ", citiesEyebrow: "Beliebte StÃ¤dte",
    footer: "Genaue Gebetszeiten nach Stadt.",
    citiesTitle: "Gebetszeiten in wichtigen StÃ¤dten",
    citiesLine1: 'Direkt zu Stadtseiten: <a href="/new-york">New York</a>, <a href="/sydney">Sydney</a>, <a href="/london">London</a>, <a href="/berlin">Berlin</a>, <a href="/dubai">Dubai</a> und <a href="/cairo">Kairo</a>.',
    citiesLine2: 'Direkt zu Suchintentionen wie <a href="/asr-time/new-york">Asr in New York</a>, <a href="/dhuhr-time/sydney">Dhuhr in Sydney</a> oder <a href="/next-prayer/london">nÃ¤chstes Gebet in London</a>.',
    heroTitle: (type, place, topic) => type === "home" ? (place ? `Gebetszeiten in ${place} heute` : "Gebetszeiten heute und Countdown zum nÃ¤chsten Gebet") : (place ? `${topic} in ${place}` : `${topic} heute`),
    heroSubtitle: (type, place, topic) => type === "home" ? (place ? `Sieh genaue Gebetszeiten in ${place}, den Countdown zum nÃ¤chsten Gebet und den kompletten Tagesplan.` : "Die Seite passt sich jetzt automatisch an die Browsersprache und den Standort an.") : (place ? `Sieh ${topic.toLowerCase()} in ${place} und darunter den vollstÃ¤ndigen Gebetsplan.` : `Lade ${topic.toLowerCase()} automatisch und prÃ¼fe darunter den vollstÃ¤ndigen Gebetsplan.`),
    infoTitle: topic => `FÃ¼r schnelle ${topic.toLowerCase()}-Abfragen gebaut`,
    features: topic => ["Erkennt Sprache und Standort automatisch.", `Zeigt ${topic.toLowerCase()} mit Live-Countdown und klarer Statusanzeige.`, "Funktioniert direkt im Browser ohne App.", "Manuelle Buttons fÃ¼r Englisch und Arabisch bleiben oben rechts verfÃ¼gbar."],
    aboutTitle: topic => `${topic} ohne unnÃ¶tige Umwege`,
    about: (topic, place) => [place ? `Diese Seite ist auf ${topic.toLowerCase()} in ${place} ausgerichtet, damit Besucher sofort die richtige Information sehen.` : `Diese Seite ist auf ${topic.toLowerCase()} ausgerichtet, damit Besucher sofort die richtige Information sehen.`, "Ziel ist ein professionelleres Erlebnis: automatische Sprachwahl, automatische Standorterkennung und ein klarer Gebetsplan.", "So verstehen sowohl Nutzer als auch Suchmaschinen die Seite deutlicher."],
    faqTitle: "HÃ¤ufige Fragen",
    faq: [["Erkennt die Seite meine Stadt automatisch?", "Ja. Zuerst wird GPS versucht, danach eine IP-basierte Erkennung."], ["Kann ich auf eine andere Stadt wechseln?", "Ja. Du kannst jede Stadt manuell suchen und die Seite aktualisiert sich sofort."], ["Folgt die Seite automatisch der Besuchersprache?", "Ja. Die Seite folgt jetzt automatisch der Browsersprache, wÃ¤hrend die manuellen Buttons fÃ¼r Englisch und Arabisch erhalten bleiben."]],
    pageTitle: (type, place, topic) => type === "home" ? (place ? `Gebetszeiten in ${place} heute | Fajr, Dhuhr, Asr, Maghrib, Isha | Adantimer` : "Adantimer | Genaue Gebetszeiten und Countdown zum nÃ¤chsten Gebet") : (place ? `${topic} in ${place} heute | Adantimer` : `${topic} heute | Adantimer`),
    pageDescription: (type, place, topic) => type === "home" ? (place ? `PrÃ¼fe genaue Gebetszeiten in ${place}, sieh den Countdown zum nÃ¤chsten Gebet und den heutigen Tagesplan.` : "PrÃ¼fe genaue Gebetszeiten fÃ¼r deine Stadt und lasse Adantimer automatisch die Browsersprache Ã¼bernehmen.") : (place ? `PrÃ¼fe ${topic.toLowerCase()} in ${place}, sieh den Countdown zum nÃ¤chsten Gebet und den vollstÃ¤ndigen Tagesplan.` : `PrÃ¼fe ${topic.toLowerCase()}, sieh den Countdown zum nÃ¤chsten Gebet und den vollstÃ¤ndigen Tagesplan.`)
  },
  fr: {
    code: "fr", dir: "ltr",
    button: "Voir les horaires", cityPlaceholder: "Entrer une ville", countryPlaceholder: "Pays (optionnel)",
    nextPrayer: "Prochaine priÃ¨re", currentPrayer: "PriÃ¨re actuelle", today: "Aujourd'hui", method: "MÃ©thode",
    loading: "Chargement...", locating: "GPS en cours, puis IP en secours.", detect: "DÃ©tection de votre position",
    noCurrentPrayer: "Entre deux priÃ¨res", searchPrompt: "Entrez une ville pour mettre Ã  jour l'horaire.",
    permissionError: "Impossible de charger votre position. Recherchez une ville pour continuer.",
    locationNotFound: "Ville introuvable. Essayez une grande ville proche.", fetchError: "Impossible de charger les horaires maintenant. RÃ©essayez.",
    timezone: tz => `Fuseau horaire : ${tz}`, locationPrefix: "Horaires pour", countdown: "commence dans",
    prayers: { Fajr: "Fajr", Dhuhr: "Dhuhr", Asr: "Asr", Maghrib: "Maghrib", Isha: "Isha" },
    topics: { home: "Horaires de priÃ¨re", "prayer-times": "Horaires de priÃ¨re", "next-prayer": "Heure de la prochaine priÃ¨re", fajr: "Heure du Fajr", dhuhr: "Heure du Dhuhr", asr: "Heure du Asr", maghrib: "Heure du Maghrib", isha: "Heure du Isha" },
    eyebrow: "Horaires par ville", infoEyebrow: "Automatique", aboutEyebrow: "Ã€ propos", faqEyebrow: "FAQ", citiesEyebrow: "Villes populaires",
    footer: "Horaires de priÃ¨re prÃ©cis par ville.",
    citiesTitle: "Horaires de priÃ¨re dans les grandes villes",
    citiesLine1: 'AccÃ©dez directement aux pages villes : <a href="/new-york">New York</a>, <a href="/sydney">Sydney</a>, <a href="/london">Londres</a>, <a href="/berlin">Berlin</a>, <a href="/dubai">DubaÃ¯</a> et <a href="/cairo">Le Caire</a>.',
    citiesLine2: 'AccÃ©dez aussi Ã  des recherches prÃ©cises comme <a href="/asr-time/new-york">Asr Ã  New York</a>, <a href="/dhuhr-time/sydney">Dhuhr Ã  Sydney</a> ou <a href="/next-prayer/london">prochaine priÃ¨re Ã  Londres</a>.',
    heroTitle: (type, place, topic) => type === "home" ? (place ? `Horaires de priÃ¨re Ã  ${place} aujourd'hui` : "Horaires de priÃ¨re aujourd'hui et compte Ã  rebours") : (place ? `${topic} Ã  ${place}` : `${topic} aujourd'hui`),
    heroSubtitle: (type, place, topic) => type === "home" ? (place ? `Consultez les horaires prÃ©cis Ã  ${place}, la prochaine priÃ¨re et le planning complet du jour.` : "La page s'adapte dÃ©sormais automatiquement Ã  la langue du navigateur et Ã  la localisation.") : (place ? `Consultez ${topic.toLowerCase()} Ã  ${place}, puis le planning complet ci-dessous.` : `Chargez ${topic.toLowerCase()} automatiquement, puis consultez le planning complet ci-dessous.`),
    infoTitle: topic => `ConÃ§u pour vÃ©rifier rapidement ${topic.toLowerCase()}`,
    features: topic => ["DÃ©tecte automatiquement la langue et la position.", `Affiche ${topic.toLowerCase()} avec un compte Ã  rebours en direct.`, "Fonctionne directement dans le navigateur sans application.", "Les boutons manuels anglais et arabe restent disponibles en haut Ã  droite."],
    aboutTitle: topic => `${topic} sans friction inutile`,
    about: (topic, place) => [place ? `Cette page vise directement ${topic.toLowerCase()} Ã  ${place}, afin que le visiteur obtienne immÃ©diatement la bonne information.` : `Cette page vise directement ${topic.toLowerCase()}, afin que le visiteur obtienne immÃ©diatement la bonne information.`, "L'objectif est une expÃ©rience plus professionnelle : langue automatique, localisation automatique et planning clair.", "Cela aide Ã  la fois l'utilisateur et les moteurs de recherche."],
    faqTitle: "Questions frÃ©quentes",
    faq: [["La page dÃ©tecte-t-elle ma ville automatiquement ?", "Oui. La page essaie d'abord le GPS puis un fallback par IP."], ["Puis-je changer de ville ?", "Oui. Vous pouvez rechercher n'importe quelle ville manuellement."], ["La page suit-elle automatiquement la langue du visiteur ?", "Oui. La page suit dÃ©sormais la langue du navigateur, avec les boutons anglais et arabe toujours disponibles."]],
    pageTitle: (type, place, topic) => type === "home" ? (place ? `Horaires de priÃ¨re Ã  ${place} aujourd'hui | Fajr, Dhuhr, Asr, Maghrib, Isha | Adantimer` : "Adantimer | Horaires de priÃ¨re prÃ©cis et prochaine priÃ¨re") : (place ? `${topic} Ã  ${place} aujourd'hui | Adantimer` : `${topic} aujourd'hui | Adantimer`),
    pageDescription: (type, place, topic) => type === "home" ? (place ? `Consultez les horaires prÃ©cis Ã  ${place}, la prochaine priÃ¨re et le planning complet du jour.` : "Consultez les horaires de priÃ¨re de votre ville et laissez Adantimer suivre automatiquement la langue du navigateur.") : (place ? `Consultez ${topic.toLowerCase()} Ã  ${place}, la prochaine priÃ¨re et le planning complet du jour.` : `Consultez ${topic.toLowerCase()}, la prochaine priÃ¨re et le planning complet du jour.`)
  },
  tr: {
    code: "tr", dir: "ltr",
    button: "Vakitleri goster", cityPlaceholder: "Sehir girin", countryPlaceholder: "Ulke (istege bagli)",
    nextPrayer: "Sonraki namaz", currentPrayer: "Guncel namaz", today: "Bugun", method: "Yontem",
    loading: "Yukleniyor...", locating: "Once GPS, sonra IP yedegi deneniyor.", detect: "Konumunuz algilaniyor",
    noCurrentPrayer: "Namazlar arasinda", searchPrompt: "Takvimi guncellemek icin bir sehir girin.",
    permissionError: "Konum yuklenemedi. Devam etmek icin bir sehir arayin.",
    locationNotFound: "Sehir bulunamadi. Daha buyuk bir yakin sehir deneyin.", fetchError: "Namaz vakitleri su anda yuklenemedi. Lutfen tekrar deneyin.",
    timezone: tz => `Saat dilimi: ${tz}`, locationPrefix: "Vakitler", countdown: "basliyor",
    prayers: { Fajr: "Fajr", Dhuhr: "Dhuhr", Asr: "Asr", Maghrib: "Maghrib", Isha: "Isha" },
    topics: { home: "Namaz Vakitleri", "prayer-times": "Namaz Vakitleri", "next-prayer": "Sonraki Namaz Vakti", fajr: "Fajr Vakti", dhuhr: "Dhuhr Vakti", asr: "Asr Vakti", maghrib: "Maghrib Vakti", isha: "Isha Vakti" },
    eyebrow: "Sehre gore namaz vakitleri", infoEyebrow: "Otomatik", aboutEyebrow: "Hakkinda", faqEyebrow: "SSS", citiesEyebrow: "Populer sehirler",
    footer: "Sehre gore dogru namaz vakitleri.",
    citiesTitle: "Buyuk sehirlerde namaz vakitleri",
    citiesLine1: 'Sehir sayfalarina dogrudan gidin: <a href="/new-york">New York</a>, <a href="/sydney">Sydney</a>, <a href="/london">Londra</a>, <a href="/berlin">Berlin</a>, <a href="/dubai">Dubai</a> ve <a href="/cairo">Kahire</a>.',
    citiesLine2: 'Ayrica <a href="/asr-time/new-york">New York Asr</a>, <a href="/dhuhr-time/sydney">Sydney Dhuhr</a> veya <a href="/next-prayer/london">Londra sonraki namaz</a> gibi aramalara gidin.',
    heroTitle: (type, place, topic) => type === "home" ? (place ? `${place} icin bugunun namaz vakitleri` : "Bugunun namaz vakitleri ve sonraki namaz geri sayimi") : (place ? `${topic} in ${place}` : `${topic} bugun`),
    heroSubtitle: (type, place, topic) => type === "home" ? (place ? `${place} icin dogru vakitleri, sonraki namaz geri sayimini ve gunluk takvimi gorun.` : "Sayfa artik tarayici diline ve konuma otomatik uyum saglar.") : (place ? `${place} icin ${topic.toLowerCase()} bilgisini gorun ve asagida tam takvimi inceleyin.` : `${topic.toLowerCase()} bilgisini otomatik yukleyin ve asagida tam takvimi inceleyin.`),
    infoTitle: topic => `${topic.toLowerCase()} icin hizli kullanim`,
    features: topic => ["Dil ve konumu otomatik algilar.", `${topic.toLowerCase()} bilgisini canli geri sayimla gosterir.`, "Uygulama kurmadan tarayicida calisir.", "Sag ustte manuel Ingilizce ve Arapca dugmeleri kalir."],
    aboutTitle: topic => `Gereksiz kalabalik olmadan ${topic.toLowerCase()}`,
    about: (topic, place) => [place ? `Bu sayfa ${place} icin ${topic.toLowerCase()} amacina odaklanir ve ziyaretcinin dogru bilgiye hemen ulasmasini saglar.` : `Bu sayfa ${topic.toLowerCase()} amacina odaklanir ve ziyaretcinin dogru bilgiye hemen ulasmasini saglar.`, "Amac daha profesyonel bir deneyim: otomatik dil secimi, otomatik konum algilama ve net bir namaz takvimi.", "Bu sayfanin amacini hem kullanicilarin hem arama motorlarinin daha iyi anlamasina yardim eder."],
    faqTitle: "Sik sorulan sorular",
    faq: [["Sayfa sehrimi otomatik algiliyor mu?", "Evet. Once GPS denenir, sonra IP tabanli yedek kullanilir."], ["Baska bir sehre gecebilir miyim?", "Evet. Herhangi bir sehri manuel olarak arayabilirsiniz."], ["Sayfa otomatik olarak ziyaretcinin dilini takip ediyor mu?", "Evet. Sayfa artik tarayici dilini otomatik takip eder; Ingilizce ve Arapca dugmeleri yine de mevcuttur."]],
    pageTitle: (type, place, topic) => type === "home" ? (place ? `${place} icin bugunun namaz vakitleri | Fajr, Dhuhr, Asr, Maghrib, Isha | Adantimer` : "Adantimer | Dogru namaz vakitleri ve sonraki namaz") : (place ? `${topic} in ${place} bugun | Adantimer` : `${topic} bugun | Adantimer`),
    pageDescription: (type, place, topic) => type === "home" ? (place ? `${place} icin dogru namaz vakitlerini, sonraki namaz geri sayimini ve gunluk takvimi gorun.` : "Sehriniz icin dogru namaz vakitlerini gorun ve Adantimer'in tarayici dilini otomatik kullanmasina izin verin.") : (place ? `${topic.toLowerCase()} in ${place} bilgisini, sonraki namaz geri sayimini ve gunluk takvimi gorun.` : `${topic.toLowerCase()} bilgisini, sonraki namaz geri sayimini ve gunluk takvimi gorun.`)
  },
  "zh-hans": {
    code: "zh-CN", dir: "ltr",
    button: "æŸ¥çœ‹ç¤¼æ‹œæ—¶é—´", cityPlaceholder: "è¾“å…¥åŸŽå¸‚", countryPlaceholder: "å›½å®¶ï¼ˆå¯é€‰ï¼‰",
    nextPrayer: "ä¸‹ä¸€æ¬¡ç¤¼æ‹œ", currentPrayer: "å½“å‰ç¤¼æ‹œ", today: "ä»Šå¤©", method: "è®¡ç®—æ–¹å¼",
    loading: "åŠ è½½ä¸­...", locating: "æ­£åœ¨å°è¯• GPSï¼Œç„¶åŽä½¿ç”¨ IP å¤‡ç”¨ã€‚", detect: "æ­£åœ¨è¯†åˆ«ä½ çš„ä½ç½®",
    noCurrentPrayer: "ä¸¤æ¬¡ç¤¼æ‹œä¹‹é—´", searchPrompt: "è¾“å…¥åŸŽå¸‚ä»¥æ›´æ–°æ—¶é—´è¡¨ã€‚",
    permissionError: "æ— æ³•èŽ·å–ä½ çš„ä½ç½®ã€‚è¯·è¾“å…¥åŸŽå¸‚ç»§ç»­ã€‚",
    locationNotFound: "æœªæ‰¾åˆ°è¯¥åŸŽå¸‚ã€‚è¯·å°è¯•é™„è¿‘æ›´å¤§çš„åŸŽå¸‚ã€‚", fetchError: "æš‚æ—¶æ— æ³•åŠ è½½ç¤¼æ‹œæ—¶é—´ï¼Œè¯·ç¨åŽå†è¯•ã€‚",
    timezone: tz => `æ—¶åŒºï¼š${tz}`, locationPrefix: "ç¤¼æ‹œæ—¶é—´", countdown: "å¼€å§‹äºŽ",
    prayers: { Fajr: "æ™¨ç¤¼", Dhuhr: "æ™Œç¤¼", Asr: "æ™¡ç¤¼", Maghrib: "æ˜ç¤¼", Isha: "å®µç¤¼" },
    topics: { home: "ç¤¼æ‹œæ—¶é—´", "prayer-times": "ç¤¼æ‹œæ—¶é—´", "next-prayer": "ä¸‹ä¸€æ¬¡ç¤¼æ‹œæ—¶é—´", fajr: "æ™¨ç¤¼æ—¶é—´", dhuhr: "æ™Œç¤¼æ—¶é—´", asr: "æ™¡ç¤¼æ—¶é—´", maghrib: "æ˜ç¤¼æ—¶é—´", isha: "å®µç¤¼æ—¶é—´" },
    eyebrow: "æŒ‰åŸŽå¸‚æŸ¥çœ‹ç¤¼æ‹œæ—¶é—´", infoEyebrow: "è‡ªåŠ¨", aboutEyebrow: "å…³äºŽ", faqEyebrow: "å¸¸è§é—®é¢˜", citiesEyebrow: "çƒ­é—¨åŸŽå¸‚",
    footer: "æŒ‰åŸŽå¸‚æä¾›å‡†ç¡®ç¤¼æ‹œæ—¶é—´ã€‚",
    citiesTitle: "ä¸»è¦åŸŽå¸‚ç¤¼æ‹œæ—¶é—´",
    citiesLine1: 'å¯ç›´æŽ¥æ‰“å¼€åŸŽå¸‚é¡µé¢ï¼š<a href="/new-york">çº½çº¦</a>ã€<a href="/sydney">æ‚‰å°¼</a>ã€<a href="/london">ä¼¦æ•¦</a>ã€<a href="/berlin">æŸæž—</a>ã€<a href="/dubai">è¿ªæ‹œ</a>ã€<a href="/cairo">å¼€ç½—</a>ã€‚',
    citiesLine2: 'ä¹Ÿå¯ä»¥ç›´æŽ¥è¿›å…¥å…·ä½“æœç´¢ï¼Œä¾‹å¦‚ <a href="/asr-time/new-york">çº½çº¦æ™¡ç¤¼æ—¶é—´</a>ã€<a href="/dhuhr-time/sydney">æ‚‰å°¼æ™Œç¤¼æ—¶é—´</a>ã€<a href="/next-prayer/london">ä¼¦æ•¦ä¸‹ä¸€æ¬¡ç¤¼æ‹œ</a>ã€‚',
    heroTitle: (type, place, topic) => type === "home" ? (place ? `${place} ä»Šæ—¥ç¤¼æ‹œæ—¶é—´` : "ä»Šæ—¥ç¤¼æ‹œæ—¶é—´ä¸Žä¸‹ä¸€æ¬¡ç¤¼æ‹œå€’è®¡æ—¶") : (place ? `${place}${topic}` : `${topic}`),
    heroSubtitle: (type, place, topic) => type === "home" ? (place ? `æŸ¥çœ‹ ${place} çš„å‡†ç¡®ç¤¼æ‹œæ—¶é—´ã€ä¸‹ä¸€æ¬¡ç¤¼æ‹œä»¥åŠå®Œæ•´æ—¥ç¨‹ã€‚` : "é¡µé¢çŽ°åœ¨ä¼šè‡ªåŠ¨æ ¹æ®æµè§ˆå™¨è¯­è¨€å’Œä½ç½®è¿›è¡Œé€‚é…ã€‚") : (place ? `æŸ¥çœ‹ ${place} çš„${topic}ï¼Œå¹¶åœ¨ä¸‹æ–¹æŸ¥çœ‹å®Œæ•´ç¤¼æ‹œæ—¶é—´è¡¨ã€‚` : `è‡ªåŠ¨åŠ è½½${topic}ï¼Œå¹¶åœ¨ä¸‹æ–¹æŸ¥çœ‹å®Œæ•´ç¤¼æ‹œæ—¶é—´è¡¨ã€‚`),
    infoTitle: topic => `ä¸ºå¿«é€ŸæŸ¥çœ‹${topic}è€Œè®¾è®¡`,
    features: topic => ["è‡ªåŠ¨è¯†åˆ«è¯­è¨€å’Œä½ç½®ã€‚", `æ˜¾ç¤º${topic}å¹¶æä¾›å®žæ—¶å€’è®¡æ—¶ã€‚`, "æ— éœ€å®‰è£…åº”ç”¨ï¼Œç›´æŽ¥åœ¨æµè§ˆå™¨ä¸­ä½¿ç”¨ã€‚", "å³ä¸Šè§’ä»ä¿ç•™è‹±è¯­å’Œé˜¿æ‹‰ä¼¯è¯­æ‰‹åŠ¨æŒ‰é’®ã€‚"],
    aboutTitle: topic => `${topic}ï¼Œæ›´æ¸…æ™°æ›´ç›´æŽ¥`,
    about: (topic, place) => [place ? `æ­¤é¡µé¢èšç„¦äºŽ ${place} çš„${topic}ï¼Œè®©è®¿é—®è€…èƒ½å¤Ÿç«‹å³çœ‹åˆ°æœ€ç›¸å…³çš„ä¿¡æ¯ã€‚` : `æ­¤é¡µé¢èšç„¦äºŽ${topic}ï¼Œè®©è®¿é—®è€…èƒ½å¤Ÿç«‹å³çœ‹åˆ°æœ€ç›¸å…³çš„ä¿¡æ¯ã€‚`, "ç›®æ ‡æ˜¯æä¾›æ›´ä¸“ä¸šçš„ä½“éªŒï¼šè‡ªåŠ¨è¯­è¨€ã€è‡ªåŠ¨å®šä½ï¼Œä»¥åŠæ¸…æ™°çš„ç¤¼æ‹œæ—¶é—´è¡¨ã€‚", "è¿™ä¹Ÿæ›´æœ‰åˆ©äºŽç”¨æˆ·å’Œæœç´¢å¼•æ“Žç†è§£é¡µé¢æ„å›¾ã€‚"],
    faqTitle: "å¸¸è§é—®é¢˜",
    faq: [["é¡µé¢ä¼šè‡ªåŠ¨è¯†åˆ«æˆ‘çš„åŸŽå¸‚å—ï¼Ÿ", "ä¼šã€‚é¡µé¢ä¼šå…ˆå°è¯• GPSï¼Œç„¶åŽä½¿ç”¨ IP ä½œä¸ºå¤‡ç”¨ã€‚"], ["æˆ‘å¯ä»¥åˆ‡æ¢åˆ°å…¶ä»–åŸŽå¸‚å—ï¼Ÿ", "å¯ä»¥ã€‚ä½ å¯ä»¥æ‰‹åŠ¨æœç´¢ä»»ä½•åŸŽå¸‚ã€‚"], ["é¡µé¢ä¼šè‡ªåŠ¨ä½¿ç”¨è®¿é—®è€…çš„è¯­è¨€å—ï¼Ÿ", "ä¼šã€‚é¡µé¢çŽ°åœ¨ä¼šè‡ªåŠ¨è·Ÿéšæµè§ˆå™¨è¯­è¨€ï¼ŒåŒæ—¶ä»ä¿ç•™è‹±è¯­å’Œé˜¿æ‹‰ä¼¯è¯­æ‰‹åŠ¨æŒ‰é’®ã€‚"]],
    pageTitle: (type, place, topic) => type === "home" ? (place ? `${place} ä»Šæ—¥ç¤¼æ‹œæ—¶é—´ | æ™¨ç¤¼ æ™Œç¤¼ æ™¡ç¤¼ æ˜ç¤¼ å®µç¤¼ | Adantimer` : "Adantimer | å‡†ç¡®ç¤¼æ‹œæ—¶é—´ä¸Žä¸‹ä¸€æ¬¡ç¤¼æ‹œ") : (place ? `${place}${topic} | Adantimer` : `${topic} | Adantimer`),
    pageDescription: (type, place, topic) => type === "home" ? (place ? `æŸ¥çœ‹ ${place} çš„å‡†ç¡®ç¤¼æ‹œæ—¶é—´ã€ä¸‹ä¸€æ¬¡ç¤¼æ‹œå€’è®¡æ—¶ä»¥åŠä»Šæ—¥å®Œæ•´ç¤¼æ‹œæ—¥ç¨‹ã€‚` : "æŸ¥çœ‹ä½ æ‰€åœ¨åŸŽå¸‚çš„ç¤¼æ‹œæ—¶é—´ï¼Œå¹¶è®© Adantimer è‡ªåŠ¨ä½¿ç”¨æµè§ˆå™¨è¯­è¨€ã€‚") : (place ? `æŸ¥çœ‹ ${place} çš„${topic}ã€ä¸‹ä¸€æ¬¡ç¤¼æ‹œå€’è®¡æ—¶ä»¥åŠä»Šæ—¥å®Œæ•´ç¤¼æ‹œæ—¥ç¨‹ã€‚` : `æŸ¥çœ‹${topic}ã€ä¸‹ä¸€æ¬¡ç¤¼æ‹œå€’è®¡æ—¶ä»¥åŠä»Šæ—¥å®Œæ•´ç¤¼æ‹œæ—¥ç¨‹ã€‚`)
  },
  ar: {
    code: "ar", dir: "rtl",
    button: "Ø§Ø¹Ø±Ø¶ Ø§Ù„Ù…ÙˆØ§Ù‚ÙŠØª", cityPlaceholder: "Ø£Ø¯Ø®Ù„ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©", countryPlaceholder: "Ø§Ù„Ø¯ÙˆÙ„Ø© (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)",
    nextPrayer: "Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©", currentPrayer: "Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©", today: "Ø§Ù„ÙŠÙˆÙ…", method: "Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø­Ø³Ø§Ø¨",
    loading: "Ø¬Ø§Ø± Ø§Ù„ØªØ­Ù…ÙŠÙ„...", locating: "Ø¬Ø§Ø±Ù Ù…Ø­Ø§ÙˆÙ„Ø© ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø¹Ø¨Ø± GPS Ø«Ù… Ø¹Ø¨Ø± IP.", detect: "Ø¬Ø§Ø±Ù ØªØ­Ø¯ÙŠØ¯ Ù…ÙˆÙ‚Ø¹Ùƒ",
    noCurrentPrayer: "Ø¨ÙŠÙ† Ø§Ù„ØµÙ„ÙˆØ§Øª", searchPrompt: "Ø£Ø¯Ø®Ù„ Ù…Ø¯ÙŠÙ†Ø© Ù„ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¬Ø¯ÙˆÙ„.",
    permissionError: "ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ù…ÙˆÙ‚Ø¹Ùƒ. Ø§Ø¨Ø­Ø« Ø¹Ù† Ù…Ø¯ÙŠÙ†Ø© Ù„Ù„Ù…ØªØ§Ø¨Ø¹Ø©.",
    locationNotFound: "Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©. Ø¬Ø±Ù‘Ø¨ Ù…Ø¯ÙŠÙ†Ø© Ø£ÙƒØ¨Ø± Ù‚Ø±ÙŠØ¨Ø©.", fetchError: "ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„Ø¢Ù†. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.",
    timezone: tz => `Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø²Ù…Ù†ÙŠØ©: ${tz}`, locationPrefix: "Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„ØµÙ„Ø§Ø© ÙÙŠ", countdown: "ØªØ¨Ø¯Ø£ Ø®Ù„Ø§Ù„",
    prayers: { Fajr: "Ø§Ù„ÙØ¬Ø±", Dhuhr: "Ø§Ù„Ø¸Ù‡Ø±", Asr: "Ø§Ù„Ø¹ØµØ±", Maghrib: "Ø§Ù„Ù…ØºØ±Ø¨", Isha: "Ø§Ù„Ø¹Ø´Ø§Ø¡" },
    topics: { home: "Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„ØµÙ„Ø§Ø©", "prayer-times": "Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„ØµÙ„Ø§Ø©", "next-prayer": "ÙˆÙ‚Øª Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©", fajr: "ÙˆÙ‚Øª Ø§Ù„ÙØ¬Ø±", dhuhr: "ÙˆÙ‚Øª Ø§Ù„Ø¸Ù‡Ø±", asr: "ÙˆÙ‚Øª Ø§Ù„Ø¹ØµØ±", maghrib: "ÙˆÙ‚Øª Ø§Ù„Ù…ØºØ±Ø¨", isha: "ÙˆÙ‚Øª Ø§Ù„Ø¹Ø´Ø§Ø¡" },
    eyebrow: "Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„ØµÙ„Ø§Ø© Ø­Ø³Ø¨ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©", infoEyebrow: "ØªÙ„Ù‚Ø§Ø¦ÙŠ", aboutEyebrow: "Ø¹Ù† Ø§Ù„ØµÙØ­Ø©", faqEyebrow: "Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø´Ø§Ø¦Ø¹Ø©", citiesEyebrow: "Ù…Ø¯Ù† Ø´Ø§Ø¦Ø¹Ø©",
    footer: "Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„Ø¯Ù‚ÙŠÙ‚Ø© Ø­Ø³Ø¨ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©.",
    citiesTitle: "Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„ØµÙ„Ø§Ø© ÙÙŠ Ø§Ù„Ù…Ø¯Ù† Ø§Ù„ÙƒØ¨Ø±Ù‰",
    citiesLine1: 'ØªØµÙØ­ ØµÙØ­Ø§Øª Ø§Ù„Ù…Ø¯Ù† Ù…Ø¨Ø§Ø´Ø±Ø©: <a href="/new-york">Ù†ÙŠÙˆÙŠÙˆØ±Ùƒ</a>ØŒ <a href="/sydney">Ø³ÙŠØ¯Ù†ÙŠ</a>ØŒ <a href="/london">Ù„Ù†Ø¯Ù†</a>ØŒ <a href="/berlin">Ø¨Ø±Ù„ÙŠÙ†</a>ØŒ <a href="/dubai">Ø¯Ø¨ÙŠ</a>ØŒ Ùˆ<a href="/cairo">Ø§Ù„Ù‚Ø§Ù‡Ø±Ø©</a>.',
    citiesLine2: 'ÙŠÙ…ÙƒÙ†Ùƒ Ø£ÙŠØ¶Ø§Ù‹ Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰ ØµÙØ­Ø§Øª Ø¯Ù‚ÙŠÙ‚Ø© Ù…Ø«Ù„ <a href="/asr-time/new-york">ÙˆÙ‚Øª Ø§Ù„Ø¹ØµØ± ÙÙŠ Ù†ÙŠÙˆÙŠÙˆØ±Ùƒ</a>ØŒ <a href="/dhuhr-time/sydney">ÙˆÙ‚Øª Ø§Ù„Ø¸Ù‡Ø± ÙÙŠ Ø³ÙŠØ¯Ù†ÙŠ</a>ØŒ Ø£Ùˆ <a href="/next-prayer/london">Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø© ÙÙŠ Ù„Ù†Ø¯Ù†</a>.',
    heroTitle: (type, place, topic) => type === "home" ? (place ? `Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„ØµÙ„Ø§Ø© ÙÙŠ ${place} Ø§Ù„ÙŠÙˆÙ…` : "Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„ÙŠÙˆÙ… ÙˆØ§Ù„Ø¹Ø¯ Ø§Ù„ØªÙ†Ø§Ø²Ù„ÙŠ Ù„Ù„ØµÙ„Ø§Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©") : (place ? `${topic} ÙÙŠ ${place}` : `${topic} Ø§Ù„ÙŠÙˆÙ…`),
    heroSubtitle: (type, place, topic) => type === "home" ? (place ? `Ø´Ø§Ù‡Ø¯ Ø§Ù„Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„Ø¯Ù‚ÙŠÙ‚Ø© ÙÙŠ ${place} ÙˆØªØ§Ø¨Ø¹ Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø© ÙˆØ¬Ø¯ÙˆÙ„ Ø§Ù„ÙŠÙˆÙ… Ø§Ù„ÙƒØ§Ù…Ù„.` : "ØªØªÙƒÙŠÙ‘Ù Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø¢Ù† ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ù…Ø¹ Ù„ØºØ© Ø§Ù„Ù…ØªØµÙØ­ ÙˆÙ…ÙˆÙ‚Ø¹ Ø§Ù„Ø²Ø§Ø¦Ø±.") : (place ? `Ø´Ø§Ù‡Ø¯ ${topic} ÙÙŠ ${place} Ø«Ù… Ø±Ø§Ø¬Ø¹ Ø¬Ø¯ÙˆÙ„ Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„ÙƒØ§Ù…Ù„ Ø¨Ø§Ù„Ø£Ø³ÙÙ„.` : `Ø­Ù…Ù‘Ù„ ${topic} ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ø«Ù… Ø±Ø§Ø¬Ø¹ Ø¬Ø¯ÙˆÙ„ Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„ÙƒØ§Ù…Ù„ Ø¨Ø§Ù„Ø£Ø³ÙÙ„.`),
    infoTitle: topic => `Ù…ØµÙ…Ù…Ø© Ù„Ù„ÙˆØµÙˆÙ„ Ø§Ù„Ø³Ø±ÙŠØ¹ Ø¥Ù„Ù‰ ${topic}`,
    features: topic => ["ØªØªØ¹Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ù„ØºØ© ÙˆØ§Ù„Ù…ÙˆÙ‚Ø¹ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹.", `ØªØ¹Ø±Ø¶ ${topic} Ù…Ø¹ Ø¹Ø¯ ØªÙ†Ø§Ø²Ù„ÙŠ Ù…Ø¨Ø§Ø´Ø± ÙˆØ­Ø§Ù„Ø© ÙˆØ§Ø¶Ø­Ø©.`, "ØªØ¹Ù…Ù„ Ù…Ø¨Ø§Ø´Ø±Ø© ÙÙŠ Ø§Ù„Ù…ØªØµÙØ­ Ù…Ù† Ø¯ÙˆÙ† ØªØ·Ø¨ÙŠÙ‚.", "ØªØ¨Ù‚Ù‰ Ø£Ø²Ø±Ø§Ø± Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© ÙˆØ§Ù„Ø¹Ø±Ø¨ÙŠØ© Ù…ØªØ§Ø­Ø© ÙŠØ¯ÙˆÙŠØ§Ù‹ Ø£Ø¹Ù„Ù‰ Ø§Ù„ÙŠÙ…ÙŠÙ†."],
    aboutTitle: topic => `${topic} Ù…Ù† Ø¯ÙˆÙ† ØªØ¹Ù‚ÙŠØ¯`,
    about: (topic, place) => [place ? `Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø© Ù…ÙˆØ¬Ù‡Ø© Ø¥Ù„Ù‰ ${topic} ÙÙŠ ${place} Ø­ØªÙ‰ ÙŠØµÙ„ Ø§Ù„Ø²Ø§Ø¦Ø± Ø¥Ù„Ù‰ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø© Ø§Ù„ØµØ­ÙŠØ­Ø© Ù…Ø¨Ø§Ø´Ø±Ø©.` : `Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø© Ù…ÙˆØ¬Ù‡Ø© Ø¥Ù„Ù‰ ${topic} Ø­ØªÙ‰ ÙŠØµÙ„ Ø§Ù„Ø²Ø§Ø¦Ø± Ø¥Ù„Ù‰ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø© Ø§Ù„ØµØ­ÙŠØ­Ø© Ù…Ø¨Ø§Ø´Ø±Ø©.`, "Ø§Ù„Ù‡Ø¯Ù Ù‡Ùˆ ØªØ¬Ø±Ø¨Ø© Ø£ÙƒØ«Ø± Ø§Ø­ØªØ±Ø§ÙÙŠØ©: Ù„ØºØ© ØªÙ„Ù‚Ø§Ø¦ÙŠØ©ØŒ Ù…ÙˆÙ‚Ø¹ ØªÙ„Ù‚Ø§Ø¦ÙŠØŒ ÙˆØ¬Ø¯ÙˆÙ„ ØµÙ„Ø§Ø© ÙˆØ§Ø¶Ø­.", "ÙˆÙ‡Ø°Ø§ ÙŠØ³Ø§Ø¹Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙˆÙ…Ø­Ø±ÙƒØ§Øª Ø§Ù„Ø¨Ø­Ø« Ø¹Ù„Ù‰ ÙÙ‡Ù… Ø§Ù„ØµÙØ­Ø© Ø¨Ø´ÙƒÙ„ Ø£ÙˆØ¶Ø­."],
    faqTitle: "Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø´Ø§Ø¦Ø¹Ø©",
    faq: [["Ù‡Ù„ ØªØªØ¹Ø±Ù Ø§Ù„ØµÙØ­Ø© Ø¹Ù„Ù‰ Ù…Ø¯ÙŠÙ†ØªÙŠ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ØŸ", "Ù†Ø¹Ù…. ØªØ­Ø§ÙˆÙ„ Ø§Ù„ØµÙØ­Ø© Ø§Ø³ØªØ®Ø¯Ø§Ù… GPS Ø£ÙˆÙ„Ø§Ù‹ Ø«Ù… ØªØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ IP ÙƒØ®ÙŠØ§Ø± Ø§Ø­ØªÙŠØ§Ø·ÙŠ."], ["Ù‡Ù„ ÙŠÙ…ÙƒÙ†Ù†ÙŠ Ø§Ù„ØªØ¨Ø¯ÙŠÙ„ Ø¥Ù„Ù‰ Ù…Ø¯ÙŠÙ†Ø© Ø£Ø®Ø±Ù‰ØŸ", "Ù†Ø¹Ù…. ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø£ÙŠ Ù…Ø¯ÙŠÙ†Ø© ÙŠØ¯ÙˆÙŠØ§Ù‹ ÙˆØ³ÙŠØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„ØµÙØ­Ø© ÙÙˆØ±Ø§Ù‹."], ["Ù‡Ù„ ØªØªØ¨Ø¹ Ø§Ù„ØµÙØ­Ø© Ù„ØºØ© Ø§Ù„Ø²Ø§Ø¦Ø± ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ØŸ", "Ù†Ø¹Ù…. ØªØªØ¨Ø¹ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø¢Ù† Ù„ØºØ© Ø§Ù„Ù…ØªØµÙØ­ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ØŒ Ù…Ø¹ Ø¨Ù‚Ø§Ø¡ Ø£Ø²Ø±Ø§Ø± Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© ÙˆØ§Ù„Ø¹Ø±Ø¨ÙŠØ© Ù…ØªØ§Ø­Ø© ÙŠØ¯ÙˆÙŠØ§Ù‹."]],
    pageTitle: (type, place, topic) => type === "home" ? (place ? `Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„ØµÙ„Ø§Ø© ÙÙŠ ${place} Ø§Ù„ÙŠÙˆÙ… | Ø§Ù„ÙØ¬Ø± ÙˆØ§Ù„Ø¸Ù‡Ø± ÙˆØ§Ù„Ø¹ØµØ± ÙˆØ§Ù„Ù…ØºØ±Ø¨ ÙˆØ§Ù„Ø¹Ø´Ø§Ø¡ | Adantimer` : "Adantimer | Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„ØµÙ„Ø§Ø© ÙˆØ§Ù„Ø¹Ø¯ Ø§Ù„ØªÙ†Ø§Ø²Ù„ÙŠ Ù„Ù„ØµÙ„Ø§Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©") : (place ? `${topic} ÙÙŠ ${place} Ø§Ù„ÙŠÙˆÙ… | Adantimer` : `${topic} Ø§Ù„ÙŠÙˆÙ… | Adantimer`),
    pageDescription: (type, place, topic) => type === "home" ? (place ? `ØªØ­Ù‚Ù‚ Ù…Ù† Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„Ø¯Ù‚ÙŠÙ‚Ø© ÙÙŠ ${place} ÙˆØªØ§Ø¨Ø¹ Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø© ÙˆØ¬Ø¯ÙˆÙ„ Ø§Ù„ÙŠÙˆÙ… Ø§Ù„ÙƒØ§Ù…Ù„.` : "ØªØ­Ù‚Ù‚ Ù…Ù† Ù…ÙˆØ§Ù‚ÙŠØª Ø§Ù„ØµÙ„Ø§Ø© Ù„Ù…Ø¯ÙŠÙ†ØªÙƒ ÙˆØ¯Ø¹ Adantimer ÙŠØªØ¨Ø¹ Ù„ØºØ© Ø§Ù„Ù…ØªØµÙØ­ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹.") : (place ? `ØªØ­Ù‚Ù‚ Ù…Ù† ${topic} ÙÙŠ ${place} ÙˆØªØ§Ø¨Ø¹ Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø© ÙˆØ¬Ø¯ÙˆÙ„ Ø§Ù„ÙŠÙˆÙ… Ø§Ù„ÙƒØ§Ù…Ù„.` : `ØªØ­Ù‚Ù‚ Ù…Ù† ${topic} ÙˆØªØ§Ø¨Ø¹ Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø© ÙˆØ¬Ø¯ÙˆÙ„ Ø§Ù„ÙŠÙˆÙ… Ø§Ù„ÙƒØ§Ù…Ù„.`)
  }
};

const mojibakeDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8") : null;

function repairMojibake(value) {
  if (typeof value !== "string") return value;
  if (!/[ÃƒÃ˜Ã™ÃÃ‘Ã…Ã†Ã‡Ã‹ÃÃ–ÃœÃÃžÃŸÃ -Ã¿]/.test(value)) return value;
  try {
    if (mojibakeDecoder) {
      const bytes = Uint8Array.from(Array.from(value, char => char.charCodeAt(0) & 255));
      return mojibakeDecoder.decode(bytes);
    }
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
}

function normalizeLocaleValue(value) {
  if (typeof value === "string") return repairMojibake(value);
  if (Array.isArray(value)) return value.map(normalizeLocaleValue);
  if (typeof value === "function") {
    return (...args) => normalizeLocaleValue(value(...args));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalizeLocaleValue(entry)]));
  }
  return value;
}

const NORMALIZED_LOCALES = normalizeLocaleValue(LOCALES);

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
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\p{L}/gu, letter => letter.toUpperCase());
}

function resolveLanguageTag(segment = "") {
  return LANGUAGE_ALIASES[String(segment).toLowerCase()] || null;
}

function getPreferredLanguage() {
  const pathLanguage = resolveLanguageTag(window.location.pathname.split("/").filter(Boolean)[0]);
  if (pathLanguage) return pathLanguage;
  const saved = localStorage.getItem("adantimer-language");
  if (saved && NORMALIZED_LOCALES[saved]) return saved;
  const browserLanguages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  for (const locale of browserLanguages) {
    const normalized = resolveLanguageTag(locale);
    if (normalized) return normalized;
  }
  return "en";
}

function getRequestedCity() {
  const segments = window.location.pathname.split("/").filter(Boolean);
  const clean = resolveLanguageTag(segments[0]) ? segments.slice(1) : segments;
  if (!clean.length) return "";
  if (["prayer-times", "next-prayer", "fajr-time", "dhuhr-time", "asr-time", "maghrib-time", "isha-time"].includes(clean[0])) {
    return clean[1] ? unslugifyCity(decodeURIComponent(clean[1])) : "";
  }
  return unslugifyCity(decodeURIComponent(clean[0]));
}

function getLocale() {
  return NORMALIZED_LOCALES[language] || NORMALIZED_LOCALES.en;
}

function getTopic(locale) {
  return locale.topics[pageType] || locale.topics.home;
}

function getPlaceName(city = "", country = "") {
  return city && country ? `${city}, ${country}` : city || country || "";
}

function getLanguagePrefix(lang) {
  return lang === "en" ? "" : `/${lang}`;
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
  return `${prefix}${path === "/" && prefix ? "" : path}`;
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
  langButtons.forEach(button => {
    const isActive = button.dataset.lang === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
  langOptionButtons.forEach(button => {
    const isActive = button.dataset.lang === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
  if (languageMenuLabelEl) {
    const menuLabels = {
      en: "Other languages",
      ar: "Other languages",
      de: "German",
      fr: "French",
      tr: "Turkish",
      "zh-hans": "Chinese"
    };
    languageMenuLabelEl.textContent = menuLabels[language] || "Other languages";
  }
  if (languageMenuEl) languageMenuEl.classList.toggle("is-active", !["en", "ar"].includes(language));
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
      fr: "Horaires de priÃ¨re du jour",
      tr: "BugÃ¼nÃ¼n namaz takvimi",
      "zh-hans": "ä»Šæ—¥ç¤¼æ‹œæ—¶é—´è¡¨",
      ar: "Ø¬Ø¯ÙˆÙ„ Ø§Ù„ØµÙ„Ø§Ø© Ø§Ù„ÙŠÙˆÙ…"
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
  language = NORMALIZED_LOCALES[lang] ? lang : "en";
  window.language = language;
  const activeCity = cityName || getRequestedCity();
  if (persist) localStorage.setItem("adantimer-language", language);
  renderStaticContent();
  renderScheduleSummary();
  renderPrayerRows();
  renderNextPrayer();
  applySeoMeta(activeCity);
  updateHistory(activeCity);
}

window.setLanguage = setLanguage;

async function getGPSLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }), reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 });
  });
}

function timeoutAfter(ms, message) {
  return new Promise((_, reject) => {
    window.setTimeout(() => reject(new Error(message)), ms);
  });
}

async function getIPLocation() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    if (!data || !data.latitude || !data.longitude) return null;
    return { lat: Number(data.latitude), lng: Number(data.longitude), city: data.city || "", country: data.country_name || "" };
  } catch {
    return null;
  }
}

async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    const address = data.address || {};
    return { city: address.city || address.town || address.village || address.hamlet || "", country: address.country || "" };
  } catch {
    return { city: "", country: "" };
  }
}

async function searchCity(city, country = "") {
  const params = new URLSearchParams({ format: "json", limit: "1", city });
  if (country) params.set("country", country);
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
  const data = await response.json();
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
  const ipPromise = getIPLocation();
  try {
    currentLocationType = "gps";
    return await Promise.race([
      getGPSLocation(),
      timeoutAfter(3500, "gps-timeout")
    ]);
  } catch {
    const ipResult = await ipPromise;
    if (ipResult) {
      currentLocationType = "ip";
      return ipResult;
    }
  }
  return null;
}

async function loadPrayerTimes(resolvedLocation) {
  const locale = getLocale();
  countdownEl.textContent = locale.loading;
  prayerTimesEl.innerHTML = "";
  nextPrayerData = null;
  renderNextPrayer();
  const source = resolvedLocation || await resolveInitialLocation();
  if (!source) {
    countdownEl.textContent = locale.permissionError;
    locationStatusEl.textContent = locale.permissionError;
    locationEl.textContent = locale.searchPrompt;
    return;
  }
  currentCoords = { lat: Number(source.lat), lng: Number(source.lng) };
  try {
    const prayerResponse = await fetch(`https://api.aladhan.com/v1/timings?latitude=${currentCoords.lat}&longitude=${currentCoords.lng}&method=2`);
    const prayerJson = await prayerResponse.json();
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
    renderStaticContent();
    renderScheduleSummary();
    renderPrayerRows();
    startCountdown(nextPrayer);
    applySeoMeta(cityName);
    saveRecentLocation();
    if (currentLocationType === "manual") updateHistory(cityName);
  } catch {
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
  locationStatusEl.textContent = `${locale.locationPrefix} ${city}`;
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

langOptionButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (languageMenuEl) languageMenuEl.open = false;
    setLanguage(button.dataset.lang, true);
  });
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
