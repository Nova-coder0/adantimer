(() => {
  const originalFetch = typeof window.fetch === "function" ? window.fetch.bind(window) : null;
  const responseCtor = typeof Response === "function" ? Response : null;

  if (!originalFetch) return;

  const abortableFetch = (input, init = {}, timeoutMs = 7000) => {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : null;
    const upstreamSignal = init && init.signal;
    const handleAbort = () => controller && controller.abort();

    if (controller && upstreamSignal) {
      if (upstreamSignal.aborted) controller.abort();
      else upstreamSignal.addEventListener("abort", handleAbort, { once: true });
    }

    const requestInit = controller ? { ...init, signal: controller.signal } : init;

    return originalFetch(input, requestInit).finally(() => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (upstreamSignal) upstreamSignal.removeEventListener("abort", handleAbort);
    });
  };

  const buildIpApiFallbackResponse = data => {
    if (!responseCtor || !data || !data.success || !data.latitude || !data.longitude) return null;
    return new responseCtor(
      JSON.stringify({
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city || "",
        country_name: data.country || ""
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  };

  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : (input && input.url) || "";

    if (url.startsWith("https://ipapi.co/json/")) {
      try {
        const fallbackResponse = await abortableFetch("https://ipwho.is/", {}, 3500);
        const fallbackJson = await fallbackResponse.json();
        const rewritten = buildIpApiFallbackResponse(fallbackJson);
        if (rewritten) return rewritten;
      } catch {
        // Fall back to the original provider below.
      }
      return abortableFetch(input, init, 3500);
    }

    if (url.startsWith("https://api.aladhan.com/")) {
      return abortableFetch(input, init, 8000);
    }

    if (url.startsWith("https://nominatim.openstreetmap.org/")) {
      return abortableFetch(input, init, 7000);
    }

    return originalFetch(input, init);
  };

  const loadingPattern = /loading|wird geladen|chargement|yukleniyor|加载中|جار التحميل/i;

  const getLocaleMessages = () => {
    const lang = (document.documentElement.lang || "en").toLowerCase();
    if (lang.startsWith("ar")) {
      return {
        title: "تعذر تحميل المواقيت الآن.",
        subtitle: "جرّب تحديث الصفحة أو ابحث عن مدينة يدويًا."
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
        title: "Namaz vakitleri yüklenemedi.",
        subtitle: "Sayfayı yenileyin veya bir şehri manuel arayın."
      };
    }
    if (lang.startsWith("zh")) {
      return {
        title: "暂时无法加载礼拜时间。",
        subtitle: "请刷新页面，或手动搜索城市。"
      };
    }
    return {
      title: "Prayer times could not be loaded.",
      subtitle: "Refresh the page or search for a city manually."
    };
  };

  const looksStuck = () => {
    const countdown = document.getElementById("countdown");
    const locationStatus = document.getElementById("location-status");
    const prayerTimes = document.getElementById("prayer-times");

    if (!countdown || !locationStatus || !prayerTimes) return false;

    const countdownText = (countdown.textContent || "").trim();
    const statusText = (locationStatus.textContent || "").trim();

    return loadingPattern.test(countdownText) && prayerTimes.children.length === 0 && (loadingPattern.test(statusText) || /detect/i.test(statusText));
  };

  const replaceLoadingState = () => {
    if (!looksStuck()) return;

    const { title, subtitle } = getLocaleMessages();
    const countdown = document.getElementById("countdown");
    const locationStatus = document.getElementById("location-status");
    const location = document.getElementById("location");
    const currentPrayer = document.getElementById("current-prayer-value");
    const todayDate = document.getElementById("today-date-value");
    const method = document.getElementById("method-value");

    if (countdown) countdown.textContent = title;
    if (locationStatus) locationStatus.textContent = title;
    if (location) location.textContent = subtitle;
    if (currentPrayer && loadingPattern.test(currentPrayer.textContent || "")) currentPrayer.textContent = "—";
    if (todayDate && loadingPattern.test(todayDate.textContent || "")) todayDate.textContent = "—";
    if (method && loadingPattern.test(method.textContent || "")) method.textContent = "—";
  };

  window.setTimeout(replaceLoadingState, 12000);
  window.addEventListener("error", () => window.setTimeout(replaceLoadingState, 0));
  window.addEventListener("unhandledrejection", () => window.setTimeout(replaceLoadingState, 0));
})();
