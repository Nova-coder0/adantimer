param(
  [switch]$RunLive,
  [string]$BaseUrl = "https://www.adantimer.com"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$failures = New-Object System.Collections.Generic.List[string]
$checks = New-Object System.Collections.Generic.List[string]

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function AddCheck([string]$message) {
  $checks.Add($message)
}

function AddFailure([string]$message) {
  $failures.Add($message)
}

function AssertTrue([bool]$condition, [string]$successMessage, [string]$failureMessage) {
  if ($condition) {
    AddCheck $successMessage
  } else {
    AddFailure $failureMessage
  }
}

function ReadProjectFile([string]$relativePath) {
  $absolutePath = Join-Path $projectRoot $relativePath
  if (-not (Test-Path $absolutePath)) {
    AddFailure "Missing required file: $relativePath"
    return ""
  }

  return [System.IO.File]::ReadAllText($absolutePath)
}

function AssertContains([string]$content, [string]$needle, [string]$successMessage, [string]$failureMessage) {
  AssertTrue ($content.Contains($needle)) $successMessage $failureMessage
}

function AssertNotContains([string]$content, [string]$needle, [string]$successMessage, [string]$failureMessage) {
  AssertTrue (-not $content.Contains($needle)) $successMessage $failureMessage
}

function TestMojibake([string]$relativePath) {
  $content = ReadProjectFile $relativePath
  if (-not $content) {
    return
  }

  $pattern = '[\u00C3\u00D8\u00D9\u00E6\u00E2\u00D0\u00D1]'
  if ([regex]::IsMatch($content, $pattern)) {
    AddFailure "Suspicious mojibake pattern found in $relativePath"
  } else {
    AddCheck "No suspicious mojibake pattern found in $relativePath"
  }
}

function TestNodeSyntax([string]$relativePath) {
  $absolutePath = Join-Path $projectRoot $relativePath
  if (-not (Test-Path $absolutePath)) {
    AddFailure "Missing required file for syntax check: $relativePath"
    return
  }

  $output = & node --check $absolutePath 2>&1
  if ($LASTEXITCODE -eq 0) {
    AddCheck "Node syntax check passed for $relativePath"
  } else {
    $details = ($output | Out-String).Trim()
    AddFailure "Node syntax check failed for $relativePath`n$details"
  }
}

function GetLiveResponse([string]$url) {
  $nodeScript = @'
const https = require("https");
const { URL } = require("url");

function fetchPage(target, redirects = 0) {
  if (redirects > 5) {
    throw new Error("Too many redirects");
  }

  return new Promise((resolve, reject) => {
    const request = https.get(target, {
      headers: {
        "User-Agent": "AdantimerQualityGate/1.0"
      }
    }, response => {
      const statusCode = response.statusCode || 0;
      if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
        const nextUrl = new URL(response.headers.location, target).toString();
        response.resume();
        resolve(fetchPage(nextUrl, redirects + 1));
        return;
      }

      let content = "";
      response.setEncoding("utf8");
      response.on("data", chunk => content += chunk);
      response.on("end", () => resolve({ statusCode, content }));
    });

    request.setTimeout(20000, () => request.destroy(new Error("Request timed out")));
    request.on("error", reject);
  });
}

fetchPage(process.argv[2])
  .then(result => process.stdout.write(JSON.stringify(result)))
  .catch(error => {
    console.error(error.message);
    process.exit(1);
  });
'@

  $output = ($nodeScript | node - $url 2>&1) -join [Environment]::NewLine
  if ($LASTEXITCODE -ne 0) {
    throw "Node live fetch failed: $output"
  }

  return $output | ConvertFrom-Json
}

function TestLiveUrl([string]$url, [string[]]$requiredSnippets) {
  try {
    $response = GetLiveResponse $url
    if ([int]$response.statusCode -ne 200) {
      AddFailure "Live check failed for $url with status $($response.statusCode)"
      return
    }

    AddCheck "Live check returned 200 for $url"

    foreach ($snippet in $requiredSnippets) {
      if ($response.content.Contains($snippet)) {
        AddCheck "Live content check passed for $url -> $snippet"
      } else {
        AddFailure "Live content check missing on $url -> $snippet"
      }
    }
  } catch {
    AddFailure "Live check failed for $url -> $($_.Exception.Message)"
  }
}

function TestLiveUrlRegex([string]$url, [string[]]$requiredPatterns) {
  try {
    $response = GetLiveResponse $url
    if ([int]$response.statusCode -ne 200) {
      AddFailure "Live regex check failed for $url with status $($response.statusCode)"
      return
    }

    AddCheck "Live regex check returned 200 for $url"

    foreach ($pattern in $requiredPatterns) {
      if ([regex]::IsMatch($response.content, $pattern)) {
        AddCheck "Live regex check passed for $url -> $pattern"
      } else {
        AddFailure "Live regex check missing on $url -> $pattern"
      }
    }
  } catch {
    AddFailure "Live regex check failed for $url -> $($_.Exception.Message)"
  }
}

function TestLiveUrlNotContains([string]$url, [string[]]$forbiddenSnippets) {
  try {
    $response = GetLiveResponse $url
    if ([int]$response.statusCode -ne 200) {
      AddFailure "Live negative check failed for $url with status $($response.statusCode)"
      return
    }

    AddCheck "Live negative check returned 200 for $url"

    foreach ($snippet in $forbiddenSnippets) {
      if ($response.content.Contains($snippet)) {
        AddFailure "Live negative check found forbidden content on $url -> $snippet"
      } else {
        AddCheck "Live negative check passed for $url -> $snippet"
      }
    }
  } catch {
    AddFailure "Live negative check failed for $url -> $($_.Exception.Message)"
  }
}

