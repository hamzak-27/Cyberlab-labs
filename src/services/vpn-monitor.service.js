import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config/environment.js';
import { EventEmitter } from 'events';

/**
 * VPN Connection Monitor Service
 * Tracks active VPN connections, monitors status, and provides real-time updates
 */
class VPNMonitorService extends EventEmitter {
  constructor() {
    super();
    this.vpnLogPath = config.vpn.logPath || '/var/log/openvpn';
    this.statusLogFile = config.vpn.statusLog || '/var/log/openvpn/openvpn-status.log';
    this.monitorInterval = config.vpn.monitorInterval || 10000; // 10 seconds
    
    // Track active connections
    this.activeConnections = new Map();
    this.monitorTimer = null;
    this.isMonitoring = false;
  }

  /**
   * Initialize VPN monitoring service
   */
  async initialize() {
    try {
      // Verify OpenVPN log directory exists
      await this.ensureLogDirectory();
      
      // Load initial connection state
      await this.loadConnectionState();
      
      // Start monitoring
      await this.startMonitoring();
      
      console.log('VPN Monitor Service initialized successfully');
      return { status: 'success', message: 'VPN monitoring active' };
    } catch (error) {
      console.error('Failed to initialize VPN Monitor:', error);
      throw new Error(`VPN Monitor initialization failed: ${error.message}`);
    }
  }

  /**
   * Start real-time VPN connection monitoring
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('VPN monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log('Starting VPN connection monitoring...');
    
    // Initial scan
    await this.scanConnections();
    
    // Set up periodic monitoring
    this.monitorTimer = setInterval(async () => {
      try {
        await this.scanConnections();
      } catch (error) {
        console.error('VPN monitoring scan error:', error);
        this.emit('error', error);
      }
    }, this.monitorInterval);

    console.log(`VPN monitoring started - scanning every ${this.monitorInterval/1000}s`);
  }

  /**
   * Stop VPN connection monitoring
   */
  stopMonitoring() {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
    }
    
