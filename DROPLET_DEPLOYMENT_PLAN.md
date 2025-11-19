# VPN Droplet Deployment Plan

## Project Overview
Migrate the labs-backend system from local Windows environment to a DigitalOcean Ubuntu droplet with OpenVPN for remote access to cybersecurity lab VMs.

---

## Current vs Target Architecture

### Current Setup (Local)
```
Windows PC (localhost)
├── labs-backend (npm run dev) - Port 5002
├── OpenVPN Server (local, demo certs)
├── VirtualBox VMs (local)
└── MongoDB (Atlas cloud)

User Flow:
1. User → localhost:5173 (frontend)
2. Download .ovpn (demo config)
3. Connect to local VPN
4. Access local VMs
```

### Target Setup (Droplet)
```
DigitalOcean Droplet (Ubuntu 22.04)
Public IP: XXX.XXX.XXX.XXX
├── OpenVPN Server (proper CA/PKI)
├── Docker: labs-backend
├── Docker: MongoDB
├── Nginx (HTTPS/SSL)
└── VirtualBox: Lab VMs

User Flow:
1. User → https://yourdomain.com (frontend)
2. Download .ovpn (real certs)
3. Connect to droplet VPN
4. Access droplet VMs remotely
```

---

## Deployment Phases

### **Phase 1: Droplet Provisioning & Basic Setup** (Day 1)
- Provision droplet
- Initial server hardening
- Install base dependencies
- Set up firewall

### **Phase 2: OpenVPN Server Setup** (Day 1-2)
- Install OpenVPN
- Set up Certificate Authority (CA)
- Configure VPN server
- Test VPN connection

### **Phase 3: Application Deployment** (Day 2-3)
- Install Docker & Docker Compose
- Deploy labs-backend
- Set up MongoDB
- Configure Nginx reverse proxy

### **Phase 4: VM Infrastructure** (Day 3-4)
- Install VirtualBox/KVM
- Set up VM networking
- Upload VM templates
- Test VM provisioning

### **Phase 5: Integration & Testing** (Day 4-5)
- End-to-end testing
- Performance tuning
- Monitoring setup
- Documentation

### **Phase 6: Go Live** (Day 5)
- DNS configuration
- SSL certificates
- User migration
- Launch

---

## Detailed Implementation Plan

## **PHASE 1: Droplet Provisioning & Basic Setup**

### 1.1 Create DigitalOcean Droplet

#### Droplet Specifications:
| Component | Specification | Reason |
|-----------|---------------|--------|
| **OS** | Ubuntu 22.04 LTS x64 | Stable, long-term support |
| **Plan** | CPU-Optimized | Better VM performance |
| **CPU** | 8 vCPUs | Run 8-10 concurrent VMs |
| **RAM** | 16 GB | 2GB per VM + overhead |
| **Storage** | 200 GB SSD | VMs + templates + OS |
| **Region** | Choose closest to users | Lower latency |
| **Cost** | ~$112/month | CPU-Optimized droplet |

#### Steps:
```bash
# 1. Create droplet via DigitalOcean dashboard
#    - Choose Ubuntu 22.04 LTS
#    - Select CPU-Optimized 8 vCPU / 16 GB
#    - Add SSH key for access
#    - Choose datacenter region

# 2. Note down the droplet IP
DROPLET_IP="XXX.XXX.XXX.XXX"

# 3. SSH into droplet
ssh root@$DROPLET_IP
```

### 1.2 Initial Server Hardening

```bash
# Update system
apt update && apt upgrade -y

# Create non-root user
adduser labsadmin
usermod -aG sudo labsadmin

# Set up SSH key for new user
mkdir -p /home/labsadmin/.ssh
cp ~/.ssh/authorized_keys /home/labsadmin/.ssh/
chown -R labsadmin:labsadmin /home/labsadmin/.ssh
chmod 700 /home/labsadmin/.ssh
chmod 600 /home/labsadmin/.ssh/authorized_keys

# Disable root login
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart sshd

# From now on, use: ssh labsadmin@$DROPLET_IP
```

### 1.3 Install Base Dependencies

```bash
# Essential packages
sudo apt install -y \
  curl \
  wget \
  git \
  vim \
  htop \
  net-tools \
  ufw \
  build-essential \
  software-properties-common

# Install Node.js 20.x (for labs-backend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
node --version  # Should be v20.x
npm --version   # Should be 10.x
```

### 1.4 Configure Firewall (UFW)

