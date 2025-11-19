# HackTheBox-style VPN Network Setup Script
# Creates internal network for lab VMs accessible via VPN

param(
    [string]$NetworkName = "LabNetwork",
    [string]$NetworkSubnet = "192.168.100.0/24",
    [string]$VpnSubnet = "10.10.10.0/24"
)

Write-Host "Setting up HackTheBox-style VPN Network..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

try {
    # Install OpenVPN if not present
    Write-Host "Checking OpenVPN installation..." -ForegroundColor Yellow
    
    $openVpnPath = "C:\Program Files\OpenVPN\bin\openvpn.exe"
    if (-not (Test-Path $openVpnPath)) {
        Write-Host "OpenVPN not found. Please install OpenVPN first:" -ForegroundColor Red
        Write-Host "1. Download from: https://openvpn.net/community-downloads/" -ForegroundColor Yellow
        Write-Host "2. Install as Administrator" -ForegroundColor Yellow
        Write-Host "3. Run this script again" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "OpenVPN found at: $openVpnPath" -ForegroundColor Green
    
    # Create VirtualBox internal network
    Write-Host "Creating VirtualBox internal network: $NetworkName" -ForegroundColor Yellow
    
    # Check if VBoxManage is available
    $vboxPath = Get-Command "VBoxManage.exe" -ErrorAction SilentlyContinue
    if (-not $vboxPath) {
        Write-Host "VBoxManage not found in PATH. Adding VirtualBox to PATH..." -ForegroundColor Yellow
        $env:PATH += ";C:\Program Files\Oracle\VirtualBox"
    }
    
    # Create internal network for lab VMs
    VBoxManage.exe natnetwork add --netname "$NetworkName" --network "$NetworkSubnet" --enable
    Write-Host "Internal network created: $NetworkSubnet" -ForegroundColor Green
    
    # Setup TAP adapter for OpenVPN
    Write-Host "Setting up TAP adapter for VPN..." -ForegroundColor Yellow
    
    # The OpenVPN installer should have created a TAP adapter
    $tapAdapters = Get-NetAdapter | Where-Object { $_.InterfaceDescription -like "*TAP-Windows*" }
    
    if ($tapAdapters.Count -eq 0) {
        Write-Host "No TAP adapter found. OpenVPN installation may be incomplete." -ForegroundColor Red
        Write-Host "Please reinstall OpenVPN with TAP adapter support." -ForegroundColor Yellow
        exit 1
    }
    
    $tapAdapter = $tapAdapters[0]
    Write-Host "Found TAP adapter: $($tapAdapter.Name)" -ForegroundColor Green
    
    # Configure TAP adapter IP
    Write-Host "Configuring TAP adapter..." -ForegroundColor Yellow
    netsh interface ip set address "$($tapAdapter.Name)" static 10.10.10.1 255.255.255.0
    
    # Enable IP forwarding
    Write-Host "Enabling IP forwarding..." -ForegroundColor Yellow
    Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" -Name "IPEnableRouter" -Value 1
    
    # Configure Windows Firewall rules for VPN
    Write-Host "Configuring firewall rules..." -ForegroundColor Yellow
    
    # Allow OpenVPN server
    New-NetFirewallRule -DisplayName "OpenVPN Server" -Direction Inbound -Protocol UDP -LocalPort 1194 -Action Allow -ErrorAction SilentlyContinue
    
    # Allow traffic on VPN subnets
    New-NetFirewallRule -DisplayName "VPN Lab Traffic" -Direction Inbound -Protocol Any -LocalAddress "10.10.10.0/24" -Action Allow -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "Lab Network Traffic" -Direction Inbound -Protocol Any -LocalAddress "192.168.100.0/24" -Action Allow -ErrorAction SilentlyContinue
    
    Write-Host "`nVPN Network setup completed successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Generate CA certificates for OpenVPN" -ForegroundColor White
    Write-Host "2. Configure OpenVPN server with config file" -ForegroundColor White
    Write-Host "3. Update VM network settings to use internal network" -ForegroundColor White
    Write-Host "4. Test VPN connection and VM access" -ForegroundColor White
    
    Write-Host "`nNetwork Configuration:" -ForegroundColor Cyan
    Write-Host "VPN Server: 10.10.10.1" -ForegroundColor White
    Write-Host "VPN Client Range: 10.10.10.10-10.10.10.100" -ForegroundColor White
    Write-Host "Lab VM Range: 192.168.100.10-192.168.100.200" -ForegroundColor White
    Write-Host "TAP Adapter: $($tapAdapter.Name)" -ForegroundColor White
    
} catch {
    Write-Host "Error setting up VPN network: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}