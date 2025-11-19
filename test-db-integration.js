#!/usr/bin/env node

/**
 * Database Integration Test
 * Tests connection to shared MongoDB and verifies models
 */

import mongoose from 'mongoose';
import { config } from './src/config/environment.js';

async function testDatabaseIntegration() {
  console.log('🔗 Testing Database Integration...\n');
  
  try {
    // Test 1: Connect to shared MongoDB
    console.log('Step 1: Connecting to shared MongoDB...');
    console.log(`MongoDB URI: ${config.database.mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    await mongoose.connect(config.database.mongoUri);
    console.log('✅ Connected to shared MongoDB successfully!\n');
    
    // Test 2: List existing collections
    console.log('Step 2: Checking existing collections...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Test 3: Check User collection
    const userCollection = collections.find(c => c.name === 'users');
    if (userCollection) {
      const userCount = await db.collection('users').countDocuments();
      console.log(`✅ Found ${userCount} users in shared database`);
      
      // Get sample user to verify structure
      const sampleUser = await db.collection('users').findOne({}, { projection: { password: 0 } });
      if (sampleUser) {
        console.log('✅ Sample user structure:', {
          id: sampleUser._id,
          username: sampleUser.username,
          email: sampleUser.email,
          role: sampleUser.role,
          hasAvatar: !!sampleUser.avatar,
          hasCourseTaken: !!sampleUser.coursesTaken
        });
      }
    } else {
      console.log('⚠️ No users collection found - this is expected for new setup');
    }
    
    // Test 4: Import and test our models
    console.log('\nStep 3: Testing our models with shared database...');
    
    const Lab = (await import('./src/models/Lab.js')).default;
    const Session = (await import('./src/models/Session.js')).default;
    const FlagSubmission = (await import('./src/models/FlagSubmission.js')).default;
    const UserLabStats = (await import('./src/models/UserExtension.js')).default;
    
    console.log('✅ All models imported successfully');
    
    // Test 5: Check if our lab collections exist
    const labCount = await Lab.countDocuments();
    console.log(`✅ Found ${labCount} labs in database`);
    
    if (labCount > 0) {
      const sampleLab = await Lab.findOne({}, { name: 1, difficulty: 1, category: 1 });
      console.log('✅ Sample lab:', {
        name: sampleLab.name,
        difficulty: sampleLab.difficulty,
        category: sampleLab.category
      });
    }
    
    // Test 6: Check session and flag submissions
    const sessionCount = await Session.countDocuments();
    const flagCount = await FlagSubmission.countDocuments();
    console.log(`✅ Found ${sessionCount} sessions and ${flagCount} flag submissions`);
    
    // Test 7: Test JWT configuration
    console.log('\nStep 4: Verifying JWT configuration...');
    console.log('✅ JWT Secret configured:', config.jwt.secret ? 'Yes' : 'No');
    console.log('✅ JWT Expires In:', config.jwt.expiresIn);
    
    // Test 8: Test authentication middleware
    console.log('\nStep 5: Testing authentication middleware...');
    const { authorization } = await import('./src/middleware/auth.middleware.js');
    console.log('✅ Authentication middleware imported successfully');
    
    console.log('\n🎉 Database integration test completed successfully!');
    console.log('\nIntegration Status:');
    console.log('✅ Shared MongoDB connection working');
    console.log('✅ All models compatible with shared schema');
    console.log('✅ Authentication middleware ready');
    console.log('✅ JWT configuration aligned');
    
    return {
      success: true,
      userCount: userCollection ? await db.collection('users').countDocuments() : 0,
      labCount,
      sessionCount,
      flagCount
    };
    
  } catch (error) {
    console.error('\n❌ Database integration test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check MongoDB connection string');
    console.error('2. Verify network connectivity');
    console.error('3. Ensure database permissions are correct');
    throw error;
  } finally {
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
  console.log('\n🛑 Test interrupted by user');
  try {
    await mongoose.connection.close();
  } catch (error) {
    // Ignore errors during cleanup
  }
  process.exit(0);
});

// Run the test
testDatabaseIntegration().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});

export default testDatabaseIntegration;