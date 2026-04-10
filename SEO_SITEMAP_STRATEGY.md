# Adantimer SEO Sitemap Strategy

This project uses a large sitemap network because Adantimer competes in a global, location-heavy search category: prayer times, salah times, salat times, gebetszeiten, namaz vakitleri, Fajr, Dhuhr/Duhr, Asr, Maghrib, Isha, and next prayer queries.

## Goal

The goal is not to create empty files or fake URLs. The goal is to give search engines a clean global map of real, crawlable city pages across the most important countries and continents.

## Sitemap Structure

- `sitemap.xml` is the sitemap index submitted to Google Search Console.
- `sitemap-core.xml.gz` contains the main intent pages.
- `sitemap-xx.xml.gz` files contain country-specific city URLs.
- Each country sitemap stays below 50,000 URLs.
- Arabic-market countries include both English/global and `/ar/...` Arabic URL patterns.

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

The local test generated more than one million city + prayer-intent URLs while keeping the largest sitemap below 50,000 URLs.
