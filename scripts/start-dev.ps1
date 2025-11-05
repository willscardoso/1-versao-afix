<#
Simple helper to check for Node.js, optionally install deps, and start the Next.js dev server.
Usage:
  .\scripts\start-dev.ps1 -InstallDeps    # installs deps then starts
  .\scripts\start-dev.ps1                 # starts (assumes node_modules exists)
#>

param(
    [switch]$InstallDeps
)

function Test-Command($name) {
    return (Get-Command $name -ErrorAction SilentlyContinue) -ne $null
}

if (-not (Test-Command node)) {
    Write-Host "Node.js not found. Please install Node.js (LTS)." -ForegroundColor Yellow
    Write-Host "Download: https://nodejs.org/" -ForegroundColor Cyan
    Write-Host "Or use winget: winget install --id OpenJS.NodeJS.LTS -e" -ForegroundColor Cyan
    exit 1
}

if ($InstallDeps -or -not (Test-Path -Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Green
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "npm install failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

Write-Host "Starting Next.js dev server..." -ForegroundColor Green
npm run dev