```bash
# Enable firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (IMPORTANT: Don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow OpenVPN
sudo ufw allow 1194/udp

# Allow HTTP/HTTPS (for Nginx)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

---

## **PHASE 2: OpenVPN Server Setup**

### 2.1 Install OpenVPN & Easy-RSA

```bash
# Install OpenVPN and Easy-RSA
sudo apt install -y openvpn easy-rsa

# Create Easy-RSA directory
make-cadir ~/openvpn-ca
cd ~/openvpn-ca
```

### 2.2 Set Up Certificate Authority (CA)

```bash
# Edit vars file
vim vars

# Add/modify these lines:
export KEY_COUNTRY="US"
export KEY_PROVINCE="CA"
export KEY_CITY="SanFrancisco"
export KEY_ORG="CyberLabs"
export KEY_EMAIL="admin@cyberlabs.com"
export KEY_OU="CyberLabsVPN"
export KEY_NAME="server"

# Source vars and build CA
source vars
./clean-all
./build-ca

# Generate server certificate
./build-key-server server

# Generate Diffie-Hellman parameters
./build-dh

# Generate TLS authentication key
openvpn --genkey --secret keys/ta.key
```

### 2.3 Copy Certificates to OpenVPN Directory

```bash
# Create directory for server certs
sudo mkdir -p /etc/openvpn/server/

# Copy certificates
sudo cp ~/openvpn-ca/keys/ca.crt /etc/openvpn/server/
sudo cp ~/openvpn-ca/keys/server.crt /etc/openvpn/server/
sudo cp ~/openvpn-ca/keys/server.key /etc/openvpn/server/
sudo cp ~/openvpn-ca/keys/dh2048.pem /etc/openvpn/server/
sudo cp ~/openvpn-ca/keys/ta.key /etc/openvpn/server/

# Set permissions
sudo chmod 600 /etc/openvpn/server/server.key
sudo chmod 600 /etc/openvpn/server/ta.key
```

### 2.4 Configure OpenVPN Server

```bash
# Create server configuration
sudo vim /etc/openvpn/server/server.conf
```

**Server Configuration** (`/etc/openvpn/server/server.conf`):
```conf
# Server Settings
port 1194
proto udp
dev tun

# SSL/TLS Configuration
ca ca.crt
cert server.crt
key server.key
dh dh2048.pem
tls-auth ta.key 0

# Network Configuration
server 10.8.0.0 255.255.255.0
topology subnet

# Push routes to clients
push "route 192.168.56.0 255.255.255.0"
push "dhcp-option DNS 8.8.8.8"
push "dhcp-option DNS 8.8.4.4"

# Client Configuration
client-to-client
keepalive 10 120
cipher AES-256-GCM
auth SHA256
compress lz4-v2
push "compress lz4-v2"

# Privileges
user nobody
group nogroup
persist-key
persist-tun

# Logging
status /var/log/openvpn/openvpn-status.log
log-append /var/log/openvpn/openvpn.log
verb 3

# Connection Limits
max-clients 50

# Client-specific configs
client-config-dir /etc/openvpn/server/ccd
```

### 2.5 Enable IP Forwarding & NAT

```bash
# Enable IP forwarding
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Configure NAT (replace eth0 with your interface name)
INTERFACE=$(ip route | grep default | awk '{print $5}')

sudo iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o $INTERFACE -j MASQUERADE
sudo iptables -A FORWARD -i tun0 -o $INTERFACE -j ACCEPT
sudo iptables -A FORWARD -i $INTERFACE -o tun0 -j ACCEPT

# Save iptables rules
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```

### 2.6 Start OpenVPN Server

```bash
# Create log directory
sudo mkdir -p /var/log/openvpn

# Enable and start OpenVPN
sudo systemctl enable openvpn-server@server
sudo systemctl start openvpn-server@server

# Check status
sudo systemctl status openvpn-server@server

# Check logs
sudo tail -f /var/log/openvpn/openvpn.log
```

### 2.7 Test OpenVPN (Client Certificate)

```bash
# Generate a test client certificate
cd ~/openvpn-ca
source vars
./build-key test-client

# Create test client config
cat > ~/test-client.ovpn << EOF
client
dev tun
proto udp
remote $DROPLET_IP 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
compress lz4-v2
verb 3

<ca>
$(cat /etc/openvpn/server/ca.crt)
</ca>

<cert>
$(cat ~/openvpn-ca/keys/test-client.crt)
</cert>

