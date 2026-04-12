(() => {
  const nativeFetch = typeof window.fetch === "function" ? window.fetch.bind(window) : null;
  const ResponseCtor = typeof Response === "function" ? Response : null;

  if (!nativeFetch) return;

  function fetchWithTimeout(input, init = {}, timeoutMs = 7000) {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : null;
    const upstreamSignal = init && init.signal;
    const abortForwarder = () => controller && controller.abort();

    if (controller && upstreamSignal) {
      if (upstreamSignal.aborted) controller.abort();
      else upstreamSignal.addEventListener("abort", abortForwarder, { once: true });
    }

    const nextInit = controller ? { ...init, signal: controller.signal } : init;

    return nativeFetch(input, nextInit).finally(() => {
      if (timer) window.clearTimeout(timer);
      if (upstreamSignal) upstreamSignal.removeEventListener("abort", abortForwarder);
    });
  }

  function buildIpApiResponse(data) {
    if (!ResponseCtor || !data || data.success === false) return null;
    if (!Number.isFinite(Number(data.latitude)) || !Number.isFinite(Number(data.longitude))) return null;

    return new ResponseCtor(
      JSON.stringify({
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        city: data.city || "",
        country_name: data.country || ""
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : (input && input.url) || "";

    if (url.startsWith("https://ipapi.co/json/")) {
      try {
        const fallbackResponse = await fetchWithTimeout("https://ipwho.is/", {}, 3500);
        const fallbackJson = await fallbackResponse.json();
        const rewritten = buildIpApiResponse(fallbackJson);
        if (rewritten) return rewritten;
      } catch {
        // Fall through to the original provider if the fallback fails.
      }
      return fetchWithTimeout(input, init, 3500);
    }

    if (url.startsWith("https://ipwho.is/")) {
      return fetchWithTimeout(input, init, 3500);
    }

    if (url.startsWith("https://nominatim.openstreetmap.org/")) {
      return fetchWithTimeout(input, init, 7000);
    }

    if (url.startsWith("https://api.aladhan.com/")) {
      return fetchWithTimeout(input, init, 8000);
    }

    return nativeFetch(input, init);
  };

  const loadingPattern = /loading|wird geladen|chargement|yukleniyor|detect|locating|trying gps/i;

  function getFallbackCopy() {
    const lang = (document.documentElement.lang || "en").toLowerCase();

    if (lang.startsWith("ar")) {
      return {
        title: "ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…ÙˆØ§Ù‚ÙŠØª Ø­Ø§Ù„ÙŠØ§.",
        subtitle: "Ø­Ø¯Ø« Ø§Ù„ØµÙØ­Ø© Ø£Ùˆ Ø§Ø¨Ø­Ø« Ø¹Ù† Ù…Ø¯ÙŠÙ†Ø© ÙŠØ¯ÙˆÙŠØ§."
      };
    }

    if (lang.startsWith("de")) {
      return {
        title: "Die Gebetszeiten konnten nicht geladen werden.",
        subtitle: "Bitte lade die Seite neu oder suche manuell nach einer Stadt."
      };
    }

    if (lang.startsWith("fr")) {
      return {
        title: "Impossible de charger les horaires.",
        subtitle: "Recharge la page ou recherche une ville manuellement."
      };
    }

    if (lang.startsWith("tr")) {
      return {
        title: "Namaz vakitleri su anda yuklenemedi.",
        subtitle: "Sayfayi yenileyin veya sehri manuel arayin."
      };
    }

    if (lang.startsWith("zh")) {
      return {
        title: "Prayer times could not be loaded.",
        subtitle: "Refresh the page or search for a city manually."
      };
    }

    return {
      title: "Prayer times could not be loaded.",
      subtitle: "Refresh the page or search for a city manually."
    };
  }

  function stillLooksStuck() {
    const countdown = document.getElementById("countdown");
    const prayerTimes = document.getElementById("prayer-times");
    const status = document.getElementById("location-status");

    if (!countdown || !prayerTimes || !status) return false;

    const countdownText = (countdown.textContent || "").trim().toLowerCase();
    const statusText = (status.textContent || "").trim().toLowerCase();

    return prayerTimes.children.length === 0
      && loadingPattern.test(countdownText)
      && loadingPattern.test(statusText);
  }

  function replaceEndlessLoading() {
    if (!stillLooksStuck()) return;

    const copy = getFallbackCopy();
    const countdown = document.getElementById("countdown");
    const status = document.getElementById("location-status");
    const location = document.getElementById("location");
    const currentPrayer = document.getElementById("current-prayer-value");
    const todayDate = document.getElementById("today-date-value");
    const method = document.getElementById("method-value");

    if (countdown) countdown.textContent = copy.title;
    if (status) status.textContent = copy.title;
    if (location) location.textContent = copy.subtitle;
    if (currentPrayer && loadingPattern.test(currentPrayer.textContent || "")) currentPrayer.textContent = "-";
    if (todayDate && loadingPattern.test(todayDate.textContent || "")) todayDate.textContent = "-";
    if (method && loadingPattern.test(method.textContent || "")) method.textContent = "-";
  }

  window.setTimeout(replaceEndlessLoading, 12000);
  window.addEventListener("error", () => window.setTimeout(replaceEndlessLoading, 0));
  window.addEventListener("unhandledrejection", () => window.setTimeout(replaceEndlessLoading, 0));
})();
