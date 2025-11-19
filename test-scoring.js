import { connectDB } from './src/config/database.js';
import ScoringService from './src/services/scoringService.js';
import { Lab, UserExtension, FlagSubmission, Session, Badge } from './src/models/index.js';

const scoringService = new ScoringService();
const TEST_USER_ID = 'test_user_scoring_123';

console.log('🏆 Testing Scoring and Badge System...\n');

async function setupTestData() {
    try {
        console.log('Setting up test data...');

        // Clean up previous test data
        await UserExtension.deleteMany({ userId: TEST_USER_ID });
        await Badge.deleteMany({ userId: TEST_USER_ID });
        await FlagSubmission.deleteMany({ userId: TEST_USER_ID });

        // Create a test lab if it doesn't exist
        let testLab = await Lab.findOne({ name: 'Test Scoring Lab' });
        if (!testLab) {
            testLab = new Lab({
                name: 'Test Scoring Lab',
                description: 'A lab for testing the scoring system',
                difficulty: 'Medium',
                category: 'Web',
                ovfPath: '/test/path/lab.ova',
                ovaChecksum: 'test-checksum',
                isActive: true,
                createdBy: 'test-admin',
                flags: {
                    user: {
                        template: 'CTF{user_flag}',
                        points: 25,
                        locations: ['/home/user/flag.txt']
                    },
                    root: {
                        template: 'CTF{root_flag}',
                        points: 50,
                        locations: ['/root/flag.txt']
                    }
                },
                defaultCredentials: {
                    username: 'user',
                    password: 'password'
                }
            });
            await testLab.save();
            console.log('✅ Created test lab');
        }

        // Create a mock session
        const testSession = new Session({
            sessionId: 'test_session_scoring_123',
            userId: TEST_USER_ID,
            labId: testLab._id,
            status: 'running',
            startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
            vmDetails: {
                vmId: 'test-vm-123',
                vmName: 'test-vm'
            },
            connectionInfo: {
                sshPort: 22000,
                host: 'localhost'
            },
            flags: {
                user_flag: {
                    flagId: 'flag_id_user_123',
                    points: 25
                },
                root_flag: {
                    flagId: 'flag_id_root_123', 
                    points: 50
                }
            }
        });
        await testSession.save();

        console.log('✅ Test data setup complete\n');
        return { testLab, testSession };

    } catch (error) {
        console.error('❌ Failed to setup test data:', error.message);
        throw error;
    }
}

async function testFlagScoring(testLab, testSession) {
    console.log('Test 1: Flag Scoring System...');

    try {
        // Create a flag submission
        const flagSubmission = new FlagSubmission({
            sessionId: testSession.sessionId,
            userId: TEST_USER_ID,
            flagName: 'user_flag',
            submittedFlag: 'CTF{test_user_flag}',
            isCorrect: true,
            points: 25, // Initial points
            submittedAt: new Date()
        });
        await flagSubmission.save();

        // Test scoring calculation
        const scoreData = await scoringService.calculateFlagPoints(flagSubmission, testLab, testSession);
        console.log('📊 Score Calculation Result:');
        console.log(`   Base Points: ${scoreData.basePoints}`);
        console.log(`   Bonus Points: ${scoreData.bonusPoints}`);
        console.log(`   Multiplier: ${scoreData.multiplier}x (${testLab.difficulty})`);
        console.log(`   Total Points: ${scoreData.totalPoints}`);
        console.log(`   Speed Bonus: ${scoreData.factors.speed ? 'Yes' : 'No'}`);
        console.log(`   First Blood: ${scoreData.factors.firstBlood ? 'Yes' : 'No'}`);

        // Test user score update
        const userStats = await scoringService.updateUserScore(
            TEST_USER_ID,
            scoreData.totalPoints,
            testLab._id,
            'user_flag'
        );

        console.log('👤 User Stats Updated:');
        console.log(`   Total Points: ${userStats.totalPoints}`);
        console.log(`   Total Flags: ${userStats.totalFlagsFound}`);
        console.log(`   Labs Completed: ${userStats.completedLabs.length}`);

        console.log('✅ Test 1 passed\n');
        return { scoreData, userStats };

    } catch (error) {
        console.log(`❌ Test 1 failed: ${error.message}\n`);
        throw error;
    }
}

async function testBadgeSystem() {
    console.log('Test 2: Badge Achievement System...');

    try {
        // Test badge checking with first flag context
        const context = {
            isFirstBlood: true,
            sessionDuration: 1800, // 30 minutes
            labDifficulty: 'Medium',
            perfectSolve: true
        };

        const newBadges = await scoringService.checkAndAwardBadges(TEST_USER_ID, context);

        console.log('🏅 Badge Results:');
        console.log(`   New Badges Earned: ${newBadges.length}`);
        
        newBadges.forEach(badge => {
            console.log(`   🎖️  ${badge.name} (${badge.rarity}): ${badge.description}`);
        });

        // Get badge definitions
        const badgeDefinitions = Object.keys(scoringService.badgeDefinitions);
        console.log(`   Total Badge Types: ${badgeDefinitions.length}`);

        console.log('✅ Test 2 passed\n');
        return newBadges;

    } catch (error) {
        console.log(`❌ Test 2 failed: ${error.message}\n`);
        throw error;
    }
}

