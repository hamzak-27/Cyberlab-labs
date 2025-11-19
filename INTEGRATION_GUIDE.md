# Labs Backend Integration Guide

## 📋 Overview

This document describes the integration between `labs-backend` (port 5002) and the new `Cyber_project/frontend` (port 5173).

---

## ✅ Completed Integration Steps

### 1. **CORS Configuration**
- ✅ labs-backend already allows all origins in development mode
- ✅ No changes needed to `labs-backend/server.js`

### 2. **JWT Authentication**
- ✅ Created `.env` file in `Cyber_project/backend`
- ✅ Set `JWT_SECRET=secret` (matches labs-backend)
- ✅ Both backends can now validate each other's tokens

### 3. **Frontend API Service**
- ✅ Created `Cyber_project/frontend/src/services/labsService.js`
- ✅ Implements all API calls to labs-backend:
  - `getAllLabs()` - Fetch all labs with filtering
  - `startLab(labId)` - Start new lab session
  - `submitFlag(sessionId, flag)` - Submit flags for validation
  - `getActiveSessions()` - Get user's active sessions
  - `getUserStats()` - Get user statistics
  - `getBadges()` - Get user badges/achievements
  - And many more...

### 4. **LabsPage.jsx Updates**
- ✅ Replaced mock data with real API calls
- ✅ Added loading states
- ✅ Integrated session management
- ✅ Added connection info display
- ✅ Implemented real flag submission with feedback
- ✅ Added error handling with toast notifications

### 5. **User Model Enhancement**
- ✅ Added `labsProgress` array to track individual lab progress
- ✅ Added `labsStats` object for overall statistics
- ✅ Fields include: sessions started, flags captured, points, completion status

---

## 🚀 How to Start Both Systems

### Terminal 1: Start Labs Backend
```bash
cd C:\Users\ihamz\labs-backend
npm run dev
```
**Expected output:** Server running on port 5002

### Terminal 2: Start Main Backend
```bash
cd C:\Users\ihamz\Cyber_project\backend
npm run dev
```
**Expected output:** Server running on port 5001

### Terminal 3: Start Frontend
```bash
cd C:\Users\ihamz\Cyber_project\frontend
npm run dev
```
**Expected output:** Frontend running on port 5173

---

## 🔗 API Architecture

```
┌────────────────────────────────────────────────────────┐
│                FRONTEND (Port 5173)                    │
│  ┌─────────────────────────────────────────────────┐  │
│  │  LabsPage.jsx                                   │  │
│  │  - Uses labsService.js                          │  │
│  │  - Displays labs from API                       │  │
│  │  - Manages sessions                             │  │
│  │  - Handles flag submissions                     │  │
│  └─────────────────────────────────────────────────┘  │
└────────────┬───────────────────────┬───────────────────┘
             │                       │
             │ Auth/Courses         │ Labs/Sessions/Flags
             │ (Port 5001)          │ (Port 5002)
             ↓                       ↓
┌────────────────────────┐   ┌──────────────────────────┐
│  Main Backend          │   │  Labs Backend            │
│  - Authentication      │   │  - Lab Management        │
│  - User Management     │   │  - VM Provisioning       │
│  - Courses/Modules     │   │  - Session Management    │
│  - Lessons             │   │  - Flag Validation       │
└────────────┬───────────┘   └──────────┬───────────────┘
             │                          │
             └──────────┬───────────────┘
                        ↓
              ┌──────────────────────┐
              │  MongoDB (Shared DB) │
              │  - Users             │
              │  - Labs              │
              │  - Sessions          │
              │  - Courses           │
              └──────────────────────┘
```

---

## 📡 API Endpoints Used

### Labs Backend (localhost:5002)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/labs` | GET | Get all labs (with filtering) |
| `/api/labs/:id` | GET | Get single lab details |
| `/api/sessions/start` | POST | Start new lab session |
| `/api/sessions/active` | GET | Get user's active sessions |
| `/api/sessions/:id` | GET | Get session details |
| `/api/sessions/:id/stop` | POST | Stop session |
| `/api/sessions/:id/extend` | POST | Extend session timeout |
| `/api/sessions/:id/flags` | POST | Submit flag |
| `/api/sessions/:id/connection` | GET | Get connection info |
| `/api/stats/user` | GET | Get user statistics |
| `/api/stats/badges` | GET | Get user badges |
| `/api/stats/leaderboard` | GET | Get leaderboard |

### Main Backend (localhost:5001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/signup` | POST | User registration |
| `/api/user/profile` | GET | Get user profile |
| `/api/courses` | GET | Get all courses |

---

## 🎨 UI/UX Features

### LabsPage Components

1. **Stats Dashboard**
   - Labs Completed counter
   - Flags Captured counter
   - Average Score display
   - Weekly Progress tracker

2. **Labs Grid View**
   - Displays all available labs
   - Shows difficulty, time, category
   - Displays number of flags
   - Shows popularity and ratings
   - Technologies/tools used

3. **Lab Detail View**
   - Lab description and objectives
   - Connection information (when session active)
   - Code editor for working on exploits
   - Flag submission form
   - Session timer

4. **Loading States**
   - Spinner while fetching labs
   - "No labs found" message
   - Submitting flag indicator

