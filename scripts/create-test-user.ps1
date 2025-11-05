param(
  [string]$Email = 'test@local.test',
  [string]$Password = 'TestPass123!',
  [string]$FullName = 'Test User'
)

$body = @{ email = $Email; password = $Password; full_name = $FullName } | ConvertTo-Json

try {
  $res = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/admin/create-user' -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
  Write-Output "Created user: $($res.user.email) id=$($res.user.id)"
} catch {
  Write-Error "Create user failed: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    try { $text = $_.Exception.Response.Content | ConvertFrom-Json; Write-Output ($text | ConvertTo-Json -Depth 5) } catch { }
  }
}
