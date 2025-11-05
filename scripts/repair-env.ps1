<#
Repair or create a `.env.local` interactively by validating existing values.
Usage: run from repository root in PowerShell:
  .\scripts\repair-env.ps1
#>

Write-Host "Repair .env.local helper`n" -ForegroundColor Cyan

$envPath = Join-Path -Path (Get-Location) -ChildPath ".env.local"

if (Test-Path $envPath) {
    Write-Host ".env.local found at $envPath. Reading..." -ForegroundColor Yellow
    $lines = Get-Content $envPath
} else {
    Write-Host ".env.local not found. A new file will be created." -ForegroundColor Yellow
    $lines = @()
}

$kv = @{}
foreach ($line in $lines) {
    if ($line -match '^\s*#') { continue }
    if ($line -match '^(\w+)=(.*)$') {
        $kv[$matches[1]] = $matches[2].Trim()
    }
}

function promptIfInvalid($key, $validator, $message) {
    $val = $kv[$key]
    if (-not $validator.Invoke($val)) {
        do {
            $in = Read-Host "$message"
            if ($in -and $in.Trim() -ne '') { $kv[$key] = $in.Trim(); break }
        } while ($true)
    }
}

promptIfInvalid 'NEXT_PUBLIC_SUPABASE_URL' ({ param($v) ($v -and ($v -match 'https?://[\w\.-]+supabase\.co')) }, 'Enter your Supabase project URL (https://<ref>.supabase.co)')
promptIfInvalid 'SUPABASE_SERVICE_ROLE' ({ param($v) ($v -and ($v.Length -gt 20)) }, 'Enter your SUPABASE_SERVICE_ROLE (service role key)')
promptIfInvalid 'JWT_SECRET' ({ param($v) ($v -and ($v.Length -gt 10)) }, 'Enter a JWT_SECRET (long random string)')

# write back
$out = @()
foreach ($k in $kv.Keys) { $out += "$k=$($kv[$k])" }
Set-Content -Path $envPath -Value $out -Encoding UTF8
Write-Host "Wrote .env.local (please ensure it is kept secret)." -ForegroundColor Green

Write-Host "Now restart your dev server: npm run dev" -ForegroundColor Cyan
