import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5002';

console.log('🚀 Testing API Endpoints...\n');

// Test endpoints
const testEndpoints = [
    {
        name: 'Health Check',
        url: '/health',
        method: 'GET',
        expected: 200
    },
    {
        name: 'API Status',
        url: '/api/status',
        method: 'GET',
        expected: 200
    },
    {
        name: 'API Documentation',
        url: '/api/docs',
        method: 'GET',
        expected: 200
    },
    {
        name: 'Get Lab Categories',
        url: '/api/labs/meta/categories',
        method: 'GET',
        expected: 200
    },
    {
        name: 'Get Labs',
        url: '/api/labs',
        method: 'GET',
        expected: 200
    },
    {
        name: 'Get Popular Labs',
        url: '/api/labs/popular',
        method: 'GET',
        expected: 200
    },
    {
        name: 'Search Labs',
        url: '/api/labs/search?q=test',
        method: 'GET',
        expected: 200
    },
    {
        name: '404 Test',
        url: '/api/nonexistent',
        method: 'GET',
        expected: 404
    }
];

async function testEndpoint(test) {
    try {
        const response = await fetch(`${BASE_URL}${test.url}`, {
            method: test.method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'API-Test-Client/1.0'
            },
            timeout: 5000
        });

        const isSuccess = response.status === test.expected;
        const statusText = isSuccess ? '✅' : '❌';
        
        console.log(`${statusText} ${test.name}: ${response.status} ${response.statusText}`);
        
        // Show response for some endpoints
        if (test.name === 'API Status' || test.name === 'Health Check') {
            const data = await response.json();
            console.log(`   Response:`, JSON.stringify(data, null, 2));
        }
        
        return { ...test, status: response.status, success: isSuccess };
        
    } catch (error) {
        console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        return { ...test, status: 'ERROR', success: false, error: error.message };
    }
}

async function runTests() {
    console.log(`Testing server at: ${BASE_URL}\n`);
    
    // Test if server is running
    try {
        const healthResponse = await fetch(`${BASE_URL}/health`, { timeout: 3000 });
        if (!healthResponse.ok) {
            throw new Error(`Server returned ${healthResponse.status}`);
        }
        console.log('✅ Server is running and responsive\n');
    } catch (error) {
        console.log('❌ Server is not running or not responsive');
        console.log('💡 Please start the server first: node server.js');
        console.log(`   Error: ${error.message}\n`);
        return;
    }

    // Run all tests
    console.log('Running endpoint tests...\n');
    const results = [];
    
    for (const test of testEndpoints) {
        const result = await testEndpoint(test);
        results.push(result);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Summary
    console.log('\n📊 Test Summary:');
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    console.log(`Passed: ${passed}/${total}`);
    
    if (passed === total) {
        console.log('🎉 All tests passed!');
    } else {
        console.log('⚠️  Some tests failed:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`   - ${r.name}: Expected ${r.expected}, got ${r.status}`);
        });
    }

    console.log('\n📋 Available Endpoints:');
    console.log('   🔗 Health: http://localhost:5002/health');
    console.log('   🔗 API Status: http://localhost:5002/api/status');  
    console.log('   🔗 API Docs: http://localhost:5002/api/docs');
    console.log('   🔗 Labs: http://localhost:5002/api/labs');
    console.log('   🔗 Categories: http://localhost:5002/api/labs/meta/categories');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Test session endpoints (requires authentication)');
    console.log('   2. Add lab data to test lab endpoints');
    console.log('   3. Test flag submission and VM provisioning');
    console.log('   4. Test rate limiting and error handling');
}

runTests().catch(console.error);