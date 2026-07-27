$projectDir = "C:\Users\Meriton\Desktop\pizzeria-ai"
$baseUrl = "http://localhost:3000"
$secret = "1e88a1a6478664acc9a848d9e99eed07fed9583ed5af1982"
$logDir = Join-Path $projectDir "scripts\logs"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/social/publish-scheduled?secret=$secret" -Method Get -TimeoutSec 30
    $response | ConvertTo-Json -Depth 5 | Out-File -FilePath (Join-Path $logDir "daily-post-$timestamp.log") -Encoding utf8
} catch {
    "Fehler: $($_ | Out-String)" | Out-File -FilePath (Join-Path $logDir "daily-post-$timestamp-ERROR.log") -Encoding utf8
}
