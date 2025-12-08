let cityName = "";
let countryName = "";
const countdownEl = document.getElementById("countdown");
const prayerTimesEl = document.getElementById("prayer-times");
const titleEl = document.getElementById("title");
const locationEl = document.getElementById("location");
const nextPrayerNameEl = document.getElementById("next-prayer-name");
const manualInputEl = document.getElementById("manual-location"); // Eingabefeld für Stadt/Land

let language = "en";

// Sprache wechseln
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

// GPS-Standort abrufen
function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err)
    );
  });
}

// IP-Standort als Fallback
async function getLocationFromIP() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return { lat: data.latitude, lng: data.longitude, city: data.city, country: data.country_name };
  } catch {
    return null;
  }
}

// Koordinaten von manueller Eingabe
async function getCoordinatesFromInput(city, country) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ',' + country)}`
    );
    const data = await res.json();
    if (data.length > 0) return { lat: data[0].lat, lng: data[0].lon, city: data[0].display_name };
  } catch {}
  return null;
}

// Hauptfunktion zum Laden der Gebetszeiten
async function loadPrayerTimes(manualCity = null, manualCountry = null) {
  countdownEl.innerText = "Loading...";
  prayerTimesEl.innerHTML = "";
  nextPrayerNameEl.innerText = "";
  locationEl.innerText = "📍 Locating...";

  let coords = null;

  // 1️⃣ Manueller Input hat Vorrang
  if (manualCity && manualCountry) {
    coords = await getCoordinatesFromInput(manualCity, manualCountry);
  }

  // 2️⃣ GPS
  if (!coords) {
    try {
      coords = await getLocation();
    } catch {
      coords = null;
    }
  }

  // 3️⃣ IP-Fallback
  if (!coords) {
    coords = await getLocationFromIP();
  }

  if (!coords) {
    locationEl.innerText = "📍 Location not found";
    countdownEl.innerText = "Unable to determine location.";
    return;
  }

  // Gebetszeiten von API abrufen
  try {
    const { lat, lng } = coords;
    const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`);
    const data = await res.json();
    const times = data.data.timings;

    cityName = coords.city || data.data.meta.timezone || "";
    countryName = coords.country || "";

    locationEl.innerText = "📍 " + cityName + (countryName ? ", " + countryName : "");

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

      if (!nextPrayer && t > now) nextPrayer = { ...p, time: t };

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

    nextPrayerNameEl.innerText = nextPrayer.label[language];
    startCountdown(nextPrayer);

  } catch {
    countdownEl.innerText = "Error loading prayer times.";
  }
}

// Countdown starten
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

// Eventlistener für manuelle Eingabe
document.getElementById("manual-submit").addEventListener("click", () => {
  const city = document.getElementById("manual-city").value;
  const country = document.getElementById("manual-country").value;
  if (city && country) loadPrayerTimes(city, country);
});

// Initial laden
loadPrayerTimes();
