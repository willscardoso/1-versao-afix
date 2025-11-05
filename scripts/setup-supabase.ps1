<#
Interactive PowerShell script to bootstrap Supabase env vars and optionally create a test user.

Usage: run this from the repo root in PowerShell:
  .\scripts\setup-supabase.ps1

It will prompt for:
 - Supabase Project URL or project ref (e.g. your-ref or https://your-ref.supabase.co)
 - anon key
 - (optional) service_role key
 - whether to create a test user (email + password)

Security: this writes a `.env.local` file with the provided keys. Do NOT commit `.env.local`.
#>

Write-Host "Supabase setup helper`n" -ForegroundColor Cyan

$validateProject = {
    param($input)
    if (-not $input) { return $null }
    # If user accidentally pasted a command, reject it
    if ($input -match "\b(powershell|\.ps1|Set-ExecutionPolicy|-ExecutionPolicy|Invoke-RestMethod)\b") {
        return $null
    }
    # If it contains a URL, extract the first supabase.co URL-like token
    $urlMatch = [regex]::Match($input, 'https?://[\w\.-]+supabase\.co')
    if ($urlMatch.Success) { return $urlMatch.Value.TrimEnd('/') }
    # Otherwise, if it's a short ref (alphanumeric, 4-20 chars), build a URL
    if ($input -match '^[a-z0-9-]{4,}$') { return "https://$input.supabase.co" }
    return $null
}

do {
    $projectInput = Read-Host "Enter your Supabase project ref (e.g. abcdef) or full URL (https://<ref>.supabase.co)"
    $projectUrl = & $validateProject $projectInput
    if (-not $projectUrl) { Write-Host "Invalid project ref or URL detected. Please enter only the short project ref (e.g. abcdef) or the full https://<ref>.supabase.co URL." -ForegroundColor Red }
} while (-not $projectUrl)

do {
    $anonKey = Read-Host "Enter your NEXT_PUBLIC_SUPABASE_ANON_KEY (anon key)"
    if (-not $anonKey -or $anonKey.Length -lt 20) { Write-Host "The anon key looks invalid (too short). Please paste the anon/public key from Supabase Settings → API." -ForegroundColor Yellow }
} while (-not $anonKey -or $anonKey.Length -lt 20)

$serviceRole = Read-Host "(Optional) Enter SUPABASE_SERVICE_ROLE (press Enter to skip)"
if ($serviceRole -and $serviceRole.Trim() -ne "" -and $serviceRole -match "^\s*") {
    # trim spaces
    $serviceRole = $serviceRole.Trim()
}

$envPath = Join-Path -Path (Get-Location) -ChildPath ".env.local"

Write-Host "Writing .env.local to: $envPath" -ForegroundColor Yellow

$content = @()
$content += "NEXT_PUBLIC_SUPABASE_URL=$projectUrl"
$content += "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey"
if ($serviceRole -and $serviceRole.Trim() -ne "") {
    $content += "SUPABASE_SERVICE_ROLE=$serviceRole"
}

Set-Content -Path $envPath -Value $content -Encoding UTF8

Write-Host "Wrote .env.local (remember: do NOT commit this file)." -ForegroundColor Green

$createUser = Read-Host "Do you want to create a test user now? (y/N)"
if ($createUser -match '^[Yy]') {
    $testEmail = Read-Host "Enter test user email (e.g. test+1@example.com)"
    $testPassword = Read-Host "Enter test user password (will be visible)"

    $signupUrl = "$projectUrl/auth/v1/signup"
    $body = @{ email = $testEmail; password = $testPassword } | ConvertTo-Json

    Write-Host "Creating user via: $signupUrl" -ForegroundColor Yellow
    try {
        $resp = Invoke-RestMethod -Method Post -Uri $signupUrl -Body $body -Headers @{ "apikey" = $anonKey; "Content-Type" = "application/json" } -ErrorAction Stop
        Write-Host "User signup response:" -ForegroundColor Green
        $resp | ConvertTo-Json -Depth 5 | Write-Host
        Write-Host "If signup requires email confirmation, finish confirmation in the Supabase Dashboard or use the service_role key to create a confirmed user." -ForegroundColor Yellow
    } catch {
        Write-Host "Failed to create user:" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
} else {
    Write-Host "Skipping user creation. You can create a user in the Supabase Dashboard -> Authentication -> Users." -ForegroundColor Yellow
}

Write-Host "Done. Start the dev server with: npm run dev" -ForegroundColor Cyan
