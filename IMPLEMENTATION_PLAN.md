# 🚀 Cybersecurity Lab Platform - Backend Implementation Plan

## 📋 Overview
This document outlines the complete implementation plan for building a cybersecurity lab platform backend that integrates seamlessly with the existing frontend team's admin system.

## 🔍 Current System Analysis

### Existing Frontend-Team Backend Structure
- **Framework**: Express.js (ES modules)
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT with cookie-based auth + Bearer token fallback
- **Architecture**: MVC pattern with controllers, models, middleware, routers
- **Port**: 5001 (admin backend)
- **CORS**: Configured for localhost:5173 (frontend)

### Existing Models
- **User**: username, fullName, email, role (user/admin), coursesTaken, token (credits), avatar
- **Courses**: title, detail, image, createdBy, tag[], hours, complexity, type, modules[]
- **Module**: Course modules structure
- **Lesson**: Individual lesson content

### Integration Strategy
Our new lab backend will:
1. **Share the same MongoDB database** (same MONGO_URI)
2. **Extend the existing User model** for lab-specific fields
3. **Use the same JWT authentication** mechanism
4. **Run on a different port** (5002) to avoid conflicts
5. **Maintain the same coding patterns** for consistency

## 🏗️ New Lab Backend Architecture

### Directory Structure
```
labs-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection (shared)
│   │   ├── redis.js             # Redis connection for caching
│   │   └── environment.js       # Environment variables
│   ├── models/
│   │   ├── Lab.js               # Lab/OVA definitions
│   │   ├── Session.js           # Active lab sessions
│   │   ├── Flag.js              # Flag submissions
│   │   ├── Badge.js             # Achievement system
│   │   └── UserExtension.js     # Extend existing User model
│   ├── controllers/
│   │   ├── lab.controller.js    # Lab management
│   │   ├── session.controller.js # Session lifecycle
│   │   ├── flag.controller.js   # Flag submission/validation
│   │   ├── stats.controller.js  # User progress & leaderboard
│   │   └── admin.controller.js  # Admin operations
│   ├── services/
│   │   ├── provisioner.service.js # VM lifecycle management
│   │   ├── flag.service.js      # Dynamic flag generation
│   │   ├── scoring.service.js   # Points & badge calculation
│   │   └── session.service.js   # Session management
│   ├── middleware/
│   │   ├── auth.middleware.js   # Shared JWT auth
│   │   ├── admin.middleware.js  # Admin-only routes
│   │   ├── session.middleware.js # Session validation
│   │   └── rateLimit.middleware.js # API rate limiting
│   ├── routes/
│   │   ├── lab.routes.js        # Lab CRUD operations
│   │   ├── session.routes.js    # Session management
│   │   ├── flag.routes.js       # Flag submission
│   │   ├── stats.routes.js      # Progress & leaderboard
│   │   └── admin.routes.js      # Admin operations
│   ├── utils/
│   │   ├── vm.utils.js          # VirtualBox CLI wrapper
│   │   ├── crypto.utils.js      # Flag generation & hashing
│   │   ├── network.utils.js     # IP/Port management
│   │   └── validation.utils.js  # Input validation
│   ├── jobs/
│   │   ├── queue.js             # BullMQ job queue setup
│   │   ├── provisioner.jobs.js # VM provisioning jobs
│   │   └── cleanup.jobs.js      # Session cleanup jobs
│   └── server.js                # Main application entry point
├── .env                         # Environment variables
├── package.json                 # Dependencies
├── README.md                    # Setup instructions
└── docker-compose.yml          # Optional containerization
```

## 🗄️ Database Schema Design

### Extended User Model (labs-backend/src/models/UserExtension.js)
```javascript
// Extend existing User model with lab-specific fields
const UserLabSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labStats: {
    totalPoints: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    labsCompleted: { type: Number, default: 0 },
    flagsFound: { type: Number, default: 0 },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }]
  },
  activeSession: {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    startedAt: Date
  }
}, { timestamps: true });
```

