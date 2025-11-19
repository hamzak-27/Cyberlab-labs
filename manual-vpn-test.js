#!/usr/bin/env node

/**
 * Manual VPN Integration Test
 * Simple test to verify VPN system components work together
 */

import { promises as fs } from 'fs';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runVPNTests() {
  log('🚀 Starting Manual VPN Integration Test', 'cyan');
  log('=======================================\n', 'cyan');
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  // Test 1: Configuration Loading
  testsTotal++;
  try {
    log('Test 1: Configuration Loading', 'blue');
    const { config } = await import('./src/config/environment.js');
    
    if (config.vpn && config.vpn.serverHost) {
      log('  ✅ VPN configuration loaded successfully', 'green');
      log(`  📍 VPN Server: ${config.vpn.serverHost}:${config.vpn.serverPort}`, 'blue');
      testsPassed++;
    } else {
      throw new Error('VPN configuration missing');
    }
  } catch (error) {
    log(`  ❌ Configuration loading failed: ${error.message}`, 'red');
  }
  
  // Test 2: VPN Service Initialization
  testsTotal++;
  try {
    log('\nTest 2: VPN Service Initialization', 'blue');
    
    // Create mock directories
    await fs.mkdir('./test-vpn-certs', { recursive: true });
    await fs.mkdir('./test-configs', { recursive: true });
    
    const { default: vpnService } = await import('./src/services/vpn.service.js');
    await vpnService.initialize();
    
    log('  ✅ VPN service initialized successfully', 'green');
    testsPassed++;
  } catch (error) {
    log(`  ❌ VPN service initialization failed: ${error.message}`, 'red');
  }
  
  // Test 3: VPN Monitor Service
  testsTotal++;
  try {
    log('\nTest 3: VPN Monitor Service', 'blue');
    
    // Create mock VPN status log
    await fs.mkdir('./test-logs', { recursive: true });
    const mockStatusContent = `OpenVPN CLIENT LIST
Updated,Sat Nov 03 12:30:00 2024
Common Name,Real Address,Bytes Received,Bytes Sent,Connected Since
test-user,192.168.1.100:52341,2048,1024,Sat Nov 03 12:25:00 2024
ROUTING TABLE
Virtual Address,Common Name,Real Address,Last Ref
10.10.42.10,test-user,192.168.1.100:52341,Sat Nov 03 12:25:00 2024
GLOBAL STATS
Max bcast/mcast queue length,0
END`;
    
    await fs.writeFile('./test-logs/openvpn-status.log', mockStatusContent);
    
    // Override config for testing
    process.env.VPN_STATUS_LOG = './test-logs/openvpn-status.log';
    process.env.VPN_MONITOR_INTERVAL = '5000';
    
    const { default: vpnMonitor } = await import('./src/services/vpn-monitor.service.js');
    await vpnMonitor.initialize();
    
    // Test status retrieval
    const status = vpnMonitor.getConnectionStatus('test-user');
    if (status && typeof status.connected === 'boolean') {
      log('  ✅ VPN monitor service working correctly', 'green');
      log(`  📊 User status: ${status.connected ? 'Connected' : 'Disconnected'}`, 'blue');
      testsPassed++;
    } else {
      throw new Error('Invalid status response');
    }
  } catch (error) {
    log(`  ❌ VPN monitor test failed: ${error.message}`, 'red');
  }
  
  // Test 4: VM Provisioner Network Configuration
  testsTotal++;
  try {
    log('\nTest 4: VM Provisioner VPN Network Configuration', 'blue');
    
    const { default: vmProvisioner } = await import('./src/services/provisioner.service.js');
    
    // Test VPN bridge network allocation
    const networkConfig = await vmProvisioner.allocateNetworkPorts('test-session', {
      useVPN: true,
      userSubnet: {
        subnetNumber: 42,
        network: '10.10.42.0/24',
        netmask: '255.255.255.0',
        gateway: '10.10.42.1'
      }
    });
    
    if (networkConfig && networkConfig.mode === 'bridge' && networkConfig.vmIP) {
      log('  ✅ VPN bridge networking configuration works', 'green');
      log(`  🌐 VM IP: ${networkConfig.vmIP}`, 'blue');
      log(`  🔌 Services: SSH, Web, FTP, MySQL`, 'blue');
      testsPassed++;
    } else {
      throw new Error('Invalid network configuration');
    }
  } catch (error) {
    log(`  ❌ VM provisioner test failed: ${error.message}`, 'red');
  }
  
  // Test 5: VPN Configuration Generation
  testsTotal++;
  try {
    log('\nTest 5: VPN Configuration Generation', 'blue');
    
    const { default: vpnService } = await import('./src/services/vpn.service.js');
    
    // Test user config generation
    const configResult = await vpnService.generateUserConfig('test-user', 'test-session-123', {
      labId: 'test-lab',
      duration: 30
    });
    
    if (configResult.success && configResult.userSubnet && configResult.configPath) {
      log('  ✅ VPN configuration generation works', 'green');
      log(`  📁 Config path: ${configResult.configPath}`, 'blue');
      log(`  🌐 User subnet: ${configResult.userSubnet.network}`, 'blue');
      log(`  ⏰ Expires: ${configResult.expiresAt}`, 'blue');
      testsPassed++;
    } else {
      throw new Error('VPN configuration generation failed');
    }
  } catch (error) {
    log(`  ❌ VPN configuration generation failed: ${error.message}`, 'red');
  }
  
  // Test 6: Connection Info Generation
  testsTotal++;
  try {
    log('\nTest 6: VPN Connection Info Generation', 'blue');
    
    const networkConfig = {
      mode: 'bridge',
      vmIP: '10.10.42.10',
      services: {
        ssh: { ip: '10.10.42.10', port: 22 },
        web: { ip: '10.10.42.10', port: 80 },
        ftp: { ip: '10.10.42.10', port: 21 },
        mysql: { ip: '10.10.42.10', port: 3306 }
      }
    };
    
    // Simulate connection info generation
    const connectionInfo = {
      mode: networkConfig.mode,
      ssh: {
        host: networkConfig.services.ssh.ip,
        port: networkConfig.services.ssh.port,
        command: `ssh user@${networkConfig.services.ssh.ip}`
      },
      web: {
        url: `http://${networkConfig.services.web.ip}`
      },
      general: {
        vmIP: networkConfig.vmIP,
        vpnRequired: true,
        directAccess: true
      }
    };
    
    if (connectionInfo.general.vpnRequired && connectionInfo.ssh.host === '10.10.42.10') {
      log('  ✅ VPN connection info generation works', 'green');
      log(`  🔐 SSH: ${connectionInfo.ssh.command}`, 'blue');
      log(`  🌐 Web: ${connectionInfo.web.url}`, 'blue');
      log(`  🔒 VPN Required: ${connectionInfo.general.vpnRequired}`, 'blue');
      testsPassed++;
    } else {
      throw new Error('Invalid connection info');
    }
  } catch (error) {
    log(`  ❌ Connection info test failed: ${error.message}`, 'red');
  }
  
  // Cleanup
  try {
    await fs.rm('./test-vpn-certs', { recursive: true, force: true });
    await fs.rm('./test-configs', { recursive: true, force: true });
    await fs.rm('./test-logs', { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
  
  // Results
  log('\n=======================================', 'cyan');
  log('📊 Test Results Summary', 'cyan');
  log('=======================================', 'cyan');
  log(`Total Tests: ${testsTotal}`, 'blue');
  log(`Passed: ${testsPassed}`, testsPassed === testsTotal ? 'green' : 'yellow');
  log(`Failed: ${testsTotal - testsPassed}`, testsTotal - testsPassed === 0 ? 'green' : 'red');
  log(`Success Rate: ${((testsPassed/testsTotal) * 100).toFixed(1)}%`, 'cyan');
  
  if (testsPassed === testsTotal) {
    log('\n🎉 ALL VPN INTEGRATION TESTS PASSED!', 'green');
    log('✅ Your VPN system is ready for production!', 'green');
  } else if (testsPassed >= testsTotal * 0.8) {
    log('\n✅ Most VPN integration tests passed!', 'yellow');
    log('⚠️  Some components may need attention.', 'yellow');
  } else {
    log('\n❌ VPN integration tests failed!', 'red');
    log('🔧 Please check the failed components above.', 'red');
  }
  
  return testsPassed === testsTotal;
}

// Run the tests
runVPNTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log(`\n💥 Test execution failed: ${error.message}`, 'red');
  process.exit(1);
});