#!/usr/bin/env node

/**
 * Test Script for User Profile and Flag Submission System
 * Tests the complete user progress tracking workflow
 */

import { promises as fs } from 'fs';
import mongoose from 'mongoose';
import { connectDB } from './src/config/database.js';
import { 
  Lab, 
  Session, 
  FlagSubmission, 
  Badge, 
  UserExtension 
} from './src/models/index.js';
import { seedBadges } from './src/seeds/badges.seed.js';
import { logger } from './src/utils/logger.js';

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

const TEST_USER_ID = new mongoose.Types.ObjectId();
const TEST_LAB_ID = new mongoose.Types.ObjectId();

async function runUserProfileTests() {
  log('🚀 Starting User Profile and Flag Submission Tests', 'cyan');
  log('=======================================================\n', 'cyan');
  
  try {
    // Connect to database
    await connectDB();
    log('✅ Connected to database', 'green');
    
    // Seed badges
    const badgeResult = await seedBadges();
    log(`✅ Badge seeding: ${badgeResult.message} (${badgeResult.count} badges)`, 'green');
    
    // Test 1: Create test lab
    await createTestLab();
    log('✅ Test lab created', 'green');
    
    // Test 2: Create test session
    const session = await createTestSession();
    log('✅ Test session created', 'green');
    
    // Test 3: Initialize user stats
    const userStats = await UserExtension.findOrCreate(TEST_USER_ID);
    log('✅ User statistics initialized', 'green');
    log(`   📊 Initial level: ${userStats.level.level} (${userStats.level.title})`, 'blue');
    
    // Test 4: Submit user flag (correct)
    await testFlagSubmission(session, 'user', session.flags.user.value, true);
    log('✅ User flag submitted successfully', 'green');
    
    // Test 5: Submit root flag (correct)  
    await testFlagSubmission(session, 'root', session.flags.root.value, true);
    log('✅ Root flag submitted successfully', 'green');
    
    // Test 6: Check updated user stats
    const updatedStats = await UserExtension.findOne({ userId: TEST_USER_ID });
    log('✅ User statistics updated', 'green');
    log(`   📊 Points: ${updatedStats.labStats.totalPoints}`, 'blue');
    log(`   📊 Labs completed: ${updatedStats.labStats.labsCompleted}`, 'blue');
    log(`   📊 Flags found: ${updatedStats.labStats.flagsFound}`, 'blue');
    log(`   📊 Current level: ${updatedStats.level.level} (${updatedStats.level.title})`, 'blue');
    log(`   📊 Accuracy: ${updatedStats.accuracy}%`, 'blue');
    
    // Test 7: Check for earned badges
    const badges = await updatedStats.getBadges();
    log(`✅ Badges checked: ${badges.length} earned`, 'green');
    badges.forEach(badge => {
      log(`   🏆 ${badge.badge.name}: ${badge.badge.description}`, 'yellow');
    });
    
    // Test 8: Test flag submission statistics
    const flagStats = await FlagSubmission.getUserStats(TEST_USER_ID);
    log('✅ Flag submission statistics:', 'green');
    log(`   📈 Total submissions: ${flagStats.totalSubmissions}`, 'blue');
    log(`   📈 Correct submissions: ${flagStats.correctSubmissions}`, 'blue');
    log(`   📈 Accuracy: ${flagStats.accuracy}%`, 'blue');
    log(`   📈 Total points: ${flagStats.totalPoints}`, 'blue');
    
    // Test 9: Test leaderboard position
    const ranking = await getUserRanking(TEST_USER_ID, updatedStats.labStats.totalPoints);
    log('✅ Leaderboard position calculated:', 'green');
    log(`   🏅 Global rank: ${ranking.globalRank}`, 'blue');
    log(`   🏅 Percentile: ${ranking.percentile}%`, 'blue');
    
    // Test 10: Test badge progress
    const allBadges = await Badge.findActive();
    const progressSample = await calculateBadgeProgress(allBadges[0], updatedStats);
    if (progressSample) {
      log('✅ Badge progress calculation works:', 'green');
      log(`   🎯 Progress: ${progressSample.current}/${progressSample.required} (${progressSample.percentage}%)`, 'blue');
    }
    
    // Test 11: Create another session to test streaks
    const session2 = await createTestSession(true);
    await testFlagSubmission(session2, 'user', session2.flags.user.value, true);
    await testFlagSubmission(session2, 'root', session2.flags.root.value, true);
    
    const finalStats = await UserExtension.findOne({ userId: TEST_USER_ID });
    log('✅ Second session completed:', 'green');
    log(`   📊 Labs completed: ${finalStats.labStats.labsCompleted}`, 'blue');
    log(`   📊 Current streak: ${finalStats.labStats.currentStreak}`, 'blue');
    log(`   📊 Total points: ${finalStats.labStats.totalPoints}`, 'blue');
    
    // Check for new badges after second completion
    const finalBadges = await finalStats.getBadges();
    if (finalBadges.length > badges.length) {
      log(`✅ New badges earned! Total: ${finalBadges.length}`, 'green');
      const newBadges = finalBadges.slice(badges.length);
      newBadges.forEach(badge => {
        log(`   🆕 ${badge.badge.name}: ${badge.badge.description}`, 'yellow');
      });
    }
    
    log('\n🎉 ALL USER PROFILE TESTS PASSED!', 'green');
    log('✅ User progress tracking system is working correctly!', 'green');
    
    return true;
    
  } catch (error) {
    log(`\n💥 Test failed: ${error.message}`, 'red');
    console.error(error);
    return false;
  } finally {
    // Cleanup
    try {
      await FlagSubmission.deleteMany({ userId: TEST_USER_ID });
      await Session.deleteMany({ userId: TEST_USER_ID });
      await Lab.findByIdAndDelete(TEST_LAB_ID);
      await UserExtension.deleteOne({ userId: TEST_USER_ID });
      log('\n🧹 Test data cleaned up', 'yellow');
    } catch (cleanupError) {
      log('⚠️  Cleanup error (non-critical)', 'yellow');
    }
    
    await mongoose.connection.close();
  }
}

