const countdownEl = document.getElementById("countdown");
const prayerTimesEl = document.getElementById("prayer-times");
const titleEl = document.getElementById("title");

let language = "en";

function setLanguage(lang) {
  language = lang;
  loadPrayerTimes();
}

function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }),
      err => reject(err)
    );
  });
}

async function loadPrayerTimes() {
  countdownEl.innerText = "Loading...";
  prayerTimesEl.innerHTML = "";

  try {
    const { lat, lng } = await getLocation();
    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`
    );
    const data = await res.json();
    const times = data.data.timings;

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

    titleEl.innerText =
      language === "ar" ? "الصلاة القادمة" : "Next Prayer";

    startCountdown(nextPrayer);

  } catch {
    countdownEl.innerText = "Location permission required.";
  }
}

function startCountdown(prayer) {
  function tick() {
    const now = new Date();
    const diff = prayer.time - now;

    if (diff <= 0) {
      loadPrayerTimes();
      return;
    }

    const hrs = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const mins = String(
      Math.floor((diff % 3600000) / 60000)
    ).padStart(2, "0");
    const secs = String(
      Math.floor((diff % 60000) / 1000)
    ).padStart(2, "0");

    countdownEl.innerText =
      `${prayer.label[language]} in ${hrs}:${mins}:${secs}`;
  }

  tick();
  setInterval(tick, 1000);
}

loadPrayerTimes();
