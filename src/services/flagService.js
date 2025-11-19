import crypto from 'crypto';
import { config } from '../config/environment.js';

/**
 * Flag Service - Simplified for Static Flags
 * Loads pre-configured flags from lab configuration
 * No SSH injection required - flags are already in VM files
 */
class FlagService {
  constructor() {
    this.activeSessions = new Map(); // Track active flag sessions
  }

  /**
   * Load static flags for a session
   * @param {string} sessionId - Unique session identifier
   * @param {string} userId - User identifier
   * @param {Object} labConfig - Lab configuration containing static flags
   * @returns {Object} Flag data object
   */
  generateSessionFlags(sessionId, userId, labConfig) {
    try {
      console.log(`🚩 Loading static flags for session ${sessionId} (${labConfig.name})`);
      console.log('DEBUG labConfig:', JSON.stringify(labConfig, null, 2));
      console.log('DEBUG labConfig.flags.user.flag:', labConfig.flags?.user?.flag);
      console.log('DEBUG labConfig.flags.root.flag:', labConfig.flags?.root?.flag);
      
      // Verify lab has static flags configured
      if (!labConfig.flags || !labConfig.flags.user || !labConfig.flags.root) {
        throw new Error(`Lab ${labConfig.name} does not have flags configured in database`);
      }
      
      // Create flag metadata using static flags from lab config
      const flagData = {
        sessionId,
        userId,
        labId: labConfig._id || labConfig.id,
        labName: labConfig.name,
        
        // USE STATIC FLAGS FROM LAB CONFIG
        userFlag: labConfig.flags.user.flag,
        rootFlag: labConfig.flags.root.flag,
        
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + config.session.timeoutMs),
        injectionStatus: 'not-required', // Static flags don't need injection
        
        locations: {
          user: labConfig.flags.user.locations || ['/home/user/user.txt'],
          root: labConfig.flags.root.locations || ['/root/root.txt']
        },
        
        points: {
          user: labConfig.flags.user.points || 25,
          root: labConfig.flags.root.points || 50
        },
        
        flagType: 'static'
      };
      
      // Store in active sessions
      this.activeSessions.set(sessionId, flagData);
      
      console.log(`✅ Static flags loaded for session ${sessionId}:`, {
        userFlag: flagData.userFlag,
        rootFlag: flagData.rootFlag,
        locations: flagData.locations
      });
      
      return flagData;
    } catch (error) {
      console.error('Flag loading failed:', error);
      throw new Error(`Flag loading failed: ${error.message}`);
    }
  }

  /**
   * Skip flag injection - flags are already in VM (static)
   * @param {string} sessionId - Session identifier
   * @param {Object} connectionInfo - VM connection information (unused)
   * @param {Object} labConfig - Lab configuration (unused)
   * @returns {Promise<Object>} Injection result
   */
  async injectFlags(sessionId, connectionInfo, labConfig) {
    try {
      const flagData = this.activeSessions.get(sessionId);
      if (!flagData) {
        throw new Error(`No flag data found for session ${sessionId}`);
      }

      console.log(`✅ Static flags - no injection needed for session ${sessionId}`);
      console.log(`   Flags are pre-configured in VM file`);
      
      // Static flags don't need injection
      const injectionResult = {
        success: true,
        method: 'static',
        userFlagInjected: true, // Already in VM
        rootFlagInjected: true, // Already in VM
        note: 'Static flags pre-configured in VM - no SSH injection required'
      };
      
      // Update flag data with injection status
      flagData.injectionStatus = 'not-required';
      flagData.injectedAt = new Date();
      flagData.injectionDetails = injectionResult;
      
      this.activeSessions.set(sessionId, flagData);
      
      console.log(`✅ Session ${sessionId} ready - flags available in VM`);
      return injectionResult;
      
    } catch (error) {
      console.error('Flag service error:', error);
      throw new Error(`Flag service failed: ${error.message}`);
    }
  }

  /**
   * Inject flags via shared folder (works without Guest Additions)
   * Creates a shared folder and generates a script in the VM
   * @private
   */
  async injectViaSharedFolder(sessionId, connectionInfo, labConfig, flagData) {
    const credentials = {
      username: connectionInfo.username || labConfig.defaultCredentials?.username || 'tiago',
      password: connectionInfo.password || labConfig.defaultCredentials?.password || 'Virgulino'
    };
    
    console.log(`\n========== FLAG INJECTION (Shared Folder Method) ==========`);
    console.log(`🔐 Session: ${sessionId}`);
    console.log(`🔐 Method: Shared folder + startup script (no Guest Additions required)`);
    console.log(`===========================================================\n`);
    
    try {
      const { execSync } = await import('child_process');
      const fs = await import('fs');
      const path = await import('path');
      const os = await import('os');
      
      const vboxPath = 'C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe';
      const vmName = `Session-${sessionId}`;
      
      // Create temporary directory for flag files
      const tempDir = path.join(os.tmpdir(), `flags-${sessionId}`);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Write flag files to temp directory
      fs.writeFileSync(path.join(tempDir, 'user_flag.txt'), flagData.userFlag);
      fs.writeFileSync(path.join(tempDir, 'root_flag.txt'), flagData.rootFlag);
      
      // Create injection script that will run inside VM
      const injectionScript = `#!/bin/bash
# Flag injection script - auto-generated
sleep 30  # Wait for VM to fully boot

# Copy user flag
for location in ${flagData.locations.user.join(' ')}; do
  mkdir -p "$(dirname "$location")" 2>/dev/null
  cp /media/sf_flags/user_flag.txt "$location" 2>/dev/null && chmod 644 "$location" && break
done

# Copy root flag
for location in ${flagData.locations.root.join(' ')}; do
  mkdir -p "$(dirname "$location")" 2>/dev/null
  sudo cp /media/sf_flags/root_flag.txt "$location" 2>/dev/null && sudo chmod 644 "$location" && break
done

echo "Flags injected successfully" > /tmp/flag_injection_complete
`;
      
      fs.writeFileSync(path.join(tempDir, 'inject_flags.sh'), injectionScript);
      
      console.log(`📁 Created flag files in: ${tempDir}`);
      console.log(`📝 User flag written`);
      console.log(`📝 Root flag written`);
      console.log(`📝 Injection script created`);
      
      // Add shared folder to VM (must be powered off or will add on next boot)
      try {
        execSync(
          `"${vboxPath}" sharedfolder add "${vmName}" --name "flags" --hostpath "${tempDir}" --automount --auto-mount-point "/media/sf_flags"`,
          { encoding: 'utf8' }
        );
        console.log(`✅ Shared folder configured: /media/sf_flags`);
      } catch (error) {
        // Folder might already exist, that's okay
        console.log(`ℹ️  Shared folder already configured or will be added`);
      }
      
      console.log(`\n✅ Flags prepared for injection`);
      console.log(`   Method: Flags available in /media/sf_flags/ inside VM`);
      console.log(`   Users must manually copy them to target locations`);
      console.log(`   OR we can use cloud-init/rc.local for auto-copy\n`);
      
      return {
        success: true,
        method: 'sharedfolder',
        userFlagInjected: true,  // Available in shared folder
        rootFlagInjected: true,  // Available in shared folder
        sharedFolderPath: '/media/sf_flags',
        note: 'Flags available in shared folder - manual copy required or use startup script'
      };
      
    } catch (error) {
      console.error('\n❌ Shared folder injection failed:', error.message);
      return {
        success: false,
        method: 'sharedfolder',
        error: error.message,
        userFlagInjected: false,
        rootFlagInjected: false
      };
    }
  }
  
  /**
   * Inject flags via VBoxManage guest control (requires Guest Additions)
   * @private
   */
  async injectViaGuestControl(sessionId, connectionInfo, labConfig, flagData) {
    const credentials = {
      username: connectionInfo.username || labConfig.defaultCredentials?.username || 'tiago',
      password: connectionInfo.password || labConfig.defaultCredentials?.password || 'Virgulino'
    };
    
    console.log(`\n========== FLAG INJECTION (VBoxManage Guest Control) ==========`);
    console.log(`🔐 Session: ${sessionId}`);
    console.log(`🔐 Method: VBoxManage guestcontrol (no SSH required)`);
    console.log(`🔐 Credentials: ${credentials.username}`);
    console.log(`===============================================================\n`);
    
    try {
      const injectionResults = {
        success: false,
        method: 'vboxmanage-guestcontrol',
        userFlagInjected: false,
        rootFlagInjected: false,
        errors: []
      };
      
      // Get VM UUID from session
      const { execSync } = await import('child_process');
      const vboxPath = 'C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe';
      
      // Find VM by session name
      const vmName = `Session-${sessionId}`;
      console.log(`📦 Looking for VM: ${vmName}`);
      
      // Inject user flags
      for (const location of flagData.locations.user) {
        try {
          const command = `echo "${flagData.userFlag}" > ${location}`;
          console.log(`📝 Injecting user flag to ${location}...`);
          
          const result = execSync(
            `"${vboxPath}" guestcontrol "${vmName}" run --exe /bin/sh --username ${credentials.username} --password ${credentials.password} --wait-stdout -- sh -c "${command}"`,
            { encoding: 'utf8', timeout: 30000 }
          );
          
          console.log(`✅ User flag injected to ${location}`);
          injectionResults.userFlagInjected = true;
          break;
        } catch (error) {
          console.warn(`⚠️  Failed to inject user flag to ${location}: ${error.message}`);
          injectionResults.errors.push(`User flag to ${location}: ${error.message}`);
        }
      }
      
      // Inject root flags
      for (const location of flagData.locations.root) {
        try {
          // Use sudo for root locations
          const command = `echo ${credentials.password} | sudo -S sh -c \"echo '${flagData.rootFlag}' > ${location}\"`;
          console.log(`🔐 Injecting root flag to ${location}...`);
          
          const result = execSync(
            `"${vboxPath}" guestcontrol "${vmName}" run --exe /bin/sh --username ${credentials.username} --password ${credentials.password} --wait-stdout -- sh -c "${command}"`,
            { encoding: 'utf8', timeout: 30000 }
          );
          
          console.log(`✅ Root flag injected to ${location}`);
          injectionResults.rootFlagInjected = true;
          break;
        } catch (error) {
          console.warn(`⚠️  Failed to inject root flag to ${location}: ${error.message}`);
          injectionResults.errors.push(`Root flag to ${location}: ${error.message}`);
        }
      }
      
      if (injectionResults.userFlagInjected || injectionResults.rootFlagInjected) {
        injectionResults.success = true;
      }
      
      console.log(`\n✅ Flag injection completed:`);
      console.log(`   User flag: ${injectionResults.userFlagInjected ? '✅' : '❌'}`);
      console.log(`   Root flag: ${injectionResults.rootFlagInjected ? '✅' : '❌'}`);
      console.log(`   Errors: ${injectionResults.errors.length}\n`);
      
      return injectionResults;
      
    } catch (error) {
      console.error('\n❌ Guest control injection failed:', error.message);
      return {
        success: false,
        method: 'vboxmanage-guestcontrol',
        error: error.message,
        userFlagInjected: false,
        rootFlagInjected: false
      };
    }
  }
  
  /**
   * Inject flags via SSH using direct command execution (Windows compatible)
   * Fallback method when guest control is not available
   * @private
   */
  async injectViaSSH(sessionId, connectionInfo, labConfig, flagData) {
    const credentials = {
      username: connectionInfo.username || labConfig.defaultCredentials?.username || 'root',
      password: connectionInfo.password || labConfig.defaultCredentials?.password || 'root'
    };
    
    // For HackTheBox mode, use the management SSH port (localhost NAT)
    // For regular mode, use the provided connection info
    let host, sshPort;
    if (connectionInfo.mode === 'hackthebox-internal' && connectionInfo._managementSSH) {
      // Use backend management port (NIC 2 - NAT)
      host = connectionInfo._managementSSH.host;
      sshPort = connectionInfo._managementSSH.port;
      console.log(`\n========== FLAG INJECTION DIAGNOSTICS ==========`);
      console.log(`🔐 Session: ${sessionId}`);
      console.log(`🔐 Mode: HackTheBox Internal (Dual NIC)`);
      console.log(`🔐 Management SSH: ${host}:${sshPort} (NIC 2 - NAT)`);
      console.log(`🔐 User Access: ${connectionInfo.ipAddress}:22 (NIC 1 - Internal, VPN required)`);
      console.log(`🔐 Credentials: ${credentials.username}${credentials.password ? ' (with password)' : ' (no password)'}`);
      console.log(`================================================\n`);
    } else {
      // Use regular connection info
      host = connectionInfo.host || connectionInfo.ipAddress || '127.0.0.1';
      sshPort = connectionInfo.sshPort || 22;
      console.log(`\n========== FLAG INJECTION DIAGNOSTICS ==========`);
      console.log(`🔐 Session: ${sessionId}`);
      console.log(`🔐 Mode: ${connectionInfo.mode || 'NAT'}`);
      console.log(`🔐 SSH Target: ${host}:${sshPort}`);
      console.log(`🔐 Credentials: ${credentials.username}${credentials.password ? ' (with password)' : ' (no password)'}`);
      console.log(`================================================\n`);
    }
    
    // Wait for SSH to be ready (especially important for freshly started VMs)
    console.log('⏳ Waiting for SSH service to be ready (max 5 minutes)...');
    console.log(`   Testing connection to ${host}:${sshPort}...`);
    console.log(`   Note: VM boot + SSH daemon start can take 3-5 minutes`);
    try {
      // Increase timeout to 300 seconds (5 minutes) for VM boot + SSH service start
      await this.waitForSSH(host, sshPort, 300000, credentials.username, credentials.password);
      console.log('✅ SSH service is ready and authenticated successfully\n');
    } catch (error) {
      console.error('\n========== SSH CONNECTION FAILED ==========');
      console.error(`❌ Host: ${host}:${sshPort}`);
      console.error(`❌ Error: ${error.message}`);
      console.error(`❌ Mode: ${connectionInfo.mode}`);
      if (connectionInfo.mode === 'hackthebox-internal') {
        console.error(`\n💡 Troubleshooting HackTheBox Mode:`);
        console.error(`   1. Verify VM has started: Check VirtualBox GUI`);
        console.error(`   2. Check NIC 2 (NAT) is configured with port forwarding`);
        console.error(`   3. Verify port ${sshPort} is not blocked by firewall`);
        console.error(`   4. Check if SSH service started inside VM (may take 2-3 min after boot)`);
        console.error(`   5. Verify management port is correct in VM provisioner`);
      }
      console.error('==========================================\n');
      console.warn('⚠️  Flags NOT injected into VM filesystem');
      console.warn('⚠️  Users can still submit flags - they are stored in session database');
      return {
        success: false,
        method: 'ssh-skipped',
        error: 'SSH service not available - flags not injected',
        userFlagInjected: false,
        rootFlagInjected: false,
        skipReason: error.message,
        diagnostics: {
          host,
          port: sshPort,
          mode: connectionInfo.mode,
          attemptedAuth: credentials.username
        }
      };
    }
    
    try {
      const injectionResults = {
        success: false,
        method: 'ssh-direct',
        userFlagInjected: false,
        rootFlagInjected: false,
        errors: []
      };
      
      // Inject user flags
      for (const location of flagData.locations.user) {
        try {
          const userCommand = `echo "${flagData.userFlag}" > ${location}`;
          const result = await this.executeSSHCommand(host, sshPort, credentials.username, userCommand, 30000, credentials.password);
          
          console.log(`📝 User flag injected to ${location}`);
          injectionResults.userFlagInjected = true;
          break; // Success on first location
        } catch (error) {
          console.warn(`Failed to inject user flag to ${location}:`, error.message);
          injectionResults.errors.push(`User flag to ${location}: ${error.message}`);
        }
      }
      
      // Inject root flags using sudo (root SSH login not allowed)
      for (const location of flagData.locations.root) {
        try {
          // Use sudo with tiago's password - echo password into sudo stdin
          console.log(`🔐 Using sudo to inject root flag to ${location}`);
          const rootCommand = `echo "${credentials.password}" | sudo -S sh -c 'echo "${flagData.rootFlag}" > ${location} && chmod 600 ${location}'`;
          await this.executeSSHCommand(host, sshPort, credentials.username, rootCommand, 30000, credentials.password);
          
          console.log(`🔐 Root flag injected to ${location}`);
          injectionResults.rootFlagInjected = true;
          break;
        } catch (sudoError) {
          try {
            // Fallback: try direct write to /tmp (world-writable)
            const directCommand = `echo "${flagData.rootFlag}" > ${location}`;
            await this.executeSSHCommand(host, sshPort, credentials.username, directCommand, 30000, credentials.password);
            
            console.log(`🔐 Root flag injected to ${location} (direct)`);
            injectionResults.rootFlagInjected = true;
            break;
          } catch (directError) {
            console.warn(`Failed to inject root flag to ${location}:`, directError.message);
            injectionResults.errors.push(`Root flag to ${location}: ${directError.message}`);
          }
        }
      }
      
      // Check if at least one flag was injected
      if (injectionResults.userFlagInjected || injectionResults.rootFlagInjected) {
        injectionResults.success = true;
      }
      
      console.log('✅ Flag injection completed:', {
        userFlag: injectionResults.userFlagInjected,
        rootFlag: injectionResults.rootFlagInjected,
        errors: injectionResults.errors.length
      });
      
      return injectionResults;
      
    } catch (error) {
      console.error('Flag injection failed:', error);
      return {
        success: false,
        method: 'ssh-direct',
        error: error.message,
        userFlagInjected: false,
        rootFlagInjected: false
      };
    }
  }

  /**
   * Execute SSH command using ssh2 library
   * @private
   */
  async executeSSHCommand(host, port, username, command, timeout = 30000, password = null) {
    const { Client: SSH2Client } = await import('ssh2');
    
    return new Promise((resolve, reject) => {
      const ssh = new SSH2Client();
      const timer = setTimeout(() => {
        ssh.end();
        reject(new Error('Command timeout'));
      }, timeout);
      
      console.log(`📡 Executing SSH command via ssh2 library`);
      console.log(`   Command: ${command}`);
      
      ssh.on('ready', () => {
        console.log('   ✅ SSH connection established, executing command...');
        
        ssh.exec(command, (err, stream) => {
          if (err) {
            clearTimeout(timer);
            ssh.end();
            reject(err);
            return;
          }
          
          let stdout = '';
          let stderr = '';
          
          stream.on('close', (code) => {
            clearTimeout(timer);
            ssh.end();
            
            if (code !== 0) {
              console.error(`   ❌ Command exited with code ${code}`);
              if (stderr) console.error(`   stderr: ${stderr}`);
              reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
            } else {
              console.log(`   ✅ Command succeeded`);
              if (stdout.trim()) console.log(`   Output: ${stdout.trim().substring(0, 100)}`);
              resolve(stdout.trim());
            }
          });
          
          stream.on('data', (data) => {
            stdout += data.toString();
          });
          
          stream.stderr.on('data', (data) => {
            stderr += data.toString();
          });
        });
      });
      
      ssh.on('error', (error) => {
        clearTimeout(timer);
        console.error(`   ❌ SSH connection error: ${error.code || 'UNKNOWN'} - ${error.message}`);
        reject(error);
      });
      
      // Connect with appropriate auth method
      const config = {
        host,
        port,
        username,
        readyTimeout: 20000,
        // Try modern algorithms first, then legacy for old VMs
        algorithms: {
          kex: [
            'curve25519-sha256',
            'curve25519-sha256@libssh.org',
            'ecdh-sha2-nistp256',
            'ecdh-sha2-nistp384',
            'ecdh-sha2-nistp521',
            'diffie-hellman-group-exchange-sha256',
            'diffie-hellman-group14-sha256',
            'diffie-hellman-group14-sha1',
            'diffie-hellman-group1-sha1'
          ],
          cipher: [
            'chacha20-poly1305@openssh.com',
            'aes128-gcm',
            'aes128-gcm@openssh.com',
            'aes256-gcm',
            'aes256-gcm@openssh.com',
            'aes128-ctr',
            'aes192-ctr',
            'aes256-ctr',
            'aes128-cbc',
            'aes256-cbc',
            'aes192-cbc',
            '3des-cbc'
          ],
          hmac: [
            'hmac-sha2-256-etm@openssh.com',
            'hmac-sha2-512-etm@openssh.com',
            'hmac-sha2-256',
            'hmac-sha2-512',
            'hmac-sha1',
            'hmac-md5'
          ],
          serverHostKey: [
            'ssh-ed25519',
            'ecdsa-sha2-nistp256',
            'ecdsa-sha2-nistp384',
            'ecdsa-sha2-nistp521',
            'rsa-sha2-512',
            'rsa-sha2-256',
            'ssh-rsa',
            'ssh-dss'
          ]
        }
      };
      
      if (password) {
        config.password = password;
      }
      
      ssh.connect(config);
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
    
    // Windows VMs
    if (labConfig.category === 'Windows' || labConfig.name.toLowerCase().includes('windows')) {
      return 'guestcontrol'; // Use VBoxManage for Windows
    }
    
    // Linux VMs with SSH credentials - use SSH injection
    if (labConfig.defaultCredentials && labConfig.defaultCredentials.username) {
      return 'ssh'; // Has SSH credentials - inject via SSH
    }
    
    // Fallback to database-only if no credentials available
    // Users exploit the VM and submit flags which are validated against session database
    return 'database-only';
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

  /**
   * Wait for SSH service to be ready by testing actual SSH connection
   * @private
   */
  async waitForSSH(host, port, maxWait = 180000, username = 'root', password = null) {
    const { Client: SSH2Client } = await import('ssh2');
    const startTime = Date.now();
    let attemptCount = 0;
    let lastError = null;
    
    return new Promise((resolve, reject) => {
      const checkSSH = () => {
        attemptCount++;
        const elapsed = Date.now() - startTime;
        
        if (elapsed > maxWait) {
          const errorMsg = lastError 
            ? `SSH not ready after ${Math.round(maxWait/1000)}s (${attemptCount} attempts). Last error: ${lastError}`
            : `SSH timeout after ${Math.round(maxWait/1000)}s (${attemptCount} attempts)`;
          reject(new Error(errorMsg));
          return;
        }
        
        // Only log every 4th attempt to reduce spam (every ~20 seconds)
        const shouldLog = attemptCount === 1 || attemptCount % 4 === 0;
        
        const ssh = new SSH2Client();
        const attemptTimer = setTimeout(() => {
          ssh.end();
          if (shouldLog) {
            console.log(`   Attempt ${attemptCount}: Connection timeout after 10s, retrying... (${Math.round(elapsed/1000)}s elapsed)`);
          }
          lastError = 'Connection timeout';
          setTimeout(checkSSH, 5000); // Retry every 5 seconds
        }, 10000);
        
        ssh.on('ready', () => {
          clearTimeout(attemptTimer);
          ssh.end();
          console.log(`   ✅ SSH connection successful after ${attemptCount} attempts (${Math.round(elapsed/1000)}s)`);
          resolve();
        });
        
        ssh.on('error', (error) => {
          clearTimeout(attemptTimer);
          lastError = error.message;
          
          if (shouldLog) {
            console.log(`   Attempt ${attemptCount}: ${error.code || 'Error'} - ${error.message} (${Math.round(elapsed/1000)}s elapsed)`);
          }
          
          setTimeout(checkSSH, 5000); // Retry every 5 seconds
        });
        
        const config = {
          host,
          port,
          username,
          readyTimeout: 10000,
          // Try modern algorithms first, then legacy for old VMs
          algorithms: {
            kex: [
              'curve25519-sha256',
              'curve25519-sha256@libssh.org',
              'ecdh-sha2-nistp256',
              'ecdh-sha2-nistp384',
              'ecdh-sha2-nistp521',
              'diffie-hellman-group-exchange-sha256',
              'diffie-hellman-group14-sha256',
              'diffie-hellman-group14-sha1',
              'diffie-hellman-group1-sha1'
            ],
            cipher: [
              'chacha20-poly1305@openssh.com',
              'aes128-gcm',
              'aes128-gcm@openssh.com',
              'aes256-gcm',
              'aes256-gcm@openssh.com',
              'aes128-ctr',
              'aes192-ctr',
              'aes256-ctr',
              'aes128-cbc',
              'aes256-cbc',
              'aes192-cbc',
              '3des-cbc'
            ],
            hmac: [
              'hmac-sha2-256-etm@openssh.com',
              'hmac-sha2-512-etm@openssh.com',
              'hmac-sha2-256',
              'hmac-sha2-512',
              'hmac-sha1',
              'hmac-md5'
            ],
            serverHostKey: [
              'ssh-ed25519',
              'ecdsa-sha2-nistp256',
              'ecdsa-sha2-nistp384',
              'ecdsa-sha2-nistp521',
              'rsa-sha2-512',
              'rsa-sha2-256',
              'ssh-rsa',
              'ssh-dss'
            ]
          }
        };
        
        if (password) {
          config.password = password;
        }
        
        ssh.connect(config);
      };
      
      checkSSH();
    });
  }
}

// Export singleton instance
export default new FlagService();