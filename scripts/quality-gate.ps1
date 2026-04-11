param(
  [string]$RunLive,
  [string]$BaseUrl
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

if (-not $BaseUrl) {
  $BaseUrl = "https://www.adantimer.com"
}

$failures = New-Object System.Collections.Generic.List[string]
$checks = New-Object System.Collections.Generic.List[string]

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

function TestMojibake([string]$relativePath) {
  $content = ReadProjectFile $relativePath
  if (-not $content) {
    return
  }

  $sanitized = [regex]::Replace($content, '(?m)^.*MOJIBAKE_PATTERN.*\r?\n?', '')
  $pattern = '(?:\u00C3.|\u00D8.|\u00D9.|\u00E6.|\u00EF\u00BC.|\u00E2.|\u00D0.|\u00D1.)'
  if ([regex]::IsMatch($sanitized, $pattern)) {
    AddFailure "Suspicious mojibake pattern found in $relativePath"
  } else {
    AddCheck "No suspicious mojibake pattern found in $relativePath"
  }
}

function TestLiveUrl([string]$url, [string[]]$requiredSnippets) {
  try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing
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
    AddFailure "Live check failed for $url -> $($_.Exception.Message)"
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
  "api/render-copy.js",
  "api/render-data.js",
  "api/render-locales.js",
  "api/render-template.js"
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
$renderTemplate = ReadProjectFile "api/render-template.js"
$sitemapCore = ReadProjectFile "sitemap-core.xml"
$robots = ReadProjectFile "robots.txt"

AssertContains $indexHtml 'data-lang="en"' "Homepage keeps the English quick button" "Homepage is missing the English quick button"
AssertContains $indexHtml 'data-lang="ar"' "Homepage keeps the Arabic quick button" "Homepage is missing the Arabic quick button"
AssertContains $indexHtml 'Other languages' "Homepage includes the Other languages menu" "Homepage is missing the Other languages menu"
AssertContains $indexHtml 'hreflang="de"' "Homepage exposes the German alternate" "Homepage is missing the German alternate"
AssertContains $indexHtml 'hreflang="zh-hans"' "Homepage exposes the Chinese alternate" "Homepage is missing the Chinese alternate"
AssertContains $indexHtml '"inLanguage": ["en", "ar", "de", "fr", "tr", "zh-Hans"]' "Structured data lists all supported languages" "Structured data language list is incomplete"

AssertContains $scriptJs 'window.setLanguage = setLanguage;' "Client language switch remains globally available" "Client language switch is no longer exposed globally"
AssertContains $scriptJs 'updateAlternateLinks(city);' "Client SEO updates still refresh alternate links" "Client SEO updates no longer refresh alternate links"
AssertContains $scriptJs 'locale.cityLabel || locale.cityPlaceholder' "Client labels use real localized labels" "Client labels still fall back to placeholders only"
AssertContains $renderTemplate 'English</button>' "SSR template keeps the English quick button" "SSR template no longer renders the English quick button"
AssertContains $renderTemplate 'Arabic</button>' "SSR template keeps the Arabic quick button" "SSR template no longer renders the Arabic quick button"
AssertContains $sitemapCore 'https://www.adantimer.com/de/prayer-times' "Core sitemap includes German prayer routes" "Core sitemap is missing German prayer routes"
AssertContains $sitemapCore 'https://www.adantimer.com/zh-hans/isha-time' "Core sitemap includes Chinese prayer routes" "Core sitemap is missing Chinese prayer routes"
AssertContains $robots 'Sitemap: https://www.adantimer.com/sitemap.xml' "robots.txt points to the sitemap index" "robots.txt is missing the sitemap index reference"

TestMojibake "index.html"
TestMojibake "script.js"
TestMojibake "api/render-template.js"
TestMojibake "api/render-copy.js"
TestMojibake "api/render-data.js"
TestMojibake "api/render-locales.js"

AssertTrue (-not (Test-Path (Join-Path $projectRoot "api/render-de.js"))) "Unused render-de.js preview file is gone" "Unused api/render-de.js is still present"

if ($RunLive) {
  TestLiveUrl "$BaseUrl/" @("Other languages", 'hreflang="zh-hans"')
  TestLiveUrl "$BaseUrl/de" @('<html lang="de"', 'canonical" href="https://www.adantimer.com/de"')
  TestLiveUrl "$BaseUrl/ar/asr-time/buraydah" @('<html lang="ar" dir="rtl"', 'dir="rtl"')
  TestLiveUrl "$BaseUrl/sitemap-core.xml" @("https://www.adantimer.com/de/prayer-times", "https://www.adantimer.com/zh-hans/isha-time")
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
