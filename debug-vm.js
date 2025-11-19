import VMProvisioner from './src/services/provisioner.service.js';

async function debugVMState() {
  try {
    await VMProvisioner.initialize();
    
    // Quick instance creation and debugging
    const sessionId = 'debug-session-' + Date.now();
    const templateId = '3b1eda3c-70ca-4f74-9977-d4cba1cb29d9'; // Lampiao template
    
    console.log('🔧 Creating instance...');
    const instance = await VMProvisioner.createInstance(templateId, sessionId, { userId: 'debug-user' });
    
    console.log('▶️ Starting instance...');
    const result = await VMProvisioner.startInstance(sessionId);
    
    console.log('✅ Success:', result);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugVMState();