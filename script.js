let cityName = "";
let countryName = "";
const countdownEl = document.getElementById("countdown");
const prayerTimesEl = document.getElementById("prayer-times");
const titleEl = document.getElementById("title");
const locationEl = document.getElementById("location");
const nextPrayerNameEl = document.getElementById("next-prayer-name");

let language = "en";

// Sprache umschalten
function setLanguage(lang) {
  language = lang;

  // RTL/LTR Body setzen
  if (language === "ar") {
    document.body.setAttribute("dir", "rtl");
    titleEl.innerText = "الصلاة القادمة";
  } else {
    document.body.setAttribute("dir", "ltr");
    titleEl.innerText = "Next Prayer";
  }

  loadPrayerTimes();
}

// GPS-basierten Standort abrufen
function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err)
    );
  });
}

// Reverse-Geocoding: Koordinaten → Stadt/Land
async function getCityCountry(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    const city = data.address.city || data.address.town || data.address.village || "";
    const country = data.address.country || "";
    return { city, country };
  } catch {
    return { city: "", country: "" };
  }
}

// Gebetszeiten laden
async function loadPrayerTimes() {
  countdownEl.innerText = "Loading...";
  prayerTimesEl.innerHTML = "";
  nextPrayerNameEl.innerText = "";
  locationEl.innerText = "📍 Locating...";

  try {
    const { lat, lng } = await getLocation();

    // Standort abrufen
    const location = await getCityCountry(lat, lng);
    cityName = location.city;
    countryName = location.country;
    locationEl.innerText = "📍 " + cityName + (countryName ? ", " + countryName : "");

    // Gebetszeiten von API
    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`
    );
    const data = await res.json();
    const times = data.data.timings;

    // Gebetszeiten-Labels
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

    // Falls kein nächstes Gebet mehr heute, Fajr morgen
    if (!nextPrayer) {
      const fajrTomorrow = prayers[0];
      const [h, m] = times["Fajr"].split(":");
      const t = new Date();
      t.setDate(t.getDate() + 1);
      t.setHours(h, m, 0);
      nextPrayer = { ...fajrTomorrow, time: t };
    }

    // Nächstes Gebet anzeigen
    nextPrayerNameEl.innerText = nextPrayer.label[language];

    startCountdown(nextPrayer);

  } catch {
    countdownEl.innerText = "Location permission required.";
    locationEl.innerText = "📍 Location not found";
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

// Initial laden
loadPrayerTimes();