### Lab Model
```javascript
const LabSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  category: { type: String, enum: ['Web', 'Binary', 'Network', 'Crypto'], required: true },
  ovaPath: { type: String, required: true },
  ovaChecksum: { type: String, required: true },
  templateVmId: String, // VirtualBox VM ID after import
  flags: {
    user: {
      template: String,
      points: { type: Number, default: 25 }
    },
    root: {
      template: String,
      points: { type: Number, default: 50 }
    }
  },
  vmConfig: {
    ram: { type: Number, default: 1024 },
    cpu: { type: Number, default: 1 },
    network: { type: String, default: 'nat' }
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```

### Session Model
```javascript
const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  vmInstanceId: { type: String, required: true },
  status: { type: String, enum: ['starting', 'running', 'stopping', 'stopped', 'failed'], default: 'starting' },
  connectionInfo: {
    ipAddress: String,
    sshPort: Number,
    webPorts: [Number]
  },
  flags: {
    user: {
      value: String,
      foundAt: Date,
      submitted: { type: Boolean, default: false }
    },
    root: {
      value: String,
      foundAt: Date,
      submitted: { type: Boolean, default: false }
    }
  },
  lastActivity: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 60 * 1000) }, // 30 min
  totalPoints: { type: Number, default: 0 }
}, { timestamps: true });
```

### Flag Submission Model
```javascript
const FlagSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  flagType: { type: String, enum: ['user', 'root'], required: true },
  submittedFlag: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  pointsAwarded: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });
```

### Badge Model
```javascript
const BadgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: String,
  criteria: {
    type: { type: String, enum: ['labs_completed', 'points_earned', 'streak', 'category_master'] },
    value: Number,
    category: String // for category_master badges
  },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' }
}, { timestamps: true });
```

## 🔌 API Endpoints Design

### Base URL: `http://localhost:5002/api`

### Lab Management
- `GET /labs` - List all available labs
- `GET /labs/:id` - Get lab details
- `POST /labs` - Create new lab (admin only)
- `PUT /labs/:id` - Update lab (admin only)
- `DELETE /labs/:id` - Delete lab (admin only)

### Session Management
- `POST /labs/:id/start` - Start lab session
- `GET /sessions/current` - Get user's active session
- `PUT /sessions/:id/extend` - Extend session (reset timer)
- `DELETE /sessions/:id` - Stop session

### Flag Submission
- `POST /sessions/:id/flags` - Submit flag
- `GET /sessions/:id/flags` - Get session flag status

### User Progress & Stats
- `GET /users/:id/stats` - Get user lab statistics
- `GET /users/:id/sessions` - Get user session history
- `GET /leaderboard` - Global leaderboard
- `GET /badges` - Available badges
- `GET /users/:id/badges` - User's earned badges

### Admin Operations
- `GET /admin/sessions` - All active sessions
- `POST /admin/sessions/:id/terminate` - Force terminate session
- `GET /admin/stats` - Platform statistics
- `POST /admin/labs/:id/test` - Test lab deployment

## 🎯 Lampião VM Integration

### VM Specifications
- **Name**: Lampião (Portuguese vulnerable machine)
- **OS**: Ubuntu Linux
- **Format**: VMware OVF/VMDK
- **Memory**: 512MB (upgraded to 1GB)
- **CPU**: 1 virtual CPU
- **Disk**: 20GB capacity
- **Network**: NAT configuration
- **Default Credentials**: tiago:tiago

### Integration Details
```javascript
const lampiaoLab = {
  name: "Lampião",
  description: "Portuguese vulnerable Linux machine with web vulnerabilities and privilege escalation",
  difficulty: "Medium",
  category: "Web",
  ovfPath: "./Lampiao/Lampiao.ovf",
  ovaChecksum: "db4280bfd1df1a1650fd21a73ca6edc93ac12cbd",
  templateVmId: "Lampiao-Template",
  flags: {
    user: {
      template: "FLAG{user_lampiao_{session}_{user}}",
      points: 25,
      locations: ["/home/tiago/user.txt", "/var/www/html/user_flag.txt"]
    },
    root: {
      template: "FLAG{root_lampiao_{session}_{timestamp}}",
      points: 50,
      locations: ["/root/root.txt"]
    }
  },
  defaultCredentials: {
    username: "tiago",
    password: "tiago"
  },
  services: ["SSH (22)", "HTTP (80)", "MySQL (3306)"],
  vulnerabilities: ["Web App", "Privilege Escalation", "File Upload"]
};
```

