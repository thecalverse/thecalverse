param(
  [string]$SourceRoot = "X:\Calverse\Versions",
  [string]$RepoDir = "X:\Calverse\thecalverse"
)

$ErrorActionPreference = "Stop"

$landingDir = Join-Path $SourceRoot "Landing Pages"
$htmlDir = Join-Path $SourceRoot "html"
$apkDir = Join-Path $SourceRoot "apk"
$aabDir = Join-Path $SourceRoot "aab"

$required = @(
  (Join-Path $landingDir "index-2.html"),
  (Join-Path $htmlDir "assets"),
  $apkDir,
  $aabDir
)

foreach ($path in $required) {
  if (-not (Test-Path $path)) {
    throw "Required source path not found: $path"
  }
}

$latestVersion = Get-ChildItem -Path $htmlDir -File -Filter "V*.html" |
  Where-Object { $_.BaseName -match '^V\d+$' } |
  Sort-Object { [int]($_.BaseName -replace '^V', '') } -Descending |
  Select-Object -First 1

if (-not $latestVersion) {
  throw "No versioned HTML files found in $htmlDir (expected names like V17.html, V18.html)."
}

Copy-Item -Path (Join-Path $landingDir "index-2.html") -Destination (Join-Path $RepoDir "index.html") -Force
Copy-Item -Path $latestVersion.FullName -Destination (Join-Path $RepoDir "V17.html") -Force
Copy-Item -Path $latestVersion.FullName -Destination (Join-Path $RepoDir "app.html") -Force

$destAssets = Join-Path $RepoDir "assets"
if (Test-Path $destAssets) {
  Remove-Item -LiteralPath $destAssets -Recurse -Force
}
Copy-Item -Path (Join-Path $htmlDir "assets") -Destination $destAssets -Recurse -Force

$destApks = Join-Path $RepoDir "apks"
if (Test-Path $destApks) {
  Remove-Item -LiteralPath $destApks -Recurse -Force
}
Copy-Item -Path $apkDir -Destination $destApks -Recurse -Force

$destAabb = Join-Path $RepoDir "aabb"
if (Test-Path $destAabb) {
  Remove-Item -LiteralPath $destAabb -Recurse -Force
}
Copy-Item -Path $aabDir -Destination $destAabb -Recurse -Force

Write-Host "Sync complete from landing index-2 and $($latestVersion.Name): index.html -> index.html, $($latestVersion.Name) -> V17.html, assets/, apks/, aabb/"
