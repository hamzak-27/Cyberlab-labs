# OpenVPN Certificate Setup Script
# Downloads Easy-RSA and generates all required certificates

param(
    [string]$ServerName = "labs-vpn-server",
    [string]$CertDir = "C:\Users\ihamz\labs-backend\certificates"
)

Write-Host "Setting up OpenVPN certificates..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

try {
    # Create working directory
    $WorkDir = "C:\OpenVPN-Setup"
    $EasyRSADir = "$WorkDir\easy-rsa"
    
    Write-Host "Creating working directory: $WorkDir" -ForegroundColor Yellow
    if (Test-Path $WorkDir) {
        Remove-Item $WorkDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $WorkDir -Force | Out-Null
    
    # Download Easy-RSA
    Write-Host "Downloading Easy-RSA..." -ForegroundColor Yellow
    $EasyRSAUrl = "https://github.com/OpenVPN/easy-rsa/releases/download/v3.1.7/EasyRSA-3.1.7.tgz"
    $EasyRSAZip = "$WorkDir\easyrsa.tgz"
    
    try {
        Invoke-WebRequest -Uri $EasyRSAUrl -OutFile $EasyRSAZip -UseBasicParsing
        Write-Host "Easy-RSA downloaded successfully" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download Easy-RSA. Trying alternative method..." -ForegroundColor Yellow
        
        # Alternative: Download ZIP version
        $AltUrl = "https://github.com/OpenVPN/easy-rsa/archive/refs/tags/v3.1.7.zip"
        Invoke-WebRequest -Uri $AltUrl -OutFile "$WorkDir\easyrsa.zip" -UseBasicParsing
        
        # Extract ZIP
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory("$WorkDir\easyrsa.zip", $WorkDir)
        
        # Rename extracted directory
        $ExtractedDir = Get-ChildItem $WorkDir -Directory | Where-Object { $_.Name -like "*easy-rsa*" } | Select-Object -First 1
        if ($ExtractedDir) {
            Rename-Item $ExtractedDir.FullName $EasyRSADir
        }
    }
    
    # If tgz download succeeded, try to extract it
    if (Test-Path $EasyRSAZip) {
        Write-Host "Extracting Easy-RSA..." -ForegroundColor Yellow
        
        # Try using 7-Zip if available
        $SevenZip = Get-Command "7z.exe" -ErrorAction SilentlyContinue
        if ($SevenZip) {
            & $SevenZip x $EasyRSAZip -o"$WorkDir" -y
            & $SevenZip x "$WorkDir\EasyRSA-3.1.7.tar" -o"$WorkDir" -y
            Rename-Item "$WorkDir\EasyRSA-3.1.7" $EasyRSADir -Force
        } else {
            Write-Host "7-Zip not found. Please install 7-Zip or use the alternative method above." -ForegroundColor Red
            throw "Cannot extract .tgz file without 7-Zip"
        }
    }
    
    # Verify Easy-RSA directory exists
    if (-not (Test-Path $EasyRSADir)) {
        Write-Host "Easy-RSA directory not found. Creating minimal setup..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $EasyRSADir -Force | Out-Null
        
        # Download easyrsa script directly
        $EasyRSAScript = "https://raw.githubusercontent.com/OpenVPN/easy-rsa/v3.1.7/easyrsa3/easyrsa"
        Invoke-WebRequest -Uri $EasyRSAScript -OutFile "$EasyRSADir\easyrsa" -UseBasicParsing
        
        # Create Windows batch wrapper
        @"
@echo off
cd /d "%~dp0"
bash easyrsa %*
"@ | Out-File "$EasyRSADir\easyrsa.bat" -Encoding ASCII
    }
    
    # Navigate to Easy-RSA directory
    Set-Location $EasyRSADir
    Write-Host "Working in: $EasyRSADir" -ForegroundColor Cyan
    
    # Check if we have the easyrsa executable
    $EasyRSAExe = Get-ChildItem -Path . -Filter "easyrsa*" -File | Select-Object -First 1
    if (-not $EasyRSAExe) {
        Write-Host "easyrsa executable not found. Creating simple certificate generation..." -ForegroundColor Yellow
        
        # Fallback: Generate certificates using OpenSSL directly
        $OpenSSLPath = Get-Command "openssl.exe" -ErrorAction SilentlyContinue
        if (-not $OpenSSLPath) {
            # Try OpenVPN's bundled OpenSSL
            $OpenSSLPath = "C:\Program Files\OpenVPN\bin\openssl.exe"
            if (-not (Test-Path $OpenSSLPath)) {
                throw "OpenSSL not found. Please install OpenSSL or ensure OpenVPN is properly installed."
            }
        } else {
            $OpenSSLPath = $OpenSSLPath.Source
        }
        
        Write-Host "Using OpenSSL at: $OpenSSLPath" -ForegroundColor Green
        
        # Create certificates directory
        New-Item -ItemType Directory -Path "$CertDir" -Force | Out-Null
        Set-Location $CertDir
        
        # Generate CA private key
        Write-Host "Generating CA private key..." -ForegroundColor Yellow
        & "$OpenSSLPath" genrsa -out ca.key 4096
        
        # Generate CA certificate
        Write-Host "Generating CA certificate..." -ForegroundColor Yellow
        & "$OpenSSLPath" req -new -x509 -days 365 -key ca.key -out ca.crt -subj "/C=US/ST=CA/L=SF/O=CyberLabs/CN=CyberLabs-CA"
        
        # Generate server private key
        Write-Host "Generating server private key..." -ForegroundColor Yellow
        & "$OpenSSLPath" genrsa -out server.key 4096
        
        # Generate server certificate request
        Write-Host "Generating server certificate request..." -ForegroundColor Yellow
        & "$OpenSSLPath" req -new -key server.key -out server.csr -subj "/C=US/ST=CA/L=SF/O=CyberLabs/CN=$ServerName"
        
        # Sign server certificate
        Write-Host "Signing server certificate..." -ForegroundColor Yellow
        & "$OpenSSLPath" x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt
        
        # Generate Diffie-Hellman parameters
        Write-Host "Generating Diffie-Hellman parameters (this may take a while)..." -ForegroundColor Yellow
        & "$OpenSSLPath" dhparam -out dh.pem 2048
        
        # Generate TLS auth key
        Write-Host "Generating TLS auth key..." -ForegroundColor Yellow
        $OpenVPNPath = "C:\Program Files\OpenVPN\bin\openvpn.exe"
        if (Test-Path $OpenVPNPath) {
            & "$OpenVPNPath" --genkey --secret ta.key
        } else {
            # Generate random key manually
            $RandomBytes = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
            $KeyBytes = New-Object byte[] 256
            $RandomBytes.GetBytes($KeyBytes)
            [System.Convert]::ToBase64String($KeyBytes) | Out-File "ta.key" -Encoding ASCII
        }
        
        # Clean up temporary files
        Remove-Item server.csr -ErrorAction SilentlyContinue
        Remove-Item ca.srl -ErrorAction SilentlyContinue
        
    } else {
        # Use Easy-RSA if available
        Write-Host "Found Easy-RSA executable: $($EasyRSAExe.Name)" -ForegroundColor Green
        
        # Initialize PKI
        Write-Host "Initializing PKI..." -ForegroundColor Yellow
        & ".\$($EasyRSAExe.Name)" init-pki
        
        # Build CA
        Write-Host "Building Certificate Authority..." -ForegroundColor Yellow
        & ".\$($EasyRSAExe.Name)" build-ca nopass
        
        # Generate server certificate
        Write-Host "Generating server certificate..." -ForegroundColor Yellow
        & ".\$($EasyRSAExe.Name)" build-server-full server nopass
        
        # Generate Diffie-Hellman parameters
        Write-Host "Generating Diffie-Hellman parameters..." -ForegroundColor Yellow
        & ".\$($EasyRSAExe.Name)" gen-dh
        
        # Generate TLS auth key
        Write-Host "Generating TLS auth key..." -ForegroundColor Yellow
        $OpenVPNPath = "C:\Program Files\OpenVPN\bin\openvpn.exe"
        if (Test-Path $OpenVPNPath) {
            & "$OpenVPNPath" --genkey --secret ta.key
        }
        
        # Copy certificates to destination
        Write-Host "Copying certificates to: $CertDir" -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $CertDir -Force | Out-Null
        
        Copy-Item "pki\ca.crt" $CertDir -Force
        Copy-Item "pki\issued\server.crt" $CertDir -Force
        Copy-Item "pki\private\server.key" $CertDir -Force
        Copy-Item "pki\dh.pem" $CertDir -Force
        Copy-Item "ta.key" $CertDir -Force
    }
    
    # Verify all certificates were created
    Write-Host "`nVerifying certificates..." -ForegroundColor Cyan
    $RequiredFiles = @("ca.crt", "server.crt", "server.key", "dh.pem", "ta.key")
    $AllFilesExist = $true
    
    foreach ($file in $RequiredFiles) {
        $filepath = Join-Path $CertDir $file
        if (Test-Path $filepath) {
            $size = (Get-Item $filepath).Length
            Write-Host "✅ $file ($size bytes)" -ForegroundColor Green
        } else {
            Write-Host "❌ $file (missing)" -ForegroundColor Red
            $AllFilesExist = $false
        }
    }
    
    if ($AllFilesExist) {
        Write-Host "`n🎉 All certificates generated successfully!" -ForegroundColor Green
        Write-Host "Certificates location: $CertDir" -ForegroundColor Cyan
        Write-Host "`nNext steps:" -ForegroundColor Yellow
        Write-Host "1. Update OpenVPN server configuration" -ForegroundColor White
        Write-Host "2. Start OpenVPN server" -ForegroundColor White
        Write-Host "3. Test VPN connection" -ForegroundColor White
    } else {
        Write-Host "`n❌ Some certificates are missing. Check the logs above." -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "Error during certificate setup: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
} finally {
    # Clean up
    if (Test-Path $WorkDir) {
        Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
        Set-Location "C:\"
        Remove-Item $WorkDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "`n✅ Certificate setup completed!" -ForegroundColor Green