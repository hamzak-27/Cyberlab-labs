#!/usr/bin/env node

/**
 * Flag Injection Test Script
 * Tests flag generation and injection into Lampião VM
 */

import mongoose from 'mongoose';
import { config } from '../src/config/environment.js';
import Lab from '../src/models/Lab.js';
import VMProvisionerService from '../src/services/provisioner.service.js';
import FlagService from '../src/services/flag.service.js';

/**
 * Test flag generation
 */
async function testFlagGeneration(lab) {
  console.log('🚩 Testing flag generation...');
  
  const testSessionId = 'flag-test-' + Date.now();
  const testUserId = 'test-user-' + Date.now().toString().slice(-6);
  
  try {
    const flagData = FlagService.generateSessionFlags(testSessionId, testUserId, lab);
    
    console.log('✅ Flags generated successfully!');
    console.log(`   Session ID: ${flagData.sessionId}`);
    console.log(`   User ID: ${flagData.userId}`);
    console.log(`   User Flag: ${flagData.userFlag}`);
    console.log(`   Root Flag: ${flagData.rootFlag}`);
    console.log(`   User Points: ${flagData.points.user}`);
    console.log(`   Root Points: ${flagData.points.root}`);
    console.log(`   User Locations: ${flagData.locations.user.join(', ')}`);
    console.log(`   Root Locations: ${flagData.locations.root.join(', ')}`);
    
    return { flagData, testSessionId };
  } catch (error) {
    console.error('❌ Flag generation failed:', error.message);
    return null;
  }
}

/**
 * Test VM instance creation and startup
 */
async function testVMInstance(templateId, sessionId) {
  console.log('🖥️ Testing VM instance creation and startup...');
  
  try {
    // Create instance
    const instanceResult = await VMProvisionerService.createInstance(
      templateId,
      sessionId,
      {
        userId: 'test-user',
        vmConfig: {}
      }
    );
    
    if (!instanceResult.success) {
      throw new Error('Failed to create VM instance');
    }
    
    console.log('✅ VM instance created successfully');
    console.log(`   Instance ID: ${instanceResult.instanceId}`);
    console.log(`   SSH Port: ${instanceResult.networkConfig.sshPort}`);
    console.log(`   Web Port: ${instanceResult.networkConfig.webPort}`);
    
    // Start the VM
    console.log('🚀 Starting VM instance...');
    const startResult = await VMProvisionerService.startInstance(sessionId);
    
    if (!startResult.success) {
      throw new Error('Failed to start VM instance');
    }
    
    console.log('✅ VM instance started successfully');
    console.log(`   Status: ${startResult.status}`);
    console.log(`   Connection Info: ${startResult.connectionInfo.ssh.command}`);
    
    return {
      instanceId: instanceResult.instanceId,
      networkConfig: instanceResult.networkConfig,
      connectionInfo: startResult.connectionInfo
    };
    
  } catch (error) {
    console.error('❌ VM instance setup failed:', error.message);
    throw error;
  }
}

/**
 * Test flag injection into running VM
 */
