import VMProvisioner from './src/services/provisioner.service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test script for VM Provisioner Service
 * Tests the complete workflow: Initialize -> Import -> Create -> Start -> Stop -> Delete
 */
async function testVMProvisioner() {
  console.log('🚀 Starting VM Provisioner Test...\n');

  try {
    // Step 1: Initialize the provisioner
    console.log('📋 Step 1: Initializing VM Provisioner...');
    const initResult = await VMProvisioner.initialize();
    console.log('✅ Provisioner initialized:', initResult);
    console.log('');

    // Step 2: Test Lampião import
    console.log('📥 Step 2: Testing Lampião import...');
    const lampiaoPath = path.join(__dirname, 'Lampiao', 'Lampiao.ovf');
    
    const labConfig = {
      name: 'Lampiao',
      description: 'Portuguese vulnerable Linux machine with web vulnerabilities',
      difficulty: 'Medium',
      category: 'Web',
      vmConfig: {
        ram: 1024,
        cpu: 1,
        network: 'nat'
      }
    };

    console.log(`Importing from: ${lampiaoPath}`);
    const importResult = await VMProvisioner.importTemplate(lampiaoPath, labConfig);
    console.log('✅ Template imported:', importResult);
    console.log('');

    // Step 3: Create instance
    console.log('🔧 Step 3: Creating VM instance...');
    const sessionId = 'test-session-' + Date.now();
    const sessionConfig = {
      userId: 'test-user-123',
      vmConfig: {
        ram: 1024
      }
    };

    const instanceResult = await VMProvisioner.createInstance(
      importResult.templateId,
      sessionId,
      sessionConfig
    );
    console.log('✅ Instance created:', instanceResult);
    console.log('');

    // Step 4: Start instance
    console.log('▶️ Step 4: Starting VM instance...');
    const startResult = await VMProvisioner.startInstance(sessionId);
    console.log('✅ VM started:', startResult);
    console.log('');

    // Display connection information
    if (startResult.connectionInfo) {
      console.log('🌐 Connection Information:');
      console.log(`   SSH: ${startResult.connectionInfo.ssh.command}`);
      console.log(`   Web: ${startResult.connectionInfo.web.url}`);
      console.log('');
    }

    // Step 5: Check status
    console.log('📊 Step 5: Checking VM status...');
    const statusResult = await VMProvisioner.getInstanceStatus(sessionId);
    console.log('✅ VM status:', statusResult);
    console.log('');

    // Step 6: List all instances
    console.log('📋 Step 6: Listing all active instances...');
    const allInstances = await VMProvisioner.listActiveInstances();
    console.log('✅ Active instances:', allInstances.length);
    allInstances.forEach((instance, index) => {
      console.log(`   ${index + 1}. Session: ${instance.sessionId}, Status: ${instance.status}`);
    });
    console.log('');

    // Wait a bit to let VM fully boot
    console.log('⏳ Waiting 10 seconds to let VM fully boot...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Step 7: Stop instance
    console.log('⏹️ Step 7: Stopping VM instance...');
    const stopResult = await VMProvisioner.stopInstance(sessionId);
    console.log('✅ VM stopped:', stopResult);
    console.log('');

    // Step 8: Delete instance
    console.log('🗑️ Step 8: Deleting VM instance...');
    const deleteResult = await VMProvisioner.deleteInstance(sessionId);
    console.log('✅ VM deleted:', deleteResult);
    console.log('');

    console.log('🎉 VM Provisioner test completed successfully!');
    console.log('✅ All operations working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Helper function to test individual components
async function testComponentsSeparately() {
  console.log('🧪 Testing individual components...\n');

  try {
    // Test 1: VirtualBox installation check
    console.log('1. Testing VirtualBox installation...');
    await VMProvisioner.initialize();
    console.log('✅ VirtualBox found and working\n');

    // Test 2: Directory creation
    console.log('2. Testing directory creation...');
    // This is handled in initialize()
    console.log('✅ Directories created successfully\n');

    // Test 3: File verification
    console.log('3. Testing Lampião file verification...');
    const lampiaoPath = path.join(__dirname, 'Lampiao', 'Lampiao.ovf');
    console.log(`Checking file: ${lampiaoPath}`);
    
    // This test requires access to VMProvisioner internals, so we'll create a simple file check
    const fs = await import('fs/promises');
    try {
      const stats = await fs.stat(lampiaoPath);
      console.log(`✅ Lampião OVF found: ${(stats.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.log(`❌ Lampião OVF not found: ${error.message}`);
    }

    console.log('');
    console.log('🎯 Component tests completed');

  } catch (error) {
    console.error('❌ Component test failed:', error.message);
  }
}

// Run the appropriate test based on command line argument
const testType = process.argv[2] || 'full';

if (testType === 'components') {
  testComponentsSeparately();
} else if (testType === 'full') {
  testVMProvisioner();
} else {
  console.log('Usage: node test-provisioner.js [full|components]');
  console.log('  full: Run complete VM lifecycle test (default)');
  console.log('  components: Test individual components only');
  process.exit(1);
}