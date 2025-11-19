#!/usr/bin/env node

/**
 * VPN Testing Script - Test HackTheBox-style VPN integration
 * 
 * This script tests the VPN API endpoints to ensure they work correctly.
 * Run this after starting the server to verify VPN functionality.
 */

import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5001/api';
const TEST_SESSION_ID = 'test-session-' + Date.now();
const TEST_USER_ID = 'test-user-123';

// Create axios instance with error handling
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Mock authentication for testing
api.interceptors.request.use(config => {
  // Add mock authentication
  config.headers['x-test-user'] = TEST_USER_ID;
  return config;
});

async function testVPNEndpoints() {
  console.log('🧪 Testing HackTheBox-style VPN Integration\n');
  
  try {
    console.log('1. Testing VPN config generation...');
    const generateResponse = await api.post('/vpn/config/generate', {
      sessionId: TEST_SESSION_ID,
      duration: 30,
      labId: 'lampiao'
    });
    
    console.log('✅ VPN config generated successfully');
    console.log('   Session ID:', TEST_SESSION_ID);
    console.log('   Duration:', generateResponse.data.data.expiresAt);
    console.log('   Server IP:', generateResponse.data.data.connectionInfo.serverIP);
    console.log('   Lab Network:', generateResponse.data.data.connectionInfo.userNetwork);
    console.log('');

    console.log('2. Testing VPN session status...');
    const statusResponse = await api.get(`/vpn/status/${TEST_SESSION_ID}`);
    console.log('✅ VPN session status retrieved');
    console.log('   Status:', statusResponse.data.data.status);
    console.log('   Time remaining:', statusResponse.data.data.timeRemaining, 'minutes');
    console.log('');

    console.log('3. Testing VPN config download...');
    const downloadResponse = await api.get(`/vpn/config/download/${TEST_SESSION_ID}`, {
      responseType: 'blob'
    });
    
    // Save the config file for inspection
    const configPath = path.join(process.cwd(), 'storage', 'vpn', 'configs', `test-${TEST_SESSION_ID}.ovpn`);
    await fs.writeFile(configPath, downloadResponse.data);
    
    console.log('✅ VPN config downloaded successfully');
    console.log('   Saved to:', configPath);
    console.log('   File size:', downloadResponse.data.length, 'bytes');
    console.log('');

    console.log('4. Testing VPN cleanup...');
    const cleanupResponse = await api.post('/vpn/cleanup');
    console.log('✅ VPN cleanup completed');
    console.log('   Cleaned sessions:', cleanupResponse.data.cleanedSessions);
    console.log('');

    // Read and display part of the config file
    console.log('5. Config file content preview:');
    const configContent = await fs.readFile(configPath, 'utf8');
    const lines = configContent.split('\n').slice(0, 15);
    console.log('   First 15 lines of generated .ovpn file:');
    lines.forEach((line, i) => {
      console.log(`   ${String(i + 1).padStart(2)}: ${line}`);
    });
    console.log('   ...');
    
    // Check for required elements
    const hasCA = configContent.includes('<ca>');
    const hasCert = configContent.includes('<cert>');
    const hasKey = configContent.includes('<key>');
    const hasTLSAuth = configContent.includes('<tls-auth>');
    const hasLabNetwork = configContent.includes('192.168.100.0');
    
    console.log('\n6. Config validation:');
    console.log('   ✅ Contains CA certificate:', hasCA);
    console.log('   ✅ Contains client certificate:', hasCert);
    console.log('   ✅ Contains private key:', hasKey);
    console.log('   ✅ Contains TLS auth key:', hasTLSAuth);
    console.log('   ✅ Contains lab network route:', hasLabNetwork);
    
    if (hasCA && hasCert && hasKey && hasTLSAuth && hasLabNetwork) {
      console.log('\n🎉 All VPN tests passed! The integration is working correctly.');
      console.log('\n📋 Next steps:');
      console.log('   1. Start the OpenVPN server: cd "C:\\Program Files\\OpenVPN\\bin" && .\\openvpn.exe --config C:\\Users\\ihamz\\labs-backend\\config\\openvpn-simple.conf');
      console.log('   2. Import the generated .ovpn file into an OpenVPN client');
      console.log('   3. Connect and test access to 192.168.100.x network');
    } else {
      console.log('\n❌ Some config elements are missing. Check the VPN service configuration.');
    }

  } catch (error) {
    console.error('❌ VPN test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Make sure the server is running and VPN routes are properly mounted.');
    }
    
    if (error.response?.status === 500) {
      console.log('\n💡 Check server logs for detailed error information.');
    }
  }
}

async function checkServerHealth() {
  try {
    console.log('🔍 Checking server health...');
    const healthResponse = await api.get('/health');
    console.log('✅ Server is healthy');
    console.log('   Service:', healthResponse.data.service);
    console.log('   Environment:', healthResponse.data.environment);
    console.log('   Uptime:', Math.round(healthResponse.data.uptime), 'seconds');
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:5001');
    return false;
  }
}

async function main() {
  console.log('🚀 Starting VPN Integration Tests\n');
  
  // Check server health first
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    process.exit(1);
  }
  
  // Run VPN tests
  await testVPNEndpoints();
  
  console.log('\n✨ VPN testing complete!');
}

// Run the tests
main().catch(error => {
  console.error('\n💥 Test script failed:', error.message);
  process.exit(1);
});