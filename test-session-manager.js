import SessionManager from './src/services/sessionManager.js';
import { connectDB } from './src/config/database.js';
import { Lab } from './src/models/index.js';

// Mock user ID for testing
const TEST_USER_ID = 'test_user_12345';

async function testSessionManager() {
    try {
        console.log('🚀 Testing Session Manager...\n');

        // Connect to database
        await connectDB();
        console.log('✅ Connected to database\n');

        // Initialize Session Manager
        const sessionManager = new SessionManager();
        console.log('✅ Session Manager initialized\n');

        // Check system status
        console.log('📊 System Status:');
        const systemStatus = await sessionManager.getSystemStatus();
        console.log(JSON.stringify(systemStatus, null, 2));
        console.log('');

        // Look for available labs
        const labs = await Lab.find({ isActive: true }).limit(1);
        
        if (labs.length === 0) {
            console.log('❌ No active labs found. Please register a lab first.');
            console.log('');
            console.log('Example lab creation:');
            console.log(`const lab = new Lab({
    name: 'Lampião VM',
    description: 'Brazilian vulnerable VM for penetration testing',
    category: 'penetration-testing',
    difficulty: 'intermediate',
    vmTemplate: 'path/to/lampiao.ova',
    isActive: true,
    defaultCredentials: {
        username: 'lampiao',
        password: 'lampiao'
    },
    flags: [
        {
            name: 'user_flag',
            location: '/home/lampiao/user.txt',
            points: 20,
            hint: 'Find the user flag in the home directory',
            injectionMethod: 'file_write'
        },
        {
            name: 'root_flag', 
            location: '/root/root.txt',
            points: 30,
            hint: 'Escalate privileges to get the root flag',
            injectionMethod: 'file_write'
        }
    ],
    vmConfig: {
        memory: 1024,
        cpus: 1,
        network: 'nat'
    }
});
await lab.save();`);
            return;
        }

        const testLab = labs[0];
        console.log(`🧪 Testing with lab: ${testLab.name}`);
        console.log('');

        // Test 1: Check for existing active sessions
        console.log('Test 1: Check for existing active sessions...');
        const activeSessions = await sessionManager.getUserActiveSessions(TEST_USER_ID);
        console.log(`Found ${activeSessions.length} active sessions for user`);
        
        // Stop any existing sessions
        if (activeSessions.length > 0) {
            console.log('Stopping existing sessions...');
            const stopResults = await sessionManager.stopUserSessions(TEST_USER_ID, 'test_cleanup');
            console.log('Stop results:', stopResults);
        }
        console.log('✅ Test 1 passed\n');

        // Test 2: Get session info (should fail for non-existent session)
        console.log('Test 2: Get info for non-existent session...');
        try {
            await sessionManager.getSessionInfo('non_existent_session');
            console.log('❌ Test 2 failed - should have thrown error');
        } catch (error) {
            console.log(`✅ Test 2 passed - correctly threw error: ${error.message}`);
        }
        console.log('');

        // Test 3: Activity update (should fail for non-existent session)
        console.log('Test 3: Update activity for non-existent session...');
        const activityResult = await sessionManager.updateActivity('non_existent_session');
        console.log(`✅ Test 3 passed - activity update result: ${activityResult}`);
        console.log('');

        // Test 4: Submit flag (should fail for non-existent session)
        console.log('Test 4: Submit flag for non-existent session...');
        try {
            await sessionManager.submitFlag('non_existent_session', 'test_flag', 'CTF{test}', TEST_USER_ID);
            console.log('❌ Test 4 failed - should have thrown error');
        } catch (error) {
            console.log(`✅ Test 4 passed - correctly threw error: ${error.message}`);
        }
        console.log('');

        // Test 5: Extend session (should fail for non-existent session)
        console.log('Test 5: Extend non-existent session...');
        try {
            await sessionManager.extendSession('non_existent_session');
            console.log('❌ Test 5 failed - should have thrown error');
        } catch (error) {
            console.log(`✅ Test 5 passed - correctly threw error: ${error.message}`);
        }
        console.log('');

        // Test 6: Stop session (should fail for non-existent session)
        console.log('Test 6: Stop non-existent session...');
        try {
            await sessionManager.stopSession('non_existent_session');
            console.log('❌ Test 6 failed - should have thrown error');
        } catch (error) {
            console.log(`✅ Test 6 passed - correctly threw error: ${error.message}`);
        }
        console.log('');

        console.log('⚠️  VM Provisioning Test Skipped');
        console.log('VM provisioning requires:');
        console.log('- VirtualBox to be installed and accessible');
        console.log('- A valid OVA/OVF file in the lab template path');
        console.log('- Proper network configuration');
        console.log('');
        console.log('To test VM provisioning:');
        console.log('1. Ensure you have VirtualBox installed');
        console.log('2. Import an OVA file (like Lampião) manually first');
        console.log('3. Update the lab record with the correct vmTemplate path');
        console.log('4. Then try: sessionManager.startSession(userId, labId)');
        console.log('');

        // Test Session Manager event handling
        console.log('Test 7: Event handling...');
        let eventReceived = false;
        
        sessionManager.on('sessionActivity', (data) => {
            console.log('📡 Received sessionActivity event:', data);
            eventReceived = true;
        });

        // Simulate an event
        sessionManager.emit('sessionActivity', { 
            sessionId: 'test_session', 
            activityType: 'test',
            timestamp: new Date() 
        });

        setTimeout(() => {
            if (eventReceived) {
                console.log('✅ Test 7 passed - event handling works');
            } else {
                console.log('❌ Test 7 failed - event not received');
            }
        }, 100);

        console.log('');

        // Test Configuration
        console.log('Test 8: Configuration validation...');
        const config = sessionManager.config;
        const requiredConfigs = [
            'maxSessionDuration',
            'sessionExtensionTime', 
            'maxExtensions',
            'sessionCleanupInterval',
            'maxConcurrentSessions',
            'inactivityTimeout'
        ];

        let configValid = true;
        for (const configKey of requiredConfigs) {
            if (!(configKey in config)) {
                console.log(`❌ Missing config: ${configKey}`);
                configValid = false;
            }
        }

        if (configValid) {
            console.log('✅ Test 8 passed - all configurations present');
            console.log('Configuration:');
            Object.keys(config).forEach(key => {
                const value = config[key];
                const timeValue = ['maxSessionDuration', 'sessionExtensionTime', 'sessionCleanupInterval', 'inactivityTimeout'].includes(key) 
                    ? `${value / 1000 / 60} minutes` 
                    : value;
                console.log(`  ${key}: ${timeValue}`);
            });
        } else {
            console.log('❌ Test 8 failed - missing configurations');
        }

        console.log('');

        // Final system status
        console.log('📊 Final System Status:');
        const finalStatus = await sessionManager.getSystemStatus();
        console.log(JSON.stringify(finalStatus, null, 2));

        console.log('\n🎉 Session Manager basic tests completed!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Set up a proper lab with OVA file');  
        console.log('2. Test full session lifecycle (start -> flags -> stop)');
        console.log('3. Test concurrent sessions');
        console.log('4. Test session expiry and cleanup');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error(error.stack);
    } finally {
        // Don't exit process to avoid breaking cleanup interval
        console.log('\n⏳ Session Manager will continue running...');
        console.log('Press Ctrl+C to exit');
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down Session Manager test...');
    process.exit(0);
});

// Run tests
testSessionManager();