$requiredFiles = @(
  "templates/index.html",
  "style.css",
  "script.js",
  "vercel.json",
  "robots.txt",
  "sitemap.xml",
  "sitemap-core.xml",
  "api/render.js",
  "data/quran-surahs.js",
  "data/dhikr-entries.js",
  ".github/workflows/generate-sitemaps.yml",
  "tools/generate_sitemaps.py"
)

foreach ($file in $requiredFiles) {
  AssertTrue (Test-Path (Join-Path $projectRoot $file)) "Found $file" "Missing required file: $file"
}

TestNodeSyntax "script.js"
TestNodeSyntax "api/render.js"

try {
  $vercelConfig = Get-Content (Join-Path $projectRoot "vercel.json") -Raw | ConvertFrom-Json
  AddCheck "vercel.json parses successfully"
  AssertTrue ($vercelConfig.rewrites.Count -gt 0) "vercel.json contains rewrites" "vercel.json has no rewrites"
} catch {
  AddFailure "vercel.json could not be parsed: $($_.Exception.Message)"
}

$indexHtml = ReadProjectFile "templates/index.html"
$styleCss = ReadProjectFile "style.css"
$scriptJs = ReadProjectFile "script.js"
$renderJs = ReadProjectFile "api/render.js"
$quranSurahs = ReadProjectFile "data/quran-surahs.js"
$dhikrEntries = ReadProjectFile "data/dhikr-entries.js"
$vercelJsonText = ReadProjectFile "vercel.json"
$sitemapCore = ReadProjectFile "sitemap-core.xml"
$sitemapIndex = ReadProjectFile "sitemap.xml"
$robots = ReadProjectFile "robots.txt"
$workflow = ReadProjectFile ".github/workflows/generate-sitemaps.yml"
$rewritesText = $vercelConfig.rewrites | ConvertTo-Json -Depth 10

AssertContains $indexHtml 'data-lang="en"' "Homepage keeps the English quick button" "Homepage is missing the English quick button"
AssertContains $indexHtml 'data-lang="ar"' "Homepage keeps the Arabic quick button" "Homepage is missing the Arabic quick button"
AssertContains $indexHtml 'Other languages' "Homepage includes the Other languages menu" "Homepage is missing the Other languages menu"
AssertContains $indexHtml 'class="card tools-hub"' "Homepage template includes the tools hub container" "Homepage template is missing the tools hub container"
AssertNotContains $indexHtml 'class="card qibla-panel"' "Homepage template no longer includes the qibla panel container" "Homepage template still includes the qibla panel container"
AssertNotContains $indexHtml 'id="qibla-sensor-button"' "Homepage template no longer includes the qibla sensor button" "Homepage template still includes the qibla sensor button"
AssertContains $indexHtml 'hreflang="de"' "Homepage exposes the German alternate" "Homepage is missing the German alternate"
AssertContains $indexHtml 'hreflang="fr"' "Homepage exposes the French alternate" "Homepage is missing the French alternate"
AssertContains $indexHtml 'hreflang="tr"' "Homepage exposes the Turkish alternate" "Homepage is missing the Turkish alternate"
AssertContains $indexHtml 'hreflang="zh-hans"' "Homepage exposes the Chinese alternate" "Homepage is missing the Chinese alternate"
AssertContains $indexHtml '"inLanguage": ["en", "ar", "de", "fr", "tr", "zh-Hans"]' "Structured data lists the supported languages" "Structured data language list is incomplete"
AssertContains $indexHtml '<script src="/script.js"></script>' "Homepage loads the main client script without stale cache-bust markers" "Homepage script loader drifted from the stable baseline"

