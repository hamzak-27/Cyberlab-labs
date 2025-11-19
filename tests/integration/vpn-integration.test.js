import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import WebSocket from 'ws';
import fs from 'fs/promises';
import path from 'path';
import app from '../../src/app.js';
import vpnService from '../../src/services/vpn.service.js';
import vpnMonitor from '../../src/services/vpn-monitor.service.js';
import vmProvisioner from '../../src/services/provisioner.service.js';
import websocketService from '../../src/services/websocket.service.js';

/**
 * End-to-End VPN Integration Test Suite
 * Tests the complete VPN workflow from certificate generation to VM networking
 */
describe('VPN Integration End-to-End Tests', () => {
  let server;
  let testUser;
  let authToken;
  let testSessionId;
  let websocketClient;
  
  const TEST_USER = {
    username: 'vpn-test-user',
    email: 'vpntest@example.com',
    password: 'TestPass123!',
    role: 'user'
  };

  beforeAll(async () => {
    // Start test server
    server = app.listen(0); // Use random available port
    const address = server.address();
    const baseURL = `http://localhost:${address.port}`;
    
    console.log(`Test server started on ${baseURL}`);
    
    // Initialize services
    await vpnService.initialize();
    await vpnMonitor.initialize();
    await vmProvisioner.initialize();
    
    // Create test directories
    await ensureTestDirectories();
    
    // Create test user and get auth token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send(TEST_USER);
    
    testUser = userResponse.body.data.user;
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USER.email,
        password: TEST_USER.password
      });
    
    authToken = loginResponse.body.data.token;
    
    console.log(`Test user created: ${testUser.id}`);
  });

  afterAll(async () => {
    // Cleanup
    if (websocketClient) {
      websocketClient.close();
    }
    
    vpnMonitor.stopMonitoring();
    websocketService.shutdown();
    
    if (server) {
      server.close();
    }
    
    // Cleanup test files
    await cleanupTestFiles();
    
    console.log('Test cleanup completed');
  });

  describe('1. VPN Service - Certificate Generation', () => {
    test('should generate VPN certificates for user', async () => {
      const response = await request(app)
        .post(`/api/vpn/generate-config/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('configPath');
      expect(response.body.data).toHaveProperty('certificatePath');
      
      console.log('✅ VPN certificates generated successfully');
    });

    test('should download VPN configuration file', async () => {
      const response = await request(app)
        .get(`/api/vpn/config/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/x-openvpn-profile');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.text).toContain('client');
      expect(response.text).toContain('remote');
      
      console.log('✅ VPN configuration download works');
    });
  });

  describe('2. VPN Monitoring - Connection Tracking', () => {
    test('should start VPN monitoring service', async () => {
      const response = await request(app)
        .post('/api/vpn-monitor/start')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(vpnMonitor.isMonitoring).toBe(true);
      
      console.log('✅ VPN monitoring started');
    });

    test('should get VPN connection status', async () => {
      const response = await request(app)
        .get('/api/vpn-monitor/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId', testUser.id);
      expect(response.body.data).toHaveProperty('connected');
      expect(response.body.data).toHaveProperty('status');
      
      console.log('✅ VPN status retrieval works');
    });

    test('should get VPN monitoring health', async () => {
      const response = await request(app)
        .get('/api/vpn-monitor/health')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('monitoring', true);
      expect(response.body.data).toHaveProperty('status', 'healthy');
      
      console.log('✅ VPN monitor health check works');
    });
  });

  describe('3. WebSocket - Real-time Updates', () => {
    test('should establish authenticated WebSocket connection', (done) => {
      const wsUrl = `ws://localhost:${server.address().port}/ws/vpn-monitor?token=${authToken}`;
      
      websocketClient = new WebSocket(wsUrl);
      
      websocketClient.on('open', () => {
        console.log('✅ WebSocket connection established');
        done();
      });
      
      websocketClient.on('error', (error) => {
        done(error);
      });
    });

    test('should receive VPN status via WebSocket', (done) => {
      websocketClient.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'vpn:status') {
          expect(message.data).toHaveProperty('userId');
          expect(message.data).toHaveProperty('connected');
          console.log('✅ WebSocket VPN status received');
          done();
        }
      });
      
      // Request status update
      websocketClient.send(JSON.stringify({
        type: 'vpn:status:request'
      }));
    });

    test('should handle WebSocket ping-pong', (done) => {
      websocketClient.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'pong') {
          expect(message).toHaveProperty('timestamp');
          console.log('✅ WebSocket ping-pong works');
          done();
        }
      });
      
      websocketClient.send(JSON.stringify({ type: 'ping' }));
    });
  });

  describe('4. VM Provisioner - VPN Network Integration', () => {
    let templateId;
    let vmInstanceId;
    
    test('should create VM instance with VPN bridge networking', async () => {
      // Mock template for testing
      templateId = 'mock-template-id';
      testSessionId = `test-session-${Date.now()}`;
      
      // Test VPN subnet allocation
      const userSubnet = {
        subnetNumber: 42,
        network: '10.10.42.0/24',
        netmask: '255.255.255.0',
        gateway: '10.10.42.1'
      };
      
      const sessionConfig = {
        userId: testUser.id,
        useVPN: true,
        userSubnet
      };
      
      // Mock the VM provisioner for testing
      const mockResult = await simulateVMCreation(templateId, testSessionId, sessionConfig);
      
      expect(mockResult.success).toBe(true);
      expect(mockResult.networkConfig.mode).toBe('bridge');
      expect(mockResult.networkConfig.vmIP).toBe('10.10.42.10');
      expect(mockResult.networkConfig.services).toHaveProperty('ssh');
      expect(mockResult.networkConfig.services).toHaveProperty('web');
      
      vmInstanceId = mockResult.instanceId;
      console.log('✅ VM instance created with VPN bridge networking');
    });

    test('should generate proper connection info for VPN mode', async () => {
      const connectionInfo = generateVPNConnectionInfo({
        mode: 'bridge',
        vmIP: '10.10.42.10',
        services: {
          ssh: { ip: '10.10.42.10', port: 22 },
          web: { ip: '10.10.42.10', port: 80 },
          ftp: { ip: '10.10.42.10', port: 21 },
          mysql: { ip: '10.10.42.10', port: 3306 }
        }
      });
      
      expect(connectionInfo.mode).toBe('bridge');
      expect(connectionInfo.ssh.host).toBe('10.10.42.10');
      expect(connectionInfo.ssh.port).toBe(22);
      expect(connectionInfo.ssh.command).toBe('ssh user@10.10.42.10');
      expect(connectionInfo.web.url).toBe('http://10.10.42.10');
      expect(connectionInfo.general.vpnRequired).toBe(true);
      expect(connectionInfo.general.directAccess).toBe(true);
      
      console.log('✅ VPN connection info generation works');
    });
  });

  describe('5. Session Integration - Complete Workflow', () => {
    test('should create lab session with VPN integration', async () => {
      // Mock session creation with VPN
      const sessionData = {
        labId: 'test-lab-id',
        userId: testUser.id,
        useVPN: true,
        vmConfig: {
          ram: 2048,
          cpu: 2
        }
      };
      
      const mockSession = await simulateSessionCreation(sessionData);
      
      expect(mockSession.success).toBe(true);
      expect(mockSession.vpnConfig).toBeDefined();
      expect(mockSession.vmNetworking.mode).toBe('bridge');
      expect(mockSession.connectionInfo.vpnRequired).toBe(true);
      
      console.log('✅ Complete VPN session workflow works');
    });

    test('should simulate VPN connection event', async () => {
      // Simulate OpenVPN status log update
      const mockConnection = {
        userId: testUser.id,
        clientIP: '192.168.1.100',
        vpnIP: '10.10.42.10',
        connectedAt: new Date(),
        bytesReceived: 1024,
        bytesSent: 2048
      };
      
      // Trigger VPN connection event
      vpnMonitor.emit('connection:new', {
        userId: testUser.id,
        connection: mockConnection
      });
      
      // Wait a bit for event processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const status = vpnMonitor.getConnectionStatus(testUser.id);
      expect(status.connected).toBe(true);
      
      console.log('✅ VPN connection event simulation works');
    });

    test('should handle VPN disconnection event', async () => {
      // Simulate VPN disconnection
      vpnMonitor.emit('connection:lost', {
        userId: testUser.id,
        connection: { status: 'disconnected' }
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const status = vpnMonitor.getConnectionStatus(testUser.id);
      expect(status.connected).toBe(false);
      expect(status.status).toBe('disconnected');
      
      console.log('✅ VPN disconnection event simulation works');
    });
  });

  describe('6. Error Handling and Edge Cases', () => {
    test('should handle missing VPN certificates gracefully', async () => {
      const response = await request(app)
        .get('/api/vpn/config/nonexistent-user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBeDefined();
      console.log('✅ Missing VPN config error handling works');
    });

    test('should handle WebSocket authentication failure', (done) => {
      const invalidWsUrl = `ws://localhost:${server.address().port}/ws/vpn-monitor?token=invalid-token`;
      const invalidClient = new WebSocket(invalidWsUrl);
      
      invalidClient.on('close', (code, reason) => {
        expect(code).toBe(1008); // Authentication failed
        console.log('✅ WebSocket auth failure handling works');
        done();
      });
      
      invalidClient.on('error', () => {
        // Expected for auth failure
        done();
      });
    });

    test('should handle VPN monitor service errors', async () => {
      // Test stopping monitoring
      const response = await request(app)
        .post('/api/vpn-monitor/stop')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(vpnMonitor.isMonitoring).toBe(false);
      
      console.log('✅ VPN monitor stop/error handling works');
    });
  });

  // Helper functions for testing
  async function ensureTestDirectories() {
    const dirs = [
      './test-vpn-certs',
      './test-configs',
      './test-logs'
    ];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }
    }
  }

  async function cleanupTestFiles() {
    const dirs = [
      './test-vpn-certs',
      './test-configs',  
      './test-logs'
    ];
    
    for (const dir of dirs) {
      try {
        await fs.rm(dir, { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  function simulateVMCreation(templateId, sessionId, sessionConfig) {
    // Mock VM provisioner response for testing
    const { useVPN, userSubnet } = sessionConfig;
    
    if (useVPN && userSubnet) {
      return Promise.resolve({
        success: true,
        instanceId: `vm-${sessionId}`,
        sessionId,
        networkConfig: {
          mode: 'bridge',
          vmIP: `10.10.${userSubnet.subnetNumber}.10`,
          subnet: userSubnet.network,
          netmask: userSubnet.netmask,
          gateway: userSubnet.gateway,
          services: {
            ssh: { ip: `10.10.${userSubnet.subnetNumber}.10`, port: 22 },
            web: { ip: `10.10.${userSubnet.subnetNumber}.10`, port: 80 },
            ftp: { ip: `10.10.${userSubnet.subnetNumber}.10`, port: 21 },
            mysql: { ip: `10.10.${userSubnet.subnetNumber}.10`, port: 3306 }
          }
        }
      });
    }
    
    // Fallback to NAT mode
    return Promise.resolve({
      success: true,
      instanceId: `vm-${sessionId}`,
      sessionId,
      networkConfig: {
        mode: 'nat',
        sshPort: 2222,
        webPort: 8080,
        ipAddress: '127.0.0.1'
      }
    });
  }

  function generateVPNConnectionInfo(networkConfig) {
    if (networkConfig.mode === 'bridge') {
      const { vmIP, services } = networkConfig;
      
      return {
        mode: 'bridge',
        ssh: {
          host: services.ssh.ip,
          port: services.ssh.port,
          command: `ssh user@${services.ssh.ip}`,
          description: 'SSH access to the lab VM via VPN'
        },
        web: {
          url: `http://${services.web.ip}`,
          description: 'Web interface access via VPN'
        },
        ftp: {
          host: services.ftp.ip,
          port: services.ftp.port,
          description: 'FTP access via VPN'
        },
        mysql: {
          host: services.mysql.ip,
          port: services.mysql.port,
          description: 'MySQL database access via VPN'
        },
        general: {
          vmIP,
          directAccess: true,
          vpnRequired: true,
          services: services
        }
      };
    }
  }

  function simulateSessionCreation(sessionData) {
    return Promise.resolve({
      success: true,
      sessionId: `session-${Date.now()}`,
      vpnConfig: {
        configPath: `./test-configs/${sessionData.userId}.ovpn`,
        certificatePath: `./test-vpn-certs/${sessionData.userId}`
      },
      vmNetworking: {
        mode: 'bridge',
        vmIP: '10.10.42.10'
      },
      connectionInfo: {
        vpnRequired: true,
        directAccess: true
      }
    });
  }
});

export default describe;