async function testFlagInjection(sessionId, connectionInfo, lab) {
  console.log('💉 Testing flag injection into VM...');
  
  try {
    // Wait a bit for VM to fully boot
    console.log('⏳ Waiting for VM to fully boot (30 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const injectionResult = await FlagService.injectFlags(sessionId, connectionInfo, lab);
    
    if (injectionResult.success) {
      console.log('✅ Flag injection completed successfully!');
      console.log(`   Method: ${injectionResult.method}`);
      console.log(`   User Flag Injected: ${injectionResult.userFlagInjected}`);
      console.log(`   Root Flag Injected: ${injectionResult.rootFlagInjected}`);
      
      if (injectionResult.errors && injectionResult.errors.length > 0) {
        console.log('⚠️ Injection warnings:');
        injectionResult.errors.forEach(error => console.log(`      ${error}`));
      }
      
      return injectionResult;
    } else {
      console.error('❌ Flag injection failed');
      console.error(`   Error: ${injectionResult.error}`);
      return injectionResult;
    }
    
  } catch (error) {
    console.error('❌ Flag injection error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test flag validation
 */
async function testFlagValidation(sessionId) {
  console.log('🔍 Testing flag validation...');
  
  try {
    const flagInfo = FlagService.getFlagInfo(sessionId);
    if (!flagInfo) {
      throw new Error('No flag info found for session');
    }
    
    // Test with correct user flag
    const userFlagData = FlagService.activeSessions.get(sessionId);
    const userValidation = FlagService.validateFlag(sessionId, userFlagData.userFlag, 'user');
    
    if (userValidation.valid) {
      console.log('✅ User flag validation passed');
      console.log(`   Points awarded: ${userValidation.points}`);
    } else {
      console.error('❌ User flag validation failed:', userValidation.error);
    }
    
    // Test with correct root flag
    const rootValidation = FlagService.validateFlag(sessionId, userFlagData.rootFlag, 'root');
    
    if (rootValidation.valid) {
      console.log('✅ Root flag validation passed');
      console.log(`   Points awarded: ${rootValidation.points}`);
    } else {
      console.error('❌ Root flag validation failed:', rootValidation.error);
    }
    
    // Test with incorrect flag
    const wrongValidation = FlagService.validateFlag(sessionId, 'FLAG{wrong_flag}', 'user');
    if (!wrongValidation.valid) {
      console.log('✅ Invalid flag correctly rejected');
    } else {
      console.error('❌ Invalid flag incorrectly accepted');
    }
    
    return {
      userValidation,
      rootValidation,
      wrongValidation
    };
    
  } catch (error) {
    console.error('❌ Flag validation test error:', error.message);
    return null;
  }
}

/**
 * Cleanup test resources
 */
async function cleanupTest(sessionId) {
  console.log('🧹 Cleaning up test resources...');
  
  try {
    // Stop and delete VM instance
    await VMProvisionerService.deleteInstance(sessionId);
    console.log('✅ VM instance deleted');
    
    // Remove flag session
    FlagService.removeFlagSession(sessionId);
    console.log('✅ Flag session removed');
    
  } catch (error) {
    console.warn('⚠️ Cleanup warning:', error.message);
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('🚀 Starting Flag Injection Test...\n');
  
  let testSessionId = null;
  
  try {
    // Connect to database
    console.log('📊 Connecting to database...');
    await mongoose.connect(config.database.mongoUri);
    console.log('✅ Database connected');
    
    // Find Lampião lab
    console.log('\n🔍 Finding Lampião lab...');
    const lab = await Lab.findOne({ name: 'Lampião Vulnerable Linux VM' });
    
    if (!lab || !lab.templateVmId) {
      throw new Error('Lampião lab not found or not imported. Please run register-lampiao-lab.js and test-lampiao-import.js first.');
    }
    
    console.log('✅ Lampião lab found');
    console.log(`   Lab ID: ${lab._id}`);
    console.log(`   Template VM ID: ${lab.templateVmId}`);
    
    // Initialize VM provisioner
    console.log('\n🔧 Initializing VM provisioner...');
    await VMProvisionerService.initialize();
    console.log('✅ VM provisioner ready');
    
    // Test 1: Flag Generation
    console.log('\n=== Test 1: Flag Generation ===');
    const flagResult = await testFlagGeneration(lab);
    if (!flagResult) {
      throw new Error('Flag generation test failed');
    }
    
    testSessionId = flagResult.testSessionId;
    
    // Test 2: VM Instance Setup
    console.log('\n=== Test 2: VM Instance Setup ===');
    const vmInstance = await testVMInstance(lab.templateVmId, testSessionId);
    
    // Test 3: Flag Injection
    console.log('\n=== Test 3: Flag Injection ===');
    const injectionResult = await testFlagInjection(testSessionId, vmInstance.connectionInfo, lab);
    
    // Test 4: Flag Validation
    console.log('\n=== Test 4: Flag Validation ===');
    const validationResult = await testFlagValidation(testSessionId);
    
    // Results summary
    console.log('\n🎉 Flag injection test completed!');
    console.log('\nResults Summary:');
    console.log(`✅ Flag Generation: Success`);
    console.log(`✅ VM Instance Setup: Success`);
    console.log(`${injectionResult.success ? '✅' : '❌'} Flag Injection: ${injectionResult.success ? 'Success' : 'Failed'}`);
    console.log(`${validationResult ? '✅' : '❌'} Flag Validation: ${validationResult ? 'Success' : 'Failed'}`);
    
    if (injectionResult.success && validationResult) {
      console.log('\n🎯 Flag injection system is working perfectly!');
      console.log('\nNext steps:');
      console.log('1. Run complete session workflow: node scripts/test-lampiao-workflow.js');
    } else {
      console.log('\n⚠️ Flag injection system needs attention.');
      console.log('Check SSH connectivity and VM boot status.');
    }
    
  } catch (error) {
    console.error('\n💥 Flag injection test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure VM template is imported (run test-lampiao-import.js)');
    console.error('2. Check that VirtualBox VMs can start properly');
    console.error('3. Verify SSH connectivity (default: tiago:louboutin)');
    console.error('4. Make sure no firewall is blocking SSH ports');
    process.exit(1);
  } finally {
    // Cleanup
    if (testSessionId) {
      await cleanupTest(testSessionId);
    }
    
    // Close database connection
    try {
      await mongoose.connection.close();
      console.log('\n📊 Database connection closed');
    } catch (error) {
      console.warn('Warning: Failed to close database connection:', error.message);
    }
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Flag injection test interrupted by user');
  try {
    await mongoose.connection.close();
  } catch (error) {
    // Ignore errors during cleanup
  }
  process.exit(0);
});

// Run the test
main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});