# Adantimer SEO Sitemap Strategy

This project uses a large sitemap network because Adantimer competes in a global, location-heavy search category: prayer times, salah times, salat times, gebetszeiten, namaz vakitleri, Fajr, Dhuhr/Duhr, Asr, Maghrib, Isha, and next prayer queries.

## Goal

The goal is not to create empty files or fake URLs. The goal is to give search engines a clean global map of real, crawlable city pages across the most important countries and continents.

## Sitemap Structure

- `sitemap.xml` is the prioritized sitemap index submitted to Google Search Console.
- `sitemap-core.xml` contains the main language home routes.
- `sitemap-intents.xml` contains the core prayer intent routes.
- `sitemap-top-cities.xml` contains reviewed top-city routes and their intent pages.
- `sitemap-ar-core.xml` contains reviewed Arabic core-city routes and their intent pages.
- `sitemap-gsc-winners.xml` contains routes that already show real Google Search Console impression signals.
- `sitemap-bulk-cities.xml` is a secondary sitemap index for bulk country sitemaps.
- `sitemap-xx.xml.gz` files contain country-specific city URLs.
- Each country sitemap stays below 50,000 URLs.
- Bulk country sitemaps are generated only for countries whose main 1-3 search languages are actually supported by the site.
- Arabic-market countries include both English/global and `/ar/...` Arabic URL patterns.

## Priority Rule

The main sitemap index is not a dump of every generated URL anymore.

It is intentionally limited to priority sitemap files that represent:

- reviewed core hubs
- reviewed top cities
- reviewed Arabic core routes
- real GSC winner pages

Bulk city sitemaps remain available through `sitemap-bulk-cities.xml`, but they are no longer mixed into the main sitemap signal by default.

That bulk layer is also intentionally filtered. If a country would only be served with obviously wrong language combinations, it does not belong in the active bulk sitemap index yet.

## Canonical URL Rule

Only canonical URLs belong in the sitemap. This is important.

A searcher may write many different versions of the same intent: `prayer times`, `salah time`, `salat`, `duhr`, `dhuhr`, `gebetszeiten`, or `namaz vakitleri`.

We should cover those words in titles, headings, page copy, FAQ, internal links, and redirect/alias routes. But we should not put every spelling variant into the sitemap if they all show the same content. That creates duplicate pages and weakens crawl quality.

## Canonical Intent Pages

The sitemap generator uses these canonical intent patterns:

- `/{city}`
- `/prayer-times/{city}`
- `/next-prayer/{city}`
- `/fajr-time/{city}`
- `/dhuhr-time/{city}`
- `/asr-time/{city}`
- `/maghrib-time/{city}`
- `/isha-time/{city}`
- `/ar/{city}` for Arabic-market countries
- `/ar/{intent}/{city}` for Arabic-market countries

## Scale

The generator uses real GeoNames city data through `geonamescache`. This lets us scale toward a large competitor-style SEO structure while avoiding invented or low-quality URLs.

That scale should not be pushed to Google as one undifferentiated priority signal on a young domain. The generator therefore keeps two layers:

- a small, prioritized sitemap index for the strongest pages
- a separate bulk-city sitemap index for longtail inventory
