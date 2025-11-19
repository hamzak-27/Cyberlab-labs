import { Client as SSH2Client } from 'ssh2';
import net from 'net';

/**
 * SSH Debug Utility
 * Helps troubleshoot SSH connections to VMs
 */
export class SSHDebugger {
  
  /**
   * Test SSH connection with various credential combinations
   * @param {string} host - SSH host
   * @param {number} port - SSH port
   * @param {Array} credentialsList - Array of credential objects to try
   * @returns {Promise<Object>} Test results
   */
  async testConnections(host, port, credentialsList) {
    const results = [];
    
    for (const credentials of credentialsList) {
      console.log(`🔐 Testing SSH connection: ${credentials.username}@${host}:${port}`);
      
      const result = await this.testSingleConnection(host, port, credentials);
      results.push({
        credentials,
        ...result
      });
      
      console.log(`   Result: ${result.success ? '✅ Success' : '❌ Failed'}`);
      if (!result.success) {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    }
    
    return results;
  }
  
  /**
   * Test a single SSH connection
   * @private
   */
  async testSingleConnection(host, port, credentials) {
    return new Promise((resolve) => {
      const ssh = new SSH2Client();
      const timeout = setTimeout(() => {
        ssh.destroy();
        resolve({
          success: false,
          error: 'Connection timeout (15 seconds)'
        });
      }, 15000);
      
      ssh.on('ready', () => {
        clearTimeout(timeout);
        
        // Try to execute a simple command
        ssh.exec('whoami', (err, stream) => {
          if (err) {
            ssh.end();
            resolve({
              success: false,
              error: `Command execution failed: ${err.message}`
            });
            return;
          }
          
          let output = '';
          stream.on('data', (data) => {
            output += data.toString();
          });
          
          stream.on('close', (code) => {
            ssh.end();
            resolve({
              success: true,
              whoami: output.trim(),
              exitCode: code
            });
          });
        });
      });
      
      ssh.on('error', (error) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          error: error.message
        });
      });
      
      // Try connection with multiple algorithm configurations
      ssh.connect({
        host,
        port,
        username: credentials.username,
        password: credentials.password,
        readyTimeout: 10000,
        // More permissive algorithms for older systems
        algorithms: {
          kex: [
            'diffie-hellman-group-exchange-sha256',
            'diffie-hellman-group14-sha256',
            'diffie-hellman-group-exchange-sha1',
            'diffie-hellman-group14-sha1',
            'diffie-hellman-group1-sha1'
          ],
          cipher: [
            'aes128-ctr',
            'aes192-ctr', 
            'aes256-ctr',
            'aes128-cbc',
            'aes192-cbc',
            'aes256-cbc',
            '3des-cbc'
          ],
          hmac: [
            'hmac-sha2-256',
            'hmac-sha2-512',
            'hmac-sha1',
            'hmac-md5'
          ]
        }
      });
    });
  }
  
  /**
   * Get common credential combinations for testing
   * @param {string} vmType - Type of VM (lampiao, metasploitable, etc.)
   * @returns {Array} Array of credential objects
   */
  getCommonCredentials(vmType = 'lampiao') {
    const credentialSets = {
      lampiao: [
        { username: 'tiago', password: 'Virgulino' },  // Correct Lampiao credentials
        { username: 'tiago', password: 'tiago' },
        { username: 'lampiao', password: 'lampiao' },
        { username: 'admin', password: 'admin' },
        { username: 'root', password: 'root' },
        { username: 'root', password: 'tiago' },
        { username: 'ubuntu', password: 'ubuntu' },
        { username: 'user', password: 'user' }
      ],
      metasploitable: [
        { username: 'msfadmin', password: 'msfadmin' },
        { username: 'root', password: 'root' },
        { username: 'user', password: 'user' }
      ],
      dvwa: [
        { username: 'admin', password: 'password' },
        { username: 'dvwa', password: 'dvwa' },
        { username: 'root', password: 'root' }
      ],
      generic: [
        { username: 'admin', password: 'admin' },
        { username: 'root', password: 'root' },
        { username: 'user', password: 'user' },
        { username: 'ubuntu', password: 'ubuntu' },
        { username: 'kali', password: 'kali' }
      ]
    };
    
    return credentialSets[vmType] || credentialSets.generic;
  }
  
  /**
   * Check if SSH service is running on the target
   * @param {string} host - Target host
   * @param {number} port - Target port
   * @returns {Promise<boolean>} True if port is open
   */
  async checkSSHService(host, port) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 5000);
      
      socket.on('connect', () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(true);
      });
      
      socket.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
      
      socket.connect(port, host);
    });
  }
  
  /**
   * Get VM info and suggest debugging steps
   * @param {string} vmName - VM name or type
   * @returns {Object} Debugging information
   */
  getVMDebugInfo(vmName = 'lampiao') {
    const debugInfo = {
      lampiao: {
        expectedCredentials: [
          { username: 'tiago', password: 'Virgulino' },  // Correct credentials
          { username: 'lampiao', password: 'lampiao' }
        ],
        commonIssues: [
          'SSH service might not be started yet (wait 2-3 minutes after VM boot)',
          'VM might be using different credentials than expected',
          'SSH might be configured to disallow password authentication',
          'Firewall might be blocking SSH connections'
        ],
        debugSteps: [
          'Check if VM has fully booted (wait at least 3 minutes)',
          'Try connecting via VirtualBox console to check SSH service',
          'Verify VM network configuration',
          'Check /etc/ssh/sshd_config for authentication settings'
        ]
      }
    };
    
    return debugInfo[vmName.toLowerCase()] || debugInfo.lampiao;
  }
}

