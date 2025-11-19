# IP Range Migration Summary

## Changes Made: 192.168.100.0/24 → 10.12.10.0/24

**Date**: 2025-11-08
**Status**: ✅ Code Updated

---

## Files Updated

### 1. ✅ `src/services/vmProvisioner.js`
- **Line 635**: `subnet: '10.12.10.0/24'`
- **Line 637**: `gateway: '10.12.10.1'`
- **Line 679**: Comment updated - Range: 10.12.10.10 - 10.12.10.200
- **Line 686**: `return '10.12.10.${ipSuffix}'`

### 2. ✅ `src/services/vpn.service.js`
- **Line 26**: `this.labNetwork = '10.12.10.0'`
- **Line 90-91**: `route 10.12.10.0 255.255.255.0`
- **Line 306**: Comment - "Lab VMs accessible via 10.12.10.x IPs"
- **Line 310**: Comment - "Lab Network: 10.12.10.0/24"

### 3. ✅ `config/openvpn-simple.conf`
- **Line 10**: `push "route 10.12.10.0 255.255.255.0"`

### 4. ⚠️ `C:\Program Files\OpenVPN\config\openvpn-server.conf`
- **Status**: Needs manual update (requires admin rights)
- **Script created**: `scripts/update-openvpn-config.ps1`

---

## Next Steps (IMPORTANT)

### 1. Update OpenVPN Server Config (Run as Administrator)
```powershell
cd C:\Users\ihamz\labs-backend
.\scripts\update-openvpn-config.ps1
```

### 2. Restart Services
```powershell
# Restart OpenVPN
Restart-Service OpenVPNService

# Restart your backend server
# Stop current server (Ctrl+C)
npm start
```

### 3. Clean Up Old VPN Configs
```powershell
# Delete old .ovpn files
Remove-Item "C:\Users\ihamz\labs-backend\storage\vpn\configs\*.ovpn" -Force
```

### 4. Test the Changes
```powershell
# 1. Start a new lab session
# 2. Check VM gets IP in 10.12.10.x range
# 3. Generate VPN config
# 4. Verify VPN config has route to 10.12.10.0/24
# 5. Connect via VPN and test access
```

---

## What Changed

### Network Configuration
```
OLD: 192.168.100.0/24
  Gateway: 192.168.100.1
  VM Range: 192.168.100.10 - 192.168.100.200

NEW: 10.12.10.0/24
  Gateway: 10.12.10.1
  VM Range: 10.12.10.10 - 10.12.10.200
```

### VPN Routing
```
OLD: push "route 192.168.100.0 255.255.255.0"
NEW: push "route 10.12.10.0 255.255.255.0"
```

### VM IP Assignment
```javascript
// OLD
return `192.168.100.${ipSuffix}`;

// NEW
return `10.12.10.${ipSuffix}`;
```

---

## Impact

### ✅ Will Continue to Work
- VPN client subnet (10.10.10.0/24) - unchanged
- Session ID to IP mapping - same algorithm
- MAC address generation - same algorithm
- Port allocations - unchanged
- Certificates - no changes needed

### ⚠️ Requires Action
- **Users**: Must download NEW VPN configs
- **Running VMs**: Stop and restart to get new IPs
- **OpenVPN Server**: Must restart after config update
- **Backend**: Must restart after code changes

### ❌ Will Break (Until Fixed)
- Old VPN configs with 192.168.100.0/24 routes
- Bookmarks/notes with old 192.168.100.x IPs
- Any static IP configs inside VMs

---

## Verification Checklist

After making changes:

```
□ OpenVPN server config updated
□ OpenVPN service restarted
□ Backend server restarted
□ Old VPN configs deleted
□ New lab session created successfully
□ VM assigned IP in 10.12.10.x range
□ VPN config generated with correct routes
□ VPN connection successful
□ Can access VM at 10.12.10.x IP
□ Users notified of the change
```

---

## Rollback (If Needed)

If issues occur, reverse the changes:

```powershell
# 1. Restore files from git
git checkout src/services/vmProvisioner.js
git checkout src/services/vpn.service.js
git checkout config/openvpn-simple.conf

# 2. Manually restore OpenVPN config
# Change 10.12.10.0 back to 192.168.100.0

# 3. Restart services
Restart-Service OpenVPNService
# Restart backend
```

---

## Notes

- VirtualBox internal network "LabNetwork" doesn't need changes
- DHCP/static IP config inside VMs may need updating
- Firewall rules may need updating if specific to old subnet
- Documentation should be updated to reflect new IPs
