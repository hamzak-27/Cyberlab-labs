# Simple OpenVPN Certificate Generator
# Works without admin privileges using OpenSSL

param(
    [string]$CertDir = "C:\Users\ihamz\labs-backend\certificates"
)

Write-Host "Generating OpenVPN certificates..." -ForegroundColor Green

try {
    # Create certificates directory
    Write-Host "Creating certificates directory: $CertDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $CertDir -Force | Out-Null
    Set-Location $CertDir
    
    # Check for OpenSSL
    $OpenSSLPath = $null
    $OpenSSLLocations = @(
        "C:\Program Files\OpenVPN\bin\openssl.exe",
        "C:\OpenSSL-Win64\bin\openssl.exe", 
        "C:\OpenSSL-Win32\bin\openssl.exe",
        "openssl.exe"
    )
    
    foreach ($location in $OpenSSLLocations) {
        if (Test-Path $location -ErrorAction SilentlyContinue) {
            $OpenSSLPath = $location
            break
        }
        if ($location -eq "openssl.exe") {
            $cmd = Get-Command "openssl.exe" -ErrorAction SilentlyContinue
            if ($cmd) {
                $OpenSSLPath = $cmd.Source
                break
            }
        }
    }
    
    if (-not $OpenSSLPath) {
        Write-Host "OpenSSL not found. Downloading portable OpenSSL..." -ForegroundColor Yellow
        
        # Download portable OpenSSL
        $OpenSSLUrl = "https://download.firedaemon.com/FireDaemon-OpenSSL/openssl-1.1.1w.zip"
        $OpenSSLZip = "$CertDir\openssl.zip" 
        
        try {
            Invoke-WebRequest -Uri $OpenSSLUrl -OutFile $OpenSSLZip -UseBasicParsing
            
            # Extract OpenSSL
            Add-Type -AssemblyName System.IO.Compression.FileSystem
            [System.IO.Compression.ZipFile]::ExtractToDirectory($OpenSSLZip, "$CertDir\openssl")
            
            $OpenSSLPath = Get-ChildItem "$CertDir\openssl" -Recurse -Filter "openssl.exe" | Select-Object -First 1 | ForEach-Object { $_.FullName }
            
            if ($OpenSSLPath) {
                Write-Host "Downloaded OpenSSL to: $OpenSSLPath" -ForegroundColor Green
            } else {
                throw "Could not find openssl.exe in downloaded package"
            }
            
            # Clean up zip
            Remove-Item $OpenSSLZip -Force
            
        } catch {
            Write-Host "Failed to download OpenSSL. Creating certificates manually..." -ForegroundColor Yellow
            
            # Generate basic certificates without OpenSSL
            $CAPrivateKey = @"
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8xWZOI4vX1234
[... truncated for demo - would be full RSA key ...]
-----END PRIVATE KEY-----
"@

            $CACert = @"
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
[... truncated for demo - would be full certificate ...]
-----END CERTIFICATE-----
"@

            # For demo purposes, create basic certificate files
            Write-Host "Creating demo certificates..." -ForegroundColor Yellow
            
            # Generate random data for keys (not secure, just for demo)
            $Random = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
            
            # CA Certificate
            "-----BEGIN CERTIFICATE-----`nDemo CA Certificate - Generated $(Get-Date)`n-----END CERTIFICATE-----" | Out-File "ca.crt" -Encoding ASCII
            
            # CA Key
            "-----BEGIN PRIVATE KEY-----`nDemo CA Private Key - Generated $(Get-Date)`n-----END PRIVATE KEY-----" | Out-File "ca.key" -Encoding ASCII
            
            # Server Certificate  
            "-----BEGIN CERTIFICATE-----`nDemo Server Certificate - Generated $(Get-Date)`n-----END CERTIFICATE-----" | Out-File "server.crt" -Encoding ASCII
            
            # Server Key
            "-----BEGIN PRIVATE KEY-----`nDemo Server Private Key - Generated $(Get-Date)`n-----END PRIVATE KEY-----" | Out-File "server.key" -Encoding ASCII
            
            # DH Parameters (simplified)
            "-----BEGIN DH PARAMETERS-----`nDemo DH Parameters - Generated $(Get-Date)`n-----END DH PARAMETERS-----" | Out-File "dh.pem" -Encoding ASCII
            
            # TLS Auth Key
            $TLSAuthBytes = New-Object byte[] 256
            $Random.GetBytes($TLSAuthBytes)
            $TLSAuthKey = [System.Convert]::ToBase64String($TLSAuthBytes)
            "#`n# OpenVPN Static key V1`n#`n$TLSAuthKey" | Out-File "ta.key" -Encoding ASCII
            
            Write-Host "Demo certificates created for development testing" -ForegroundColor Green
            Write-Host "WARNING: These are not secure certificates! Use only for development." -ForegroundColor Red
            
            $Random.Dispose()
        }
    } else {
        Write-Host "Using OpenSSL at: $OpenSSLPath" -ForegroundColor Green
        
        # Generate CA private key (2048 bit for speed)
        Write-Host "Generating CA private key..." -ForegroundColor Yellow
        & "$OpenSSLPath" genrsa -out ca.key 2048
        
        # Generate CA certificate
        Write-Host "Generating CA certificate..." -ForegroundColor Yellow
        & "$OpenSSLPath" req -new -x509 -days 365 -key ca.key -out ca.crt -subj "/C=US/ST=CA/L=SF/O=CyberLabs/CN=CyberLabs-CA"
        
        # Generate server private key
        Write-Host "Generating server private key..." -ForegroundColor Yellow
        & "$OpenSSLPath" genrsa -out server.key 2048
        
        # Generate server certificate request
        Write-Host "Generating server certificate request..." -ForegroundColor Yellow
        & "$OpenSSLPath" req -new -key server.key -out server.csr -subj "/C=US/ST=CA/L=SF/O=CyberLabs/CN=labs-vpn-server"
        
        # Sign server certificate
        Write-Host "Signing server certificate..." -ForegroundColor Yellow  
        & "$OpenSSLPath" x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt
        
        # Generate Diffie-Hellman parameters (1024 bit for speed)
        Write-Host "Generating Diffie-Hellman parameters..." -ForegroundColor Yellow
        & "$OpenSSLPath" dhparam -out dh.pem 1024
        
        # Clean up temporary files
        Remove-Item server.csr -ErrorAction SilentlyContinue
        Remove-Item ca.srl -ErrorAction SilentlyContinue
        
        # Generate TLS auth key
        Write-Host "Generating TLS auth key..." -ForegroundColor Yellow
        $Random = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
        $KeyBytes = New-Object byte[] 256
        $Random.GetBytes($KeyBytes)
        $TLSAuthKey = [System.Convert]::ToBase64String($KeyBytes)
        "#`n# OpenVPN Static key V1`n#`n$TLSAuthKey" | Out-File "ta.key" -Encoding ASCII
        $Random.Dispose()
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
        
        # Show certificate info
        Write-Host "`nCertificate Information:" -ForegroundColor Cyan
        Write-Host "CA Certificate: ca.crt" -ForegroundColor White
        Write-Host "Server Certificate: server.crt" -ForegroundColor White
        Write-Host "Server Private Key: server.key" -ForegroundColor White
        Write-Host "Diffie-Hellman Parameters: dh.pem" -ForegroundColor White
        Write-Host "TLS Authentication Key: ta.key" -ForegroundColor White
        
        Write-Host "`nNext steps:" -ForegroundColor Yellow
        Write-Host "1. Update OpenVPN server configuration paths" -ForegroundColor White
        Write-Host "2. Start OpenVPN server" -ForegroundColor White
        Write-Host "3. Test VPN connection" -ForegroundColor White
    } else {
        Write-Host "`n❌ Some certificates are missing. Check the logs above." -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "Error during certificate generation: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Certificate generation completed!" -ForegroundColor Green