// Helper function for standalone testing
export async function debugSSHConnection(host, port, vmType = 'lampiao') {
  const sshDebugger = new SSHDebugger();
  
  console.log(`🔍 SSH Debug Session for ${vmType.toUpperCase()} VM`);
  console.log(`Target: ${host}:${port}\n`);
  
  // Check if SSH port is open
  console.log('1️⃣ Checking if SSH service is reachable...');
  const isReachable = await sshDebugger.checkSSHService(host, port);
  console.log(`   SSH Port Status: ${isReachable ? '✅ Open' : '❌ Closed/Filtered'}\n`);
  
  if (!isReachable) {
    console.log('❌ SSH port is not reachable. Possible issues:');
    console.log('   - VM is still booting (wait 2-3 minutes)');
    console.log('   - SSH service is not running');
    console.log('   - Port forwarding is not configured');
    console.log('   - Firewall is blocking the connection\n');
    return { success: false, error: 'SSH port not reachable' };
  }
  
  // Test different credentials
  console.log('2️⃣ Testing credential combinations...');
  const credentials = sshDebugger.getCommonCredentials(vmType);
  const results = await sshDebugger.testConnections(host, port, credentials);
  
  // Analyze results
  const successfulConnections = results.filter(r => r.success);
  
  if (successfulConnections.length > 0) {
    console.log('🎉 Successful SSH connections found:');
    successfulConnections.forEach(conn => {
      console.log(`   ✅ ${conn.credentials.username}:${conn.credentials.password} (whoami: ${conn.whoami})`);
    });
    
    return {
      success: true,
      workingCredentials: successfulConnections.map(c => c.credentials)
    };
  } else {
    console.log('❌ No successful SSH connections found.');
    
    // Show debug info
    const debugInfo = sshDebugger.getVMDebugInfo(vmType);
    console.log('\n🛠️ Debugging suggestions:');
    debugInfo.debugSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });
    
    console.log('\n⚠️ Common issues:');
    debugInfo.commonIssues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
    
    return {
      success: false,
      error: 'No working credentials found',
      suggestedCredentials: debugInfo.expectedCredentials
    };
  }
}

export default SSHDebugger;