5. **Error Handling**
   - Toast notifications for errors
   - Fallback UI when API fails
   - Clear error messages

---

## 🔐 Authentication Flow

```
1. User logs in via Main Backend (port 5001)
   └─> JWT token created with JWT_SECRET="secret"
   └─> Token stored in cookie

2. User navigates to /labs page

3. LabsPage fetches labs from Labs Backend (port 5002)
   └─> axios automatically sends cookie
   └─> Labs Backend validates JWT using same JWT_SECRET
   └─> Returns labs data

4. User starts a lab
   └─> POST /api/sessions/start with labId
   └─> Labs Backend creates VM session
   └─> Returns session details & connection info

5. User submits flag
   └─> POST /api/sessions/:id/flags
   └─> Labs Backend validates flag
   └─> Updates user statistics
   └─> Returns result (correct/incorrect + points)
```

---

## 🧪 Testing the Integration

### 1. Test Lab Listing
```bash
# Login first to get auth cookie
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Fetch labs (uses cookie)
curl http://localhost:5002/api/labs -b cookies.txt
```

### 2. Test Lab Start
```bash
# Start a lab session
curl -X POST http://localhost:5002/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{"labId":"<lab_id_here>"}' \
  -b cookies.txt
```

### 3. Test Flag Submission
```bash
# Submit a flag
curl -X POST http://localhost:5002/api/sessions/<session_id>/flags \
  -H "Content-Type: application/json" \
  -d '{"flag":"CTF{test_flag}","type":"user"}' \
  -b cookies.txt
```

---

## 🐛 Troubleshooting

### Issue: "No labs showing up"

**Possible causes:**
1. Labs backend not running
2. No labs in database
3. CORS error

**Solutions:**
```bash
# 1. Check labs-backend is running
curl http://localhost:5002/health

# 2. Add a test lab (admin required)
# Use admin panel or direct database insert

# 3. Check browser console for CORS errors
# Should be fine - dev mode allows all origins
```

### Issue: "Authentication failed"

**Possible causes:**
1. JWT_SECRET mismatch
2. Cookie not being sent
3. Token expired

**Solutions:**
```bash
# 1. Verify .env files match
cat C:\Users\ihamz\Cyber_project\backend\.env | findstr JWT_SECRET
cat C:\Users\ihamz\labs-backend\.env | findstr JWT_SECRET
# Both should show: JWT_SECRET=secret

# 2. Check axios config
# labsService.js should have:
# axios.defaults.withCredentials = true

# 3. Re-login to get fresh token
```

### Issue: "Failed to start lab session"

**Possible causes:**
1. VirtualBox not running
2. No VM templates imported
3. Maximum sessions reached

**Solutions:**
```bash
# 1. Check VirtualBox installation
"C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" --version

# 2. Import Lampiao lab
# Check labs-backend/Lampiao/ directory exists

# 3. Check active sessions
curl http://localhost:5002/api/sessions/active -b cookies.txt
```

---

## 📦 Database Schema

### User Model (Extended for Labs)

```javascript
{
  // Existing fields...
  username: String,
  email: String,
  
  // NEW: Labs progress tracking
  labsProgress: [{
    labId: ObjectId,  // References Lab
    sessionsStarted: Number,
    flagsCaptured: {
      user: Boolean,
      root: Boolean
    },
    points: Number,
    completed: Boolean,
    firstAttemptAt: Date,
    completedAt: Date,
    bestTime: Number,
    attempts: Number
  }],
  
  // NEW: Overall labs statistics
  labsStats: {
    totalSessions: Number,
    totalFlagsCaptured: Number,
    totalPoints: Number,
    labsCompleted: Number,
    averageScore: Number,
    rank: Number
  }
}
```

---

## 🎯 Next Steps

### Immediate Todos:
- [ ] Add Lampiao VM to database (via admin panel)
- [ ] Test full flow: Login → View Labs → Start Session → Submit Flag
- [ ] Add more labs to populate the database
- [ ] Implement VPN config download UI

### Future Enhancements:
- [ ] Real-time session timer countdown
- [ ] WebSocket for live session updates
- [ ] Lab progress visualization
- [ ] Hints system for difficult flags
- [ ] Write-up submission after completion
- [ ] Social features (share completion, comments)

---

## 📞 Support

If you encounter issues:

1. **Check logs:**
   - Labs backend: `labs-backend/logs/app.log`
   - Main backend: Check terminal output
   - Frontend: Browser console (F12)

2. **Common issues:**
   - Port already in use: Change PORT in .env
   - MongoDB connection: Check MONGO_URI
   - VirtualBox errors: Ensure VBoxManage in PATH

3. **Debug mode:**
   ```bash
   # Enable verbose logging
   NODE_ENV=development npm run dev
   ```

---

## ✨ Success Criteria

Integration is successful when:

- ✅ Frontend displays real labs from labs-backend
- ✅ Users can start lab sessions
- ✅ VMs are provisioned automatically
- ✅ Connection info is displayed
- ✅ Flags can be submitted and validated
- ✅ Points are awarded correctly
- ✅ User statistics update in real-time
- ✅ No CORS or authentication errors

---

**Integration completed on:** 2025-11-17
**Status:** ✅ **Ready for Testing**
