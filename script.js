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
let countdownInterval = null;

// =================== LANGUAGE ===================
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

// =================== GPS ===================
function getGPSLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// =================== IP FALLBACK ===================
async function getIPLocation() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return {
      lat: data.latitude,
      lng: data.longitude
    };
  } catch {
    return null;
  }
}

// =================== REVERSE GEOCODE ===================
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const json = await res.json();
    const addr = json.address || {};
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.hamlet ||
      "";
    const country = addr.country || "";
    return { city, country };
  } catch {
    return { city: "", country: "" };
  }
}

// =================== MANUAL ===================
function setManualLocation(lat, lng, city = "", country = "") {
  manualCoords = { lat, lng };
  cityName = city;
  countryName = country;
  currentLocationType = "manual";
  loadPrayerTimes();
}

// =================== CORE ===================
async function loadPrayerTimes() {
  countdownEl.innerText = "Loading...";
  prayerTimesEl.innerHTML = "";
  nextPrayerNameEl.innerText = "";
  locationEl.innerText = "📍 Locating...";

  let coords = null;

  try {
    // MANUAL FIRST
    if (currentLocationType === "manual" && manualCoords) {
      coords = manualCoords;
    } else {
      try {
        coords = await getGPSLocation();
        currentLocationType = "gps";
      } catch {
        const ip = await getIPLocation();
        if (!ip) throw new Error();
        coords = ip;
        currentLocationType = "ip";
      }
    }

    // PRAYER TIMES
    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${coords.lat}&longitude=${coords.lng}&method=2`
    );
    const data = await res.json();
    const times = data.data.timings;

    // REAL LOCATION NAME (FIX ✅)
    if (currentLocationType !== "manual") {
      const loc = await reverseGeocode(coords.lat, coords.lng);
      cityName = loc.city || "Your location";
      countryName = loc.country || "";
    }

    locationEl.innerText =
      "📍 " + cityName + (countryName ? ", " + countryName : "");

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
      const [h, m] = times.Fajr.split(":");
      const t = new Date();
      t.setDate(t.getDate() + 1);
      t.setHours(h, m, 0);
      nextPrayer = {
        key: "Fajr",
        label: prayers[0].label,
        time: t
      };
    }

    nextPrayerNameEl.innerText = nextPrayer.label[language];
    startCountdown(nextPrayer);
  } catch {
    countdownEl.innerText = "Location permission required.";
    locationEl.innerText = "📍 Location not found";
  }
}

// =================== COUNTDOWN ===================
function startCountdown(prayer) {
  function tick() {
    const diff = prayer.time - new Date();
    if (diff <= 0) {
      loadPrayerTimes();
      return;
    }

    const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

    countdownEl.innerText = `${prayer.label[language]} in ${h}:${m}:${s}`;
  }

  clearInterval(countdownInterval);
  tick();
  countdownInterval = setInterval(tick, 1000);
}

// =================== INIT ===================
loadPrayerTimes();

