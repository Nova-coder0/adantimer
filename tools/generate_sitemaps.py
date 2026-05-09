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
COUNTRY_BULK_LANGUAGES = {
    # Arabic-first countries.
    "ae": ["ar", "en"],
    "bh": ["ar", "en"],
    "dz": ["fr", "ar", "en"],
    "eg": ["ar", "en"],
    "iq": ["ar", "en"],
    "jo": ["ar", "en"],
    "kw": ["ar", "en"],
    "lb": ["ar", "fr", "en"],
    "ly": ["ar", "en"],
    "ma": ["fr", "ar", "en"],
    "om": ["ar", "en"],
    "ps": ["ar", "en"],
    "qa": ["ar", "en"],
    "sa": ["ar", "en"],
    "sd": ["ar", "en"],
    "sy": ["ar", "en"],
    "tn": ["fr", "ar", "en"],
    "ye": ["ar", "en"],
    # German / French / Turkish / Chinese supported markets.
    "at": ["de", "en"],
    "be": ["fr", "de", "en"],
    "ca": ["en", "fr"],
    "ch": ["de", "fr", "en"],
    "cn": ["zh-hans", "en"],
    "de": ["de", "en"],
    "fr": ["fr", "en"],
    "gb": ["en"],
    "ie": ["en"],
    "lu": ["fr", "de", "en"],
    "sg": ["en", "zh-hans"],
    "tr": ["tr", "en"],
    "us": ["en"],
    "au": ["en"],
    # Portuguese supported markets.
    "br": ["pt", "en"],
    "pt": ["pt", "en"],
    # Spanish supported markets.
    "ar": ["es", "en"],
    "cl": ["es", "en"],
    "co": ["es", "en"],
    "cr": ["es", "en"],
    "do": ["es", "en"],
    "es": ["es", "en"],
    "mx": ["es", "en"],
    "pa": ["es", "en"],
    "pe": ["es", "en"],
    "ve": ["es", "en"],
}
INTENTS = ["", "prayer-times", "next-prayer", "fajr-time", "dhuhr-time", "asr-time", "maghrib-time", "isha-time"]
PRIORITY_INTENTS = ["prayer-times", "next-prayer", "fajr-time", "dhuhr-time", "asr-time", "maghrib-time", "isha-time"]
GSC_WINNER_CITY_LANGUAGES = {
    "oran": ["en", "fr", "ar"],
    "annaba": ["en", "fr", "ar"],
    "bouira": ["en", "fr", "ar"],
    "ain-benian": ["en", "fr", "ar"],
    "chesham": ["en"],
}
CORE_LANGUAGE_HOMES = [
    ("/", "1.0"),
    ("/ar", "0.98"),
    ("/de", "0.74"),
    ("/fr", "0.74"),
    ("/pt", "0.74"),
    ("/es", "0.74"),
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


def sitemap_index(entries: list[str]) -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries)
        + "\n</sitemapindex>\n"
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


def write_sitemap_index(root: pathlib.Path, name: str, targets: list[pathlib.Path], lastmod: str) -> pathlib.Path:
    entries: list[str] = []
    for target in targets:
        entries.append(
            "  <sitemap>\n"
            f"    <loc>{BASE_URL}/{html.escape(target.name, quote=False)}</loc>\n"
            f"    <lastmod>{lastmod}</lastmod>\n"
            "  </sitemap>"
        )
    xml_path = root / f"{name}.xml"
    xml_path.write_text(sitemap_index(entries), encoding="utf-8")
    return xml_path


def supported_bulk_country_codes() -> list[str]:
    return sorted(COUNTRY_BULK_LANGUAGES.keys())


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
    country_languages = COUNTRY_BULK_LANGUAGES.get(code)
    if not country_languages:
        return []
    variant_count = len(INTENTS) * len(country_languages)
    max_cities = max(1, MAX_URLS_PER_SITEMAP // variant_count)
    entries: list[str] = []
    for _population, city_slug in cities[:max_cities]:
        for language in country_languages:
            for intent in INTENTS:
                prefix = "" if language == "en" else f"/{language}"
                path = f"{prefix}/{city_slug}" if not intent else f"{prefix}/{intent}/{city_slug}"
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


def build_gsc_winner_entries(lastmod: str) -> list[str]:
    entries: list[str] = []
    for city_slug, languages in GSC_WINNER_CITY_LANGUAGES.items():
        for language in languages:
            prefix = "" if language == "en" else f"/{language}"
            entries.append(url_entry(f"{BASE_URL}{prefix}/{city_slug}", "0.88", lastmod))
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
    country_codes = supported_bulk_country_codes()

    core = build_core_entries(lastmod)
    intents = build_intent_entries(lastmod)
    top_cities = build_priority_city_entries(ENGLISH_TOP_CITIES, lastmod)
    arabic_core = build_priority_city_entries(ARABIC_CORE_CITIES, lastmod, "ar")
    gsc_winners = build_gsc_winner_entries(lastmod)

    priority_targets = [
        write_priority_sitemap(root, "sitemap-core", core, compressed),
        write_priority_sitemap(root, "sitemap-intents", intents, compressed),
        write_priority_sitemap(root, "sitemap-top-cities", top_cities, compressed),
        write_priority_sitemap(root, "sitemap-ar-core", arabic_core, compressed),
        write_priority_sitemap(root, "sitemap-gsc-winners", gsc_winners, compressed),
    ]

    total_urls = len(core) + len(intents) + len(top_cities) + len(arabic_core) + len(gsc_winners)
    bulk_targets: list[pathlib.Path] = []
    for code in country_codes:
        entries = build_country_entries(code, groups.get(code, []), lastmod)
        if not entries:
            continue
        total_urls += len(entries)
        bulk_targets.append(write_sitemap(root / f"sitemap-{code}.xml", urlset(entries), compressed))

    write_sitemap_index(root, "sitemap-bulk-cities", bulk_targets, lastmod)
    write_sitemap_index(root, "sitemap", priority_targets, lastmod)
    print(
        "Generated "
        f"{len(priority_targets)} priority sitemaps, "
        f"{len(bulk_targets)} bulk country sitemaps, "
        f"and {total_urls:,} URLs "
        f"across {len(country_codes)} supported-language countries"
    )


if __name__ == "__main__":
    main()