<key>
$(cat ~/openvpn-ca/keys/test-client.key)
</key>

<tls-auth>
$(cat /etc/openvpn/server/ta.key)
</tls-auth>
key-direction 1
EOF

# Download test-client.ovpn to your local machine and test connection
```

---

## **PHASE 3: Application Deployment**

### 3.1 Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

### 3.2 Clone labs-backend Repository

```bash
# Create app directory
sudo mkdir -p /opt/apps
sudo chown labsadmin:labsadmin /opt/apps
cd /opt/apps

# Clone repository (or upload via SCP)
git clone https://github.com/yourusername/labs-backend.git
# OR
# scp -r C:\Users\ihamz\labs-backend labsadmin@$DROPLET_IP:/opt/apps/

cd labs-backend
```

### 3.3 Create Docker Compose Configuration

```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  labs-backend:
    build: .
    container_name: labs-backend
    restart: always
    ports:
      - "5002:5002"
    environment:
      - NODE_ENV=production
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
      - VPN_SERVER_HOST=${DROPLET_IP}
      - VPN_SERVER_PORT=1194
    volumes:
      - ./storage:/app/storage
      - ./certificates:/app/certificates
      - /etc/openvpn/server:/app/openvpn-certs:ro
    networks:
      - labs-network
    depends_on:
      - mongodb

  mongodb:
    image: mongo:7.0
    container_name: labs-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - labs-network

  nginx:
    image: nginx:alpine
    container_name: labs-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    networks:
      - labs-network
    depends_on:
      - labs-backend

networks:
  labs-network:
    driver: bridge

volumes:
  mongodb_data:
EOF
```

### 3.4 Create Environment File

```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
MONGO_URI=mongodb://admin:your_secure_password@mongodb:27017/Cyber-project?authSource=admin
MONGO_PASSWORD=your_secure_password
JWT_SECRET=$(openssl rand -base64 32)
DROPLET_IP=$DROPLET_IP
EOF
```

### 3.5 Create Dockerfile

```bash
# Create Dockerfile if not exists
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port
EXPOSE 5002

