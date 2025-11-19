# Update OpenVPN Server Configuration
# Run this script as Administrator

Write-Host "Updating OpenVPN server configuration..." -ForegroundColor Yellow

$configPath = "C:\Program Files\OpenVPN\config\openvpn-server.conf"

if (Test-Path $configPath) {
    # Read the config file
    $content = Get-Content $configPath -Raw
    
    # Replace the old IP range with new one
    $content = $content -replace '192\.168\.100\.0', '10.12.10.0'
    
    # Write back to file
    Set-Content -Path $configPath -Value $content
    
    Write-Host "✅ Updated OpenVPN server config: 192.168.100.0/24 → 10.12.10.0/24" -ForegroundColor Green
    
    # Show the updated line
    Write-Host "`nUpdated routes:" -ForegroundColor Cyan
    Get-Content $configPath | Select-String "push.*route.*10.12.10"
    
    Write-Host "`nRestart OpenVPN service for changes to take effect:" -ForegroundColor Yellow
    Write-Host "  Restart-Service OpenVPNService" -ForegroundColor White
    
} else {
    Write-Host "❌ OpenVPN config file not found at: $configPath" -ForegroundColor Red
}
