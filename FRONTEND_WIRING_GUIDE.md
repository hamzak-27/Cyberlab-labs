# Frontend to OVH Labs-Backend Wiring Guide

## Overview
This guide documents how the React frontend is wired to talk to the KVM labs-backend on OVH (51.79.77.40:5002) via the DO droplet (157.245.102.103) acting as a reverse proxy.

## Architecture

```
Browser → DO Droplet (157.245.102.103) → Nginx Routes:
                                           ├─ /api/labs → OVH:5002 (labs-backend)
                                           ├─ /api/sessions → OVH:5002 (labs-backend)
                                           └─ /api/* → localhost:5001 (DO main backend)
```

## Frontend Configuration

### Production (`.env.production`)
- `VITE_API_URL` is **intentionally unset**
- Frontend will use same-origin `/api` (i.e., `http://157.245.102.103/api`)
- All requests go through Nginx on DO, which routes labs/sessions to OVH

### Local Dev (`.env.local`)
- By default, also uses `/api` (points to DO for realistic testing)
- Can uncomment `VITE_API_URL="http://51.79.77.40:5002/api"` to bypass DO and hit OVH directly for debugging

## Frontend API Paths

All frontend calls use **resource-style paths** (no `/api` prefix):

- `/labs` → lists all labs
- `/labs/:labId` → get lab details
- `/sessions/active` → get active sessions
- `/sessions/start` → start a session
- `/sessions/:id/stop` → stop a session
- `/sessions/:id/flags` → submit flag
- `/sessions/:id/vpn-config` → download VPN config

With `baseURL = '/api'`, these resolve to `/api/labs`, `/api/sessions/...`, etc.

## Deployment Steps

### 1. Build the frontend

From your local Windows machine:

```powershell
cd C:\Users\ihamz\Cyberlab-labs\frontend
npm run build
```

This creates `dist/` folder with the production bundle.

### 2. Deploy to DO droplet

Use SCP (or your preferred method) to copy `dist/` to the web root on DO:

```powershell
# Example (adjust paths and user as needed):
scp -r dist/* labsadmin@157.245.102.103:/home/labsadmin/www/frontend/
```

Or use your teammate's deployment method.

### 3. Verify Nginx config on DO

SSH into DO and check `/etc/nginx/sites-available/default` (or your server block file):

```bash
ssh labsadmin@157.245.102.103
sudo nano /etc/nginx/sites-available/default
```

Ensure these location blocks exist:

```nginx
# Proxy labs endpoints to OVH
location /api/labs {
    proxy_pass http://51.79.77.40:5002;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    
    if ($request_method = OPTIONS) {
        return 204;
    }
}

# Proxy session endpoints to OVH
location /api/sessions {
    proxy_pass http://51.79.77.40:5002;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;
    
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    
    if ($request_method = OPTIONS) {
        return 204;
    }
}

# Other API routes to DO main backend
location /api/ {
    proxy_pass http://localhost:5001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Test Nginx config:

```bash
sudo nginx -t
```

If successful, reload:

```bash
sudo systemctl reload nginx
```

### 4. Test Nginx routing from DO

On the DO droplet, verify that Nginx is routing correctly:

```bash
# Test labs endpoint (should hit OVH)
curl http://localhost/api/labs

# Test sessions endpoint (should hit OVH)
curl -X POST http://localhost/api/sessions/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"labId": "some_lab_id"}'

# Test other API endpoint (should hit DO main backend)
curl http://localhost/api/status
```

The first two should return responses from the OVH labs-backend, the last one from the DO main backend.

### 5. Test from browser

Open `http://157.245.102.103` (or your domain) in a browser:

1. **Labs listing page** (`/labs`):
   - Network tab should show `GET http://157.245.102.103/api/labs`
   - Response should contain labs data

2. **Lab details page** (`/labs/:labId`):
   - Network tab: `GET http://157.245.102.103/api/labs/:labId`
   - Network tab: `GET http://157.245.102.103/api/sessions/active`

3. **Start Lab Session**:
   - Click "Start Lab Session" button
   - Network tab: `POST http://157.245.102.103/api/sessions/start`
   - Should either succeed (if labs-backend is healthy) or fail with a KVM-specific error

All requests should go to the DO droplet, never directly to `51.79.77.40:5002`.

## Troubleshooting

### Issue: Labs not loading, 404 errors

**Cause**: Nginx routing not configured or not reloaded.

**Fix**: 
1. Verify Nginx config on DO as shown in step 3 above
2. Reload Nginx: `sudo systemctl reload nginx`
3. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Issue: "Connection refused" or "502 Bad Gateway"

**Cause**: OVH labs-backend is not running on port 5002.

**Fix**:
1. SSH into OVH: `ssh ubuntu@51.79.77.40`
2. Check labs-backend status: `pm2 status labs-backend`
3. If not running: `pm2 start npm --name labs-backend -- start`
4. Check logs: `pm2 logs labs-backend --lines 50`

### Issue: CORS errors in browser console

**Cause**: Nginx CORS headers missing or OVH backend CORS misconfigured.

**Fix**:
1. Ensure Nginx `add_header Access-Control-Allow-Origin` directives are present
2. Check that OVH backend `ALLOWED_ORIGINS` in `.env` includes the DO droplet origin if needed
3. Note: Once everything goes through Nginx, CORS should be handled by Nginx headers, not backend

### Issue: Still seeing VirtualBox errors

**Cause**: Old DO backend process serving `/api/sessions` instead of Nginx proxying to OVH.

**Fix**:
1. On DO, check for rogue Node processes: `ps aux | grep node`
2. Kill any unexpected backend processes
3. Ensure only the main backend is running on port 5001
4. Verify Nginx routing with `curl` tests above

### Issue: Want to debug OVH directly

**Fix**:
1. Edit `frontend/.env.local` and uncomment:
   ```ini
   VITE_API_URL="http://51.79.77.40:5002/api"
   ```
2. Run `npm run dev` for local dev server
3. Ensure OVH backend's `ALLOWED_ORIGINS` includes `http://localhost:5173`
4. Remember to comment out for production builds

## Current Status

✅ Frontend code updated to use resource-style paths
✅ `.env.production` set to use same-origin `/api`
✅ Production build created (`npm run build` succeeded)
⏳ **Next step**: Deploy `dist/` to DO and verify Nginx routing

## Notes

- The frontend never needs to know about the OVH IP or port in production
- All routing complexity is handled by Nginx on DO
- This architecture allows you to move the labs-backend to a different host without changing the frontend
- The main backend on DO continues to handle auth, modules, and other non-lab APIs