    this.isMonitoring = false;
    console.log('VPN monitoring stopped');
  }

  /**
   * Get current VPN connection status for a user
   * @param {string} userId - User ID
   * @returns {Object} Connection status information
   */
  getConnectionStatus(userId) {
    const connection = this.activeConnections.get(userId);
    
    if (!connection) {
      return {
        userId,
        connected: false,
        status: 'disconnected',
        message: 'No active VPN connection'
      };
    }

    return {
      userId,
      connected: true,
      status: connection.status,
      connectedAt: connection.connectedAt,
      lastSeen: connection.lastSeen,
      clientIP: connection.clientIP,
      vpnIP: connection.vpnIP,
      bytesReceived: connection.bytesReceived,
      bytesSent: connection.bytesSent,
      duration: this.calculateDuration(connection.connectedAt)
    };
  }

  /**
   * Get all active VPN connections
   * @returns {Array} List of all active connections
   */
  getAllConnections() {
    const connections = [];
    
    for (const [userId, connection] of this.activeConnections.entries()) {
      connections.push(this.getConnectionStatus(userId));
    }
    
    return connections;
  }

  /**
   * Check if specific user is connected via VPN
   * @param {string} userId - User ID
   * @returns {boolean} True if user has active VPN connection
   */
  isUserConnected(userId) {
    const connection = this.activeConnections.get(userId);
    return connection && connection.status === 'connected';
  }

  /**
   * Get VPN connection statistics
   * @returns {Object} VPN usage statistics
   */
  getConnectionStats() {
    const connections = Array.from(this.activeConnections.values());
    const now = new Date();
    
    return {
      totalConnections: connections.length,
      activeConnections: connections.filter(c => c.status === 'connected').length,
      totalBytesTransferred: connections.reduce((sum, c) => sum + (c.bytesReceived || 0) + (c.bytesSent || 0), 0),
      averageConnectionDuration: this.calculateAverageConnectionDuration(connections),
      connectionsLast24h: connections.filter(c => 
        (now - new Date(c.connectedAt)) < (24 * 60 * 60 * 1000)
      ).length
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Scan OpenVPN status log for active connections
   * @private
   */
  async scanConnections() {
    try {
      // Check if status log file exists
      const statusExists = await this.fileExists(this.statusLogFile);
      if (!statusExists) {
        console.warn(`OpenVPN status log not found: ${this.statusLogFile}`);
        return;
      }

      // Read and parse status log
      const statusContent = await fs.readFile(this.statusLogFile, 'utf8');
      const newConnections = this.parseStatusLog(statusContent);
      
      // Compare with current connections and detect changes
      await this.updateConnections(newConnections);
      
    } catch (error) {
      console.error('Failed to scan VPN connections:', error);
    }
  }

  /**
   * Parse OpenVPN status log file
   * @private
   */
  parseStatusLog(content) {
    const connections = new Map();
    const lines = content.split('\n');
    let inClientSection = false;
    let inRoutingSection = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === 'OpenVPN CLIENT LIST') {
        inClientSection = true;
        continue;
      }
      
      if (trimmed === 'ROUTING TABLE') {
        inClientSection = false;
        inRoutingSection = true;
        continue;
      }
      
      if (trimmed === 'GLOBAL STATS') {
        inRoutingSection = false;
        break;
      }

      if (inClientSection && trimmed && !trimmed.startsWith('Common Name')) {
        const clientData = this.parseClientLine(trimmed);
        if (clientData) {
          connections.set(clientData.userId, clientData);
        }
      }
      
      if (inRoutingSection && trimmed && !trimmed.startsWith('Virtual Address')) {
        const routeData = this.parseRouteLine(trimmed);
        if (routeData && connections.has(routeData.userId)) {
          const connection = connections.get(routeData.userId);
          connection.vpnIP = routeData.vpnIP;
          connections.set(routeData.userId, connection);
        }
      }
    }

    return connections;
  }

  /**
   * Parse client connection line from status log
   * @private
   */
  parseClientLine(line) {
    // Example: user123,192.168.1.100:52341,2024-11-03 12:30:45,1024,2048
    const parts = line.split(',');
    if (parts.length < 3) return null;

    const [commonName, clientEndpoint, connectedSince, bytesReceived = '0', bytesSent = '0'] = parts;
    const [clientIP] = clientEndpoint.split(':');
    
    // Extract user ID from common name (assuming format like "user123" or "lab-user-456")
    const userId = this.extractUserIdFromCommonName(commonName);
    
    return {
      userId,
      commonName,
      clientIP,
      connectedAt: new Date(connectedSince),
      lastSeen: new Date(),
      bytesReceived: parseInt(bytesReceived) || 0,
      bytesSent: parseInt(bytesSent) || 0,
      status: 'connected'
    };
  }

  /**
   * Parse routing table line from status log
   * @private
   */
  parseRouteLine(line) {
    // Example: 10.8.0.6,user123,192.168.1.100:52341,2024-11-03 12:30:45
    const parts = line.split(',');
    if (parts.length < 2) return null;

    const [vpnIP, commonName] = parts;
    const userId = this.extractUserIdFromCommonName(commonName);
    
    return {
      userId,
      vpnIP
    };
  }

  /**
   * Extract user ID from OpenVPN common name
   * @private
   */
  extractUserIdFromCommonName(commonName) {
    // Handle different common name formats:
    // - "user123" -> "user123"
    // - "lab-user-456" -> "user456" 
    // - "session-abc123" -> "abc123"
    
    if (commonName.startsWith('lab-user-')) {
      return commonName.replace('lab-user-', 'user');
    }
    
    if (commonName.startsWith('session-')) {
      return commonName.replace('session-', '');
    }
    
    return commonName;
  }

  /**
   * Update connection tracking with new data
   * @private
   */
  async updateConnections(newConnections) {
    const now = new Date();
    
    // Check for new connections
    for (const [userId, newConn] of newConnections.entries()) {
      const existing = this.activeConnections.get(userId);
      
      if (!existing) {
        // New connection
        console.log(`✅ VPN connection established: User ${userId} from ${newConn.clientIP}`);
        this.activeConnections.set(userId, newConn);
        this.emit('connection:new', { userId, connection: newConn });
      } else {
        // Update existing connection
        existing.lastSeen = now;
        existing.bytesReceived = newConn.bytesReceived;
        existing.bytesSent = newConn.bytesSent;
        existing.vpnIP = newConn.vpnIP || existing.vpnIP;
        this.activeConnections.set(userId, existing);
      }
    }
    
    // Check for disconnected users
    for (const [userId, existing] of this.activeConnections.entries()) {
      if (!newConnections.has(userId)) {
        console.log(`❌ VPN connection lost: User ${userId}`);
        existing.status = 'disconnected';
        existing.disconnectedAt = now;
        
        this.emit('connection:lost', { userId, connection: existing });
        
        // Remove after grace period to allow for status queries
        setTimeout(() => {
          this.activeConnections.delete(userId);
        }, 60000); // Keep disconnected state for 1 minute
      }
    }
  }

  /**
   * Ensure log directory exists
   * @private
   */
  async ensureLogDirectory() {
    try {
      await fs.mkdir(path.dirname(this.statusLogFile), { recursive: true });
    } catch (error) {
      console.warn('Could not create VPN log directory:', error.message);
    }
  }

  /**
   * Load initial connection state (for persistence)
   * @private
   */
  async loadConnectionState() {
    // Could load from file or database in the future
    console.log('VPN connection state loaded');
  }

  /**
   * Check if file exists
   * @private
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calculate connection duration
   * @private
   */
  calculateDuration(startTime) {
    if (!startTime) return 0;
    return Math.floor((new Date() - new Date(startTime)) / 1000); // Duration in seconds
  }

  /**
   * Calculate average connection duration
   * @private
   */
  calculateAverageConnectionDuration(connections) {
    if (connections.length === 0) return 0;
    
    const totalDuration = connections.reduce((sum, conn) => {
      return sum + this.calculateDuration(conn.connectedAt);
    }, 0);
    
    return Math.floor(totalDuration / connections.length);
  }
}

// Export singleton instance
export default new VPNMonitorService();