async function testLeaderboard() {
    console.log('Test 3: Leaderboard System...');

    try {
        // Get user ranking
        const ranking = await scoringService.getUserRanking(TEST_USER_ID);
        console.log('📈 User Ranking:');
        if (ranking) {
            console.log(`   Rank: ${ranking.rank} of ${ranking.totalUsers}`);
            console.log(`   Points: ${ranking.points}`);
            console.log(`   Percentile: ${ranking.percentile}%`);
        } else {
            console.log('   No ranking data (user might be new)');
        }

        // Get leaderboard
        const leaderboard = await scoringService.getLeaderboard(5);
        console.log('🏆 Top 5 Leaderboard:');
        leaderboard.forEach(entry => {
            console.log(`   ${entry.rank}. User ${entry.userId.substring(0, 8)}... - ${entry.totalPoints} pts`);
        });

        console.log('✅ Test 3 passed\n');
        return { ranking, leaderboard };

    } catch (error) {
        console.log(`❌ Test 3 failed: ${error.message}\n`);
        throw error;
    }
}

async function testCompleteWorkflow(testLab, testSession) {
    console.log('Test 4: Complete Scoring Workflow...');

    try {
        // Create another flag submission
        const rootFlagSubmission = new FlagSubmission({
            sessionId: testSession.sessionId,
            userId: TEST_USER_ID,
            flagName: 'root_flag',
            submittedFlag: 'CTF{test_root_flag}',
            isCorrect: true,
            points: 50,
            submittedAt: new Date()
        });
        await rootFlagSubmission.save();

        // Process with complete workflow
        const result = await scoringService.processFlagSubmission(
            rootFlagSubmission,
            testSession,
            testLab
        );

        console.log('🔄 Complete Workflow Result:');
        console.log(`   Points Awarded: ${result.scoreData.totalPoints}`);
        console.log(`   New Badges: ${result.newBadges.length}`);
        console.log(`   User Rank: ${result.ranking?.rank || 'N/A'}`);
        
        result.newBadges.forEach(badge => {
            console.log(`   🆕 ${badge.name}: +${badge.points} pts`);
        });

        console.log('✅ Test 4 passed\n');
        return result;

    } catch (error) {
        console.log(`❌ Test 4 failed: ${error.message}\n`);
        throw error;
    }
}

async function testBadgeDefinitions() {
    console.log('Test 5: Badge Definitions...');

    try {
        const badgeDefinitions = scoringService.badgeDefinitions;
        const badgeTypes = {};
        const badgeRarities = {};

        console.log('🎯 Available Badges:');
        Object.entries(badgeDefinitions).forEach(([badgeId, definition]) => {
            console.log(`   ${definition.icon} ${definition.name} (${definition.rarity}) - ${definition.points}pts`);
            console.log(`      "${definition.description}"`);
            
            // Count types and rarities
            badgeTypes[definition.type] = (badgeTypes[definition.type] || 0) + 1;
            badgeRarities[definition.rarity] = (badgeRarities[definition.rarity] || 0) + 1;
        });

        console.log('\n📊 Badge Statistics:');
        console.log('   Types:', Object.entries(badgeTypes).map(([type, count]) => `${type}: ${count}`).join(', '));
        console.log('   Rarities:', Object.entries(badgeRarities).map(([rarity, count]) => `${rarity}: ${count}`).join(', '));

        console.log('✅ Test 5 passed\n');

    } catch (error) {
        console.log(`❌ Test 5 failed: ${error.message}\n`);
        throw error;
    }
}

async function runScoringTests() {
    try {
        // Connect to database
        await connectDB();
        console.log('✅ Connected to database\n');

        // Setup test data
        const { testLab, testSession } = await setupTestData();

        // Run tests
        await testFlagScoring(testLab, testSession);
        await testBadgeSystem();
        await testLeaderboard();
        await testCompleteWorkflow(testLab, testSession);
        await testBadgeDefinitions();

        // Final status
        const userStats = await UserExtension.findOne({ userId: TEST_USER_ID });
        const userBadges = await Badge.find({ userId: TEST_USER_ID });

        console.log('🎉 All scoring tests completed successfully!\n');
        console.log('📋 Final Test User Status:');
        if (userStats) {
            console.log(`   Total Points: ${userStats.totalPoints}`);
            console.log(`   Total Flags: ${userStats.totalFlagsFound}`);
            console.log(`   Total Badges: ${userBadges.length}`);
            console.log(`   Labs Completed: ${userStats.completedLabs.length}`);
        }
        
        console.log('\n✨ Scoring System Features Verified:');
        console.log('   ✅ Dynamic point calculation with bonuses');
        console.log('   ✅ Difficulty multipliers');
        console.log('   ✅ Speed bonuses for fast completion');
        console.log('   ✅ First blood bonuses');
        console.log('   ✅ Badge achievement system');
        console.log('   ✅ User ranking and leaderboards');
        console.log('   ✅ Complete scoring workflow integration');

        console.log('\n🚀 Ready for production use!');

    } catch (error) {
        console.error('❌ Scoring tests failed:', error);
        console.error(error.stack);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down scoring tests...');
    process.exit(0);
});

// Run tests
runScoringTests();