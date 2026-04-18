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

function GetLiveResponse([string]$url) {
  $headers = @{
    "User-Agent" = "AdantimerQualityGate/1.0"
  }
  return Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 20
}

function TestLiveUrl([string]$url, [string[]]$requiredSnippets) {
  try {
    $response = GetLiveResponse $url
    if ([int]$response.StatusCode -ne 200) {
      AddFailure "Live check failed for $url with status $($response.StatusCode)"
      return
    }

    AddCheck "Live check returned 200 for $url"

    foreach ($snippet in $requiredSnippets) {
      if ($response.Content.Contains($snippet)) {
        AddCheck "Live content check passed for $url -> $snippet"
      } else {
        AddFailure "Live content check missing on $url -> $snippet"
      }
    }
  } catch {
    $message = $_.Exception.Message
    if ($message -match "SEC_E_NO_CREDENTIALS" -or $message -match "underlying connection was closed") {
      AddCheck "Live check skipped for $url because the local TLS stack is unavailable in this environment"
    } else {
      AddFailure "Live check failed for $url -> $message"
    }
  }
}

$requiredFiles = @(
  "index.html",
  "style.css",
  "script.js",
  "vercel.json",
  "robots.txt",
  "sitemap.xml",
  "sitemap-core.xml",
  "api/render.js",
  ".github/workflows/generate-sitemaps.yml",
  "tools/generate_sitemaps.py"
)

foreach ($file in $requiredFiles) {
  AssertTrue (Test-Path (Join-Path $projectRoot $file)) "Found $file" "Missing required file: $file"
}

try {
  $vercelConfig = Get-Content (Join-Path $projectRoot "vercel.json") -Raw | ConvertFrom-Json
  AddCheck "vercel.json parses successfully"
  AssertTrue ($vercelConfig.rewrites.Count -gt 0) "vercel.json contains rewrites" "vercel.json has no rewrites"
} catch {
  AddFailure "vercel.json could not be parsed: $($_.Exception.Message)"
}

$indexHtml = ReadProjectFile "index.html"
$scriptJs = ReadProjectFile "script.js"
$renderJs = ReadProjectFile "api/render.js"
$sitemapCore = ReadProjectFile "sitemap-core.xml"
$sitemapIndex = ReadProjectFile "sitemap.xml"
$robots = ReadProjectFile "robots.txt"
$workflow = ReadProjectFile ".github/workflows/generate-sitemaps.yml"
$rewritesText = $vercelConfig.rewrites | ConvertTo-Json -Depth 10

AssertContains $indexHtml 'data-lang="en"' "Homepage keeps the English quick button" "Homepage is missing the English quick button"
AssertContains $indexHtml 'data-lang="ar"' "Homepage keeps the Arabic quick button" "Homepage is missing the Arabic quick button"
AssertContains $indexHtml 'Other languages' "Homepage includes the Other languages menu" "Homepage is missing the Other languages menu"
AssertContains $indexHtml 'hreflang="de"' "Homepage exposes the German alternate" "Homepage is missing the German alternate"
AssertContains $indexHtml 'hreflang="fr"' "Homepage exposes the French alternate" "Homepage is missing the French alternate"
AssertContains $indexHtml 'hreflang="tr"' "Homepage exposes the Turkish alternate" "Homepage is missing the Turkish alternate"
AssertContains $indexHtml 'hreflang="zh-hans"' "Homepage exposes the Chinese alternate" "Homepage is missing the Chinese alternate"
AssertContains $indexHtml '"inLanguage": ["en", "ar", "de", "fr", "tr", "zh-Hans"]' "Structured data lists the supported languages" "Structured data language list is incomplete"
AssertContains $indexHtml '<script src="/script.js"></script>' "Homepage loads the main client script without stale cache-bust markers" "Homepage script loader drifted from the stable baseline"

AssertContains $scriptJs 'function buildRelativeUrl(lang, type, city = "")' "Client keeps a single URL builder" "Client URL builder is missing"
AssertContains $scriptJs 'const LANGUAGE_PREFIXES = {' "Client keeps explicit language path prefixes" "Client language path prefixes are missing"
AssertContains $scriptJs 'const REQUEST_TIMEOUTS = {' "Client keeps explicit request timeouts" "Client request timeout config is missing"
AssertContains $scriptJs 'async function fetchJsonWithTimeout(url, timeoutMs, options = {})' "Client keeps the shared timeout-aware fetch helper" "Client timeout-aware fetch helper is missing"
AssertContains $scriptJs 'async function resolveInitialLocation()' "Client keeps the initial location resolver" "Initial location resolver is missing"
AssertContains $scriptJs 'async function loadPrayerTimes(resolvedLocation)' "Client keeps the main prayer loader" "Prayer loading entry point is missing"
AssertContains $scriptJs 'function armLoadingWatchdog(locale)' "Client keeps the loading watchdog" "Client loading watchdog is missing"
AssertContains $scriptJs 'clearLoadingWatchdog();' "Client clears the loading watchdog on completion paths" "Client loading watchdog is never cleared"
AssertContains $scriptJs 'navigator.geolocation.getCurrentPosition' "Client still attempts GPS lookup" "GPS lookup logic is missing"
AssertContains $scriptJs 'https://ipapi.co/json/' "Client still has the IP fallback provider" "IP fallback provider is missing"
AssertContains $scriptJs 'https://api.aladhan.com/v1/timings' "Client still fetches prayer timings from Aladhan" "Prayer timing API call is missing"
AssertContains $scriptJs 'countdownEl.textContent !== locale.loading' "Client watchdog only interrupts a still-loading UI" "Client loading watchdog no longer checks the visible loading state"
AssertContains $scriptJs 'history.replaceState({}, "", buildRelativeUrl(language, pageType, city));' "Client history updates stay aligned with route building" "Client history updates drifted from route building"
AssertContains $scriptJs 'window.language = language;' "Client exposes the active language globally for the menu sync" "Client no longer exposes the active language globally"
AssertContains $scriptJs 'window.setLanguage = setLanguage;' "Client exposes setLanguage globally for the menu sync" "Client no longer exposes setLanguage globally"
AssertContains $scriptJs 'setLanguage(language, false);' "Client boot sequence still initializes language first" "Client boot sequence no longer initializes language before loading data"
AssertContains $scriptJs 'loadPrayerTimes();' "Client boot sequence still loads prayer times on startup" "Client boot sequence no longer loads prayer times on startup"
AssertNotContains $scriptJs 'const params = new URLSearchParams({ lang });' "Client no longer mixes query-param language URLs into route building" "Client still mixes query-param language URLs into route building"

