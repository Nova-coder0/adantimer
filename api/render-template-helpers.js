import { LOCALES } from "./render-data.js";
import { buildRoutePath, getLocalizedCityName } from "./render-copy.js";

export function renderHero(copy) {
  return `        <section class="hero-copy">
          <p class="eyebrow">${escapeHtml(copy.heroEyebrow)}</p>
          <h1 id="hero-heading">${escapeHtml(copy.heroHeading)}</h1>
          <p id="hero-subtitle" class="hero-subtitle">${escapeHtml(copy.heroSubtitle)}</p>
          <form id="location-form" class="location-form" novalidate>
            <label class="sr-only" for="manual-city">${escapeHtml(copy.cityLabel)}</label>
            <input type="text" id="manual-city" name="city" placeholder="${escapeHtml(copy.cityPlaceholder)}" autocomplete="address-level2">
            <label class="sr-only" for="manual-country">${escapeHtml(copy.countryLabel)}</label>
            <input type="text" id="manual-country" name="country" placeholder="${escapeHtml(copy.countryPlaceholder)}" autocomplete="country-name">
            <button id="set-location-btn" type="submit">${escapeHtml(copy.submitLabel)}</button>
          </form>
          <div class="popular-cities" aria-label="${escapeHtml(copy.topCitiesAria)}">
${copy.topCities.map(item => `            <a class="city-chip" href="${escapeHtml(buildRoutePath(copy.activeLanguage, "home", item.city))}" data-city="${escapeHtml(item.city)}" data-country="${escapeHtml(item.country)}">${escapeHtml(getLocalizedCityName(item, copy.activeLanguage))}</a>`).join("\n")}
          </div>
          <div class="intent-links" aria-label="${escapeHtml(copy.intentAria)}">
${copy.intentLinks.map(item => `            <a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`).join("\n")}
          </div>
        </section>`;
}

export function renderNextPrayer(copy) {
  return `        <aside class="next-prayer card featured-card" aria-live="polite">
          <p class="card-label" id="location-status">${escapeHtml(copy.locationStatus)}</p>
          <h2 id="title">${escapeHtml(copy.nextPrayerTitle)}</h2>
          <div id="next-prayer-name" class="highlight"></div>
          <div id="countdown" class="countdown">${escapeHtml(copy.loadingLabel)}</div>
          <div class="mini-stats">
            <div class="mini-stat"><span id="current-prayer-label">${escapeHtml(copy.currentPrayerLabel)}</span><strong id="current-prayer-value">${escapeHtml(copy.loadingLabel)}</strong></div>
            <div class="mini-stat"><span id="today-label">${escapeHtml(copy.todayLabel)}</span><strong id="today-date-value">${escapeHtml(copy.loadingLabel)}</strong></div>
            <div class="mini-stat"><span id="method-label">${escapeHtml(copy.methodLabel)}</span><strong id="method-value">${escapeHtml(copy.loadingLabel)}</strong></div>
          </div>
          <p id="location" class="location">${escapeHtml(copy.locationText)}</p>
        </aside>`;
}

export function renderSchedule(copy) {
  return `      <section class="card schedule-card" aria-labelledby="schedule-heading">
        <div class="section-head">
          <div><p class="eyebrow">${escapeHtml(copy.scheduleEyebrow)}</p><h2 id="schedule-heading">${escapeHtml(copy.scheduleHeading)}</h2></div>
          <p id="schedule-summary" class="muted">${escapeHtml(copy.scheduleSummary)}</p>
        </div>
        <div id="prayer-times" class="prayer-times"></div>
      </section>`;
}

export function renderInfo(copy) {
  return `      <section class="card info-card" aria-labelledby="why-heading">
        <p class="eyebrow">${escapeHtml(copy.infoEyebrow)}</p>
        <h2 id="why-heading">${escapeHtml(copy.infoTitle)}</h2>
        <ul class="feature-list">
${copy.features.map(item => `          <li>${escapeHtml(item)}</li>`).join("\n")}
        </ul>
      </section>`;
}

export function renderCities(copy) {
  return `    <section class="card prose" aria-labelledby="cities-heading">
      <p class="eyebrow">${escapeHtml(copy.citiesEyebrow)}</p>
      <h2 id="cities-heading">${escapeHtml(copy.citiesTitle)}</h2>
      <p>${renderInlineLinks(copy.cityLinks, copy.activeLanguage)}</p>
      <p>${renderInlineLinks(copy.cityIntentLinks, copy.activeLanguage)}</p>
    </section>`;
}

export function renderAbout(copy) {
  return `      <article class="card prose" aria-labelledby="about-heading">
        <p class="eyebrow">${escapeHtml(copy.aboutEyebrow)}</p>
        <h2 id="about-heading">${escapeHtml(copy.aboutTitle)}</h2>
${copy.aboutParagraphs.map(item => `        <p>${escapeHtml(item)}</p>`).join("\n")}
      </article>`;
}

export function renderFaq(copy) {
  return `      <section class="card prose" aria-labelledby="faq-heading">
        <p class="eyebrow">${escapeHtml(copy.faqEyebrow)}</p>
        <h2 id="faq-heading">${escapeHtml(copy.faqTitle)}</h2>
        <div class="faq-list">
${copy.faq.map(item => `          <div><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></div>`).join("\n")}
        </div>
      </section>`;
}

export function renderFooter(copy) {
  return `  <footer class="shell footer"><p>&copy; 2026 Adantimer. ${escapeHtml(copy.footerText)}</p></footer>`;
}

export function renderNoscript(copy) {
  return `  <noscript><div class="noscript-banner">${escapeHtml(copy.noscriptText)}</div></noscript>`;
}

function renderInlineLinks(items, language) {
  if (!items.length) return "";
  if (items.length === 1) {
    return `<a href="${escapeHtml(items[0].href)}">${escapeHtml(items[0].label)}</a>.`;
  }
  const locale = LOCALES[language] || LOCALES.en;
  const last = items[items.length - 1];
  const rest = items.slice(0, -1).map(item => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`).join(", ");
  return `${rest}, ${escapeHtml(locale.listConnector)} <a href="${escapeHtml(last.href)}">${escapeHtml(last.label)}</a>.`;
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