AssertContains $scriptJs 'function buildRelativeUrl(lang, type, city = "", detail = "")' "Client keeps a single URL builder" "Client URL builder is missing"
AssertContains $scriptJs 'function getRequestedSurahSlug()' "Client keeps the surah slug helper" "Client surah slug helper is missing"
AssertContains $scriptJs 'function initQuranIndex()' "Client keeps the Quran index initializer" "Client Quran index initializer is missing"
AssertContains $scriptJs 'function updateQuranIndexFilter(query = "")' "Client keeps the Quran index filter helper" "Client Quran index filter helper is missing"
AssertContains $scriptJs 'function normalizeForSearch(value = "")' "Client keeps the Quran search normalizer" "Client Quran search normalizer is missing"
AssertContains $scriptJs 'const DHIKR_STATE_STORAGE_KEY = "adantimer-dhikr-state-v1";' "Client keeps the Dhikr storage key" "Client Dhikr storage key is missing"
AssertContains $scriptJs 'document.querySelectorAll(".dhikr-category-chip[data-dhikr-category]")' "Client scopes Dhikr category buttons to filter chips" "Client Dhikr category selector is too broad"
AssertContains $scriptJs 'const dhikrCategoryRowEl = document.querySelector(".dhikr-category-row");' "Client keeps the Dhikr category row hook" "Client Dhikr category row hook is missing"
AssertContains $scriptJs 'function renderDhikrPage(state)' "Client keeps the Dhikr page renderer" "Client Dhikr page renderer is missing"
AssertContains $scriptJs 'function initDhikrPage()' "Client keeps the Dhikr page initializer" "Client Dhikr page initializer is missing"
AssertContains $scriptJs 'buildRelativeUrl(language, "dhikr")' "Client can navigate to localized Dhikr routes" "Client Dhikr route navigation is missing"
AssertContains $scriptJs 'function getRequestedDhikrCollection()' "Client keeps the Dhikr collection helper" "Client Dhikr collection helper is missing"
AssertContains $scriptJs 'function getDhikrCollectionRouteSlug(value)' "Client keeps the Dhikr collection route-slug helper" "Client Dhikr collection route-slug helper is missing"
AssertContains $scriptJs '"dhikr-collection": detailSlug ? `/dhikr/${detailSlug}` : "/dhikr"' "Client URL builder includes Dhikr collection routes" "Client Dhikr collection route handling is missing"
AssertContains $scriptJs 'buildRelativeUrl(language, "dhikr-collection", "", getRequestedDhikrCollection())' "Client can navigate to localized Dhikr collection routes" "Client localized Dhikr collection route navigation is missing"
AssertContains $scriptJs 'pageType === "dhikr" || pageType === "dhikr-collection"' "Client handles both Dhikr page types" "Client does not separate the Dhikr collection flow"
AssertContains $scriptJs 'pageType === "quran"' "Client handles the standalone Quran page separately" "Client does not separate the Quran page flow"
AssertContains $scriptJs 'buildRelativeUrl(language, "quran")' "Client can navigate to localized Quran routes" "Client Quran route navigation is missing"
AssertContains $scriptJs 'buildRelativeUrl(language, "quran-surah", "", getRequestedSurahSlug())' "Client can navigate to localized Quran surah routes" "Client Quran surah route navigation is missing"
AssertContains $scriptJs 'const TOOL_HUB_LOCALES = {' "Client keeps localized tool-hub copy" "Client tool-hub copy is missing"
AssertContains $scriptJs 'const QIBLA_PANEL_LOCALES = {' "Client keeps localized qibla-panel copy" "Client qibla-panel copy is missing"
AssertContains $scriptJs 'function renderToolsHub(locale)' "Client keeps the tools-hub renderer" "Client tools-hub renderer is missing"
AssertContains $scriptJs 'function calculateQiblaBearing(lat, lng)' "Client keeps the qibla-bearing calculator" "Client qibla-bearing calculator is missing"
AssertContains $scriptJs 'function renderQiblaPanel(state = qiblaPanelState)' "Client keeps the qibla-panel renderer" "Client qibla-panel renderer is missing"
AssertContains $scriptJs 'function setQiblaCompassVisualState(bearing = null)' "Client keeps the qibla compass visual-state helper" "Client qibla compass visual-state helper is missing"
AssertContains $scriptJs 'async function enableLiveCompass()' "Client keeps the live compass permission flow" "Client live compass permission flow is missing"
AssertContains $scriptJs 'function readDeviceHeading(event)' "Client keeps the device-heading reader" "Client device-heading reader is missing"
AssertContains $scriptJs 'async function loadQiblaCompass(resolvedLocation)' "Client keeps the standalone qibla loader" "Client standalone qibla loader is missing"
AssertContains $scriptJs 'qibla: "/qibla"' "Client URL builder includes the qibla route" "Client URL builder is missing the qibla route"
AssertContains $scriptJs '"hadith"' "Client recognizes the hadith route" "Client route handling is missing the hadith page"
AssertContains $scriptJs 'const LANGUAGE_PREFIXES = {' "Client keeps explicit language path prefixes" "Client language path prefixes are missing"
AssertContains $scriptJs 'const CITY_NAME_LOCALIZATIONS = {' "Client keeps localized city-name mappings" "Client localized city-name mappings are missing"
AssertContains $scriptJs 'const REQUEST_TIMEOUTS = {' "Client keeps explicit request timeouts" "Client request timeout config is missing"
AssertContains $scriptJs 'async function fetchJsonWithTimeout(url, timeoutMs, options = {})' "Client keeps the shared timeout-aware fetch helper" "Client timeout-aware fetch helper is missing"
AssertContains $scriptJs 'function renderResolvingState(locale, mode = "detect", previewLocation = null)' "Client keeps the staged resolving-state helper" "Client resolving-state helper is missing"
AssertContains $scriptJs 'resolvingGpsStatus' "Client keeps explicit GPS resolving copy" "Client GPS resolving copy is missing"
AssertContains $scriptJs 'resolvingIpDetail' "Client keeps explicit IP fallback resolving copy" "Client IP fallback resolving copy is missing"
AssertContains $scriptJs 'async function resolveInitialLocation(onStage = null)' "Client keeps the staged initial location resolver" "Initial location resolver is missing"
AssertContains $scriptJs 'async function loadPrayerTimes(resolvedLocation)' "Client keeps the main prayer loader" "Prayer loading entry point is missing"
AssertContains $scriptJs 'function armLoadingWatchdog(locale, softFail = false)' "Client keeps the loading watchdog" "Client loading watchdog is missing"
AssertContains $scriptJs 'function renderAutoLoadFallback(locale)' "Client keeps the soft fallback state for generic auto-loads" "Client soft fallback helper is missing"
AssertContains $scriptJs 'clearLoadingWatchdog();' "Client clears the loading watchdog on completion paths" "Client loading watchdog is never cleared"
AssertContains $scriptJs 'navigator.geolocation.getCurrentPosition' "Client still attempts GPS lookup" "GPS lookup logic is missing"
AssertContains $scriptJs 'https://ipapi.co/json/' "Client still has the IP fallback provider" "IP fallback provider is missing"
AssertContains $scriptJs 'https://api.aladhan.com/v1/timings' "Client still fetches prayer timings from Aladhan" "Prayer timing API call is missing"
AssertContains $scriptJs 'countdownEl.textContent !== locale.loading' "Client watchdog only interrupts a still-loading UI" "Client loading watchdog no longer checks the visible loading state"
AssertContains $scriptJs 'const shouldSoftFail = !resolvedLocation && !getRequestedCity();' "Client distinguishes generic auto-loads from explicit city requests" "Client no longer separates generic auto-loads from explicit city requests"
AssertContains $scriptJs 'if (softFail) {' "Client watchdog can downgrade generic auto-load failures into a soft fallback" "Client watchdog no longer supports a soft fallback path"
AssertContains $scriptJs 'history.replaceState({}, "", buildRelativeUrl(language, pageType, city));' "Client history updates stay aligned with route building" "Client history updates drifted from route building"
AssertContains $scriptJs 'window.language = language;' "Client exposes the active language globally for the menu sync" "Client no longer exposes the active language globally"
AssertContains $scriptJs 'window.setLanguage = setLanguage;' "Client exposes setLanguage globally for the menu sync" "Client no longer exposes setLanguage globally"
AssertContains $scriptJs 'function localizeCityName(city, lang = language)' "Client keeps the city-name localization helper" "Client city-name localization helper is missing"
AssertContains $scriptJs 'function formatPlaceName(city = "", country = "", lang = language)' "Client keeps the shared place-format helper" "Client place-format helper is missing"
AssertContains $scriptJs 'setLanguage(language, false);' "Client boot sequence still initializes language first" "Client boot sequence no longer initializes language before loading data"
AssertContains $scriptJs 'loadPrayerTimes();' "Client boot sequence still loads prayer times on startup" "Client boot sequence no longer loads prayer times on startup"
AssertNotContains $scriptJs 'const params = new URLSearchParams({ lang });' "Client no longer mixes query-param language URLs into route building" "Client still mixes query-param language URLs into route building"

