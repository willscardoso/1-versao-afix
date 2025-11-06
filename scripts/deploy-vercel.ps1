<#
Simple helper to deploy this repo to Vercel using a personal token.

USAGE (PowerShell):
  .\scripts\deploy-vercel.ps1

This script will:
- ask for a Vercel personal token (session only)
- verify the token with `vercel whoami`
- run a non-interactive `npx vercel --prod` deploy for the specified project name

Important: rotate and create a fresh Vercel token in the Vercel dashboard before running.
#>

function Abort($msg){ Write-Host $msg -ForegroundColor Red; exit 1 }

Write-Host "Vercel deploy helper for this repo"
$token = Read-Host "Paste your VERCEL_TOKEN (it will not be stored)"
if (-not $token) { Abort "No token provided. Exiting." }

$project = Read-Host "Enter a lowercase project name to create/use (e.g. afix)"
if (-not $project) { Abort "Project name required. Exiting." }

$cwd = (Get-Location).Path

Write-Host "Verifying token with 'vercel whoami'..."
# use npx so we don't require a global install
$npxWhoami = & npx vercel whoami --token $token 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host $npxWhoami
    Abort "Token validation failed. Make sure you created a Personal Token in Vercel (Account → Tokens) and that the token belongs to the same account/team." 
}
Write-Host "Token is valid. Proceeding to deploy..."

# Deploy non-interactively
$npxDeploy = & npx vercel --prod --confirm --name $project --cwd $cwd --token $token 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host $npxDeploy
    Abort "Deploy failed. See messages above. You can re-run this script after fixing errors." 
}

Write-Host $npxDeploy
Write-Host "Deploy finished. Next steps:"
Write-Host "- Go to Vercel dashboard for project '$project' and set the environment variables:" -ForegroundColor Cyan
Write-Host "    NEXT_PUBLIC_SUPABASE_URL (Preview+Production)" -ForegroundColor Cyan
Write-Host "    NEXT_PUBLIC_SUPABASE_ANON_KEY (Preview+Production)" -ForegroundColor Cyan
Write-Host "    SUPABASE_SERVICE_ROLE (Production only - secret)" -ForegroundColor Cyan
Write-Host "    JWT_SECRET (Production only - secret)" -ForegroundColor Cyan
Write-Host "- After env vars are set, redeploy or trigger a new deployment from Vercel to pick them up." -ForegroundColor Green

Write-Host 'TIP: you can set env vars in the Vercel dashboard or with the CLI: `vercel env add`' -ForegroundColor Yellow

Read-Host "Press Enter to finish"
