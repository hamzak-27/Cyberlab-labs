import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import vpnMonitor from './vpn-monitor.service.js';
import { config } from '../config/environment.js';

/**
 * WebSocket Service for Real-time VPN Status Updates
 * Provides live connection status, events, and monitoring data to frontend
 */
class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map of userId to WebSocket connections
    this.isInitialized = false;
  }

  /**
   * Initialize WebSocket server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    if (this.isInitialized) {
      console.log('WebSocket service already initialized');
      return;
    }

    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/vpn-monitor'
    });

    this.setupWebSocketServer();
    this.setupVPNEventListeners();
    
    this.isInitialized = true;
    console.log('WebSocket service initialized for VPN monitoring');
  }

  /**
   * Setup WebSocket server event handlers
   * @private
   */
  setupWebSocketServer() {
    this.wss.on('connection', async (ws, req) => {
      try {
        // Authenticate WebSocket connection
        const user = await this.authenticateConnection(req);
        if (!user) {
          ws.close(1008, 'Authentication failed');
          return;
        }

        // Store client connection
        const userId = user.id;
        if (!this.clients.has(userId)) {
          this.clients.set(userId, new Set());
        }
        this.clients.get(userId).add(ws);

        console.log(`✅ WebSocket connected: User ${userId}`);

        // Send initial VPN status
        this.sendVPNStatus(ws, userId);

        // Handle client messages
        ws.on('message', (data) => {
          this.handleClientMessage(ws, userId, data);
        });

        // Handle connection close
        ws.on('close', () => {
          this.handleClientDisconnect(userId, ws);
        });

        // Handle errors
        ws.on('error', (error) => {
          console.error(`WebSocket error for user ${userId}:`, error);
        });

      } catch (error) {
        console.error('WebSocket connection setup error:', error);
        ws.close(1011, 'Server error');
      }
    });
  }

  /**
   * Setup VPN monitor event listeners
   * @private
   */
  setupVPNEventListeners() {
    // Listen for new VPN connections
    vpnMonitor.on('connection:new', ({ userId, connection }) => {
      this.broadcastToUser(userId, {
        type: 'vpn:connected',
        data: {
          userId,
          status: vpnMonitor.getConnectionStatus(userId),
          message: 'VPN connection established',
          timestamp: new Date().toISOString()
        }
      });
    });

    // Listen for VPN disconnections
    vpnMonitor.on('connection:lost', ({ userId, connection }) => {
      this.broadcastToUser(userId, {
        type: 'vpn:disconnected',
        data: {
          userId,
          status: vpnMonitor.getConnectionStatus(userId),
          message: 'VPN connection lost',
          timestamp: new Date().toISOString()
        }
      });
    });

    // Listen for VPN monitor errors
    vpnMonitor.on('error', (error) => {
      this.broadcastToAll({
        type: 'vpn:monitor:error',
        data: {
          message: 'VPN monitoring error occurred',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }, 'admin'); // Only send to admin users
    });
  }

  /**
   * Authenticate WebSocket connection using JWT token
   * @private
   */
  async authenticateConnection(req) {
    try {
      // Extract token from query string or headers
      const token = req.url?.includes('token=') 
        ? new URL(`http://localhost${req.url}`).searchParams.get('token')
        : req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new Error('No authentication token provided');
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      console.error('WebSocket authentication failed:', error.message);
      return null;
    }
  }

  /**
   * Handle incoming client messages
   * @private
   */
  handleClientMessage(ws, userId, data) {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'vpn:status:request':
          this.sendVPNStatus(ws, userId);
          break;
          
        case 'vpn:stats:request':
          if (message.requireAdmin) {
            // TODO: Check if user has admin role
            this.sendVPNStats(ws);
          }
          break;
          
        case 'ping':
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
          break;
          
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling client message:', error);
    }
  }

  /**
   * Handle client disconnect
   * @private
   */
  handleClientDisconnect(userId, ws) {
    const userConnections = this.clients.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        this.clients.delete(userId);
      }
    }
    console.log(`❌ WebSocket disconnected: User ${userId}`);
  }

  /**
   * Send VPN status to specific WebSocket
   * @private
   */
  sendVPNStatus(ws, userId) {
    const status = vpnMonitor.getConnectionStatus(userId);
    this.sendToClient(ws, {
      type: 'vpn:status',
      data: status
    });
  }

  /**
   * Send VPN statistics to specific WebSocket
   * @private
   */
  sendVPNStats(ws) {
    const stats = vpnMonitor.getConnectionStats();
    const connections = vpnMonitor.getAllConnections();
    
    this.sendToClient(ws, {
      type: 'vpn:stats',
      data: {
        stats,
        connections,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Send message to specific WebSocket client
   * @private
   */
  sendToClient(ws, message) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all connections of a specific user
   */
  broadcastToUser(userId, message) {
    const userConnections = this.clients.get(userId);
    if (!userConnections) return;

    userConnections.forEach(ws => {
      this.sendToClient(ws, message);
    });
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcastToAll(message, roleFilter = null) {
    this.clients.forEach((connections, userId) => {
      // TODO: Implement role filtering if needed
      connections.forEach(ws => {
        this.sendToClient(ws, message);
      });
    });
  }

  /**
   * Send session event updates to user
   */
  sendSessionEvent(userId, event) {
    this.broadcastToUser(userId, {
      type: 'session:event',
      data: event
    });
  }

  /**
   * Send flag submission result to user
   */
  sendFlagSubmissionResult(userId, result) {
    this.broadcastToUser(userId, {
      type: 'flag:submission:result',
      data: result
    });
  }

  /**
   * Send user progress updates
   */
  sendProgressUpdate(userId, progress) {
    this.broadcastToUser(userId, {
      type: 'progress:update',
      data: progress
    });
  }

  /**
   * Send badge notification
   */
  sendBadgeNotification(userId, badge) {
    this.broadcastToUser(userId, {
      type: 'badge:earned',
      data: badge
    });
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount() {
    return Array.from(this.clients.values())
      .reduce((total, connections) => total + connections.size, 0);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.clients.size;
  }

  /**
   * Shutdown WebSocket service
   */
  shutdown() {
    if (this.wss) {
      console.log('Shutting down WebSocket service...');
      
      // Close all client connections
      this.clients.forEach(connections => {
        connections.forEach(ws => {
          ws.close(1001, 'Server shutting down');
        });
      });
      
      // Close WebSocket server
      this.wss.close(() => {
        console.log('WebSocket server closed');
      });
      
      this.clients.clear();
      this.isInitialized = false;
    }
  }

  /**
   * Send periodic status updates to all connected clients
   */
  startPeriodicUpdates(intervalMs = 30000) {
    setInterval(() => {
      this.clients.forEach((connections, userId) => {
        const status = vpnMonitor.getConnectionStatus(userId);
        connections.forEach(ws => {
          this.sendToClient(ws, {
            type: 'vpn:status:update',
            data: status
          });
        });
      });
    }, intervalMs);
  }
}

// Export singleton instance
export default new WebSocketService();