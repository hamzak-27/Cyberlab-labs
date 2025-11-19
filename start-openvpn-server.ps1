# Start OpenVPN Server
# Run as Administrator

Write-Host "Starting OpenVPN Server..." -ForegroundColor Green

# Path to OpenVPN executable
$openvpnExe = "C:\Program Files\OpenVPN\bin\openvpn.exe"
$configFile = "C:\Program Files\OpenVPN\config\openvpn-server.conf"

# Check if already running
$existingProcess = Get-Process | Where-Object {$_.ProcessName -eq "openvpn" -and $_.Path -like "*OpenVPN*"}
if ($existingProcess) {
    Write-Host "OpenVPN server already running (PID: $($existingProcess.Id))" -ForegroundColor Yellow
    Write-Host "Stop it first with: Stop-Process -Id $($existingProcess.Id) -Force" -ForegroundColor Yellow
    exit 1
}

# Check if config file exists
if (-not (Test-Path $configFile)) {
    Write-Host "ERROR: Config file not found: $configFile" -ForegroundColor Red
    exit 1
}

Write-Host "Config file: $configFile" -ForegroundColor Cyan
Write-Host "Starting OpenVPN server..." -ForegroundColor Cyan

# Start OpenVPN server
Start-Process -FilePath $openvpnExe -ArgumentList "--config `"$configFile`"" -Verb RunAs -WindowStyle Normal

Start-Sleep -Seconds 2

# Verify it started
$newProcess = Get-Process | Where-Object {$_.ProcessName -eq "openvpn"}
if ($newProcess) {
    Write-Host "[OK] OpenVPN server started successfully (PID: $($newProcess.Id))" -ForegroundColor Green
    Write-Host "Server listening on localhost:1194 (UDP)" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to start OpenVPN server" -ForegroundColor Red
}
