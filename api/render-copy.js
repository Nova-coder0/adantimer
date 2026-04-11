import { LANGUAGE_ALIASES, LOCALES, ROUTE_LABELS, ROUTES, SUPPORTED_LANGUAGES, TOP_CITIES } from "./render-data.js";
import { buildCurrentCitySummary, buildDescription, buildFullScheduleHeading, buildHeroSubtitle, buildLocationStatus, buildLocationText, buildScheduleSummary, buildTodayScheduleHeading } from "./render-copy-page.js";
import { buildAboutParagraphs, buildAboutTitle, buildCitiesTitle, buildFeatures, buildInfoTitle } from "./render-copy-content.js";
import { buildFaq, buildFaqTitle, buildFooterText } from "./render-copy-faq.js";

export function normalizeLanguage(value) {
  const normalized = String(value || "en").toLowerCase();
  return LANGUAGE_ALIASES[normalized] || LANGUAGE_ALIASES[normalized.split("-")[0]] || "en";
}

export function normalizePageType(value) {
  return Object.prototype.hasOwnProperty.call(ROUTES, value) ? value : "home";
}

export function normalizeCity(value) {
  return decodeURIComponent(String(value || "")).replace(/\+/g, " ").replace(/\s+/g, " ").trim();
}

export function getLocale(language) {
  return LOCALES[language] || LOCALES.en;
}

export function getLocalizedCityName(item, language) {
  return item?.names?.[language] || item?.city || "";
}

export function getTopicLabel(pageType, language) {
  return ROUTE_LABELS[pageType]?.[language] || ROUTE_LABELS[pageType]?.en || ROUTE_LABELS.home.en;
}

export function buildRoutePath(language, pageType, city = "") {
  const route = ROUTES[pageType] || ROUTES.home;
  const pathName = route.path(city);
  return language === "en" ? pathName : `/${language}${pathName === "/" ? "" : pathName}`;
}

export function getAlternates(siteUrl, pageType, city) {
  const alternates = {};
  for (const language of SUPPORTED_LANGUAGES) {
    alternates[language] = `${siteUrl}${buildRoutePath(language, pageType, city)}`;
  }
  alternates.default = alternates.en;
  return alternates;
}

export function buildMeta(language, pageType, city) {
  const locale = getLocale(language);
  const place = getDisplayPlaceName(city, language);
  const topic = getTopicLabel(pageType, language);
  const title = pageType === "home" && !place ? locale.homeTitle : formatTopicPlace(language, topic, place, "title");
  const description = pageType === "home" && !place ? locale.homeDescription : buildDescription(language, topic, place);
  return { locale, place, topic, title, description };
}

export function buildServerCopy(language, pageType, place, topic) {
  const locale = getLocale(language);
  const cityLinks = getLocalizedCityLinks(language, pageType, place, topic);
  const cityIntentLinks = getCityIntentLinks(language, place);
  const target = place ? formatTopicPlace(language, topic, place, "plain") : topic;

  return {
    activeLanguage: language,
    brandHref: buildRoutePath(language, "home"),
    heroEyebrow: pageType === "home" ? (place ? formatTopicPlace(language, ROUTE_LABELS["prayer-times"][language] || ROUTE_LABELS["prayer-times"].en, place, "label") : locale.homeEyebrow) : formatTopicPlace(language, topic, place, "label"),
    heroHeading: pageType === "home" ? (place ? formatTopicPlace(language, ROUTE_LABELS["prayer-times"][language] || ROUTE_LABELS["prayer-times"].en, place, "label") : locale.homeTitle.replace("Adantimer | ", "")) : formatTopicPlace(language, topic, place, "label"),
    heroSubtitle: buildHeroSubtitle(language, topic, place),
    cityLabel: locale.cityLabel,
    cityPlaceholder: locale.cityPlaceholder,
    countryLabel: locale.countryLabel,
    countryPlaceholder: locale.countryPlaceholder,
    submitLabel: locale.findButton,
    topCities: TOP_CITIES,
    topCitiesAria: locale.popularCities,
    intentLinks: getIntentLinks(language),
    intentAria: locale.searchShortcuts,
    locationStatus: place ? buildLocationStatus(language, place) : locale.locationWaiting,
    nextPrayerTitle: locale.nextPrayer,
    currentPrayerLabel: locale.currentPrayer,
    todayLabel: locale.today,
    methodLabel: locale.method,
    loadingLabel: locale.loading,
    locationText: place ? buildLocationText(language, place) : locale.locationFallback,
    scheduleEyebrow: locale.today,
    scheduleHeading: pageType === "home" ? buildTodayScheduleHeading(language) : buildFullScheduleHeading(language, topic),
    scheduleSummary: place ? buildScheduleSummary(language, place) : buildCurrentCitySummary(language),
    infoEyebrow: locale.whyEyebrow,
    infoTitle: buildInfoTitle(language, topic),
    features: buildFeatures(language, target),
    citiesEyebrow: locale.exploreEyebrow,
    citiesTitle: buildCitiesTitle(language, topic),
    cityLinks,
    cityIntentLinks,
    aboutEyebrow: locale.aboutEyebrow,
    aboutTitle: buildAboutTitle(language, topic, place),
    aboutParagraphs: buildAboutParagraphs(language, topic, place),
    faqEyebrow: locale.faqEyebrow,
    faqTitle: buildFaqTitle(language, topic, place),
    faq: buildFaq(language, topic, place),
    footerText: place ? buildFooterText(language, place) : locale.footer,
    noscriptText: locale.noScript
  };
}

