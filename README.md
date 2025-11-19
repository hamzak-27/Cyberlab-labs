# 🚀 CyberSec Labs Backend

A comprehensive cybersecurity lab platform backend built with Node.js, Express, and MongoDB. This system provides VM-based lab sessions, flag management, and user progress tracking.

## 🎯 Features

- **Lab Management**: Create and manage vulnerable VM labs
- **Session Management**: Individual VM instances per user with auto-expiry
- **Flag System**: Dynamic flag generation and validation
- **Scoring & Badges**: Point system with achievement badges
- **User Statistics**: Comprehensive progress tracking
- **Admin Panel**: Administrative controls and monitoring
- **Security**: JWT authentication, rate limiting, input validation

## 🏗️ Architecture

```
labs-backend/
├── src/
│   ├── config/          # Database & environment configuration
│   ├── models/          # MongoDB schemas (Lab, Session, Flag, Badge, etc.)
│   ├── controllers/     # Business logic controllers
│   ├── services/        # Core services (VM, Flag, Scoring)
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Authentication, validation, rate limiting
│   ├── utils/           # Helper functions
│   ├── jobs/            # Background job processing
│   └── server.js        # Application entry point
├── storage/             # OVA files and VM instances
├── logs/                # Application logs
└── Lampiao/             # Sample lab (Lampião vulnerable VM)
```

## 🔧 Prerequisites

- **Node.js** 18.x or higher
- **MongoDB** 4.4 or higher
- **Redis** 6.x or higher
- **VirtualBox** 6.1 or higher (for VM management)

## 📦 Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd labs-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up databases:**
```bash
# Start MongoDB (if using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Start Redis (if using Docker)
docker run -d -p 6379:6379 --name redis redis:latest
```

5. **Install VirtualBox:**
- Download from: https://www.virtualbox.org/wiki/Downloads
- Ensure `VBoxManage` is in your PATH

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# Database
MONGO_URI=mongodb://localhost:27017/cybersec-platform
REDIS_URL=redis://localhost:6379

# JWT (must match frontend-team backend)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# Server
PORT=5002
NODE_ENV=development

# VM Configuration
VIRTUALBOX_MANAGE_PATH=C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe
OVA_STORAGE_PATH=./storage/ova-files
VM_INSTANCES_PATH=./storage/vm-instances

# Session Configuration
SESSION_TIMEOUT_MINUTES=30
MAX_CONCURRENT_SESSIONS_PER_USER=1
```

## 🚀 Quick Start

1. **Start the development server:**
```bash
npm run dev
```

2. **The API will be available at:**
- Main API: `http://localhost:5002/api`
- Health check: `http://localhost:5002/api/health`

## 🧪 Lab Integration

### Lab Management Strategy

**Important**: All future lab integrations will be managed exclusively through the **admin backend interface**. Only administrators with proper credentials can:

- Upload new OVA/OVF files
- Configure lab metadata and flags
- Set difficulty levels and categories
- Enable/disable lab availability
- Monitor lab statistics and performance

This ensures proper quality control, security validation, and consistent lab standards across the platform.

### Lampião VM Setup (Initial Lab)

The system includes the **Lampião** vulnerable VM for testing and initial demonstration:

1. **VM Specifications:**
   - OS: Ubuntu Linux
   - Credentials: tiago:tiago
   - Services: SSH (22), HTTP (80), MySQL (3306)
   - Difficulty: Medium
   - Category: Web
   - Status: Pre-integrated for testing

2. **Files included:**
   - `Lampiao/Lampiao.ovf` - VM definition
   - `Lampiao/Lampiao-disk1.vmdk` - VM disk image
   - `Lampiao/Lampiao.mf` - Manifest file

3. **Integration Process:**
   - Lampião is included as a reference implementation
   - Future labs must be added via admin panel only
   - Each lab requires admin approval and validation

## 📚 API Documentation

### Authentication
All authenticated endpoints require a JWT token via:
- Cookie: `token=<jwt_token>`
- Header: `Authorization: Bearer <jwt_token>`

### Core Endpoints

