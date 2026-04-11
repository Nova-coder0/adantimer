import { readFile } from "node:fs/promises";
import path from "node:path";
import { applyTemplate } from "./render-template.js";
import { buildMeta, buildRoutePath, buildServerCopy, getAlternates, normalizeCity, normalizeLanguage, normalizePageType } from "./render-copy.js";

const SITE_URL = "https://www.adantimer.com";
const INDEX_PATH = path.join(process.cwd(), "index.html");

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const language = normalizeLanguage(url.searchParams.get("lang"));
    const pageType = normalizePageType(url.searchParams.get("type"));
    const city = normalizeCity(url.searchParams.get("city") || "");
    const canonical = `${SITE_URL}${buildRoutePath(language, pageType, city)}`;
    const alternates = getAlternates(SITE_URL, pageType, city);
    const { description, locale, place, title, topic } = buildMeta(language, pageType, city);
    const copy = buildServerCopy(language, pageType, place, topic);
    const template = await readFile(INDEX_PATH, "utf8");
    const html = applyTemplate(template, { alternates, canonical, copy, description, locale, pageType, title });

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400"
      }
    });
  } catch (error) {
    console.error("render failed", error);
    return new Response("Adantimer render failed", { status: 500 });
  }
}
