let cityName = "";
let countryName = "";
const countdownEl = document.getElementById("countdown");
const prayerTimesEl = document.getElementById("prayer-times");
const titleEl = document.getElementById("title");
const locationEl = document.getElementById("location");
const nextPrayerNameEl = document.getElementById("next-prayer-name");

let language = "en";
let currentLocationType = null; // "gps", "ip", "manual"
let manualCoords = null; // {lat, lng}

// Sprachumschaltung
function setLanguage(lang) {
  language = lang;
  if (language === "ar") {
    document.body.setAttribute("dir", "rtl");
    titleEl.innerText = "الصلاة القادمة";
  } else {
    document.body.setAttribute("dir", "ltr");
    titleEl.innerText = "Next Prayer";
  }
  loadPrayerTimes();
}

// GPS Standort abfragen
function getGPSLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err)
    );
  });
}

// IP Standort abfragen (Fallback)
async function getIPLocation() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return { lat: data.latitude, lng: data.longitude, city: data.city, country: data.country_name };
  } catch {
    return null;
  }
}

// Manuelle Eingabe
function setManualLocation(lat, lng, city="", country="") {
  manualCoords = { lat, lng };
  cityName = city;
  countryName = country;
  currentLocationType = "manual";
  loadPrayerTimes();
}

// Hauptfunktion: Gebetszeiten laden
async function loadPrayerTimes() {
  countdownEl.innerText = "Loading...";
  prayerTimesEl.innerHTML = "";
  nextPrayerNameEl.innerText = "";
  locationEl.innerText = "📍 Locating...";

  let coords = null;

  try {
    // 1️⃣ Prüfen: manuelle Eingabe hat Vorrang
    if (currentLocationType === "manual" && manualCoords) {
      coords = manualCoords;
    } else {
      // GPS
      try {
        coords = await getGPSLocation();
        currentLocationType = "gps";
      } catch {
        // IP Fallback
        const ipData = await getIPLocation();
        if (ipData) {
          coords = { lat: ipData.lat, lng: ipData.lng };
          cityName = ipData.city || "";
          countryName = ipData.country || "";
          currentLocationType = "ip";
        } else {
          throw new Error("No location available");
        }
      }
    }

    // 2️⃣ API Call zu Aladhan
    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${coords.lat}&longitude=${coords.lng}&method=2`
    );
    const data = await res.json();
    const times = data.data.timings;

    // Standortanzeige oben
    if (currentLocationType !== "manual") {
      cityName = data.data.meta.timezone || cityName;
      countryName = ""; // optional
    }
    locationEl.innerText = "📍 " + cityName + (countryName ? ", " + countryName : "");

    // Gebetszeiten-Array
    const prayers = [
      { key: "Fajr", label: { en: "Fajr", ar: "الفجر" } },
      { key: "Dhuhr", label: { en: "Dhuhr", ar: "الظهر" } },
      { key: "Asr", label: { en: "Asr", ar: "العصر" } },
      { key: "Maghrib", label: { en: "Maghrib", ar: "المغرب" } },
      { key: "Isha", label: { en: "Isha", ar: "العشاء" } }
    ];

    const now = new Date();
    let nextPrayer = null;

    prayers.forEach(p => {
      const [h, m] = times[p.key].split(":");
      const t = new Date();
      t.setHours(h, m, 0);

      if (!nextPrayer && t > now) {
        nextPrayer = { ...p, time: t };
      }

      const div = document.createElement("div");
      div.innerText = `${p.label[language]} — ${times[p.key]}`;
      prayerTimesEl.appendChild(div);
    });

    if (!nextPrayer) {
      const fajrTomorrow = prayers[0];
      const [h, m] = times["Fajr"].split(":");
      const t = new Date();
      t.setDate(t.getDate() + 1);
      t.setHours(h, m, 0);
      nextPrayer = { ...fajrTomorrow, time: t };
    }

    // Name der nächsten Gebetszeit
    nextPrayerNameEl.innerText = nextPrayer.label[language];

    // Countdown starten
    startCountdown(nextPrayer);

  } catch {
    countdownEl.innerText = "Location permission required.";
    locationEl.innerText = "📍 Location not found";
  }
}

// Countdown-Funktion
function startCountdown(prayer) {
  function tick() {
    const now = new Date();
    const diff = prayer.time - now;

    if (diff <= 0) {
      loadPrayerTimes();
      return;
    }

    const hrs = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

    countdownEl.innerText = `${prayer.label[language]} in ${hrs}:${mins}:${secs}`;
  }

  tick();
  setInterval(tick, 1000);
}

// Seite initial laden
loadPrayerTimes();