#### Labs
- `GET /api/labs` - List available labs
- `GET /api/labs/:id` - Get lab details
- `POST /api/labs` - Create new lab (admin only)
- `PUT /api/labs/:id` - Update lab (admin only)

#### Sessions
- `POST /api/labs/:id/start` - Start lab session
- `GET /api/sessions/current` - Get active session
- `PUT /api/sessions/:id/extend` - Extend session
- `DELETE /api/sessions/:id` - Stop session

#### Flags
- `POST /api/sessions/:id/flags` - Submit flag
- `GET /api/sessions/:id/flags` - Get flag status

#### Statistics
- `GET /api/users/:id/stats` - User statistics
- `GET /api/leaderboard` - Global leaderboard
- `GET /api/badges` - Available badges

## 🔐 Security Features

- **JWT Authentication**: Compatible with frontend-team system
- **Rate Limiting**: Per-user and global rate limits
- **Input Validation**: Joi schema validation
- **Admin Protection**: Role-based access control
- **Session Security**: Automatic expiry and cleanup
- **VM Isolation**: Each user gets isolated VM instance

## 📊 Database Schema

### Core Models

1. **Lab**: VM definitions and metadata
2. **Session**: Active lab sessions with VM instances
3. **FlagSubmission**: All flag submission attempts
4. **Badge**: Achievement definitions
5. **UserLabStats**: Extended user statistics for labs

### Integration with Frontend-Team

- Shares same MongoDB database
- References existing User model
- Compatible JWT authentication
- Separate port (5002) to avoid conflicts

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run test suite
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

### Testing with Lampião

1. **Register the lab:**
```bash
curl -X POST http://localhost:5002/api/labs \
  -H "Authorization: Bearer <admin_token>" \
  -d @lampiao-lab.json
```

2. **Start a session:**
```bash
curl -X POST http://localhost:5002/api/labs/<lab_id>/start \
  -H "Authorization: Bearer <user_token>"
```

3. **Submit flags:**
```bash
curl -X POST http://localhost:5002/api/sessions/<session_id>/flags \
  -H "Authorization: Bearer <user_token>" \
  -d '{"flag": "FLAG{user_flag_here}", "type": "user"}'
```

## 🚦 Current Implementation Status

### ✅ Completed
- [x] Project structure and dependencies
- [x] Database connections (MongoDB + Redis)
- [x] All database models with relationships
- [x] Authentication middleware (frontend-team compatible)
- [x] Environment configuration with validation
- [x] Lampião VM integration planning

### 🔄 In Progress
- [ ] VM provisioner service (VirtualBox integration)
- [ ] Flag generation and injection service
- [ ] Session management service
- [ ] Scoring and badge system
- [ ] REST API controllers and routes
- [ ] Background job processing
- [ ] Error handling and logging

### ⏳ Planned
- [ ] Complete API implementation
- [ ] Comprehensive testing
- [ ] Production deployment guides
- [ ] Performance optimization
- [ ] Advanced features (WebSocket, analytics)

## 📝 System Requirements

### Hardware
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 50GB free space
- **CPU**: Multi-core processor

### Software
- **Windows 10/11** (current setup)
- **VirtualBox** 6.1+
- **Node.js** 18.x+
- **MongoDB** 4.4+
- **Redis** 6.x+

## 🤝 Integration with Frontend

The backend is designed to integrate seamlessly with your existing frontend-team system:

1. **Shared Database**: Uses same MongoDB instance
2. **User Authentication**: Compatible JWT tokens
3. **User Model**: References existing user structure  
4. **API Design**: RESTful endpoints for easy frontend integration
5. **CORS**: Configured for localhost:5173 (frontend port)

## 📞 Support

For issues and questions:
1. Check the logs in `logs/app.log`
2. Verify environment configuration
3. Ensure all services (MongoDB, Redis, VirtualBox) are running
4. Check network ports are available (5002, 27017, 6379)

## 🔄 Next Steps

1. **Complete VM provisioner service implementation**
2. **Test Lampião lab import and session creation**
3. **Implement flag injection via SSH**
4. **Build complete REST API endpoints**
5. **Add comprehensive error handling**
6. **Set up background job processing**

---

**Status**: 🚧 **Active Development** - Core infrastructure complete, services in progress