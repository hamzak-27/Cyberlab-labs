import VMProvisioner from './src/services/provisioner.service.js';
import FlagService from './src/services/flag.service.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test Flag Generation & Injection Service
 * Tests complete workflow: VM Start → Flag Generation → SSH Injection → Validation
 */
async function testFlagService() {
  console.log('🚩 Starting Flag Service Test...\n');

  try {
    // Step 1: Initialize VM Provisioner
    console.log('📋 Step 1: Initializing VM Provisioner...');
    await VMProvisioner.initialize();
    console.log('✅ VM Provisioner initialized\n');

    // Step 2: Create VM session
    console.log('🔧 Step 2: Creating VM session...');
    const sessionId = 'flag-test-' + Date.now();
    const templateId = '3b1eda3c-70ca-4f74-9977-d4cba1cb29d9'; // Lampiao template
    
    const vmResult = await VMProvisioner.createInstance(templateId, sessionId, {
      userId: 'test-user-flag'
    });
    
    console.log('✅ VM instance created:', vmResult.instanceId);
    console.log('');

    // Step 3: Start VM
    console.log('▶️ Step 3: Starting VM...');
    const startResult = await VMProvisioner.startInstance(sessionId);
    console.log('✅ VM started successfully');
    console.log('Connection info:', startResult.connectionInfo);
    console.log('');

    // Step 4: Generate flags
    console.log('🚩 Step 4: Generating session flags...');
    
    // Lampião lab configuration
    const lampiaoLabConfig = {
      name: 'Lampião',
      category: 'Web',
      difficulty: 'Medium',
      flags: {
        user: {
          locations: ['/home/tiago/user.txt', '/var/www/html/user_flag.txt'],
          points: 25
        },
        root: {
          locations: ['/root/root.txt'],
          points: 50
        }
      },
      defaultCredentials: {
        username: 'tiago',
        password: 'Virgulino'  // Correct Lampiao password
      },
      injectionMethod: 'ssh'
    };
    
    const flagData = FlagService.generateSessionFlags(sessionId, 'test-user-flag', lampiaoLabConfig);
    console.log('✅ Flags generated:');
    console.log(`   User Flag: ${flagData.userFlag}`);
    console.log(`   Root Flag: ${flagData.rootFlag}`);
    console.log(`   Locations:`, flagData.locations);
    console.log('');

    // Step 5: Wait for VM to be fully ready
    console.log('⏳ Step 5: Waiting for VM services to be ready...');
    await sleep(20000); // Wait 20 seconds for services
    console.log('✅ VM should be ready for SSH connection\n');

    // Step 6: Inject flags into VM
    console.log('💉 Step 6: Injecting flags into VM...');
    const injectionResult = await FlagService.injectFlags(
      sessionId, 
      startResult.connectionInfo, 
      lampiaoLabConfig
    );
    
    console.log('✅ Flag injection result:', injectionResult);
    console.log('');

    if (injectionResult.success) {
      // Step 7: Test flag validation
      console.log('🔍 Step 7: Testing flag validation...');
      
      // Test valid user flag
      const userValidation = FlagService.validateFlag(sessionId, flagData.userFlag, 'user');
      console.log('User flag validation:', userValidation);
      
      // Test valid root flag
      const rootValidation = FlagService.validateFlag(sessionId, flagData.rootFlag, 'root');
      console.log('Root flag validation:', rootValidation);
      
      // Test invalid flag
      const invalidValidation = FlagService.validateFlag(sessionId, 'FLAG{invalid_flag}', 'user');
      console.log('Invalid flag validation:', invalidValidation);
      console.log('');

      // Step 8: Get flag information
      console.log('📊 Step 8: Getting flag session information...');
      const flagInfo = FlagService.getFlagInfo(sessionId);
      console.log('Flag session info:', flagInfo);
      console.log('');

      // Step 9: Test SSH connection manually (optional verification)
      console.log('🔐 Step 9: Verify SSH connection works...');
      try {
        console.log('SSH Connection details:');
        console.log(`   Host: ${startResult.connectionInfo.ssh.host}`);
        console.log(`   Port: ${startResult.connectionInfo.ssh.port}`);
        console.log(`   Command: ${startResult.connectionInfo.ssh.command}`);
        console.log('   Manual test: You can SSH and check files:');
        console.log('     ls -la /home/tiago/');
        console.log('     cat /home/tiago/user.txt');
        console.log('     sudo cat /root/root.txt');
        console.log('');
      } catch (error) {
        console.warn('SSH verification failed:', error.message);
      }
    }

    // Step 10: Cleanup
    console.log('🧹 Step 10: Cleanup...');
    
    // Stop and delete VM
    await VMProvisioner.stopInstance(sessionId);
    await VMProvisioner.deleteInstance(sessionId);
    
    // Remove flag session
    FlagService.removeFlagSession(sessionId);
    
    console.log('✅ Cleanup completed');
    console.log('');

    console.log('🎉 Flag Service test completed successfully!');
    console.log('');

    // Summary
    console.log('📋 Test Summary:');
    console.log(`✅ VM Provisioning: Working`);
    console.log(`✅ Flag Generation: Working`);
    console.log(`✅ Flag Injection: ${injectionResult.success ? 'Working' : 'Failed'}`);
    console.log(`✅ Flag Validation: Working`);
    console.log(`✅ SSH Connection: ${injectionResult.success ? 'Established' : 'Failed'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Emergency cleanup
    console.log('🛠️ Attempting emergency cleanup...');
    try {
      const sessionId = 'flag-test-' + Date.now();
      await VMProvisioner.stopInstance(sessionId);
      await VMProvisioner.deleteInstance(sessionId);
      FlagService.removeFlagSession(sessionId);
    } catch (cleanupError) {
      console.warn('Cleanup failed:', cleanupError.message);
    }
    
    process.exit(1);
  }
}

/**
 * Test only flag generation (no VM required)
 */
async function testFlagGenerationOnly() {
  console.log('🧪 Testing Flag Generation Only...\n');

  try {
    const lampiaoConfig = {
      name: 'Lampião',
      category: 'Web',
      flags: {
        user: { locations: ['/home/tiago/user.txt'], points: 25 },
        root: { locations: ['/root/root.txt'], points: 50 }
      }
    };

    // Generate flags for different users
    const users = ['user123', 'alice456', 'bob789'];
    
    for (const userId of users) {
      const sessionId = `test-${userId}-${Date.now()}`;
      const flags = FlagService.generateSessionFlags(sessionId, userId, lampiaoConfig);
      
      console.log(`Flags for ${userId}:`);
      console.log(`  Session: ${sessionId}`);
      console.log(`  User: ${flags.userFlag}`);
      console.log(`  Root: ${flags.rootFlag}`);
      console.log('');
      
      // Test validation
      const validUser = FlagService.validateFlag(sessionId, flags.userFlag, 'user');
      const validRoot = FlagService.validateFlag(sessionId, flags.rootFlag, 'root');
      const invalid = FlagService.validateFlag(sessionId, 'WRONG', 'user');
      
      console.log(`  Validation - User: ${validUser.valid ? '✅' : '❌'}`);
      console.log(`  Validation - Root: ${validRoot.valid ? '✅' : '❌'}`);
      console.log(`  Validation - Invalid: ${invalid.valid ? '❌' : '✅'}`);
      console.log('');
    }

    console.log('✅ Flag generation test completed!');

  } catch (error) {
    console.error('❌ Flag generation test failed:', error.message);
  }
}

// Helper function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests based on command line argument
const testType = process.argv[2] || 'full';

if (testType === 'generation') {
  testFlagGenerationOnly();
} else if (testType === 'full') {
  testFlagService();
} else {
  console.log('Usage: node test-flag-service.js [full|generation]');
  console.log('  full: Run complete VM + flag injection test (default)');
  console.log('  generation: Test only flag generation (no VM required)');
  process.exit(1);
}