# Start application
CMD ["npm", "start"]
EOF
```

### 3.6 Create Nginx Configuration

```bash
# Create nginx.conf
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server labs-backend:5002;
    }

    server {
        listen 80;
        server_name _;

        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
EOF
```

### 3.7 Deploy Application

```bash
# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify services are running
docker-compose ps
```

---

## **PHASE 4: VM Infrastructure**

### 4.1 Install VirtualBox

```bash
# Add VirtualBox repository
wget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | sudo apt-key add -
echo "deb [arch=amd64] https://download.virtualbox.org/virtualbox/debian $(lsb_release -cs) contrib" | sudo tee /etc/apt/sources.list.d/virtualbox.list

# Install VirtualBox
sudo apt update
sudo apt install -y virtualbox-7.0

# Add user to vboxusers group
sudo usermod -aG vboxusers labsadmin
```

### 4.2 Set Up VM Storage Structure

```bash
# Create VM directories
sudo mkdir -p /var/lib/vbox/{templates,instances,storage/ova-files}
sudo chown -R labsadmin:labsadmin /var/lib/vbox

# Create symbolic link from Docker volume
docker exec labs-backend ln -s /var/lib/vbox/storage /app/storage
```

### 4.3 Configure Host-Only Network

```bash
# Create host-only network for VMs
VBoxManage hostonlyif create
VBoxManage hostonlyif ipconfig vboxnet0 --ip 192.168.56.1 --netmask 255.255.255.0

# Enable routing between VPN and VM network
sudo iptables -A FORWARD -i tun0 -o vboxnet0 -j ACCEPT
sudo iptables -A FORWARD -i vboxnet0 -o tun0 -j ACCEPT
sudo iptables -t nat -A POSTROUTING -o vboxnet0 -j MASQUERADE

# Save rules
sudo netfilter-persistent save
```

### 4.4 Upload VM Templates

```bash
# From your local machine, upload VM templates
scp C:\Users\ihamz\path\to\lampiao.ova labsadmin@$DROPLET_IP:/var/lib/vbox/templates/

# On droplet, verify upload
ls -lh /var/lib/vbox/templates/
```

### 4.5 Test VM Provisioning

```bash
# Import test VM
VBoxManage import /var/lib/vbox/templates/lampiao.ova \
  --vsys 0 --vmname test-lampiao

# Configure network
VBoxManage modifyvm test-lampiao --nic1 hostonly --hostonlyadapter1 vboxnet0

# Start VM (headless mode)
VBoxManage startvm test-lampiao --type headless

# Check status
VBoxManage showvminfo test-lampiao --machinereadable | grep VMState

# Stop and remove test VM
VBoxManage controlvm test-lampiao poweroff
VBoxManage unregistervm test-lampiao --delete
```

---

## **PHASE 5: Integration & Testing**

### 5.1 Update VPN Service to Use Real Certificates

```bash
# Update labs-backend VPN service to use droplet certificates
# File: /opt/apps/labs-backend/src/services/vpn.service.js

# Update certificate paths:
this.certsPath = '/app/openvpn-certs'  # Points to /etc/openvpn/server
this.vpnServerIP = process.env.DROPLET_IP || 'localhost'
```

### 5.2 End-to-End Testing Checklist

```bash
# 1. Test VPN Connection
# - Generate client config via API
# - Download .ovpn file
# - Connect from local machine
# - Verify IP assignment (10.8.0.x)

# 2. Test VM Access
# - Start a lab session via API
# - VM should provision
# - VM should be accessible via VPN (ping 192.168.56.x)
# - Test SSH/HTTP access to VM

# 3. Test Flag Submission
# - Submit flags via web UI
# - Verify database updates
# - Check stats refresh

# 4. Test Session Cleanup
# - Wait for session timeout
# - VM should auto-destroy
# - VPN config should expire
```

### 5.3 Set Up Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Set up log rotation for OpenVPN
sudo vim /etc/logrotate.d/openvpn
```

**Log Rotation Config**:
```
/var/log/openvpn/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 640 root root
}
```

---

## **PHASE 6: Go Live**

### 6.1 DNS Configuration

```bash
# Point your domain to droplet IP
# In your DNS provider (Namecheap, GoDaddy, etc.):
# A record: labs.yourdomain.com → DROPLET_IP
# A record: api.labs.yourdomain.com → DROPLET_IP
```

### 6.2 SSL Certificates (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d labs.yourdomain.com -d api.labs.yourdomain.com

# Update Nginx config to use SSL
# Certbot will do this automatically
```

### 6.3 Update Frontend Configuration

```javascript
// Update API URL in frontend
// File: frontend/src/services/labsService.js
const API_URL = 'https://api.labs.yourdomain.com/api'
```

### 6.4 Final Deployment

```bash
# Restart all services
docker-compose down
docker-compose up -d

# Restart OpenVPN
sudo systemctl restart openvpn-server@server

# Check everything is running
docker-compose ps
sudo systemctl status openvpn-server@server
```

---

## Cost Breakdown

| Component | Monthly Cost |
|-----------|-------------|
| DigitalOcean Droplet (8 vCPU, 16 GB) | $112 |
| Bandwidth (5 TB included) | $0 |
| Domain Name | $12 |
| SSL Certificate (Let's Encrypt) | $0 |
| **Total** | **~$124/month** |

---

## Timeline

| Phase | Duration | Days |
|-------|----------|------|
| Phase 1: Droplet Provisioning | 4 hours | Day 1 |
| Phase 2: OpenVPN Setup | 6 hours | Day 1-2 |
| Phase 3: Application Deployment | 8 hours | Day 2-3 |
| Phase 4: VM Infrastructure | 6 hours | Day 3-4 |
| Phase 5: Integration & Testing | 10 hours | Day 4-5 |
| Phase 6: Go Live | 4 hours | Day 5 |
| **Total** | **~38 hours** | **5 days** |

---

## Rollback Plan

If deployment fails:

1. **Keep local setup running** - Users continue using localhost
2. **Debug on droplet** - Fix issues without affecting users
3. **Gradual migration** - Move one lab at a time
4. **Droplet snapshots** - Create snapshots at each phase

---

## Success Criteria

✅ Users can access labs from any location  
✅ VPN connects successfully with real certificates  
✅ VMs provision and are accessible via VPN  
✅ Flag submission works end-to-end  
✅ Sessions auto-cleanup after timeout  
✅ Frontend loads over HTTPS  
✅ Performance is acceptable (<2s response time)  

---

## Next Steps

1. **Review this plan** - Confirm requirements
2. **Provision droplet** - Start Phase 1
3. **Set up OpenVPN** - Complete Phase 2
4. **Deploy application** - Move to Phase 3

Ready to proceed? 🚀
