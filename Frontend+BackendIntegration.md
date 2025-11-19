# 🔗 Frontend + Backend Integration Implementation Plan

## 📊 Integration Overview
**Date**: November 3, 2025  
**Status**: Ready for Implementation  
**Integration Type**: Unified Platform (Course + Labs)

---

## 🎯 **Integration Strategy**

### **Unified Platform Architecture:**
- **Same Users**: Course users = Lab users (shared authentication)
- **Shared Database**: MongoDB connection unified
- **Integrated Frontend**: Labs added to existing frontend-team app
- **Consistent UX**: Labs follow existing design patterns

### **Database Integration:**
```javascript
// Current: Two separate MongoDB connections
Frontend-team: mongodb+srv://Cyber:tWDAWI4d9h2h1W7c@cluster0.4edhm5f.mongodb.net/Cyber-project
Labs-backend: Local MongoDB

// Target: Single unified connection
Unified: mongodb+srv://Cyber:tWDAWI4d9h2h1W7c@cluster0.4edhm5f.mongodb.net/Cyber-project
```

### **Authentication Integration:**
```javascript
// Current: Two separate JWT systems
Frontend-team: JWT_SECRET="secret", JWT_EXPIRES_IN="1d"
Labs-backend: JWT with different secret

// Target: Unified authentication
Shared: Use frontend-team's existing auth system
```

---

## 🏗️ **Implementation Phases**

### **Phase 1: Backend Integration** (Week 1)

#### **1.1 Database Unification**
- **Migrate**: Labs backend to use shared MongoDB
- **Schema Integration**: Add lab-related collections to existing database
- **User Model Extension**: Add lab-specific fields to existing User model

```javascript
// Updated User Schema (extend existing)
{
  // Existing course-related fields...
  labStats: {
    totalPoints: { type: Number, default: 0 },
    completedLabs: { type: Number, default: 0 },
    currentRank: { type: Number, default: 0 },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }]
  },
  labSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }]
}
```

#### **1.2 Authentication Unification**
- **JWT Integration**: Use frontend-team's JWT system
- **Cookie Support**: Labs backend accepts cookies from frontend
- **Middleware Alignment**: Use same auth patterns

```javascript
// Labs backend auth middleware (align with frontend-team)
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  // Use same JWT secret and validation logic
};
```

#### **1.3 API Endpoint Integration**
- **Port Unification**: Move labs API to port 5001 (same as courses)
- **Route Prefixing**: All labs routes under `/api/labs/*`
- **CORS Configuration**: Allow frontend-team domain

```javascript
// API structure integration
Frontend-team API (port 5001):
- /api/user/*          (existing)
- /api/courses/*       (existing)
- /api/labs/*          (new - labs catalog, sessions)
- /api/sessions/*      (new - lab sessions)
- /api/vpn/*           (new - VPN management)
```

### **Phase 2: OpenVPN Infrastructure** (Week 1-2)

#### **2.1 Digital Ocean VPN Server Setup**
```bash
# Server Configuration
Droplet: 4GB RAM, 2 vCPUs, Ubuntu 22.04
Private IP: For internal VM communication
Floating IP: For stable VPN endpoint
Firewall: OpenVPN (1194/UDP), HTTPS (443), SSH (22)
```

#### **2.2 OpenVPN Configuration**
```bash
# Network Architecture
VPN Network: 10.10.0.0/16
Server IP: 10.10.0.1
User Subnets: 10.10.X.0/24 (X = user-specific)
VM IPs: 10.10.X.10, 10.10.X.11, etc.
```

#### **2.3 Certificate Management**
```javascript
// Per-user VPN config generation
const generateVPNConfig = async (userId, sessionId) => {
  // Generate unique client certificate
  // Create .ovpn file with user-specific routes
  // Store config temporarily for download
  // Set expiry tied to session timeout
};
```

#### **2.4 VM Network Reconfiguration**
```javascript
// Current: NAT with port forwarding
networkConfig: {
  sshPort: 2200,
  webPort: 8000
}

// New: VPN bridge network
networkConfig: {
  vmIp: '10.10.15.10',
  subnet: '10.10.15.0/24',
  services: ['ssh:22', 'http:80', 'ftp:21']
}
```