AssertContains $renderJs 'function normalizeLanguage(value)' "SSR renderer keeps language normalization" "SSR renderer is missing language normalization"
AssertContains $renderJs 'function parseAcceptLanguage(value)' "SSR renderer parses Accept-Language for root requests" "SSR renderer is missing Accept-Language parsing"
AssertContains $renderJs 'function detectRequestLanguage(acceptLanguage)' "SSR renderer detects request language from headers" "SSR renderer is missing request-language detection"
AssertContains $renderJs 'function resolveRequestLanguage({ explicitLanguage, acceptLanguage, pageType, city })' "SSR renderer resolves root language per request" "SSR renderer is missing request-language resolution"
AssertContains $renderJs 'if (pageType === "home" && !city)' "SSR renderer limits request-language detection to the root home route" "SSR renderer no longer limits request-language detection to the root route"
AssertContains $renderJs 'headers.vary = "accept-language";' "SSR renderer varies root home responses by Accept-Language" "SSR renderer is missing Accept-Language cache variation"
AssertContains $renderJs 'function getAlternates(pageType, city, surahSlug = "")' "SSR renderer keeps alternate-link generation" "SSR renderer is missing alternate-link generation"
AssertContains $renderJs 'function buildEnglishCopy' "SSR renderer keeps English copy generation" "SSR renderer is missing English copy generation"
AssertContains $renderJs 'getAdjacentQuranSurahs' "SSR renderer imports the local Quran helpers" "SSR renderer is missing the local Quran helper imports"
AssertContains $renderJs 'const QURAN_INDEX_CONTENT = {' "SSR renderer keeps the Quran index copy map" "SSR renderer is missing the Quran index copy map"
AssertContains $renderJs 'const QURAN_SURAH_CONTENT = {' "SSR renderer keeps the Quran surah copy map" "SSR renderer is missing the Quran surah copy map"
AssertContains $renderJs 'const DHIKR_INDEX_CONTENT = {' "SSR renderer keeps the Dhikr index copy map" "SSR renderer is missing the Dhikr index copy map"
AssertContains $renderJs 'function buildQuranIndexCopy(language, pageType)' "SSR renderer keeps the Quran index copy builder" "SSR renderer is missing the Quran index copy builder"
AssertContains $renderJs 'function buildQuranSurahCopy(language, pageType, surah, surahReaderData)' "SSR renderer keeps the Quran surah copy builder" "SSR renderer is missing the Quran surah copy builder"
AssertContains $renderJs 'function buildDhikrIndexCopy(language, pageType, collectionId = "")' "SSR renderer keeps the Dhikr index copy builder" "SSR renderer is missing the Dhikr index copy builder"
AssertContains $renderJs 'function normalizeDhikrCollectionId(value)' "SSR renderer keeps the Dhikr collection normalizer" "SSR renderer is missing the Dhikr collection normalizer"
AssertContains $renderJs 'function getDhikrCollectionRouteSlug(value)' "SSR renderer keeps the Dhikr collection route-slug helper" "SSR renderer is missing the Dhikr collection route-slug helper"
AssertContains $renderJs 'function getDhikrCollectionCopy(language, collectionId, label)' "SSR renderer keeps the Dhikr collection copy helper" "SSR renderer is missing the Dhikr collection copy helper"
AssertContains $renderJs 'Object.assign(ROUTES["dhikr-collection"], {' "SSR renderer defines the Dhikr collection route" "SSR renderer is missing the Dhikr collection route"
AssertContains $renderJs 'data-dhikr-collection="' "SSR renderer exposes the active Dhikr collection on the body" "SSR renderer is missing the active Dhikr collection marker"
AssertContains $renderJs 'copy.standalonePageType === "dhikr" || copy.standalonePageType === "dhikr-collection"' "SSR renderer treats Dhikr collection pages as standalone" "SSR renderer does not treat Dhikr collection pages as standalone"
AssertContains $renderJs 'href: buildRoutePath(language, "dhikr-collection", "", category.id)' "SSR renderer generates Dhikr collection links" "SSR renderer is missing Dhikr collection links"
AssertContains $renderJs 'function renderQuranIndexSection(copy)' "SSR renderer keeps the Quran index renderer" "SSR renderer is missing the Quran index renderer"
AssertContains $renderJs 'function renderQuranSurahSection(copy)' "SSR renderer keeps the Quran surah renderer" "SSR renderer is missing the Quran surah renderer"
AssertContains $renderJs 'function renderDhikrSection(copy)' "SSR renderer keeps the Dhikr section renderer" "SSR renderer is missing the Dhikr section renderer"
AssertContains $renderJs 'id="quran-search-clear"' "SSR renderer includes the Quran search clear control" "SSR renderer is missing the Quran search clear control"
AssertContains $renderJs 'data-dhikr-card ' "SSR renderer includes the Dhikr cards" "SSR renderer is missing the Dhikr cards"
AssertContains $renderJs 'dhikr-card-badges' "SSR renderer includes the Dhikr evidence badges" "SSR renderer is missing the Dhikr evidence badges"
AssertContains $renderJs 'quranArabicName: surah.nameArabic || ""' "SSR renderer exposes the Arabic surah name for the standalone hero" "SSR renderer is missing the Arabic surah-name field for the standalone hero"
AssertContains $renderJs 'copy.standalonePageType === "dhikr"' "SSR renderer treats Dhikr as a standalone page type" "SSR renderer is missing the standalone Dhikr page branch"
AssertContains $renderJs 'copy.standalonePageType === "quran"' "SSR renderer treats Quran as a standalone page type" "SSR renderer is missing the standalone Quran page branch"
AssertContains $renderJs 'copy.standalonePageType === "quran-surah"' "SSR renderer treats Quran surahs as standalone pages" "SSR renderer is missing the standalone Quran surah branch"
AssertContains $renderJs 'const QURAN_API_BASE = "https://api.alquran.cloud/v1";' "SSR renderer keeps the Quran API base" "SSR renderer is missing the Quran API base"
AssertContains $renderJs 'async function getQuranSurahReaderData(surahMeta)' "SSR renderer keeps the Quran reader fetch helper" "SSR renderer is missing the Quran reader fetch helper"
AssertContains $renderJs 'const TOOL_HUB_CONTENT = {' "SSR renderer keeps server-rendered tool-hub copy" "SSR renderer is missing tool-hub copy"
AssertContains $renderJs 'const QIBLA_PANEL_CONTENT = {' "SSR renderer keeps server-rendered qibla-panel copy" "SSR renderer is missing qibla-panel copy"
AssertContains $renderJs 'qiblaSensorButton' "SSR renderer keeps qibla sensor copy" "SSR renderer is missing qibla sensor copy"
AssertContains $renderJs 'function buildToolHubCopy(language, pageType)' "SSR renderer keeps the tool-hub builder" "SSR renderer is missing the tool-hub builder"
AssertContains $renderJs 'function renderToolsSection(copy)' "SSR renderer keeps the tools-section renderer" "SSR renderer is missing the tools-section renderer"
AssertContains $renderJs 'function buildQiblaPanelCopy(language, pageType)' "SSR renderer keeps the qibla-panel builder" "SSR renderer is missing the qibla-panel builder"
AssertContains $renderJs 'function renderQiblaPanelSection(copy)' "SSR renderer keeps the qibla-panel renderer" "SSR renderer is missing the qibla-panel renderer"
AssertContains $renderJs 'qiblaKaabaLabel' "SSR renderer keeps the qibla Kaaba marker label" "SSR renderer is missing the qibla Kaaba marker label"
AssertContains $renderJs 'qibla: { en: "Qibla Direction"' "SSR renderer defines the qibla route" "SSR renderer is missing the qibla route"
AssertContains $renderJs 'function buildArabicCopy' "SSR renderer keeps Arabic copy generation" "SSR renderer is missing Arabic copy generation"
AssertContains $renderJs 'function buildCopy({ language, pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection })' "SSR renderer keeps the shared copy entry point" "SSR renderer is missing the shared copy entry point"
AssertContains $renderJs 'function buildLocalizedCopy(language, { pageType, place, sourceCity, topic, surah, surahReaderData, dhikrCollection })' "SSR renderer keeps the localized copy builder" "SSR renderer is missing the localized copy builder"
AssertContains $renderJs 'const SUPPORTED_RENDER_LANGUAGES = ["en", "ar", "de", "fr", "tr", "zh-hans"];' "SSR renderer tracks all supported languages" "SSR renderer supported-language list is missing or incomplete"
AssertContains $renderJs 'const LANGUAGE_ALIASES = {' "SSR renderer keeps language aliases" "SSR renderer language aliases are missing"
AssertContains $renderJs 'const LANGUAGE_PREFIXES = {' "SSR renderer keeps language prefixes" "SSR renderer language prefixes are missing"
AssertContains $renderJs 'const ROOT_HOME_OVERRIDES = {' "SSR renderer keeps explicit root-home copy overrides" "SSR renderer is missing the root-home copy overrides"
AssertContains $renderJs 'A stronger starting point for global prayer time searches' "SSR renderer carries stronger English root-home copy" "SSR renderer is missing the stronger English root-home copy"
AssertContains $renderJs 'const CITY_NAME_LOCALIZATIONS = {' "SSR renderer keeps localized city-name mappings" "SSR renderer localized city-name mappings are missing"
AssertContains $renderJs 'const INLINE_LINK_CONNECTORS = {' "SSR renderer keeps localized inline-link connectors" "SSR renderer is missing localized inline-link connectors"
AssertContains $renderJs 'function localizeCityName(city, language)' "SSR renderer keeps the city-name localization helper" "SSR renderer city-name localization helper is missing"
AssertContains $renderJs 'return LANGUAGE_ALIASES[normalized] || LANGUAGE_ALIASES[normalized.split("-")[0]] || "en";' "SSR renderer normalizes all supported languages" "SSR renderer language normalization drifted from the multilingual target"
AssertContains $renderJs 'hreflang="de"' "SSR renderer updates the German alternate tag" "SSR renderer is missing the German alternate replacement"
AssertContains $renderJs 'hreflang="fr"' "SSR renderer updates the French alternate tag" "SSR renderer is missing the French alternate replacement"
AssertContains $renderJs 'hreflang="tr"' "SSR renderer updates the Turkish alternate tag" "SSR renderer is missing the Turkish alternate replacement"
AssertContains $renderJs 'hreflang="zh-hans"' "SSR renderer updates the Chinese alternate tag" "SSR renderer is missing the Chinese alternate replacement"
AssertContains $renderJs '>English</button>' "SSR renderer targets the current English button markup" "SSR renderer still targets stale English button markup"
AssertContains $renderJs '>Arabic</button>' "SSR renderer targets the current Arabic button markup" "SSR renderer still targets stale Arabic button markup"
AssertContains $renderJs "Gebetszeiten nach Stadt" "SSR renderer carries German body copy" "SSR renderer is missing the German SSR body copy markers"
AssertContains $renderJs 'submitLabel: "Voir les horaires"' "SSR renderer carries French body copy" "SSR renderer is missing the French SSR body copy markers"
AssertContains $renderJs 'nextPrayerTitle: "Sonraki namaz"' "SSR renderer carries Turkish body copy" "SSR renderer is missing the Turkish SSR body copy markers"
AssertContains $renderJs 'cityLinkLabel: (topic, city) => `${city}${topic}`' "SSR renderer carries Chinese body copy" "SSR renderer is missing the Chinese SSR body copy markers"

