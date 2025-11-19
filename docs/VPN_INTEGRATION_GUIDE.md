# HackTheBox-Style VPN Integration

This document describes the complete implementation of HackTheBox-style VPN integration for the cybersecurity labs platform.

## Overview

The VPN integration allows users to connect directly to lab environments without port forwarding, similar to how HackTheBox operates. Users get VPN access to internal lab networks and can access services directly via internal IP addresses.

## Architecture

```
User → OpenVPN Client → VPN Server (10.10.10.1)
  ↓
VPN Network (10.10.10.x) → Internal Lab Network (192.168.100.x)  
  ↓
Lab VMs (SSH, Web, Services directly accessible)
```

### Network Configuration
- **VPN Server**: `10.10.10.1`
- **VPN Client Pool**: `10.10.10.10` - `10.10.10.100` 
- **Lab Network**: `192.168.100.0/24`
- **Lab VMs**: `192.168.100.10` - `192.168.100.200`

## Components

### 1. Backend Infrastructure

#### VPN Service (`src/services/vpn.service.js`)
- Handles VPN configuration generation
- Manages client certificates
- Tracks active sessions
- Provides configuration cleanup

#### VPN Routes (`src/routes/vpnRoutes.js`)
- `POST /api/vpn/config/generate` - Generate VPN config for session
- `GET /api/vpn/config/download/:sessionId` - Download .ovpn file
- `GET /api/vpn/status/:sessionId` - Get VPN session status
- `POST /api/vpn/cleanup` - Cleanup expired sessions
- Admin routes for session management

#### OpenVPN Server Configuration
- **Location**: `config/openvpn-simple.conf`
- **Certificates**: `certificates/` directory
- **Protocol**: UDP on port 1194
- **Topology**: TUN interface

### 2. Frontend Integration

#### VPN Component (`frontend/src/components/VPNInterface.jsx`)
- Shows VPN status for active sessions
- Allows users to generate VPN configs
- Provides download functionality
- Displays connection instructions

#### Lab Service Updates (`frontend/src/services/labService.js`)
- New VPN service endpoints
- Automatic file download handling
- Session status checking

### 3. Certificates

All certificates are located in `certificates/`:
- `ca.crt` - Certificate Authority (1,178 bytes)
- `server.crt` - Server Certificate (1,184 bytes)
- `server.key` - Server Private Key (1,702 bytes)
- `dh.pem` - Diffie-Hellman Parameters (432 bytes, 2048-bit)
- `ta.key` - TLS Authentication Key (374 bytes)

## Setup Instructions

### 1. Prerequisites
- Windows with OpenVPN installed
- Node.js backend running on port 5001
- React frontend
- VirtualBox or similar for VM management

### 2. OpenVPN Server Setup

1. **Install OpenVPN** (if not already installed)
   ```powershell
   # Download from https://openvpn.net/community-downloads/
   # Install with default options
   ```

2. **Start OpenVPN Server**
   ```powershell
   cd "C:\Program Files\OpenVPN\bin"
   .\openvpn.exe --config C:\Users\ihamz\labs-backend\config\openvpn-simple.conf
   ```

3. **Verify Server Status**
   Look for "Initialization Sequence Completed" message.

### 3. Backend Setup

1. **Ensure VPN Service is initialized**
   ```javascript
   // VPN routes are automatically mounted in server.js
   app.use('/api/vpn', vpnRoutes);
   ```

2. **Test API Endpoints**
   ```bash
   node scripts/test-vpn.js
   ```

### 4. Frontend Integration

The VPN interface is automatically included in active lab sessions:

```jsx
// In SessionInterface.jsx
<VPNInterface session={session} onToast={onToast} />
```

## User Workflow

### 1. Start Lab Session
User starts a lab session through the web interface.

### 2. Generate VPN Config
1. Click "Generate VPN Configuration" in the session interface
2. System creates session-specific VPN config with:
   - User certificates
   - Server connection details
   - Lab network routes
   - Expiration time (default: 2 hours)

### 3. Download and Connect
1. Click "Download .ovpn" to get configuration file
2. Import into OpenVPN client (OpenVPN GUI, Tunnelblick, etc.)
3. Connect to VPN

### 4. Access Lab Environment
Once connected:
- Access VMs directly at `192.168.100.x` addresses
- SSH directly: `ssh user@192.168.100.10`
- Web services: `http://192.168.100.10:80`
- No port forwarding needed!

## API Reference

### Generate VPN Config
```http
POST /api/vpn/config/generate
Content-Type: application/json

{
  "sessionId": "session-123",
  "duration": 120,
  "labId": "lampiao"
}
```