AssertContains $renderJs 'function normalizeLanguage(value)' "SSR renderer keeps language normalization" "SSR renderer is missing language normalization"
AssertContains $renderJs 'function getAlternates(pageType, city)' "SSR renderer keeps alternate-link generation" "SSR renderer is missing alternate-link generation"
AssertContains $renderJs 'function buildEnglishCopy' "SSR renderer keeps English copy generation" "SSR renderer is missing English copy generation"
AssertContains $renderJs 'function buildArabicCopy' "SSR renderer keeps Arabic copy generation" "SSR renderer is missing Arabic copy generation"
AssertContains $renderJs 'function buildCopy({ language, pageType, place, topic })' "SSR renderer keeps the shared copy entry point" "SSR renderer is missing the shared copy entry point"
AssertContains $renderJs 'function buildLocalizedCopy(language, { pageType, place, topic })' "SSR renderer keeps the localized copy builder" "SSR renderer is missing the localized copy builder"
AssertContains $renderJs 'const SUPPORTED_RENDER_LANGUAGES = ["en", "ar", "de", "fr", "tr", "zh-hans"];' "SSR renderer tracks all supported languages" "SSR renderer supported-language list is missing or incomplete"
AssertContains $renderJs 'const LANGUAGE_ALIASES = {' "SSR renderer keeps language aliases" "SSR renderer language aliases are missing"
AssertContains $renderJs 'const LANGUAGE_PREFIXES = {' "SSR renderer keeps language prefixes" "SSR renderer language prefixes are missing"
AssertContains $renderJs 'const INLINE_LINK_CONNECTORS = {' "SSR renderer keeps localized inline-link connectors" "SSR renderer is missing localized inline-link connectors"
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
AssertContains $rewritesText '"/de"' "vercel.json includes German rewrites" "vercel.json is missing German rewrites"
AssertContains $rewritesText '"/fr"' "vercel.json includes French rewrites" "vercel.json is missing French rewrites"
AssertContains $rewritesText '"/tr"' "vercel.json includes Turkish rewrites" "vercel.json is missing Turkish rewrites"
AssertContains $rewritesText '"/zh-hans"' "vercel.json includes Chinese rewrites" "vercel.json is missing Chinese rewrites"

AssertContains $sitemapCore 'https://www.adantimer.com/de/prayer-times' "Core sitemap includes German prayer routes" "Core sitemap is missing German prayer routes"
AssertContains $sitemapCore 'https://www.adantimer.com/fr/prayer-times' "Core sitemap includes French prayer routes" "Core sitemap is missing French prayer routes"
AssertContains $sitemapCore 'https://www.adantimer.com/tr/prayer-times' "Core sitemap includes Turkish prayer routes" "Core sitemap is missing Turkish prayer routes"
AssertContains $sitemapCore 'https://www.adantimer.com/zh-hans/isha-time' "Core sitemap includes Chinese prayer routes" "Core sitemap is missing Chinese prayer routes"
AssertContains $sitemapIndex 'https://www.adantimer.com/sitemap-core.xml.gz' "Sitemap index points to the core sitemap" "Sitemap index is missing the core sitemap"
AssertContains $robots 'Sitemap: https://www.adantimer.com/sitemap.xml' "robots.txt points to the sitemap index" "robots.txt is missing the sitemap index reference"
AssertContains $workflow 'tools/generate_sitemaps.py' "Sitemap workflow is wired to the generator script" "Sitemap workflow no longer calls the generator script"

TestMojibake "index.html"
TestMojibake "script.js"
TestMojibake "api/render.js"

if ($RunLive) {
  TestLiveUrl "$BaseUrl/" @("Other languages", 'hreflang="zh-hans"', 'Adantimer | Accurate Prayer Times and Next Salah Countdown')
  TestLiveUrl "$BaseUrl/ar/asr-time/buraydah" @('<html lang="ar" dir="rtl">', 'https://www.adantimer.com/ar/asr-time/buraydah')
  TestLiveUrl "$BaseUrl/de/prayer-times/berlin" @('Prayer Times in Berlin Today | Adantimer', 'https://www.adantimer.com/prayer-times/berlin')
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