AssertContains $rewritesText '"/ar"' "vercel.json includes Arabic rewrites" "vercel.json is missing Arabic rewrites"
AssertContains $vercelJsonText '{ "source": "/", "destination": "/api/render?type=home" }' "vercel.json rewrites the root path through SSR" "vercel.json is missing the root SSR rewrite"
AssertContains $rewritesText '"/de"' "vercel.json includes German rewrites" "vercel.json is missing German rewrites"
AssertContains $rewritesText '"/qibla"' "vercel.json includes the qibla rewrite" "vercel.json is missing the qibla rewrite"
AssertContains $rewritesText '"/quran"' "vercel.json includes the quran rewrite" "vercel.json is missing the quran rewrite"
AssertContains $rewritesText '"/quran/:surah"' "vercel.json includes the quran surah rewrite" "vercel.json is missing the quran surah rewrite"
AssertContains $rewritesText '"/dhikr"' "vercel.json includes the dhikr rewrite" "vercel.json is missing the dhikr rewrite"
AssertContains $rewritesText '"/dhikr/:collection"' "vercel.json includes the Dhikr collection rewrite" "vercel.json is missing the Dhikr collection rewrite"
AssertContains $vercelJsonText '/api/render?type=dhikr-collection&collection=:collection' "vercel.json sends Dhikr collections through SSR" "vercel.json is missing the SSR Dhikr collection destination"
AssertContains $rewritesText '"/hadith"' "vercel.json includes the hadith rewrite" "vercel.json is missing the hadith rewrite"
AssertContains $rewritesText '"/fr"' "vercel.json includes French rewrites" "vercel.json is missing French rewrites"
AssertContains $rewritesText '"/tr"' "vercel.json includes Turkish rewrites" "vercel.json is missing Turkish rewrites"
AssertContains $rewritesText '"/zh-hans"' "vercel.json includes Chinese rewrites" "vercel.json is missing Chinese rewrites"