### **Phase 3: Frontend Integration** (Week 2-3)

#### **3.1 Navigation Integration**
```jsx
// Add to existing Sidebar component
const sidebarItems = [
  // ... existing items (Dashboard, Modules, Paths, etc.)
  {
    name: 'Practice Labs',
    href: '/labs',
    icon: TerminalIcon,
    roles: ['user', 'admin']
  }
];
```

#### **3.2 New Route Addition**
```jsx
// Add to App.jsx Routes
<Route 
  path="/labs" 
  element={
    <PrivateRoute allowedRoles={["user", "admin"]}>
      <LabsPage />
    </PrivateRoute>
  } 
/>
<Route 
  path="/labs/:id" 
  element={
    <PrivateRoute allowedRoles={["user", "admin"]}>
      <LabDetailPage />
    </PrivateRoute>
  } 
/>
```

#### **3.3 Labs Catalog Page**
```jsx
// /src/pages/LabsPage.jsx
const LabsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Practice Labs</h1>
        <LabFilters />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LabCard 
          name="Lampião Vulnerable Linux VM"
          difficulty="Easy"
          category="Binary Exploitation"
          points={75}
          owned={false}
          rating={4.5}
        />
      </div>
    </div>
  );
};
```

#### **3.4 HTB-Style Lab Card**
```jsx
// /src/components/LabCard.jsx
const LabCard = ({ lab, owned, userStats }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{lab.name}</CardTitle>
          {owned && <Badge variant="success">Owned</Badge>}
        </div>
        <div className="flex gap-2">
          <Badge variant={getDifficultyColor(lab.difficulty)}>
            {lab.difficulty}
          </Badge>
          <Badge variant="outline">{lab.category}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            {lab.totalPoints} points
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400" />
            <span className="text-sm">{lab.rating.average}</span>
          </div>
        </div>
        
        <Button 
          className="w-full" 
          onClick={() => navigateToLab(lab._id)}
        >
          {owned ? 'Replay' : 'Start Lab'}
        </Button>
      </CardContent>
    </Card>
  );
};
```

### **Phase 4: Lab Detail Page** (Week 3)

#### **4.1 Lab Detail Layout**
```jsx
// /src/pages/LabDetailPage.jsx
const LabDetailPage = ({ labId }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lab Info - 2/3 width */}
        <div className="lg:col-span-2">
          <LabHeader lab={lab} />
          <LabDescription lab={lab} />
          <FlagSubmissionPanel sessionId={sessionId} />
        </div>
        
        {/* Connection Panel - 1/3 width */}
        <div>
          <ConnectionPanel 
            lab={lab}
            session={currentSession}
            onStartSession={handleStartSession}
          />
        </div>
      </div>
    </div>
  );
};
```

