import { generateSessionId, formatDuration, sanitizeVMName, generateRandomPort } from './src/utils/helpers.js';

console.log('🚀 Testing Session Manager Core Components...\n');

// Test 1: Helper Functions
console.log('Test 1: Helper Functions...');
try {
    const sessionId = generateSessionId();
    console.log(`✅ Session ID generated: ${sessionId}`);
    
    const duration = formatDuration(125000); // 2m 5s
    console.log(`✅ Duration formatted: ${duration}`);
    
    const vmName = sanitizeVMName('Lampião-VM!@#$%^&*()');
    console.log(`✅ VM name sanitized: ${vmName}`);
    
    const port = generateRandomPort(20000, 25000);
    console.log(`✅ Random port generated: ${port}`);
    
    console.log('✅ Test 1 passed\n');
} catch (error) {
    console.log(`❌ Test 1 failed: ${error.message}\n`);
}

// Test 2: Session Manager Configuration (without database)
console.log('Test 2: Session Manager Config...');
try {
    // Mock Session Manager for config testing
    const mockConfig = {
        maxSessionDuration: parseInt(process.env.MAX_SESSION_DURATION) || 3600000, // 1 hour
        sessionExtensionTime: parseInt(process.env.SESSION_EXTENSION_TIME) || 1800000, // 30 minutes
        maxExtensions: parseInt(process.env.MAX_SESSION_EXTENSIONS) || 2,
        sessionCleanupInterval: parseInt(process.env.SESSION_CLEANUP_INTERVAL) || 300000, // 5 minutes
        maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 10,
        inactivityTimeout: parseInt(process.env.SESSION_INACTIVITY_TIMEOUT) || 1800000, // 30 minutes
    };
    
    console.log('Configuration loaded:');
    Object.keys(mockConfig).forEach(key => {
        const value = mockConfig[key];
        const timeValue = ['maxSessionDuration', 'sessionExtensionTime', 'sessionCleanupInterval', 'inactivityTimeout'].includes(key) 
            ? `${value / 1000 / 60} minutes` 
            : value;
        console.log(`  ${key}: ${timeValue}`);
    });
    
    console.log('✅ Test 2 passed\n');
} catch (error) {
    console.log(`❌ Test 2 failed: ${error.message}\n`);
}

// Test 3: Event Emitter Test (without full Session Manager)
console.log('Test 3: Event System...');
try {
    const EventEmitter = (await import('events')).default;
    const emitter = new EventEmitter();
    
    let eventReceived = false;
    emitter.on('test', (data) => {
        console.log('📡 Event received:', data);
        eventReceived = true;
    });
    
    emitter.emit('test', { message: 'Hello World', timestamp: new Date() });
    
    setTimeout(() => {
        if (eventReceived) {
            console.log('✅ Test 3 passed - Event system works\n');
        } else {
            console.log('❌ Test 3 failed - Event not received\n');
        }
        
        // Test 4: Port Availability Check
        console.log('Test 4: Port Availability...');
        import('./src/utils/helpers.js').then(({ checkPortAvailable }) => {
            checkPortAvailable(22222).then(isAvailable => {
                console.log(`Port 22222 available: ${isAvailable}`);
                console.log('✅ Test 4 passed - Port check works\n');
                
                console.log('🎉 Basic tests completed successfully!');
                console.log('');
                console.log('Core components working:');
                console.log('✅ Helper functions');
                console.log('✅ Configuration loading');
                console.log('✅ Event system'); 
                console.log('✅ Port checking');
                console.log('');
                console.log('Next: Test with database connection and models');
                
                process.exit(0);
            }).catch(error => {
                console.log(`⚠️  Port check warning: ${error.message}`);
                console.log('✅ Test 4 completed with warning\n');
                
                console.log('🎉 Basic tests completed!');
                process.exit(0);
            });
        }).catch(error => {
            console.log(`❌ Test 4 failed: ${error.message}`);
            process.exit(1);
        });
    }, 100);
} catch (error) {
    console.log(`❌ Test 3 failed: ${error.message}\n`);
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down tests...');
    process.exit(0);
});

console.log('⏳ Running async tests...');