function getDisplayPlaceName(city, language) {
  if (!city) return "";
  const match = TOP_CITIES.find(item => slugify(item.city) === slugify(city));
  return match ? getLocalizedCityName(match, language) : titleCase(city);
}

function getLocalizedCityLinks(language, pageType, place, topic) {
  const targetPage = pageType === "home" ? "prayer-times" : pageType;
  return TOP_CITIES
    .filter(item => getLocalizedCityName(item, language) !== place)
    .slice(0, 6)
    .map(item => ({ label: formatTopicPlace(language, topic, getLocalizedCityName(item, language), "label"), href: buildRoutePath(language, targetPage, item.city) }));
}

function getIntentLinks(language) {
  return ["prayer-times", "next-prayer", "fajr", "dhuhr", "asr", "maghrib", "isha"].map(type => ({ label: type === "prayer-times" ? ({ en: "Prayer times today", ar: "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u064a\u0648\u0645", de: "Gebetszeiten heute", fr: "Horaires de priere aujourd'hui", tr: "Bugunun namaz vakitleri", "zh-hans": "\u4eca\u65e5\u793c\u62dc\u65f6\u95f4" }[language] || "Prayer times today") : ROUTE_LABELS[type]?.[language] || ROUTE_LABELS[type]?.en || "", href: buildRoutePath(language, type) }));
}

function getCityIntentLinks(language, place) {
  const presets = place
    ? ["prayer-times", "next-prayer", "fajr", "dhuhr", "asr", "maghrib", "isha"].map(type => ({ type, city: place }))
    : [
        { type: "prayer-times", city: getDisplayPlaceName("Makkah", language) },
        { type: "asr", city: getDisplayPlaceName("Cairo", language) },
        { type: "dhuhr", city: getDisplayPlaceName("Dubai", language) },
        { type: "next-prayer", city: getDisplayPlaceName("London", language) }
      ];

  return presets.map(item => ({ label: formatTopicPlace(language, ROUTE_LABELS[item.type]?.[language] || ROUTE_LABELS[item.type]?.en || "", item.city, "label"), href: buildRoutePath(language, item.type, item.city) }));
}

function formatTopicPlace(language, topic, place, mode) {
  if (!place) {
    return mode === "title"
      ? ({ en: `${topic} Today | Adantimer`, ar: `${topic} \u0627\u0644\u064a\u0648\u0645 | Adantimer`, de: `${topic} heute | Adantimer`, fr: `${topic} aujourd'hui | Adantimer`, tr: `${topic} bugun | Adantimer`, "zh-hans": `${topic} | Adantimer` }[language] || `${topic} Today | Adantimer`)
      : topic;
  }
  if (language === "ar") return mode === "title" ? `${topic} \u0641\u064a ${place} \u0627\u0644\u064a\u0648\u0645 | Adantimer` : `${topic} \u0641\u064a ${place}`;
  if (language === "zh-hans") return mode === "title" ? `${place}${topic} | Adantimer` : `${place}${topic}`;
  if (language === "tr") return mode === "title" ? `${topic} ${place} icin | Adantimer` : `${place} icin ${topic}`;
  if (language === "fr") return mode === "title" ? `${topic} a ${place} aujourd'hui | Adantimer` : `${topic} a ${place}`;
  if (language === "de") return mode === "title" ? `${topic} in ${place} heute | Adantimer` : `${topic} in ${place}`;
  return mode === "title" ? `${topic} in ${place} Today | Adantimer` : `${topic} in ${place}`;
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
