$projectDir = "C:\Users\Meriton\Desktop\pizzeria-ai"
$baseUrl = "http://localhost:3000"

function Test-ServerRunning {
    try {
        Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 3 | Out-Null
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-ServerRunning)) {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$projectDir`" && npm run dev" -WindowStyle Hidden
}