**Response:**
```json
{
  "success": true,
  "message": "VPN configuration generated successfully",
  "data": {
    "sessionId": "session-123",
    "expiresAt": "2024-11-06T02:00:00.000Z",
    "connectionInfo": {
      "serverIP": "localhost",
      "serverPort": 1194,
      "protocol": "udp",
      "userNetwork": "10.10.10.0"
    }
  }
}
```

### Download VPN Config
```http
GET /api/vpn/config/download/:sessionId
```

Returns `.ovpn` file as binary data.

### Check Session Status
```http
GET /api/vpn/status/:sessionId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exists": true,
    "status": "generated",
    "timeRemaining": 115,
    "connectionInfo": {
      "serverIP": "localhost",
      "userNetwork": "10.10.10.0"
    }
  }
}
```

## Configuration Files

### OpenVPN Client Config Template
Generated configs include:
```ovpn
client
dev tun
proto udp
remote localhost 1194
resolv-retry infinite
nobind
persist-key
persist-tun
auth SHA256
tls-version-min 1.2
verb 4

# Lab network routing - access to VMs in 192.168.100.0/24
route 192.168.100.0 255.255.255.0

# Keep alive
keepalive 10 120

# Security
remote-cert-tls server
compress
key-direction 1

<ca>
[CA Certificate]
</ca>

<cert>
[Client Certificate]
</cert>

<key>
[Private Key]
</key>

<tls-auth>
[TLS Auth Key]
</tls-auth>
```

## Testing

### Automated Tests
```bash
node scripts/test-vpn.js
```

This tests:
- ✅ VPN config generation
- ✅ Session status retrieval  
- ✅ Config file download
- ✅ Certificate validation
- ✅ Network route configuration

### Manual Testing
1. Start backend server
2. Start OpenVPN server
3. Generate VPN config via web interface
4. Download and import .ovpn file
5. Connect with OpenVPN client
6. Test access to 192.168.100.x addresses

## Security Features

### Certificate Management
- Each session gets unique certificates
- Certificates expire with sessions
- Server certificates secured with proper CA

### Network Isolation
- VPN clients isolated from each other
- Access only to designated lab networks
- TLS authentication prevents unauthorized access

### Session Management
- Time-limited sessions (default 2 hours)
- Automatic cleanup of expired configs
- Admin controls for session revocation

## Troubleshooting

### Common Issues

#### 1. "DH key too small" Error
**Solution**: Regenerate DH parameters
```bash
openssl dhparam -out certificates/dh.pem 2048
```

#### 2. OpenVPN Server Won't Start
**Check**:
- Certificate files exist and are readable
- Port 1194 is not in use
- TAP adapter is available
- Configuration syntax is correct

#### 3. Client Can't Connect
**Check**:
- VPN server is running
- Client config has correct server IP
- Firewall allows OpenVPN traffic
- Certificates are valid

#### 4. Can't Access Lab VMs
**Check**:
- Lab VMs are running
- VMs are on 192.168.100.x network
- Routes are properly configured
- Services are listening on correct ports

### Logs and Debugging

#### Server Logs
- OpenVPN server logs show connection attempts
- Backend logs VPN session creation/cleanup
- Check for certificate or routing errors

#### Client Logs
- OpenVPN client shows connection status
- Look for authentication failures
- Check route installation success

## Production Considerations

### Scaling
- Use dedicated OpenVPN server
- Implement proper certificate authority
- Add load balancing for multiple servers
- Monitor connection limits

### Security
- Implement user-specific certificates
- Add certificate revocation lists (CRL)
- Use stronger encryption settings
- Regular certificate rotation

### Monitoring
- Track active VPN connections
- Monitor bandwidth usage
- Alert on suspicious activities
- Session analytics and logging

## Future Enhancements

### Planned Features
- [ ] Multi-server support for scaling
- [ ] User-specific subnets
- [ ] Connection analytics dashboard
- [ ] Mobile client support
- [ ] Integration with lab lifecycle

### Potential Improvements
- [ ] Automated certificate renewal
- [ ] Advanced routing policies  
- [ ] Bandwidth throttling per user
- [ ] Connection time limits
- [ ] Geographic server selection

## Comparison with HackTheBox

Our implementation matches HackTheBox's approach:

| Feature | HackTheBox | Our Implementation |
|---------|------------|-------------------|
| VPN Access | ✅ Required | ✅ Required |
| Direct VM Access | ✅ Internal IPs | ✅ 192.168.100.x |
| No Port Forwarding | ✅ Direct access | ✅ Direct access |
| Session-based | ✅ Temporary | ✅ Time-limited |
| Certificate Auth | ✅ User certs | ✅ Session certs |

The main difference is we use session-based rather than user-based certificates for simpler management during development.

---

**Documentation Version**: 1.0  
**Last Updated**: November 2024  
**Status**: Complete - Ready for testing