### Flag Injection Strategy
- **Method**: SSH-based injection after VM boot
- **User Flag**: Placed in `/home/tiago/user.txt` and `/var/www/html/user_flag.txt`
- **Root Flag**: Placed in `/root/root.txt` (requires privilege escalation)
- **Dynamic Generation**: Unique flags per session using sessionId + userId + timestamp

## 🔧 Core Services Implementation

### 1. Provisioner Service (VM Management)
```javascript
class ProvisionerService {
  async importOVA(ovaPath, labId) {
    // Import OVA file as template VM
  }
  
  async createInstance(templateId, sessionId) {
    // Create linked clone from template
  }
  
  async startVM(vmId) {
    // Boot VM and get connection info
  }
  
  async injectFlags(vmId, userFlag, rootFlag) {
    // SSH into VM and place flags
  }
  
  async stopVM(vmId) {
    // Gracefully stop VM
  }
  
  async deleteVM(vmId) {
    // Remove VM instance
  }
}
```

### 2. Flag Service (Dynamic Flag Generation)
```javascript
class FlagService {
  generateFlags(sessionId, userId, labId) {
    // Generate unique flags per session
    const userFlag = `FLAG{user_${sessionId}_${crypto.randomBytes(8).toString('hex')}}`;
    const rootFlag = `FLAG{root_${sessionId}_${crypto.randomBytes(8).toString('hex')}}`;
    return { userFlag, rootFlag };
  }
  
  validateFlag(submittedFlag, expectedFlag) {
    return submittedFlag.trim() === expectedFlag;
  }
}
```

### 3. Scoring Service
```javascript
class ScoringService {
  async awardPoints(userId, points, flagType) {
    // Update user's total points
    // Check for badge achievements
    // Update leaderboard
  }
  
  async checkBadgeEligibility(userId) {
    // Check if user earned new badges
  }
  
  async updateLeaderboard() {
    // Recalculate rankings
  }
}
```

## ⚡ Integration Points

### 1. Shared Authentication
- Use the same JWT verification logic as frontend-team backend
- Import existing auth middleware pattern
- Maintain cookie + bearer token support

### 2. User Model Extension
- Reference existing User model via ObjectId
- Create separate UserLab collection for lab-specific data
- Maintain referential integrity

### 3. Database Sharing
- Use same MONGO_URI connection string
- Implement proper collection naming to avoid conflicts
- Share connection pooling for efficiency

### 4. Consistent API Patterns
- Follow same error handling patterns
- Use same response format conventions
- Maintain same CORS configuration

## 🔄 Session Lifecycle Management

### 1. Session Creation Flow
```
User clicks "Start Lab" 
→ Check if user has active session (limit: 1)
→ Validate lab availability
→ Queue VM provisioning job
→ Generate unique flags
→ Create session record
→ Import OVA (if needed)
→ Create VM instance
→ Boot VM
→ Inject flags via SSH
→ Update session with connection info
→ Return session details
```

### 2. Session Monitoring
- **Heartbeat system**: Client pings every 5 minutes
- **Auto-expiry**: Sessions expire after 30 minutes of inactivity
- **Cleanup job**: Background job to terminate expired sessions

### 3. Session Termination
```
Session expires/user stops
→ Gracefully stop VM
→ Save session statistics
→ Award completion badges (if applicable)
→ Delete VM instance
→ Update user stats
→ Clean up temporary files
```

## 🛠️ Technology Stack

### Core Dependencies
```json
{
  "express": "^5.1.0",
  "mongoose": "^8.6.0",
  "jsonwebtoken": "^9.0.2",
  "redis": "^4.6.0",
  "bullmq": "^4.15.0",
  "node-virtualbox": "^1.2.0",
  "ssh2": "^1.14.0",
  "crypto": "^1.0.1",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.0",
  "joi": "^17.11.0",
  "winston": "^3.11.0"
}
```

### Development Dependencies
```json
{
  "nodemon": "^3.1.10",
  "@types/node": "^20.10.0",
  "jest": "^29.7.0",
  "supertest": "^6.3.0"
}
```

