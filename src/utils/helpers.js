import crypto from 'crypto';
import net from 'net';

/**
 * Generate a unique session ID
 */
function generateSessionId() {
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(8).toString('hex');
    return `session_${timestamp}_${randomBytes}`;
}

/**
 * Generate a random string of specified length
 */
function generateRandomString(length = 16) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/**
 * Generate a secure flag value
 */
function generateFlagValue(sessionId, flagName) {
    const data = `${sessionId}_${flagName}_${Date.now()}_${Math.random()}`;
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return `CTF{${hash.substring(0, 32)}}`;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate a port number within a specific range
 */
function generateRandomPort(min = 20000, max = 65000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sleep/delay function
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format duration in milliseconds to human readable format
 */
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Sanitize VM name to be VirtualBox compatible
 */
function sanitizeVMName(name) {
    // Replace invalid characters with underscores
    return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 60);
}

/**
 * Generate VM name for session
 */
function generateVMName(labName, sessionId) {
    const sanitizedLabName = sanitizeVMName(labName);
    const shortSessionId = sessionId.split('_').pop(); // Get last part of session ID
    return `${sanitizedLabName}_${shortSessionId}`;
}

/**
 * Check if a port is available
 */
function checkPortAvailable(port, host = 'localhost') {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        
        socket.setTimeout(1000);
        
        socket.on('connect', () => {
            socket.destroy();
            resolve(false); // Port is in use
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            resolve(true); // Port is available
        });
        
        socket.on('error', () => {
            resolve(true); // Port is available
        });
        
        socket.connect(port, host);
    });
}

/**
 * Find an available port in a range
 */
async function findAvailablePort(startPort = 20000, endPort = 25000) {
    for (let port = startPort; port <= endPort; port++) {
        const isAvailable = await checkPortAvailable(port);
        if (isAvailable) {
            return port;
        }
    }
    throw new Error(`No available ports in range ${startPort}-${endPort}`);
}

/**
 * Calculate difficulty score based on lab metadata
 */
function calculateDifficultyScore(difficulty) {
    const scores = {
        'easy': 1,
        'medium': 2, 
        'hard': 3
    };
    return scores[difficulty.toLowerCase()] || 2;
}

/**
 * Validate object structure
 */
function validateObjectStructure(obj, requiredFields) {
    const missing = [];
    for (const field of requiredFields) {
        if (!(field in obj)) {
            missing.push(field);
        }
    }
    return missing.length === 0 ? null : missing;
}

/**
 * Deep clone an object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Retry an async operation with exponential backoff
 */
async function retry(operation, maxAttempts = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxAttempts) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, attempt - 1);
            await sleep(delay);
        }
    }
}

/**
 * Create a timeout promise
 */
function timeout(ms, message = 'Operation timed out') {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), ms);
    });
}

/**
 * Run operation with timeout
 */
async function withTimeout(operation, timeoutMs, timeoutMessage) {
    return Promise.race([
        operation(),
        timeout(timeoutMs, timeoutMessage)
    ]);
}

/**
 * Escape shell arguments
 */
function escapeShellArg(arg) {
    return `"${arg.replace(/"/g, '\\"')}"`;
}

/**
 * Parse connection string for SSH
 */
function parseSSHConnection(host, port, username) {
    return {
        host: host || 'localhost',
        port: parseInt(port) || 22,
        username: username || 'user',
        connectString: `${username || 'user'}@${host || 'localhost'} -p ${port || 22}`
    };
}

/**
 * Check if string is a valid IPv4 address
 */
function isValidIPv4(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
}

/**
 * Format file size in bytes to human readable format
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Create a debounced function
 */
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

export {
    generateSessionId,
    generateRandomString,
    generateFlagValue,
    isValidEmail,
    generateRandomPort,
    sleep,
    formatDuration,
    sanitizeVMName,
    generateVMName,
    checkPortAvailable,
    findAvailablePort,
    calculateDifficultyScore,
    validateObjectStructure,
    deepClone,
    retry,
    timeout,
    withTimeout,
    escapeShellArg,
    parseSSHConnection,
    isValidIPv4,
    formatBytes,
    debounce
};
