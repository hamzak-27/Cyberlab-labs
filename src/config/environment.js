import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

// Environment variables schema validation
const envSchema = Joi.object({
  // Database
  MONGO_URI: Joi.string().required(),
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  
  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  
  // Server
  PORT: Joi.number().port().default(5002),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  
  // VM Configuration
  OVA_STORAGE_PATH: Joi.string().default('./storage/ova-files'),
  VM_INSTANCES_PATH: Joi.string().default('./storage/vm-instances'),
  VIRTUALBOX_MANAGE_PATH: Joi.string().default('VBoxManage'),
  
  // VPN Configuration
  VPN_SERVER_HOST: Joi.string().default('147.182.222.141'),
  VPN_SERVER_PORT: Joi.number().port().default(1194),
  VPN_PROTOCOL: Joi.string().valid('udp', 'tcp').default('udp'),
  VPN_CA_PATH: Joi.string().default('./vpn-certs/ca.crt'),
  VPN_CERT_PATH: Joi.string().default('./vpn-certs'),
  VPN_KEY_PATH: Joi.string().default('./vpn-certs'),
  VPN_CONFIG_TEMPLATE: Joi.string().default('./templates/client.ovpn.template'),
  VPN_LOG_PATH: Joi.string().default('/var/log/openvpn'),
  VPN_STATUS_LOG: Joi.string().default('/var/log/openvpn/openvpn-status.log'),
  VPN_MONITOR_INTERVAL: Joi.number().min(5000).default(10000),
  VPN_SUBNET_BASE: Joi.string().default('10.10'),
  VPN_SUBNET_MASK: Joi.string().default('255.255.255.0'),
  
  // Session
  SESSION_TIMEOUT_MINUTES: Joi.number().min(5).max(240).default(30),
  MAX_CONCURRENT_SESSIONS_PER_USER: Joi.number().min(1).max(5).default(1),
  SESSION_CLEANUP_INTERVAL_MINUTES: Joi.number().min(1).max(60).default(5),
  
  // Rate Limiting
  API_RATE_LIMIT_PER_HOUR: Joi.number().min(100).default(1000),
  FLAG_SUBMISSION_RATE_LIMIT_PER_MINUTE: Joi.number().min(5).default(10),
  
  // Security
  BCRYPT_SALT_ROUNDS: Joi.number().min(10).max(15).default(12),
  
  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_FILE_PATH: Joi.string().default('./logs/app.log'),
  
  // Optional
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().port().optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  ADMIN_SETUP_KEY: Joi.string().optional(),
}).unknown(); // Allow unknown keys for flexibility

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Export configuration object
export const config = {
  database: {
    mongoUri: envVars.MONGO_URI,
    redisUrl: envVars.REDIS_URL,
  },
  
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },
  
  server: {
    port: envVars.PORT,
    env: envVars.NODE_ENV,
    isDevelopment: envVars.NODE_ENV === 'development',
    isProduction: envVars.NODE_ENV === 'production',
    isTest: envVars.NODE_ENV === 'test',
  },
  
  vm: {
    ovaStoragePath: envVars.OVA_STORAGE_PATH,
    vmInstancesPath: envVars.VM_INSTANCES_PATH,
    virtualboxPath: envVars.VIRTUALBOX_MANAGE_PATH,
  },
  
  vpn: {
    serverHost: envVars.VPN_SERVER_HOST,
    serverPort: envVars.VPN_SERVER_PORT,
    protocol: envVars.VPN_PROTOCOL,
    caPath: envVars.VPN_CA_PATH,
    certPath: envVars.VPN_CERT_PATH,
    keyPath: envVars.VPN_KEY_PATH,
    configTemplate: envVars.VPN_CONFIG_TEMPLATE,
    
    // Monitoring configuration
    logPath: envVars.VPN_LOG_PATH,
    statusLog: envVars.VPN_STATUS_LOG,
    monitorInterval: envVars.VPN_MONITOR_INTERVAL,
    
    // Subnet configuration for bridge mode
    subnetBase: envVars.VPN_SUBNET_BASE,
    subnetMask: envVars.VPN_SUBNET_MASK
  },
  
  session: {
    timeoutMinutes: envVars.SESSION_TIMEOUT_MINUTES,
    maxConcurrentPerUser: envVars.MAX_CONCURRENT_SESSIONS_PER_USER,
    cleanupIntervalMinutes: envVars.SESSION_CLEANUP_INTERVAL_MINUTES,
    timeoutMs: envVars.SESSION_TIMEOUT_MINUTES * 60 * 1000,
  },
  
  rateLimit: {
    apiPerHour: envVars.API_RATE_LIMIT_PER_HOUR,
    flagSubmissionPerMinute: envVars.FLAG_SUBMISSION_RATE_LIMIT_PER_MINUTE,
  },
  
  security: {
    bcryptSaltRounds: envVars.BCRYPT_SALT_ROUNDS,
  },
  
  logging: {
    level: envVars.LOG_LEVEL,
    filePath: envVars.LOG_FILE_PATH,
  },
  
  email: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
  },
  
  admin: {
    setupKey: envVars.ADMIN_SETUP_KEY,
  },
  
  // VM Network port ranges
  ports: {
    sshStart: 2200,
    sshEnd: 3199,
    webStart: 8000,
    webEnd: 8999,
  },
  
  // Default lab configurations
  defaults: {
    labTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
    vmRam: 1024, // MB
    vmCpu: 1,
    maxLabsPerUser: 1,
  }
};

// Helper functions
export const isDevelopment = () => config.server.isDevelopment;
export const isProduction = () => config.server.isProduction;
export const isTest = () => config.server.isTest;

export default config;