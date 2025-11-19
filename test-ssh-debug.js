import { debugSSHConnection } from './src/utils/ssh-debug.js';

/**
 * Test SSH debugging utility
 * Usage: node test-ssh-debug.js [host] [port] [vmtype]
 */
async function testSSHDebug() {
  // Get parameters from command line or use defaults
  const host = process.argv[2] || '127.0.0.1';
  const port = parseInt(process.argv[3]) || 2200;
  const vmType = process.argv[4] || 'lampiao';
  
  console.log('🔧 SSH Connection Debugger');
  console.log('============================\n');
  
  try {
    const result = await debugSSHConnection(host, port, vmType);
    
    if (result.success) {
      console.log('\n🎉 SUCCESS! Working credentials found:');
      result.workingCredentials.forEach(cred => {
        console.log(`   ${cred.username}:${cred.password}`);
      });
    } else {
      console.log('\n❌ DEBUG COMPLETE - No working connections found');
      if (result.suggestedCredentials) {
        console.log('\n💡 Try these credentials manually:');
        result.suggestedCredentials.forEach(cred => {
          console.log(`   ssh ${cred.username}@${host} -p ${port}  # Password: ${cred.password}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ SSH debug failed:', error.message);
  }
}

// Show usage if no parameters
if (process.argv.length < 3) {
  console.log('Usage: node test-ssh-debug.js [host] [port] [vmtype]');
  console.log('');
  console.log('Examples:');
  console.log('  node test-ssh-debug.js 127.0.0.1 2200 lampiao');
  console.log('  node test-ssh-debug.js 192.168.1.100 22 metasploitable');
  console.log('');
  console.log('Default: 127.0.0.1:2200 (lampiao)');
  console.log('');
}

testSSHDebug();