#### **4.2 HTB-Style Connection Panel**
```jsx
// /src/components/ConnectionPanel.jsx
const ConnectionPanel = ({ lab, session, onStartSession }) => {
  const [vpnStatus, setVpnStatus] = useState('disconnected');
  const [machineStatus, setMachineStatus] = useState('stopped');
  
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Connection
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* VPN Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm">VPN Status</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              vpnStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm capitalize">{vpnStatus}</span>
          </div>
        </div>
        
        {/* Download VPN Config */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={downloadVPNConfig}
          disabled={!session}
        >
          <Download className="h-4 w-4 mr-2" />
          Download VPN
        </Button>
        
        {/* Machine Control */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm">Machine Status</span>
            <Badge variant={machineStatus === 'running' ? 'success' : 'secondary'}>
              {machineStatus}
            </Badge>
          </div>
          
          {!session ? (
            <Button className="w-full" onClick={onStartSession}>
              <Play className="h-4 w-4 mr-2" />
              Start Lab
            </Button>
          ) : (
            <div className="space-y-2">
              {machineStatus === 'stopped' && (
                <Button className="w-full" onClick={startMachine}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Machine
                </Button>
              )}
              
              {machineStatus === 'running' && (
                <>
                  <div className="text-xs text-muted-foreground text-center">
                    Target: 10.10.15.10
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={stopMachine}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Machine
                  </Button>
                </>
              )}
              
              <Button variant="outline" className="w-full" onClick={resetMachine}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Machine
              </Button>
            </div>
          )}
        </div>
        
        {/* Session Timer */}
        {session && (
          <div className="pt-4 border-t">
            <div className="text-xs text-muted-foreground mb-2">Time Remaining</div>
            <Progress value={timeRemainingPercent} className="h-2" />
            <div className="text-xs text-center mt-1">
              {formatTime(timeRemaining)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

#### **4.3 Flag Submission Panel**
```jsx
// /src/components/FlagSubmissionPanel.jsx
const FlagSubmissionPanel = ({ sessionId }) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Submit Flag</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter flag here..."
              value={flagValue}
              onChange={(e) => setFlagValue(e.target.value)}
              className="flex-1"
            />
            <Button onClick={submitFlag} disabled={!flagValue}>
              Submit
            </Button>
          </div>
          
          {/* Flag Results */}
          {submissions.map((sub, index) => (
            <div key={index} className={`p-3 rounded-lg ${
              sub.correct ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{sub.flag}</span>
                <Badge variant={sub.correct ? 'success' : 'destructive'}>
                  {sub.correct ? `+${sub.points} pts` : 'Incorrect'}
                </Badge>
              </div>
              {sub.correct && sub.newBadges?.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {sub.newBadges.map(badge => (
                    <Badge key={badge.name} variant="secondary">
                      {badge.icon} {badge.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

### **Phase 5: Backend API Integration** (Week 3-4)

#### **5.1 Labs API Endpoints**
```javascript
// Add to frontend-team backend (port 5001)
app.use('/api/labs', labsRouter);

// Labs routes
GET    /api/labs                    // Lab catalog
GET    /api/labs/:id               // Lab details
POST   /api/labs/:id/sessions      // Start lab session
DELETE /api/labs/:id/sessions/:sessionId  // Stop session
POST   /api/labs/:id/sessions/:sessionId/flags  // Submit flag
GET    /api/labs/:id/sessions/:sessionId/vpn    // Download VPN config
```

#### **5.2 User Stats Integration**
```javascript
// Extend existing user API
GET    /api/user/me                // Include lab stats
GET    /api/user/stats/labs        // Detailed lab statistics
GET    /api/user/badges            // User badges
```

#### **5.3 Real-time Updates**
```javascript
// WebSocket integration for live updates
const io = new Server(server);

io.on('connection', (socket) => {
  socket.on('join-session', (sessionId) => {
    socket.join(`session-${sessionId}`);
  });
  
  // Emit machine status changes
  socket.to(`session-${sessionId}`).emit('machine-status', status);
  
  // Emit flag submission results
  socket.to(`session-${sessionId}`).emit('flag-result', result);
});
```

### **Phase 6: VPN Integration** (Week 4)

#### **6.1 VPN Config Generation**
```javascript
// Backend: Generate per-user VPN config
const generateVPNConfig = async (userId, sessionId) => {
  const userSubnet = `10.10.${userId.slice(-3)}.0/24`;
  const clientConfig = `
client
dev tun
proto udp
remote ${VPN_SERVER_IP} 1194
resolv-retry infinite
nobind
persist-key
persist-tun
ca ca.crt
cert user-${userId}.crt
key user-${userId}.key
comp-lzo
verb 3
route ${userSubnet}
  `;
  
  return { config: clientConfig, filename: `lab-${sessionId}.ovpn` };
};
```

#### **6.2 File Download Implementation**
```javascript
// Frontend: VPN config download
const downloadVPNConfig = async () => {
  try {
    const response = await axios.get(`/api/labs/${labId}/sessions/${sessionId}/vpn`, {
      responseType: 'blob',
      withCredentials: true
    });
    
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lab-${sessionId}.ovpn`;
    link.click();
    
    setVpnConfigDownloaded(true);
  } catch (error) {
    toast.error('Failed to download VPN config');
  }
};
```

---

## 🔧 **Technical Integration Details**

### **Database Schema Integration**
```javascript
// Add to existing Cyber-project database:

// Labs Collection (new)
{
  name: "Lampião Vulnerable Linux VM",
  difficulty: "Easy",
  category: "Binary",
  description: "...",
  points: { user: 25, root: 50 },
  templateVmId: "39964d01-8a7c-49c9-abac-5f4586d0083d",
  // ... existing lab fields
}

// Sessions Collection (new)
{
  userId: ObjectId (reference to existing User),
  labId: ObjectId,
  status: "active",
  vmId: "...",
  networkConfig: { vmIp: "10.10.15.10" },
  // ... existing session fields
}

// Extended User Collection
{
  // ... existing course fields
  labStats: {
    totalPoints: 150,
    completedLabs: 1,
    badges: [ObjectId, ObjectId]
  }
}
```

### **Environment Configuration**
```bash
# Unified .env for integrated backend
MONGO_URI=mongodb+srv://Cyber:tWDAWI4d9h2h1W7c@cluster0.4edhm5f.mongodb.net/Cyber-project?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=secret
JWT_EXPIRES_IN=1d
REDIS_URL=redis://localhost:6379
VPN_SERVER_IP=your-digital-ocean-ip
VIRTUALBOX_MANAGE_PATH=VBoxManage
```

### **Frontend API Integration**
```javascript
// Use existing axios configuration
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true
});

// Labs API calls
export const labsAPI = {
  getAllLabs: () => api.get('/labs'),
  getLabDetail: (id) => api.get(`/labs/${id}`),
  startLabSession: (id) => api.post(`/labs/${id}/sessions`),
  submitFlag: (labId, sessionId, flag, type) => 
    api.post(`/labs/${labId}/sessions/${sessionId}/flags`, { flag, flagType: type }),
  downloadVPN: (labId, sessionId) => 
    api.get(`/labs/${labId}/sessions/${sessionId}/vpn`, { responseType: 'blob' })
};
```

---

## 🚀 **Deployment Strategy**

### **Development Phase:**
1. **Week 1**: Backend integration + VPN setup
2. **Week 2**: Frontend integration + basic UI
3. **Week 3**: HTB-style features + real-time updates
4. **Week 4**: Testing + polishing

### **Production Deployment:**
```bash
# Digital Ocean Setup
1. Create droplet with VPN server
2. Deploy integrated backend (courses + labs)
3. Deploy unified frontend
4. Configure domain/SSL
5. Set up monitoring
```

### **Current Status:**
- ✅ **Labs Backend**: Complete and tested
- ✅ **Lampião VM**: Imported and operational
- 🔄 **Integration**: Ready to start
- ⏳ **VPN Infrastructure**: To be implemented
- ⏳ **Frontend Integration**: To be implemented

---

## 📋 **Implementation Checklist**

### **Phase 1: Backend Integration** ✅ Ready
- [ ] Migrate labs backend to shared MongoDB
- [ ] Integrate JWT authentication systems
- [ ] Merge API endpoints to port 5001
- [ ] Test unified user authentication

### **Phase 2: VPN Infrastructure** 🔄 In Progress
- [ ] Set up Digital Ocean droplet
- [ ] Install and configure OpenVPN server
- [ ] Implement certificate management
- [ ] Test VM network reconfiguration

### **Phase 3: Frontend Integration** ⏳ Pending
- [ ] Add "Practice Labs" to sidebar
- [ ] Create labs catalog page
- [ ] Implement lab detail page
- [ ] Add HTB-style connection panel

### **Phase 4: Advanced Features** ⏳ Pending
- [ ] Real-time status updates
- [ ] VPN connection monitoring
- [ ] Flag submission with scoring
- [ ] User progress integration

---

## 🎯 **Success Metrics**

### **Technical Goals:**
- ✅ Single unified authentication system
- ✅ Shared user database (courses + labs)
- ✅ HTB-style lab interface
- ✅ VPN-based VM access
- ✅ Real-time connection status
- ✅ Integrated user progress tracking

### **User Experience Goals:**
- Seamless transition from courses to labs
- Familiar UI patterns and navigation
- Professional HTB-style lab interface
- Clear connection instructions
- Real-time feedback and scoring

---

## 🚀 **Ready to Begin Implementation!**

**Starting Point**: Backend integration with shared database and authentication
**Timeline**: 4 weeks to full HTB-style platform
**Current Asset**: Fully functional Lampião lab ready for integration

**Next Step**: Begin Phase 1 - Backend Integration 🎯