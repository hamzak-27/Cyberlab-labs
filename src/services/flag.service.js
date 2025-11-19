import { Client as SSH2Client } from 'ssh2';
import crypto from 'crypto';
import { config } from '../config/environment.js';

/**
 * Flag Generation & Injection Service
 * Generates unique flags per session and injects them into VMs
 * Supports multiple injection methods: SSH, PowerShell, File System
 */
class FlagService {
  constructor() {
    this.activeSessions = new Map(); // Track active flag sessions
    this.injectionMethods = ['ssh', 'powershell', 'filesystem'];
  }

  /**
   * Generate unique flags for a session
   * @param {string} sessionId - Unique session identifier
   * @param {string} userId - User identifier
   * @param {Object} labConfig - Lab configuration containing name, category, etc.
   * @returns {Object} Generated flags object
   */
  generateSessionFlags(sessionId, userId, labConfig) {
    try {
      const timestamp = Date.now();
      const labName = labConfig.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Create session-specific salt
      const sessionSalt = crypto.createHash('sha256')
        .update(`${sessionId}-${userId}-${timestamp}-${config.jwt.secret}`)
        .digest('hex').slice(0, 12);
      
      // User ID suffix for uniqueness
      const userSuffix = userId.slice(-6);
      
      // Generate flags with strong entropy
      const userFlag = `FLAG{user_${labName}_${sessionSalt}_${userSuffix}}`;
      const rootFlag = `FLAG{root_${labName}_${sessionSalt}_${timestamp.toString().slice(-8)}}`;
      
      // Create flag metadata
      const flagData = {
        sessionId,
        userId,
        labId: labConfig._id || labConfig.id,
        labName: labConfig.name,
        userFlag,
        rootFlag,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + config.session.timeoutMs),
        injectionStatus: 'pending',
        locations: {
          user: labConfig.flags?.user?.locations || ['/home/user/user.txt'],
          root: labConfig.flags?.root?.locations || ['/root/root.txt']
        },
        points: {
          user: labConfig.flags?.user?.points || 25,
          root: labConfig.flags?.root?.points || 50
        }
      };
      
      // Store in active sessions
      this.activeSessions.set(sessionId, flagData);
      
      console.log(`🚩 Flags generated for session ${sessionId}:`, {
        userFlag,
        rootFlag,
        locations: flagData.locations
      });
      
      return flagData;
    } catch (error) {
      console.error('Flag generation failed:', error);
      throw new Error(`Flag generation failed: ${error.message}`);
    }
  }

  /**
   * Inject flags into VM using appropriate method
   * @param {string} sessionId - Session identifier
   * @param {Object} connectionInfo - VM connection information
   * @param {Object} labConfig - Lab configuration with credentials and injection method
   * @returns {Promise<Object>} Injection result
   */
  async injectFlags(sessionId, connectionInfo, labConfig) {
    try {
      const flagData = this.activeSessions.get(sessionId);
      if (!flagData) {
        throw new Error(`No flag data found for session ${sessionId}`);
      }

      console.log(`💉 Starting flag injection for session ${sessionId}...`);
      
      // Determine injection method
      const method = this.determineInjectionMethod(labConfig);
      console.log(`Using injection method: ${method}`);
      
      let injectionResult;
      
      switch (method) {
        case 'ssh':
          injectionResult = await this.injectViaSSH(sessionId, connectionInfo, labConfig, flagData);
          break;
        case 'powershell':
          injectionResult = await this.injectViaPowerShell(sessionId, connectionInfo, labConfig, flagData);
          break;
        case 'filesystem':
          injectionResult = await this.injectViaFileSystem(sessionId, connectionInfo, labConfig, flagData);
          break;
        default:
          throw new Error(`Unsupported injection method: ${method}`);
      }
      
      // Update flag data with injection status
      flagData.injectionStatus = injectionResult.success ? 'completed' : 'failed';
      flagData.injectedAt = new Date();
      flagData.injectionDetails = injectionResult;
      
      this.activeSessions.set(sessionId, flagData);
      
      console.log(`✅ Flag injection ${injectionResult.success ? 'completed' : 'failed'} for session ${sessionId}`);
      return injectionResult;
      
    } catch (error) {
      console.error('Flag injection failed:', error);
      
      // Update session with failure status
      const flagData = this.activeSessions.get(sessionId);
      if (flagData) {
        flagData.injectionStatus = 'failed';
        flagData.injectionError = error.message;
        this.activeSessions.set(sessionId, flagData);
      }
      
      throw new Error(`Flag injection failed: ${error.message}`);
    }
  }

  /**
   * Inject flags via SSH (primary method for Linux VMs)
   * @private
   */
  async injectViaSSH(sessionId, connectionInfo, labConfig, flagData) {
    return new Promise((resolve, reject) => {
      let ssh = null;
      const maxRetries = 20; // Increase retries for VM boot time
      let currentRetry = 0;
      const retryDelay = 5000; // 5 seconds between retries (VM needs time to boot)
      
      const credentials = labConfig.defaultCredentials || { username: 'root', password: 'root' };
      
      // Extract host and port - prioritize management SSH for HackTheBox mode
      console.log('DEBUG: connectionInfo received:', JSON.stringify(connectionInfo));
      
      let host, sshPort;
      if (connectionInfo._managementSSH) {
        // Use management SSH for HackTheBox internal network mode
        host = connectionInfo._managementSSH.host;
        sshPort = connectionInfo._managementSSH.port;
        console.log(`🔐 Using management SSH port for flag injection (HackTheBox mode)`);
      } else {
        // Use regular SSH connection for NAT mode
        host = connectionInfo.host || connectionInfo.ipAddress || '127.0.0.1';
        sshPort = connectionInfo.port || connectionInfo.sshPort || 22;
      }
      
      console.log(`DEBUG: Extracted host=${host}, port=${sshPort}`);
      console.log(`🔐 Injecting flags via SSH to ${host}:${sshPort} as ${credentials.username}...`);
      console.log(`⏳ Waiting for SSH service to be ready (this may take 2-3 minutes)...`);
      
      const attemptConnection = () => {
        // Create fresh SSH client for each attempt
        ssh = new SSH2Client();
        
        // Set up event listeners before connecting
        ssh.on('ready', async () => {
          console.log('✅ SSH connection established');
          
          try {
            const injectionResults = {
              success: true,
              method: 'ssh',
              userFlagInjected: false,
              rootFlagInjected: false,
              errors: []
            };
            
            // Inject user flags
            for (const location of flagData.locations.user) {
              try {
                await this.executeSSHCommand(ssh, `echo "${flagData.userFlag}" > ${location}`);
                await this.executeSSHCommand(ssh, `chmod 644 ${location}`);
                console.log(`📝 User flag injected to ${location}`);
                injectionResults.userFlagInjected = true;
                break;
              } catch (error) {
                console.warn(`Failed to inject user flag to ${location}:`, error.message);
                injectionResults.errors.push(`User flag to ${location}: ${error.message}`);
              }
            }
            
            // Inject root flags
            for (const location of flagData.locations.root) {
              try {
                await this.executeSSHCommand(ssh, `echo "${flagData.rootFlag}" | sudo tee ${location}`);
                await this.executeSSHCommand(ssh, `sudo chmod 600 ${location}`);
                console.log(`🔐 Root flag injected to ${location}`);
                injectionResults.rootFlagInjected = true;
                break;
              } catch (sudoError) {
                try {
                  await this.executeSSHCommand(ssh, `echo "${flagData.rootFlag}" > ${location}`);
                  await this.executeSSHCommand(ssh, `chmod 600 ${location}`);
                  console.log(`🔐 Root flag injected to ${location} (direct)`);
                  injectionResults.rootFlagInjected = true;
                  break;
                } catch (directError) {
                  console.warn(`Failed to inject root flag to ${location}:`, directError.message);
                  injectionResults.errors.push(`Root flag to ${location}: ${directError.message}`);
                }
              }
            }
            
            if (!injectionResults.userFlagInjected && !injectionResults.rootFlagInjected) {
              injectionResults.success = false;
              injectionResults.error = 'Failed to inject any flags';
            }
            
            ssh.end();
            resolve(injectionResults);
            
          } catch (error) {
            console.error('SSH command execution failed:', error);
            ssh.end();
            resolve({
              success: false,
              method: 'ssh',
              error: error.message,
              userFlagInjected: false,
              rootFlagInjected: false
            });
          }
        });
        
        ssh.on('error', (error) => {
        const errorType = error.level || error.code || 'unknown';
        console.log(`SSH connection attempt ${errorType}, retrying...`);
        
        if (currentRetry < maxRetries - 1) {
          currentRetry++;
          console.log(`Retrying SSH connection (attempt ${currentRetry + 1}/${maxRetries})...`);
          setTimeout(attemptConnection, retryDelay);
        } else {
          resolve({
            success: false,
            method: 'ssh',
            error: `SSH connection failed after ${maxRetries} attempts: ${error.message}`,
            userFlagInjected: false,
            rootFlagInjected: false
          });
        }
      });
      
      ssh.on('end', () => {
        console.log('SSH connection closed');
      });
      
      ssh.on('close', (hadError) => {
        if (hadError && currentRetry < maxRetries - 1) {
          currentRetry++;
          console.log(`SSH connection attempt failed: Connection lost before handshake, retrying...`);
          setTimeout(attemptConnection, retryDelay);
        } else if (hadError) {
          resolve({
            success: false,
            method: 'ssh',
            error: `SSH not ready after ${maxRetries} attempts - VM may still be booting`,
            userFlagInjected: false,
            rootFlagInjected: false
          });
        }
      });
      
        ssh.on('timeout', () => {
          if (currentRetry < maxRetries - 1) {
            currentRetry++;
            console.log(`SSH connection attempt timed out, retrying...`);
            ssh.end();
            setTimeout(attemptConnection, retryDelay);
          } else {
            ssh.end();
            resolve({
              success: false,
              method: 'ssh',
              error: `SSH connection timed out after ${maxRetries} attempts`,
              userFlagInjected: false,
              rootFlagInjected: false
            });
          }
        });
        
        // Now connect to the SSH server
        ssh.connect({
          host: host || '127.0.0.1',
          port: sshPort || 22,
          username: credentials.username,
          password: credentials.password,
          readyTimeout: 30000,
          algorithms: {
            kex: ['diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group1-sha1'],
            cipher: ['aes128-ctr', 'aes192-ctr', 'aes256-ctr', 'aes128-cbc', '3des-cbc'],
            hmac: ['hmac-sha2-256', 'hmac-sha2-512', 'hmac-sha1']
          }
        });
      };
      
      // Start initial connection attempt
      attemptConnection();
    });
  }

  /**
   * Execute SSH command with promise wrapper
   * @private
   */
  executeSSHCommand(ssh, command, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Command timeout'));
      }, timeout);
      
      ssh.exec(command, (err, stream) => {
        if (err) {
          clearTimeout(timer);
          reject(err);
          return;
        }
        
        let output = '';
        let errorOutput = '';
        
        stream.on('close', (code) => {
          clearTimeout(timer);
          if (code !== 0) {
            reject(new Error(`Command failed with code ${code}: ${errorOutput}`));
          } else {
            resolve(output);
          }
        });
        
        stream.on('data', (data) => {
          output += data.toString();
        });
        
        stream.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
      });
    });
  }

  /**
   * Inject flags via PowerShell (for Windows VMs)
   * @private
   */
  async injectViaPowerShell(sessionId, connectionInfo, labConfig, flagData) {
    // Placeholder for Windows VM support
    console.log('🪟 PowerShell injection not yet implemented');
    return {
      success: false,
      method: 'powershell',
      error: 'PowerShell injection not implemented',
      userFlagInjected: false,
      rootFlagInjected: false
    };
  }

  /**
   * Inject flags via direct file system manipulation
   * @private
   */
  async injectViaFileSystem(sessionId, connectionInfo, labConfig, flagData) {
    // Placeholder for file system injection
    console.log('💾 File system injection not yet implemented');
    return {
      success: false,
      method: 'filesystem',
      error: 'File system injection not implemented',
      userFlagInjected: false,
      rootFlagInjected: false
    };
  }

  /**
   * Determine best injection method based on lab configuration
   * @private
   */
  determineInjectionMethod(labConfig) {
    // Check if method is explicitly specified
    if (labConfig.injectionMethod) {
      return labConfig.injectionMethod;
    }
    
    // Auto-detect based on VM characteristics
    if (labConfig.defaultCredentials && labConfig.defaultCredentials.username) {
      return 'ssh'; // Has SSH credentials
    }
    
    if (labConfig.category === 'Windows' || labConfig.name.toLowerCase().includes('windows')) {
      return 'powershell';
    }
    
    // Default to SSH for Linux-based VMs
    return 'ssh';
  }

  /**
   * Validate submitted flag
   * @param {string} sessionId - Session identifier
   * @param {string} submittedFlag - Flag submitted by user
   * @param {string} flagType - 'user' or 'root'
   * @returns {Object} Validation result
   */
  validateFlag(sessionId, submittedFlag, flagType) {
    try {
      const flagData = this.activeSessions.get(sessionId);
      if (!flagData) {
        return {
          valid: false,
          error: 'Session not found or expired',
          points: 0
        };
      }
      
      // Check if session has expired
      if (new Date() > flagData.expiresAt) {
        return {
          valid: false,
          error: 'Session expired',
          points: 0
        };
      }
      
      // Validate flag type
      if (!['user', 'root'].includes(flagType)) {
        return {
          valid: false,
          error: 'Invalid flag type',
          points: 0
        };
      }
      
      // Get expected flag
      const expectedFlag = flagType === 'user' ? flagData.userFlag : flagData.rootFlag;
      const submittedTrimmed = submittedFlag.trim();
      
      // Validate flag
      const isValid = submittedTrimmed === expectedFlag;
      
      if (isValid) {
        console.log(`✅ Valid ${flagType} flag submitted for session ${sessionId}`);
        return {
          valid: true,
          flagType,
          points: flagData.points[flagType],
          sessionId,
          submittedAt: new Date()
        };
      } else {
        console.log(`❌ Invalid ${flagType} flag submitted for session ${sessionId}`);
        return {
          valid: false,
          error: 'Incorrect flag',
          points: 0,
          expectedLength: expectedFlag.length,
          submittedLength: submittedTrimmed.length
        };
      }
      
    } catch (error) {
      console.error('Flag validation error:', error);
      return {
        valid: false,
        error: 'Validation error',
        points: 0
      };
    }
  }

  /**
   * Get flag information for a session (without revealing actual flags)
   * @param {string} sessionId - Session identifier
   * @returns {Object} Flag session information
   */
  getFlagInfo(sessionId) {
    const flagData = this.activeSessions.get(sessionId);
    if (!flagData) {
      return null;
    }
    
    return {
      sessionId,
      labName: flagData.labName,
      generatedAt: flagData.generatedAt,
      expiresAt: flagData.expiresAt,
      injectionStatus: flagData.injectionStatus,
      locations: flagData.locations,
      points: flagData.points,
      hasUserFlag: !!flagData.userFlag,
      hasRootFlag: !!flagData.rootFlag
    };
  }

  /**
   * Clean up expired flag sessions
   */
  async cleanupExpiredSessions() {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [sessionId, flagData] of this.activeSessions.entries()) {
      if (now > flagData.expiresAt) {
        this.activeSessions.delete(sessionId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired flag sessions`);
    }
    
    return cleanedCount;
  }

  /**
   * Remove flag session (called when VM session ends)
   * @param {string} sessionId - Session identifier
   */
  removeFlagSession(sessionId) {
    const removed = this.activeSessions.delete(sessionId);
    if (removed) {
      console.log(`🗑️ Flag session ${sessionId} removed`);
    }
    return removed;
  }

  /**
   * Get all active flag sessions (admin only)
   */
  getActiveSessions() {
    const sessions = [];
    for (const [sessionId, flagData] of this.activeSessions.entries()) {
      sessions.push({
        sessionId,
        userId: flagData.userId,
        labName: flagData.labName,
        generatedAt: flagData.generatedAt,
        expiresAt: flagData.expiresAt,
        injectionStatus: flagData.injectionStatus
      });
    }
    return sessions;
  }
}

// Export singleton instance
export default new FlagService();