# HackTheBox-Style VPN Integration Setup

This guide will help you set up HackTheBox-style VPN integration for your Cybersecurity Labs platform.

## 🎯 What You'll Get

After setup, your platform will work exactly like HackTheBox:
- **VPN Required**: Users must connect via VPN to access lab VMs
- **Internal Network**: Lab VMs have internal IPs (192.168.100.x)
- **Direct Access**: No port forwarding - direct SSH, web, FTP access
- **Multiple Services**: SSH, Web, FTP, MySQL, RDP, SMB all accessible
- **User Isolation**: Each user gets unique VPN certificates

## 🚀 Quick Setup

### Step 1: Install OpenVPN Server

1. **Download OpenVPN:**
   - Go to: https://openvpn.net/community-downloads/
   - Download "OpenVPN for Windows"
   - Install as Administrator

2. **Run Network Setup Script:**
   ```powershell
   # Run as Administrator
   cd C:\Users\ihamz\labs-backend
   .\scripts\setup-vpn-network.ps1
   ```

### Step 2: Generate Certificates

1. **Create Certificate Authority:**
   ```powershell
   # Navigate to OpenVPN config directory
   cd "C:\Program Files\OpenVPN\easy-rsa"
   
   # Initialize PKI
   .\EasyRSA-Start.bat
   ./easyrsa init-pki
   
   # Build CA
   ./easyrsa build-ca nopass
   
   # Generate server certificate
   ./easyrsa build-server-full server nopass
   
   # Generate Diffie-Hellman parameters
   ./easyrsa gen-dh
   
   # Generate TLS auth key
   openvpn --genkey --secret ta.key
   ```

2. **Copy certificates to config directory:**
   ```powershell
   # Copy to labs-backend config directory
   copy pki\ca.crt C:\Users\ihamz\labs-backend\certificates\
   copy pki\issued\server.crt C:\Users\ihamz\labs-backend\certificates\
   copy pki\private\server.key C:\Users\ihamz\labs-backend\certificates\
   copy pki\dh.pem C:\Users\ihamz\labs-backend\certificates\
   copy ta.key C:\Users\ihamz\labs-backend\certificates\
   ```

### Step 3: Start OpenVPN Server

1. **Copy server config:**
   ```powershell
   copy C:\Users\ihamz\labs-backend\config\openvpn-server.conf "C:\Program Files\OpenVPN\config\"
   ```

2. **Start OpenVPN service:**
   ```powershell
   # Start as Administrator
   net start OpenVPNService
   
   # Or manually:
   cd "C:\Program Files\OpenVPN\bin"
   .\openvpn.exe --config ..\config\openvpn-server.conf
   ```

### Step 4: Update Application Configuration

1. **Enable VPN mode in environment:**
   ```bash
   # In .env file
   VPN_ENABLED=true
   VPN_SERVER_IP=YOUR_PUBLIC_IP
   VPN_NETWORK_MODE=hackthebox
   USE_INTERNAL_NETWORKING=true
   ```

2. **Restart your application:**
   ```bash
   npm start
   ```

## 🔧 Network Configuration

### IP Address Ranges

| Component | IP Range | Description |
|-----------|----------|-------------|
| VPN Server | 10.10.10.1 | OpenVPN server |
| VPN Clients | 10.10.10.10-100 | User VPN connections |
| Lab VMs | 192.168.100.10-200 | Internal lab network |
| Gateway | 192.168.100.1 | Internal network gateway |

### Service Ports

Each lab VM exposes standard service ports:
- **SSH**: 22
- **Web**: 80, 443, 8080, 8443
- **FTP**: 21
- **MySQL**: 3306
- **RDP**: 3389
- **SMB**: 445
- **Telnet**: 23

## 📱 User Experience

### Before (Port Forwarding):
```bash
ssh tiago@127.0.0.1 -p 2200    # Different port for each user
curl http://127.0.0.1:8080     # Port mapped web access
```

### After (HackTheBox Style):
```bash
# 1. User downloads VPN config
# 2. Connects to VPN
openvpn --config lab-session-abc123.ovpn

# 3. Direct access to lab VM
ssh tiago@192.168.100.42       # Direct internal IP
curl http://192.168.100.42     # Direct web access
nmap 192.168.100.42            # Full port scanning available
```

## 🔒 Security Features

- **Certificate-based VPN**: Each user gets unique certificates
- **Network Isolation**: Internal network only accessible via VPN
- **Session-specific**: VPN configs expire with lab sessions
- **Full Service Discovery**: Users can perform real network reconnaissance

## 🛠️ Development vs Production

### Development Mode (Current):
- Port forwarding (2200, 8000, etc.)
- Direct localhost access
- No VPN required

### Production Mode (HackTheBox Style):
- VPN required for access
- Internal IP addresses
- Real network environment
- Multiple service ports

## 🧪 Testing the Setup

1. **Start a lab session**
2. **Download VPN config** from frontend
3. **Connect via OpenVPN**:
   ```bash
   openvpn --config downloaded-config.ovpn
   ```
4. **Test direct access**:
   ```bash
   ping 192.168.100.X
   ssh tiago@192.168.100.X
   curl http://192.168.100.X
   ```

## 🔄 Migration Path

You can run both modes simultaneously:
- **Development**: Port forwarding still works
- **Production**: VPN access for real experience

Users can choose their preferred access method during development.

## 📋 Troubleshooting

### Common Issues:

1. **OpenVPN not starting**: Check certificates are in correct location
2. **VPN connects but no VM access**: Check internal network configuration
3. **VirtualBox network issues**: Ensure internal network is created
4. **Certificate errors**: Regenerate CA and server certificates

### Debug Commands:

```powershell
# Check OpenVPN status
netstat -an | findstr 1194

# Check VirtualBox networks
VBoxManage.exe list natnetworks

# Test internal connectivity
ping 192.168.100.1
```

## 🎉 Success!

Once setup is complete, your platform will provide the authentic HackTheBox experience with VPN-based access to isolated lab environments!