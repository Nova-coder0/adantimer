#!/usr/bin/env python3
"""Generate large country sitemaps for Adantimer.

The generator uses real GeoNames city data through the geonamescache package.
It keeps each sitemap under Google's 50,000 URL limit and can write compressed
.xml.gz files, which Google supports for large sitemap sets.
"""

from __future__ import annotations

import argparse
import gzip
import html
import pathlib
import re
import unicodedata
from collections import defaultdict
from datetime import date

from geonamescache import GeonamesCache

BASE_URL = "https://www.adantimer.com"
MAX_URLS_PER_SITEMAP = 49_000
DEFAULT_COUNTRIES = [
    "ae", "af", "al", "ar", "at", "au", "ba", "bd", "be", "bg", "bh", "bn", "br", "ca", "ch", "cl", "cm", "cn", "co", "cr",
    "de", "dk", "do", "dz", "ee", "eg", "es", "et", "fi", "fr", "gb", "gh", "gr", "hk", "id", "ie", "in", "iq", "ir", "is",
    "it", "jo", "jp", "ke", "kg", "kr", "kw", "kz", "lb", "lk", "lt", "lu", "lv", "ly", "ma", "ml", "mr", "mv", "mx", "my",
    "ne", "ng", "nl", "no", "np", "om", "pa", "pe", "pk", "pl", "ps", "pt", "qa", "ro", "rs", "ru", "sa", "sd", "se", "sg",
    "sn", "sy", "td", "th", "tj", "tm", "tn", "tr", "tw", "tz", "ua", "ug", "us", "uz", "ve", "vn", "ye", "za",
]
ARABIC_COUNTRIES = {"ae", "bh", "dz", "eg", "iq", "jo", "kw", "lb", "ly", "ma", "om", "ps", "qa", "sa", "sd", "sy", "tn", "ye"}
INTENTS = ["", "prayer-times", "next-prayer", "fajr-time", "dhuhr-time", "asr-time", "maghrib-time", "isha-time"]


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"[^\w\s-]", "", value, flags=re.UNICODE)
    value = re.sub(r"\s+", "-", value.strip())
    return value.lower()


def url_entry(url: str, priority: str, lastmod: str) -> str:
    safe_url = html.escape(url, quote=False)
    return (
        "  <url>\n"
        f"    <loc>{safe_url}</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        "    <changefreq>daily</changefreq>\n"
        f"    <priority>{priority}</priority>\n"
        "  </url>"
    )


def urlset(entries: list[str]) -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries)
        + "\n</urlset>\n"
    )


def write_sitemap(path: pathlib.Path, xml: str, compressed: bool) -> pathlib.Path:
    if compressed:
        target = path.with_suffix(path.suffix + ".gz")
        target.write_bytes(gzip.compress(xml.encode("utf-8"), compresslevel=9))
        return target
    path.write_text(xml, encoding="utf-8")
    return path


def discover_country_codes(root: pathlib.Path) -> list[str]:
    found = set(DEFAULT_COUNTRIES)
    for path in root.glob("sitemap-??.xml"):
        found.add(path.stem.replace("sitemap-", "").lower())
    for path in root.glob("sitemap.??.xml"):
        found.add(path.stem.replace("sitemap.", "").lower())
    return sorted(code for code in found if len(code) == 2)


def city_groups() -> dict[str, list[tuple[int, str]]]:
    gc = GeonamesCache()
    grouped: dict[str, dict[str, int]] = defaultdict(dict)
    for city in gc.get_cities().values():
        code = str(city.get("countrycode", "")).lower()
        name = city.get("asciiname") or city.get("name") or ""
        population = int(city.get("population") or 0)
        slug = slugify(name)
        if not code or not slug:
            continue
        grouped[code][slug] = max(population, grouped[code].get(slug, 0))
    return {
        code: sorted(((population, slug) for slug, population in cities.items()), reverse=True)
        for code, cities in grouped.items()
    }


def build_country_entries(code: str, cities: list[tuple[int, str]], lastmod: str) -> list[str]:
    variant_count = len(INTENTS) * (2 if code in ARABIC_COUNTRIES else 1)
    max_cities = max(1, MAX_URLS_PER_SITEMAP // variant_count)
    entries: list[str] = []
    for _population, city_slug in cities[:max_cities]:
        for intent in INTENTS:
            path = f"/{city_slug}" if not intent else f"/{intent}/{city_slug}"
            entries.append(url_entry(f"{BASE_URL}{path}", "0.84" if not intent else "0.78", lastmod))
        if code in ARABIC_COUNTRIES:
            for intent in INTENTS:
                path = f"/ar/{city_slug}" if not intent else f"/ar/{intent}/{city_slug}"
                entries.append(url_entry(f"{BASE_URL}{path}", "0.84" if not intent else "0.78", lastmod))
    if not entries:
        entries.append(url_entry(f"{BASE_URL}/{code}", "0.50", lastmod))
    return entries[:MAX_URLS_PER_SITEMAP]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="Project root")
    parser.add_argument("--uncompressed", action="store_true", help="Write plain .xml country files instead of .xml.gz")
    args = parser.parse_args()

    root = pathlib.Path(args.root).resolve()
    lastmod = date.today().isoformat()
    compressed = not args.uncompressed
    groups = city_groups()
    country_codes = discover_country_codes(root)

    core = [
        url_entry(f"{BASE_URL}/", "1.0", lastmod),
        url_entry(f"{BASE_URL}/ar", "0.95", lastmod),
        url_entry(f"{BASE_URL}/prayer-times", "0.95", lastmod),
        url_entry(f"{BASE_URL}/next-prayer", "0.95", lastmod),
        url_entry(f"{BASE_URL}/fajr-time", "0.90", lastmod),
        url_entry(f"{BASE_URL}/dhuhr-time", "0.90", lastmod),
        url_entry(f"{BASE_URL}/asr-time", "0.90", lastmod),
        url_entry(f"{BASE_URL}/maghrib-time", "0.90", lastmod),
        url_entry(f"{BASE_URL}/isha-time", "0.90", lastmod),
    ]
    sitemap_targets = [write_sitemap(root / "sitemap-core.xml", urlset(core), compressed)]

    total_urls = len(core)
    for code in country_codes:
        entries = build_country_entries(code, groups.get(code, []), lastmod)
        total_urls += len(entries)
        sitemap_targets.append(write_sitemap(root / f"sitemap-{code}.xml", urlset(entries), compressed))

    index_entries = []
    for target in sitemap_targets:
        index_entries.append(
            "  <sitemap>\n"
            f"    <loc>{BASE_URL}/{html.escape(target.name, quote=False)}</loc>\n"
            f"    <lastmod>{lastmod}</lastmod>\n"
            "  </sitemap>"
        )
    index = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(index_entries)
        + "\n</sitemapindex>\n"
    )
    (root / "sitemap.xml").write_text(index, encoding="utf-8")
    print(f"Generated {len(sitemap_targets)} sitemap files with {total_urls:,} URLs")


if __name__ == "__main__":
    main()
