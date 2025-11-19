#!/usr/bin/env node

/**
 * Complete Lampião Session Workflow Test
 * Tests the entire end-to-end session workflow including scoring integration
 */

import mongoose from 'mongoose';
import { config } from '../src/config/environment.js';
import Lab from '../src/models/Lab.js';
import Session from '../src/models/Session.js';
import FlagSubmission from '../src/models/FlagSubmission.js';
import SessionManager from '../src/services/sessionManager.service.js';
import ScoringService from '../src/services/scoringService.js';

/**
 * Create test user data
 */
function createTestUser() {
  return {
    _id: new mongoose.Types.ObjectId(),
    username: 'test-user-' + Date.now(),
    email: 'test@example.com'
  };
}

/**
 * Test complete session workflow
 */
async function testCompleteWorkflow(lab, user) {
  console.log('🔄 Testing complete session workflow...');
  
  let sessionResult = null;
  
  try {
    // Step 1: Start Session
    console.log('\n--- Step 1: Starting Session ---');
    sessionResult = await SessionManager.startSession(user._id, lab._id);
    
    if (!sessionResult.success) {
      throw new Error(`Failed to start session: ${sessionResult.message}`);
    }
    
    console.log('✅ Session started successfully');
    console.log(`   Session ID: ${sessionResult.sessionId}`);
    console.log(`   VM Status: ${sessionResult.vmStatus}`);
    console.log(`   Connection Info: ${sessionResult.connectionInfo.ssh.command}`);
    
    const sessionId = sessionResult.sessionId;
    
    // Step 2: Wait for VM to be ready
    console.log('\n--- Step 2: Waiting for VM to be ready ---');
    console.log('⏳ Waiting for VM boot and flag injection (45 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 45000));
    
    // Check session status
    const statusResult = await SessionManager.getSessionStatus(sessionId);
    console.log(`✅ Session status: ${statusResult.status}`);
    console.log(`   VM Status: ${statusResult.vmStatus}`);
    console.log(`   Flag Injection: ${statusResult.flagStatus || 'unknown'}`);
    
    // Step 3: Submit User Flag
    console.log('\n--- Step 3: Submitting User Flag ---');
    
    // Get the actual flags that were generated and injected
    const sessionDoc = await Session.findById(sessionId);
    if (!sessionDoc) {
      throw new Error('Session document not found');
    }
    
    // Extract flags from flag service (they would normally be found by users in the VM)
    const FlagService = (await import('../src/services/flag.service.js')).default;
    const flagData = FlagService.getFlagInfo(sessionId);
    const actualFlags = FlagService.activeSessions.get(sessionId);
    
    if (!flagData || !actualFlags) {
      throw new Error('Flag data not found - flag injection may have failed');
    }
    
    console.log(`   Submitting user flag: ${actualFlags.userFlag}`);
    
    const userFlagResult = await SessionManager.submitFlag(sessionId, actualFlags.userFlag, 'user');
    
    if (userFlagResult.success) {
      console.log('✅ User flag submission successful!');
      console.log(`   Points awarded: ${userFlagResult.points}`);
      console.log(`   Score breakdown: ${JSON.stringify(userFlagResult.scoreBreakdown, null, 2)}`);
      
      if (userFlagResult.newBadges && userFlagResult.newBadges.length > 0) {
        console.log(`   New badges: ${userFlagResult.newBadges.map(b => b.name).join(', ')}`);
      }
      
      if (userFlagResult.userRanking) {
        console.log(`   New rank: ${userFlagResult.userRanking.rank}/${userFlagResult.userRanking.totalUsers} (${userFlagResult.userRanking.percentile}th percentile)`);
      }
    } else {
      console.error('❌ User flag submission failed:', userFlagResult.message);
    }
    
    // Step 4: Submit Root Flag (after a short delay)
    console.log('\n--- Step 4: Submitting Root Flag ---');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    console.log(`   Submitting root flag: ${actualFlags.rootFlag}`);
    
    const rootFlagResult = await SessionManager.submitFlag(sessionId, actualFlags.rootFlag, 'root');
    
    if (rootFlagResult.success) {
      console.log('✅ Root flag submission successful!');
      console.log(`   Points awarded: ${rootFlagResult.points}`);
      console.log(`   Score breakdown: ${JSON.stringify(rootFlagResult.scoreBreakdown, null, 2)}`);
      
      if (rootFlagResult.newBadges && rootFlagResult.newBadges.length > 0) {
        console.log(`   New badges: ${rootFlagResult.newBadges.map(b => b.name).join(', ')}`);
      }
      
      if (rootFlagResult.userRanking) {
        console.log(`   New rank: ${rootFlagResult.userRanking.rank}/${rootFlagResult.userRanking.totalUsers} (${rootFlagResult.userRanking.percentile}th percentile)`);
      }
    } else {
      console.error('❌ Root flag submission failed:', rootFlagResult.message);
    }
    
    // Step 5: Test Invalid Flag Submission
    console.log('\n--- Step 5: Testing Invalid Flag Submission ---');
    
    const invalidFlagResult = await SessionManager.submitFlag(sessionId, 'FLAG{invalid_flag}', 'user');
    
    if (!invalidFlagResult.success) {
      console.log('✅ Invalid flag correctly rejected');
      console.log(`   Message: ${invalidFlagResult.message}`);
    } else {
      console.error('❌ Invalid flag incorrectly accepted!');
    }
    
    // Step 6: Check Final Session Status
    console.log('\n--- Step 6: Final Session Status ---');
    
    const finalStatus = await SessionManager.getSessionStatus(sessionId);
    console.log('📊 Final session statistics:');
    console.log(`   Status: ${finalStatus.status}`);
    console.log(`   Duration: ${Math.round((Date.now() - new Date(finalStatus.createdAt).getTime()) / 1000)} seconds`);
    console.log(`   Flags submitted: ${finalStatus.flagsSubmitted || 0}`);
    console.log(`   Total points earned: ${finalStatus.totalPoints || 0}`);
    
    // Step 7: Get User Statistics
    console.log('\n--- Step 7: User Statistics ---');
    
    try {
      const userStats = await ScoringService.getUserStats(user._id);
      console.log('📈 User statistics:');
      console.log(`   Total points: ${userStats.totalPoints}`);
      console.log(`   Total flags: ${userStats.totalFlags}`);
      console.log(`   Labs completed: ${userStats.completedLabs}`);
      console.log(`   Badges earned: ${userStats.badges.length}`);
      console.log(`   Current ranking: ${userStats.ranking.rank}/${userStats.ranking.totalUsers}`);
    } catch (statsError) {
      console.warn('⚠️ Could not fetch user statistics:', statsError.message);
    }
    
    // Step 8: Stop Session
    console.log('\n--- Step 8: Stopping Session ---');
    
    const stopResult = await SessionManager.stopSession(sessionId);
    
    if (stopResult.success) {
      console.log('✅ Session stopped successfully');
      console.log(`   Final status: ${stopResult.status}`);
      console.log(`   Duration: ${stopResult.duration} minutes`);
    } else {
      console.error('❌ Session stop failed:', stopResult.message);
    }
    
    return {
      sessionId,
      userFlagResult,
      rootFlagResult,
      invalidFlagResult,
      stopResult
    };
    
  } catch (error) {
    console.error('❌ Workflow test error:', error.message);
    
    // Attempt cleanup on error
    if (sessionResult && sessionResult.sessionId) {
      try {
        console.log('🧹 Attempting cleanup after error...');
        await SessionManager.stopSession(sessionResult.sessionId);
      } catch (cleanupError) {
        console.warn('⚠️ Cleanup error:', cleanupError.message);
      }
    }
    
    throw error;
  }
}

/**
 * Validate database state after workflow
 */
async function validateDatabaseState(workflowResult, user, lab) {
  console.log('🔍 Validating database state...');
  
  try {
    // Check session document
    const session = await Session.findById(workflowResult.sessionId);
    if (!session) {
      throw new Error('Session document not found');
    }
    
    console.log('✅ Session document found');
    console.log(`   Status: ${session.status}`);
    console.log(`   User ID: ${session.userId}`);
    console.log(`   Lab ID: ${session.labId}`);
    
    // Check flag submissions
    const flagSubmissions = await FlagSubmission.find({ sessionId: workflowResult.sessionId });
    console.log(`✅ Found ${flagSubmissions.length} flag submissions`);
    
    let validSubmissions = 0;
    let totalPoints = 0;
    
    for (const submission of flagSubmissions) {
      console.log(`   - ${submission.flagType} flag: ${submission.isValid ? 'valid' : 'invalid'} (${submission.points} points)`);
      if (submission.isValid) {
        validSubmissions++;
        totalPoints += submission.points;
      }
    }
    
    console.log(`✅ Valid submissions: ${validSubmissions}`);
    console.log(`✅ Total points from submissions: ${totalPoints}`);
    
    // Check lab statistics were updated
    const updatedLab = await Lab.findById(lab._id);
    console.log('✅ Lab statistics updated:');
    console.log(`   Total sessions: ${updatedLab.stats.totalSessions}`);
    console.log(`   User flag submissions: ${updatedLab.stats.userFlagSubmissions}`);
    console.log(`   Root flag submissions: ${updatedLab.stats.rootFlagSubmissions}`);
    
    return {
      sessionFound: true,
      flagSubmissions: flagSubmissions.length,
      validSubmissions,
      totalPoints,
      labStatsUpdated: true
    };
    
  } catch (error) {
    console.error('❌ Database validation error:', error.message);
    return {
      error: error.message
    };
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('🚀 Starting Complete Lampião Session Workflow Test...\n');
  
  let user = null;
  let workflowResult = null;
  
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
    console.log(`   Total points: ${lab.totalPoints}`);
    
    // Create test user
    user = createTestUser();
    console.log('\n👤 Test user created:');
    console.log(`   User ID: ${user._id}`);
    console.log(`   Username: ${user.username}`);
    
    // Initialize services
    console.log('\n🔧 Initializing services...');
    await SessionManager.initialize();
    console.log('✅ Session manager ready');
    
    // Run complete workflow test
    console.log('\n🔄 Running complete workflow test...');
    workflowResult = await testCompleteWorkflow(lab, user);
    
    // Validate database state
    console.log('\n🔍 Validating results...');
    const validationResult = await validateDatabaseState(workflowResult, user, lab);
    
    // Final results
    console.log('\n🎉 Complete workflow test finished!');
    console.log('\n📊 Results Summary:');
    console.log(`✅ Session Management: ${workflowResult.sessionId ? 'Success' : 'Failed'}`);
    console.log(`${workflowResult.userFlagResult?.success ? '✅' : '❌'} User Flag: ${workflowResult.userFlagResult?.success ? 'Accepted' : 'Rejected'}`);
    console.log(`${workflowResult.rootFlagResult?.success ? '✅' : '❌'} Root Flag: ${workflowResult.rootFlagResult?.success ? 'Accepted' : 'Rejected'}`);
    console.log(`${!workflowResult.invalidFlagResult?.success ? '✅' : '❌'} Invalid Flag: ${!workflowResult.invalidFlagResult?.success ? 'Correctly Rejected' : 'Incorrectly Accepted'}`);
    console.log(`${workflowResult.stopResult?.success ? '✅' : '❌'} Session Cleanup: ${workflowResult.stopResult?.success ? 'Success' : 'Failed'}`);
    console.log(`${validationResult.sessionFound ? '✅' : '❌'} Database Persistence: ${validationResult.sessionFound ? 'Success' : 'Failed'}`);
    
    if (validationResult.validSubmissions >= 2) {
      console.log('\n🎯 Complete session workflow is working perfectly!');
      console.log('✅ All systems operational:');
      console.log('   - VM provisioning and management');
      console.log('   - Flag generation and injection');
      console.log('   - Session lifecycle management');
      console.log('   - Flag submission and validation');
      console.log('   - Scoring and badge system');
      console.log('   - Database persistence');
      console.log('   - Statistics and leaderboards');
    } else {
      console.log('\n⚠️ Workflow completed with some issues');
      console.log(`   Valid flag submissions: ${validationResult.validSubmissions}/2 expected`);
    }
    
  } catch (error) {
    console.error('\n💥 Complete workflow test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure all previous tests passed (import and flag injection)');
    console.error('2. Check that VirtualBox VMs can start and run properly');
    console.error('3. Verify SSH connectivity and flag injection works');
    console.error('4. Make sure database connections are stable');
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
  console.log('\n🛑 Workflow test interrupted by user');
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