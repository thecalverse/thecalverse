param(
  [string]$SourceDir = "X:\Calverse\Versions\html",
  [string]$RepoDir = "X:\Calverse\thecalverse"
)

$ErrorActionPreference = "Stop"

$required = @(
  (Join-Path $SourceDir "index.html"),
  (Join-Path $SourceDir "V17.html"),
  (Join-Path $SourceDir "assets")
)

foreach ($path in $required) {
  if (-not (Test-Path $path)) {
    throw "Required source path not found: $path"
  }
}

Copy-Item -Path (Join-Path $SourceDir "index.html") -Destination (Join-Path $RepoDir "index.html") -Force
Copy-Item -Path (Join-Path $SourceDir "V17.html") -Destination (Join-Path $RepoDir "V17.html") -Force

$destAssets = Join-Path $RepoDir "assets"
if (Test-Path $destAssets) {
  Remove-Item -LiteralPath $destAssets -Recurse -Force
}
Copy-Item -Path (Join-Path $SourceDir "assets") -Destination $destAssets -Recurse -Force

Write-Host "Sync complete: index.html, V17.html, assets/"
