#!/usr/bin/env node

/**
 * Lampião OVF Import Test Script
 * Tests the VM provisioner's ability to import the Lampião OVF file
 */

import mongoose from 'mongoose';
import { config } from '../src/config/environment.js';
import Lab from '../src/models/Lab.js';
import VMProvisionerService from '../src/services/provisioner.service.js';

/**
 * Test VM provisioner initialization
 */
async function testProvisionerInit() {
  console.log('🔧 Testing VM provisioner initialization...');
  
  try {
    const result = await VMProvisionerService.initialize();
    console.log('✅ VM provisioner initialized successfully');
    console.log(`   Result: ${result.message}`);
    return true;
  } catch (error) {
    console.error('❌ VM provisioner initialization failed:', error.message);
    return false;
  }
}

/**
 * Test OVF import process
 */
async function testOVFImport(lab) {
  console.log(`🏗️ Testing OVF import for ${lab.name}...`);
  
  try {
    console.log(`   OVF Path: ${lab.ovfPath}`);
    console.log(`   Lab Config: ${lab.name} (${lab.difficulty})`);
    
    // Test import template
    const importResult = await VMProvisionerService.importTemplate(lab.ovfPath, {
      name: lab.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
      vmConfig: lab.vmConfig
    });
    
    if (importResult.success) {
      console.log('✅ OVF import completed successfully!');
      console.log(`   Template ID: ${importResult.templateId}`);
      console.log(`   Template Name: ${importResult.templateName}`);
      
      // Update lab with template ID
      lab.templateVmId = importResult.templateId;
      await lab.save();
      
      console.log('✅ Lab updated with template VM ID');
      return importResult;
    } else {
      console.error('❌ OVF import failed:', importResult.message);
      return null;
    }
    
  } catch (error) {
    console.error('❌ OVF import error:', error.message);
    return null;
  }
}

/**
 * Test VM template validation
 */
async function testTemplateValidation(templateId) {
  console.log('🔍 Testing template VM validation...');
  
  try {
    // Get VM info using provisioner
    const vmInfo = await VMProvisionerService.getVMInfo(templateId);
    
    if (vmInfo) {
      console.log('✅ Template VM found and validated');
      console.log(`   VM Name: ${vmInfo.name || 'N/A'}`);
      console.log(`   VM State: ${vmInfo.VMState || 'unknown'}`);
      console.log(`   Memory: ${vmInfo.memory || 'unknown'} MB`);
      console.log(`   CPUs: ${vmInfo.cpus || 'unknown'}`);
      return true;
    } else {
      console.error('❌ Template VM not found or invalid');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Template validation error:', error.message);
    return false;
  }
}

/**
 * Test instance creation from template
 */
async function testInstanceCreation(templateId) {
  console.log('🧪 Testing instance creation from template...');
  
  const testSessionId = 'test-import-' + Date.now();
  
  try {
    const instanceResult = await VMProvisionerService.createInstance(
      templateId,
      testSessionId,
      {
        userId: 'test-user',
        vmConfig: {}
      }
    );
    
    if (instanceResult.success) {
      console.log('✅ Test instance created successfully!');
      console.log(`   Instance ID: ${instanceResult.instanceId}`);
      console.log(`   Instance Name: ${instanceResult.instanceName}`);
      console.log(`   SSH Port: ${instanceResult.networkConfig.sshPort}`);
      console.log(`   Web Port: ${instanceResult.networkConfig.webPort}`);
      
      // Clean up test instance
      try {
        console.log('🧹 Cleaning up test instance...');
        await VMProvisionerService.deleteInstance(testSessionId);
        console.log('✅ Test instance cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Test instance cleanup warning:', cleanupError.message);
      }
      
      return instanceResult;
    } else {
      console.error('❌ Test instance creation failed');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Instance creation error:', error.message);
    
    // Attempt cleanup on error
    try {
      await VMProvisionerService.deleteInstance(testSessionId);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    return null;
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('🚀 Starting Lampião OVF Import Test...\n');
  
  try {
    // Connect to database
    console.log('📊 Connecting to database...');
    await mongoose.connect(config.database.mongoUri);
    console.log('✅ Database connected');
    
    // Find Lampião lab
    console.log('\n🔍 Finding Lampião lab...');
    const lab = await Lab.findOne({ name: 'Lampião Vulnerable Linux VM' });
    
    if (!lab) {
      throw new Error('Lampião lab not found. Please run register-lampiao-lab.js first.');
    }
    
    console.log('✅ Lampião lab found');
    console.log(`   Lab ID: ${lab._id}`);
    console.log(`   OVF Path: ${lab.ovfPath}`);
    
    // Test 1: VM Provisioner Initialization
    console.log('\n=== Test 1: VM Provisioner Initialization ===');
    const provisionerReady = await testProvisionerInit();
    if (!provisionerReady) {
      throw new Error('VM provisioner initialization failed');
    }
    
    // Test 2: OVF Import
    console.log('\n=== Test 2: OVF Import Process ===');
    const importResult = await testOVFImport(lab);
    if (!importResult) {
      throw new Error('OVF import failed');
    }
    
    // Test 3: Template Validation
    console.log('\n=== Test 3: Template VM Validation ===');
    const templateValid = await testTemplateValidation(importResult.templateId);
    if (!templateValid) {
      console.warn('⚠️ Template validation failed, but import may still be functional');
    }
    
    // Test 4: Instance Creation Test
    console.log('\n=== Test 4: Instance Creation Test ===');
    const instanceResult = await testInstanceCreation(importResult.templateId);
    if (!instanceResult) {
      console.warn('⚠️ Instance creation test failed, but template import was successful');
    }
    
    console.log('\n🎉 Lampião OVF import test completed successfully!');
    console.log('\nResults Summary:');
    console.log(`✅ VM Provisioner: ${provisionerReady ? 'Ready' : 'Failed'}`);
    console.log(`✅ OVF Import: ${importResult ? 'Success' : 'Failed'}`);
    console.log(`${templateValid ? '✅' : '⚠️'} Template Validation: ${templateValid ? 'Valid' : 'Warning'}`);
    console.log(`${instanceResult ? '✅' : '⚠️'} Instance Creation: ${instanceResult ? 'Success' : 'Warning'}`);
    
    if (importResult) {
      console.log('\nNext steps:');
      console.log('1. Run flag injection test: node scripts/test-flag-injection.js');
      console.log('2. Run complete session workflow: node scripts/test-lampiao-workflow.js');
    }
    
  } catch (error) {
    console.error('\n💥 Import test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure VirtualBox is installed and VBoxManage is in PATH');
    console.error('2. Check that the Lampião OVF file exists and is readable');
    console.error('3. Verify database connectivity');
    console.error('4. Make sure no other VMs with the same name exist');
    process.exit(1);
  } finally {
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
  console.log('\n🛑 Import test interrupted by user');
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