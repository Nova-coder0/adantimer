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
    homeDesc: "\u062a\u062d\u0642\u0642 \u0645\u0646 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0648\u0627\u0639\u0631\u0641 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062d\u0645\u0629 \u0648\u062c\u062f\u0648\u0644 \u0627\u0644\u0644\u0644 \u0648\u062c\u062d\u0633\u0628 \u0645\u0648\u0642\u0639\u0643.",
    hero: "\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u062d\u0633\u0628 \u0627\u0644\u0645\u062f\u064a\u0646\u0629", sub: "\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u062f\u0642\u064a\u0642\u0629 \u0648\u062a\u0627\u0628\u0639 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0648\u0627\u0646\u062a\u0642\u0644 \u0628\u0633\u0631\u0639\u0629 \u0625\u0644\u0649 \u0623\u064a \u0645\u062f\u064a\u0646\u0629.",
    city: "\u0627\u0644\u0645\u062d\u0642\u064a\u062a", country: "\u0627\u0644\u062f\u0648\u0644\u0629", cityPh: "\u0623\u062f\u062e\u0644 \u0627\u0644\u0645\u062f\u064a\u0646\u0629", countryPh: "\u0627\u0644\u062f\u0648\u0644\u0629 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)", submit: "\u0627\u0639\u0631\u0636 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629",
    nextPrayer: "\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629", current: "\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629", today: "\u0627\u0644\u064a\u0648\u0645", method: "\u0627\u0644\u0637\u0631\u064a\u0642\u0629", loading: "\u062c\u0627\u0631 \u0627\u0644\u062a\u062d\u0645\u064a\u0644...",
    why: "\u0644\u0645\u0627\u0630\u0627 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0641\u064a\u062f\u0629", info: "\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0628\u0646\u064a\u0629 \u0644\u0646\u064a\u0629 \u0627