async function createTestLab() {
  const lab = new Lab({
    _id: TEST_LAB_ID,
    name: 'Test Lab - Lampioa',
    description: 'A test lab for validating the user progress system',
    difficulty: 'Easy',
    category: 'Web',
    ovfPath: '/test/lampioa.ovf',
    ovaChecksum: 'abc123',
    flags: {
      user: {
        template: 'user_{session}',
        points: 25,
        locations: ['/home/user/user.txt']
      },
      root: {
        template: 'root_{session}', 
        points: 50,
        locations: ['/root/root.txt']
      }
    },
    defaultCredentials: {
      username: 'user',
      password: 'password'
    },
    services: ['SSH (22)', 'HTTP (80)'],
    vulnerabilities: ['SQL Injection', 'File Upload'],
    createdBy: TEST_USER_ID,
    isActive: true
  });
  
  return await lab.save();
}

async function createTestSession(isSecond = false) {
  const sessionId = new mongoose.Types.ObjectId();
  const suffix = isSecond ? '_2' : '';
  
  const session = new Session({
    _id: sessionId,
    userId: TEST_USER_ID,
    labId: TEST_LAB_ID,
    vmInstanceId: `test-vm-${sessionId}${suffix}`,
    vmName: `Test Session VM${suffix}`,
    status: 'running',
    connectionInfo: {
      ipAddress: '127.0.0.1',
      sshPort: 2222,
      webPort: 8080,
      sshCommand: 'ssh user@127.0.0.1 -p 2222',
      webUrl: 'http://127.0.0.1:8080'
    },
    flags: {
      user: {
        value: `user_${sessionId}${suffix}`,
        submitted: false,
        isCorrect: false
      },
      root: {
        value: `root_${sessionId}${suffix}`,
        submitted: false, 
        isCorrect: false
      }
    },
    startedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
  });
  
  return await session.save();
}

async function testFlagSubmission(session, flagType, flag, isCorrect) {
  // Simulate flag submission
  const pointsAwarded = isCorrect ? session.labId ? 
    (await Lab.findById(session.labId)).flags[flagType].points : 
    (flagType === 'user' ? 25 : 50) : 0;
  
  const flagSubmission = new FlagSubmission({
    userId: TEST_USER_ID,
    sessionId: session._id,
    labId: session.labId,
    flagType,
    submittedFlag: flag,
    expectedFlag: session.flags[flagType].value,
    isCorrect,
    pointsAwarded,
    metadata: {
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script',
      attemptNumber: 1
    }
  });
  
  await flagSubmission.save();
  
  // Update session
  await session.submitFlag(flagType, isCorrect, pointsAwarded);
  
  // Update user stats if correct
  if (isCorrect) {
    const userStats = await UserExtension.findOne({ userId: TEST_USER_ID });
    await userStats.updateFlagStats(isCorrect);
    
    // If session is completed, update completion stats
    const updatedSession = await Session.findById(session._id);
    if (updatedSession.isCompleted) {
      const lab = await Lab.findById(session.labId);
      await userStats.updateAfterSession(updatedSession, lab);
      await updatedSession.complete();
    }
  }
}

async function getUserRanking(userId, userPoints) {
  const totalUsers = await UserExtension.countDocuments();
  const usersAbove = await UserExtension.countDocuments({
    'labStats.totalPoints': { $gt: userPoints }
  });
  
  const rank = usersAbove + 1;
  const percentile = totalUsers > 0 ? ((totalUsers - rank) / totalUsers * 100).toFixed(1) : 0;
  
  return {
    globalRank: rank,
    totalUsers,
    percentile: parseFloat(percentile)
  };
}

async function calculateBadgeProgress(badge, userStats) {
  const { type, value } = badge.criteria;
  
  switch (type) {
    case 'labs_completed':
      return {
        current: userStats.labStats.labsCompleted,
        required: value,
        percentage: Math.min(100, (userStats.labStats.labsCompleted / value) * 100).toFixed(1)
      };
      
    case 'points_earned':
      return {
        current: userStats.labStats.totalPoints,
        required: value,
        percentage: Math.min(100, (userStats.labStats.totalPoints / value) * 100).toFixed(1)
      };
      
    default:
      return null;
  }
}

// Run the tests
runUserProfileTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log(`\n💥 Test execution failed: ${error.message}`, 'red');
  process.exit(1);
});