AssertContains $sitemapCore 'https://www.adantimer.com/de/prayer-times' "Core sitemap includes German prayer routes" "Core sitemap is missing German prayer routes"
AssertContains $sitemapCore 'https://www.adantimer.com/qibla' "Core sitemap includes the qibla page" "Core sitemap is missing the qibla page"
AssertContains $sitemapCore 'https://www.adantimer.com/zh-hans/hadith' "Core sitemap includes the Chinese hadith page" "Core sitemap is missing the Chinese hadith page"
AssertContains $sitemapCore 'https://www.adantimer.com/dhikr' "Core sitemap includes the Dhikr page" "Core sitemap is missing the Dhikr page"
AssertContains $sitemapCore 'https://www.adantimer.com/ar/dhikr' "Core sitemap includes the Arabic Dhikr page" "Core sitemap is missing the Arabic Dhikr page"
AssertContains $sitemapCore 'https://www.adantimer.com/dhikr/morning' "Core sitemap includes the morning Dhikr collection" "Core sitemap is missing the morning Dhikr collection"
AssertContains $sitemapCore 'https://www.adantimer.com/dhikr/forgiveness' "Core sitemap includes the forgiveness Dhikr collection" "Core sitemap is missing the forgiveness Dhikr collection"
AssertContains $sitemapCore 'https://www.adantimer.com/dhikr/provision' "Core sitemap includes the provision Dhikr collection" "Core sitemap is missing the provision Dhikr collection"
AssertContains $sitemapCore 'https://www.adantimer.com/dhikr/distress' "Core sitemap includes the distress Dhikr collection" "Core sitemap is missing the distress Dhikr collection"
AssertContains $sitemapCore 'https://www.adantimer.com/dhikr/healing' "Core sitemap includes the healing Dhikr collection" "Core sitemap is missing the healing Dhikr collection"
AssertContains $sitemapCore 'https://www.adantimer.com/dhikr/before-sleep' "Core sitemap includes the before-sleep Dhikr collection" "Core sitemap is missing the before-sleep Dhikr collection"
AssertContains $sitemapCore 'https://www.adantimer.com/de/dhikr/after-prayer' "Core sitemap includes the German after-prayer Dhikr collection" "Core sitemap is missing the German after-prayer Dhikr collection"
AssertContains $sitemapCore 'https://www.adantimer.com/zh-hans/dhikr/evening' "Core sitemap includes the Chinese evening Dhikr collection" "Core sitemap is missing the Chinese evening Dhikr collection"
AssertContains $sitemapCore 'https://www.adantimer.com/quran' "Core sitemap includes the Quran page" "Core sitemap is missing the Quran page"
AssertContains $sitemapCore 'https://www.adantimer.com/quran/al-fatihah' "Core sitemap includes the first Quran surah page" "Core sitemap is missing the first Quran surah page"
AssertContains $sitemapCore 'https://www.adantimer.com/fr/prayer-times' "Core sitemap includes French prayer routes" "Core sitemap is missing French prayer routes"
AssertContains $sitemapCore 'https://www.adantimer.com/tr/prayer-times' "Core sitemap includes Turkish prayer routes" "Core sitemap is missing Turkish prayer routes"
AssertContains $sitemapCore 'https://www.adantimer.com/zh-hans/isha-time' "Core sitemap includes Chinese prayer routes" "Core sitemap is missing Chinese prayer routes"
AssertContains $sitemapIndex 'https://www.adantimer.com/sitemap-core.xml.gz' "Sitemap index points to the core sitemap" "Sitemap index is missing the core sitemap"
AssertContains $robots 'Sitemap: https://www.adantimer.com/sitemap.xml' "robots.txt points to the sitemap index" "robots.txt is missing the sitemap index reference"
AssertContains $workflow 'tools/generate_sitemaps.py' "Sitemap workflow is wired to the generator script" "Sitemap workflow no longer calls the generator script"
AssertContains $styleCss '.quran-surah-grid {' "Stylesheet includes the Quran surah grid" "Stylesheet is missing the Quran surah grid styles"
AssertContains $styleCss '.quran-search-row {' "Stylesheet includes the Quran search row layout" "Stylesheet is missing the Quran search row layout"
AssertContains $styleCss '.quran-search-clear {' "Stylesheet includes the Quran search clear button" "Stylesheet is missing the Quran search clear button"
AssertContains $styleCss '.dhikr-card-grid {' "Stylesheet includes the Dhikr card grid" "Stylesheet is missing the Dhikr card grid styles"
AssertContains $styleCss '.dhikr-card[hidden],' "Stylesheet explicitly hides filtered Dhikr cards" "Stylesheet does not explicitly hide filtered Dhikr cards"
AssertContains $styleCss '.dhikr-summary-grid {' "Stylesheet includes the Dhikr summary grid" "Stylesheet is missing the Dhikr summary grid styles"
AssertContains $styleCss '.dhikr-meta-badge {' "Stylesheet includes the Dhikr evidence badge styles" "Stylesheet is missing the Dhikr evidence badge styles"
AssertContains $styleCss 'text-decoration: none;' "Stylesheet keeps Dhikr collection chips link-safe" "Stylesheet does not neutralize Dhikr chip link decoration"
AssertContains $styleCss 'body[data-page="dhikr-collection"] .hero-grid {' "Stylesheet includes the standalone Dhikr hero layout" "Stylesheet is missing the standalone Dhikr hero layout"
AssertContains $styleCss 'body[data-page="quran"] .hero-grid {' "Stylesheet includes the standalone Quran hero layout" "Stylesheet is missing the standalone Quran hero layout"
AssertContains $styleCss 'body[data-page="quran-surah"] .hero-grid {' "Stylesheet includes the standalone Quran surah hero layout" "Stylesheet is missing the standalone Quran surah hero layout"
AssertContains $quranSurahs 'export const QURAN_SURAHS = [' "Local Quran metadata exports the surah list" "Local Quran metadata export is missing"
AssertContains $quranSurahs 'slug: "al-fatihah"' "Local Quran metadata includes Surah Al-Fatihah" "Local Quran metadata is missing Surah Al-Fatihah"
AssertContains $quranSurahs 'export function getQuranSurahBySlug(slug)' "Local Quran metadata exports slug lookup" "Local Quran slug lookup helper is missing"
AssertContains $quranSurahs 'export function getAdjacentQuranSurahs(slug)' "Local Quran metadata exports adjacent surah lookup" "Local Quran adjacent surah helper is missing"
AssertContains $dhikrEntries 'export const DHIKR_CATEGORIES = [' "Local Dhikr metadata exports the category list" "Local Dhikr metadata export is missing"
AssertContains $dhikrEntries 'id: "morning-subhanallah"' "Local Dhikr metadata includes the morning SubhanAllah entry" "Local Dhikr metadata is missing the morning SubhanAllah entry"
AssertContains $dhikrEntries 'id: "forgiveness-sayyid-al-istighfar"' "Local Dhikr metadata includes the Sayyid al-Istighfar entry" "Local Dhikr metadata is missing the Sayyid al-Istighfar entry"
AssertContains $dhikrEntries 'id: "provision"' "Local Dhikr metadata includes the provision category" "Local Dhikr metadata is missing the provision category"
AssertContains $dhikrEntries 'export function getDhikrItems()' "Local Dhikr metadata exports the item helper" "Local Dhikr metadata item helper is missing"

