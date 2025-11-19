#!/usr/bin/env node

/**
 * Lampião Vulnerable VM Lab Registration Script
 * Registers the Lampião lab in the database with proper configuration
 */

import mongoose from 'mongoose';
import path from 'path';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import { config } from '../src/config/environment.js';
import Lab from '../src/models/Lab.js';

// Lampião lab configuration
const LAMPIAO_CONFIG = {
  name: 'Lampião Vulnerable Linux VM',
  description: `A vulnerable Linux VM designed for penetration testing practice. Features multiple vulnerabilities including SSH brute-force, privilege escalation, web exploitation, and network enumeration challenges. Great for beginners learning Linux security assessment.`,
  difficulty: 'Easy',
  category: 'Binary',
  
  // File paths (adjust based on actual location)
  ovfPath: path.join(process.cwd(), 'Lampiao', 'Lampiao.ovf'),
  
  // Flag configuration
  flags: {
    user: {
      template: 'FLAG{user_lampiao_{session}_{timestamp}}',
      points: 25,
      locations: ['/home/tiago/user.txt', '/tmp/user.txt']
    },
    root: {
      template: 'FLAG{root_lampiao_{session}_{timestamp}}',
      points: 50,
      locations: ['/root/root.txt', '/tmp/root.txt']
    }
  },
  
  // VM configuration
  vmConfig: {
    ram: 1024,
    cpu: 1,
    network: 'nat',
    diskSize: 20
  },
  
  // Default SSH credentials for Lampião
  defaultCredentials: {
    username: 'tiago',
    password: 'louboutin'
  },
  
  // Services available on the VM
  services: [
    'SSH (22)',
    'Apache HTTP (80)', 
    'Drupal CMS',
    'FTP (21)',
    'MySQL (3306)'
  ],
  
  // Known vulnerabilities
  vulnerabilities: [
    'SSH Weak Password',
    'Drupal 7 SQL Injection (CVE-2014-3704)',
    'Local Privilege Escalation',
    'Plaintext Password Storage',
    'Apache Configuration Issues'
  ],
  
  estimatedSolveTime: '1-2 hours',
  isActive: true
};

/**
 * Calculate file checksum
 */
async function calculateChecksum(filePath) {
  try {
    const data = await fs.readFile(filePath);
    return crypto.createHash('md5').update(data).digest('hex');
  } catch (error) {
    console.warn(`Could not calculate checksum for ${filePath}:`, error.message);
    return 'unknown';
  }
}

/**
 * Verify OVF file exists
 */
async function verifyOVFFile(ovfPath) {
  try {
    const stats = await fs.stat(ovfPath);
    console.log(`✅ OVF file found: ${ovfPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    return true;
  } catch (error) {
    console.error(`❌ OVF file not found: ${ovfPath}`);
    console.error('Please ensure the Lampião OVF file is in the correct location.');
    return false;
  }
}

/**
 * Connect to MongoDB
 */
async function connectDatabase() {
  try {
    await mongoose.connect(config.database.mongoUri);
    console.log('📊 Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    return false;
  }
}

/**
 * Register or update Lampião lab
 */
async function registerLampiaoLab() {
  try {
    console.log('🔍 Checking if Lampião lab already exists...');
    
    // Check if lab already exists
    let lab = await Lab.findOne({ name: LAMPIAO_CONFIG.name });
    
    if (lab) {
      console.log('📝 Lampião lab already exists, updating configuration...');
      
      // Update existing lab with new configuration
      Object.assign(lab, LAMPIAO_CONFIG);
      lab.ovaChecksum = await calculateChecksum(LAMPIAO_CONFIG.ovfPath);
      lab = await lab.save();
      
      console.log('✅ Lampião lab updated successfully!');
    } else {
      console.log('🆕 Creating new Lampião lab entry...');
      
      // Create checksum
      const checksum = await calculateChecksum(LAMPIAO_CONFIG.ovfPath);
      
      // Create admin user reference (for demo, using a placeholder)
      // In production, this should reference an actual admin user
      const adminUserId = new mongoose.Types.ObjectId();
      
      // Create new lab
      lab = new Lab({
        ...LAMPIAO_CONFIG,
        ovaChecksum: checksum,
        createdBy: adminUserId,
        stats: {
          totalSessions: 0,
          totalCompletions: 0,
          averageCompletionTime: 0,
          userFlagSubmissions: 0,
          rootFlagSubmissions: 0
        },
        rating: {
          average: 0,
          count: 0
        }
      });
      
      lab = await lab.save();
      console.log('✅ Lampião lab registered successfully!');
    }
    
    // Display lab information
    console.log('\n📋 Lab Information:');
    console.log(`   Lab ID: ${lab._id}`);
    console.log(`   Name: ${lab.name}`);
    console.log(`   Difficulty: ${lab.difficulty}`);
    console.log(`   Category: ${lab.category}`);
    console.log(`   OVF Path: ${lab.ovfPath}`);
    console.log(`   Checksum: ${lab.ovaChecksum}`);
    console.log(`   SSH Credentials: ${lab.defaultCredentials.username}:${lab.defaultCredentials.password}`);
    console.log(`   User Flag Points: ${lab.flags.user.points}`);
    console.log(`   Root Flag Points: ${lab.flags.root.points}`);
    console.log(`   Total Points: ${lab.totalPoints}`);
    
    return lab;
    
  } catch (error) {
    console.error('❌ Failed to register Lampião lab:', error.message);
    throw error;
  }
}

/**
 * Main registration function
 */
async function main() {
  console.log('🚀 Starting Lampião Lab Registration...\n');
  
  try {
    // Step 1: Verify OVF file
    console.log('Step 1: Verifying OVF file...');
    const ovfExists = await verifyOVFFile(LAMPIAO_CONFIG.ovfPath);
    if (!ovfExists) {
      throw new Error('OVF file verification failed');
    }
    
    // Step 2: Connect to database
    console.log('\nStep 2: Connecting to database...');
    const dbConnected = await connectDatabase();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    
    // Step 3: Register lab
    console.log('\nStep 3: Registering lab...');
    const lab = await registerLampiaoLab();
    
    console.log('\n🎉 Lampião lab registration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run OVF import test: node scripts/test-lampiao-import.js');
    console.log('2. Run flag injection test: node scripts/test-flag-injection.js');
    console.log('3. Run complete session workflow: node scripts/test-lampiao-workflow.js');
    
  } catch (error) {
    console.error('\n💥 Registration failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    try {
      await mongoose.connection.close();
      console.log('📊 Database connection closed');
    } catch (error) {
      console.warn('Warning: Failed to close database connection:', error.message);
    }
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Registration interrupted by user');
  try {
    await mongoose.connection.close();
  } catch (error) {
    // Ignore errors during cleanup
  }
  process.exit(0);
});

// Run the registration
main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});

export { registerLampiaoLab, LAMPIAO_CONFIG };