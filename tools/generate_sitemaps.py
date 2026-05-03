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
import json
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
PRIORITY_INTENTS = ["prayer-times", "next-prayer", "fajr-time", "dhuhr-time", "asr-time", "maghrib-time", "isha-time"]
CORE_LANGUAGE_HOMES = [
    ("/", "1.0"),
    ("/ar", "0.98"),
    ("/de", "0.74"),
    ("/fr", "0.74"),
    ("/tr", "0.74"),
    ("/zh-hans", "0.74"),
]
PRIORITY_CONFIG_PATH = pathlib.Path(__file__).resolve().parents[1] / "data" / "priority-cities.json"
PRIORITY_CITY_CONFIG = json.loads(PRIORITY_CONFIG_PATH.read_text(encoding="utf-8"))
PRIORITY_CITY_GROUPS = {group["id"]: group["cities"] for group in PRIORITY_CITY_CONFIG["groups"]}


def priority_group_slugs(group_ids: list[str]) -> list[str]:
    slugs: list[str] = []
    for group_id in group_ids:
        for city in PRIORITY_CITY_GROUPS.get(group_id, []):
            slug = city["slug"]
            if slug not in slugs:
                slugs.append(slug)
    return slugs


ENGLISH_TOP_CITIES = priority_group_slugs(PRIORITY_CITY_CONFIG["sitemaps"]["englishTopGroups"])
ARABIC_CORE_CITIES = priority_group_slugs(PRIORITY_CITY_CONFIG["sitemaps"]["arabicCoreGroups"])


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


def write_priority_sitemap(root: pathlib.Path, name: str, entries: list[str], compressed: bool) -> pathlib.Path:
    xml_path = root / f"{name}.xml"
    write_sitemap(xml_path, urlset(entries), False)
    if compressed:
        write_sitemap(xml_path, urlset(entries), True)
    return xml_path


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
            entries.append(url_entry(f"{BASE_URL}{path}", "0.62" if not intent else "0.56", lastmod))
        if code in ARABIC_COUNTRIES:
            for intent in INTENTS:
                path = f"/ar/{city_slug}" if not intent else f"/ar/{intent}/{city_slug}"
                entries.append(url_entry(f"{BASE_URL}{path}", "0.62" if not intent else "0.56", lastmod))
    if not entries:
        entries.append(url_entry(f"{BASE_URL}/{code}", "0.50", lastmod))
    return entries[:MAX_URLS_PER_SITEMAP]


def build_core_entries(lastmod: str) -> list[str]:
    return [url_entry(f"{BASE_URL}{path}", priority, lastmod) for path, priority in CORE_LANGUAGE_HOMES]


def build_intent_entries(lastmod: str) -> list[str]:
    entries: list[str] = []
    for intent in PRIORITY_INTENTS:
        entries.append(url_entry(f"{BASE_URL}/{intent}", "0.94", lastmod))
        entries.append(url_entry(f"{BASE_URL}/ar/{intent}", "0.91", lastmod))
    return entries


def build_priority_city_entries(cities: list[str], lastmod: str, language_prefix: str = "") -> list[str]:
    entries: list[str] = []
    prefix = f"/{language_prefix}" if language_prefix else ""
    home_priority = "0.93" if not language_prefix else "0.9"
    intent_priority = "0.87" if not language_prefix else "0.84"
    for city_slug in cities:
        entries.append(url_entry(f"{BASE_URL}{prefix}/{city_slug}", home_priority, lastmod))
        for intent in PRIORITY_INTENTS:
            entries.append(url_entry(f"{BASE_URL}{prefix}/{intent}/{city_slug}", intent_priority, lastmod))
    return entries


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

    core = build_core_entries(lastmod)
    intents = build_intent_entries(lastmod)
    top_cities = build_priority_city_entries(ENGLISH_TOP_CITIES, lastmod)
    arabic_core = build_priority_city_entries(ARABIC_CORE_CITIES, lastmod, "ar")

    sitemap_targets = [
        write_priority_sitemap(root, "sitemap-core", core, compressed),
        write_priority_sitemap(root, "sitemap-intents", intents, compressed),
        write_priority_sitemap(root, "sitemap-top-cities", top_cities, compressed),
        write_priority_sitemap(root, "sitemap-ar-core", arabic_core, compressed),
    ]

    total_urls = len(core) + len(intents) + len(top_cities) + len(arabic_core)
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
