# Quick Guide: Apply IP Range Changes

## ✅ All code files have been updated!

From: `192.168.100.0/24` → To: `10.12.10.0/24`

---

## 🚀 To Apply Changes (3 Steps)

### Step 1: Update OpenVPN Server (as Administrator)

Open **PowerShell as Administrator** and run:

```powershell
cd C:\Users\ihamz\labs-backend
.\scripts\update-openvpn-config.ps1
```

---

### Step 2: Restart Services

```powershell
# Restart OpenVPN
Restart-Service OpenVPNService

# Restart your Node.js backend
# Press Ctrl+C to stop current server, then:
npm start
```

---

### Step 3: Clean Old Files

```powershell
# Delete old VPN configs (they have wrong IP routes)
Remove-Item "C:\Users\ihamz\labs-backend\storage\vpn\configs\*.ovpn" -Force
```

---

## ✅ Done!

Now test by:
1. Creating a new lab session
2. Check the VM gets an IP like `10.12.10.42`
3. Generate a VPN config
4. Connect and access the VM

---

## 📝 What Was Changed?

### Files Updated Automatically:
- ✅ `src/services/vmProvisioner.js` - VM IP generation
- ✅ `src/services/vpn.service.js` - VPN routes
- ✅ `config/openvpn-simple.conf` - Server routes

### Files You Need to Update:
- ⚠️ `C:\Program Files\OpenVPN\config\openvpn-server.conf` (Run the script above)

---

## 🔄 If Something Breaks

Rollback with:
```powershell
git checkout src/services/vmProvisioner.js
git checkout src/services/vpn.service.js
git checkout config/openvpn-simple.conf
Restart-Service OpenVPNService
```

---

**Questions?** Check `IP_MIGRATION_SUMMARY.md` for full details.