TestMojibake "templates/index.html"
TestMojibake "script.js"

if ($RunLive) {
  TestLiveUrl "$BaseUrl/" @("Other languages", 'hreflang="zh-hans"', 'Built for automatic language, location, and city discovery')
  TestLiveUrlRegex "$BaseUrl/" @('<html lang="(?:en|ar|de|fr|tr|zh-CN)"(?: dir="(?:ltr|rtl)")?>', '<title>Adantimer \|')
  TestLiveUrl "$BaseUrl/qibla" @('<body data-page="qibla">', 'qibla-panel', 'Qibla Compass', 'qibla-sensor-button', 'qibla-kaaba-marker', 'qibla-dial')
  TestLiveUrl "$BaseUrl/dhikr" @('<body data-page="dhikr"', 'dhikr-card-grid', 'data-dhikr-category="provision"', 'data-dhikr-item="forgiveness-sayyid-al-istighfar"', 'dhikr-card-badges')
  TestLiveUrl "$BaseUrl/de/dhikr" @('<html lang="de" dir="ltr">', '<body data-page="dhikr"', 'data-dhikr-item="forgiveness-sayyid-al-istighfar"')
  TestLiveUrl "$BaseUrl/dhikr/morning" @('<body data-page="dhikr-collection"', 'data-dhikr-collection="morning"', 'morning-subhanallah')
  TestLiveUrl "$BaseUrl/de/dhikr/forgiveness" @('<html lang="de" dir="ltr">', '<body data-page="dhikr-collection"', 'data-dhikr-collection="forgiveness"')
  TestLiveUrl "$BaseUrl/dhikr/provision" @('<body data-page="dhikr-collection"', 'data-dhikr-collection="provision"', 'provision-beneficial-rizq')
  TestLiveUrl "$BaseUrl/dhikr/distress" @('<body data-page="dhikr-collection"', 'data-dhikr-collection="distress"', 'distress-dhun-nun')
  TestLiveUrl "$BaseUrl/dhikr/healing" @('<body data-page="dhikr-collection"', 'data-dhikr-collection="healing"', 'healing-rabb-an-nas')
  TestLiveUrl "$BaseUrl/dhikr/before-sleep" @('<body data-page="dhikr-collection"', 'data-dhikr-collection="sleep"', 'sleep-ayat-al-kursi')
  TestLiveUrl "$BaseUrl/quran" @('<body data-page="quran">', 'quran-search', 'quran-surah-grid', 'Read the Quran by surah')
  TestLiveUrl "$BaseUrl/quran" @('id="quran-search-clear"', 'quran-search-count')
  TestLiveUrl "$BaseUrl/quran/al-fatihah" @('<body data-page="quran-surah"', 'quran-ayah-list', 'Surah Al-Fatihah', 'ayah-1')
  TestLiveUrl "$BaseUrl/quran/al-fatihah" @('quran-nav-card-index', 'Back to all surahs', '1 / 114')
  TestLiveUrlNotContains "$BaseUrl/quran/al-fatihah" @('id="location-form"', 'class="next-prayer card featured-card"')
  TestLiveUrl "$BaseUrl/de/quran/al-fatihah" @('<html lang="de" dir="ltr">', '<body data-page="quran-surah"', 'Sure Al-Fatihah lesen')
  TestLiveUrlNotContains "$BaseUrl/de/quran/al-fatihah" @('id="location-form"', 'class="next-prayer card featured-card"')
  TestLiveUrl "$BaseUrl/ar/asr-time/buraydah" @('<html lang="ar" dir="rtl">', 'https://www.adantimer.com/ar/asr-time/buraydah')
  TestLiveUrl "$BaseUrl/de/prayer-times/berlin" @('<html lang="de" dir="ltr">', 'https://www.adantimer.com/de/prayer-times/berlin')
  TestLiveUrl "$BaseUrl/fr/prayer-times/paris" @('<html lang="fr" dir="ltr">', 'https://www.adantimer.com/fr/prayer-times/paris')
  TestLiveUrl "$BaseUrl/tr/prayer-times/istanbul" @('<html lang="tr" dir="ltr">', 'https://www.adantimer.com/tr/prayer-times/istanbul')
  TestLiveUrl "$BaseUrl/zh-hans/prayer-times/shanghai" @('<html lang="zh-CN" dir="ltr">', 'https://www.adantimer.com/zh-hans/prayer-times/shanghai')
  TestLiveUrl "$BaseUrl/robots.txt" @('Sitemap: https://www.adantimer.com/sitemap.xml')
  TestLiveUrl "$BaseUrl/sitemap.xml" @('https://www.adantimer.com/sitemap-core.xml.gz', 'https://www.adantimer.com/sitemap-de.xml.gz')
}

Write-Host "Quality gate checks:"
foreach ($item in $checks) {
  Write-Host "PASS: $item"
}

if ($failures.Count -gt 0) {
  Write-Host ""
  Write-Host "Quality gate failures:"
  foreach ($item in $failures) {
    Write-Host "FAIL: $item"
  }
  exit 1
}

Write-Host ""
Write-Host "Quality gate passed."