## 🚀 Deployment Strategy

### Phase 1: Core Lab System (Week 1-2)
1. ✅ Set up project structure
2. ✅ Implement Lab model and basic CRUD
3. ✅ Integrate with existing User authentication
4. ✅ Build VirtualBox VM provisioning service
5. ✅ Implement session management
6. ✅ Add flag generation and validation

### Phase 2: Enhanced Features (Week 3-4)
1. ✅ Implement scoring and badge system
2. ✅ Add leaderboard functionality  
3. ✅ Build admin panel APIs
4. ✅ Add session monitoring and auto-cleanup
5. ✅ Implement rate limiting and security measures

### Phase 3: Production Ready (Week 5-6)
1. ✅ Add comprehensive logging and monitoring
2. ✅ Implement proper error handling
3. ✅ Add unit and integration tests
4. ✅ Performance optimization
5. ✅ Documentation and deployment guides

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Database
MONGO_URI=mongodb://localhost:27017/cybersec-platform

# Redis
REDIS_URL=redis://localhost:6379

# JWT (shared with frontend-team backend)
JWT_SECRET=your-super-secret-jwt-key

# VM Configuration
OVA_STORAGE_PATH=./storage/ova-files
VM_INSTANCES_PATH=./storage/vm-instances
VIRTUALBOX_MANAGE_PATH=/usr/bin/VBoxManage

# Application
PORT=5002
NODE_ENV=development

# Session Configuration
SESSION_TIMEOUT_MINUTES=30
MAX_CONCURRENT_SESSIONS_PER_USER=1

# Rate Limiting
API_RATE_LIMIT_PER_HOUR=1000
```

## 🧪 Testing Strategy

### Unit Tests
- Service layer logic (flag generation, scoring)
- Utility functions (VM management, crypto)
- Model validation

### Integration Tests
- API endpoint functionality
- Database operations
- VM provisioning workflow

### End-to-End Tests
- Complete session lifecycle
- Flag submission workflow
- User progress tracking

## 📝 Success Criteria

### Functional Requirements
- ✅ Users can browse available labs
- ✅ Users can start/stop lab sessions (1 active session limit)
- ✅ Sessions auto-expire after 30 minutes of inactivity
- ✅ Dynamic flag generation per session
- ✅ Flag submission and scoring system
- ✅ User progress tracking and leaderboards
- ✅ Admin lab management capabilities

### Non-Functional Requirements
- ✅ API response time < 200ms (excluding VM provisioning)
- ✅ Support for 50+ concurrent lab sessions
- ✅ 99.5% uptime availability
- ✅ Secure flag generation (no predictable patterns)
- ✅ Proper error handling and logging
- ✅ Integration with existing user system

## 🔮 Future Enhancements

### Phase 4: Advanced Features
- **Proxmox Integration**: Replace VirtualBox with enterprise virtualization
- **WireGuard VPN**: Direct network access to lab VMs
- **Kubernetes Pwnbox**: Browser-based terminal access
- **WebSocket Events**: Real-time session status updates
- **Hint System**: Progressive hints for stuck users
- **Team Challenges**: Collaborative lab solving
- **Custom Lab Creation**: User-uploadable OVA files

### Phase 5: Enterprise Features
- **Multi-tenancy**: Organization/team isolation
- **SAML/SSO Integration**: Enterprise authentication
- **Advanced Analytics**: Detailed performance metrics
- **Custom Branding**: White-label capabilities
- **API Rate Plans**: Tiered access levels
- **Automated Grading**: AI-powered solution validation

## 📚 Documentation Deliverables

1. **API Documentation**: OpenAPI/Swagger specification
2. **Setup Guide**: Local development environment setup
3. **Deployment Guide**: Production deployment instructions
4. **Integration Guide**: Frontend integration examples
5. **Admin Guide**: Lab management and monitoring
6. **Troubleshooting Guide**: Common issues and solutions

---

This implementation plan provides a comprehensive roadmap for building a production-ready cybersecurity lab platform backend that seamlessly integrates with the existing frontend team's admin system while maintaining scalability and extensibility for future enhancements.