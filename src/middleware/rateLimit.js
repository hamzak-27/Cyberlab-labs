import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

// Redis client for rate limiting
let redisClient = null;

// Initialize Redis connection for rate limiting
const initializeRedisForRateLimit = async () => {
    if (!redisClient) {
        try {
            redisClient = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379'
            });

            redisClient.on('error', (err) => {
                logger.error('Redis rate limit client error:', err);
            });

            redisClient.on('connect', () => {
                logger.info('Redis rate limit client connected');
            });

            await redisClient.connect();
        } catch (error) {
            logger.error('Failed to initialize Redis for rate limiting:', error);
            // Fall back to memory store
            redisClient = null;
        }
    }
    return redisClient;
};

/**
 * Create rate limiter by user ID
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowSeconds - Time window in seconds
 * @param {string} message - Custom error message
 */
export const rateLimitByUser = (maxRequests = 100, windowSeconds = 3600, message = null) => {
    return rateLimit({
        windowMs: windowSeconds * 1000,
        max: maxRequests,
        message: {
            success: false,
            message: message || `Too many requests. Limit: ${maxRequests} requests per ${windowSeconds} seconds.`,
            retryAfter: windowSeconds
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: redisClient ? new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix: 'rl:user:'
        }) : undefined,
        keyGenerator: (req) => {
            // Use user ID for authenticated requests, IP for anonymous
            return req.user?.id || req.ip;
        },
        handler: (req, res) => {
            logger.warn('Rate limit exceeded by user', {
                userId: req.user?.id,
                ip: req.ip,
                path: req.path,
                method: req.method,
                limit: maxRequests,
                window: windowSeconds
            });

            res.status(429).json({
                success: false,
                message: message || `Too many requests. Limit: ${maxRequests} requests per ${windowSeconds} seconds.`,
                retryAfter: windowSeconds
            });
        },
        skip: (req) => {
            // Skip rate limiting for admin users (optional)
            return req.user?.isAdmin && process.env.NODE_ENV === 'development';
        }
    });
};

/**
 * Create rate limiter by IP address
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowSeconds - Time window in seconds
 * @param {string} message - Custom error message
 */
export const rateLimitByIP = (maxRequests = 1000, windowSeconds = 3600, message = null) => {
    return rateLimit({
        windowMs: windowSeconds * 1000,
        max: maxRequests,
        message: {
            success: false,
            message: message || `Too many requests from this IP. Limit: ${maxRequests} requests per ${windowSeconds} seconds.`,
            retryAfter: windowSeconds
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: redisClient ? new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix: 'rl:ip:'
        }) : undefined,
        keyGenerator: (req) => req.ip,
        handler: (req, res) => {
            logger.warn('Rate limit exceeded by IP', {
                ip: req.ip,
                path: req.path,
                method: req.method,
                userAgent: req.get('User-Agent'),
                limit: maxRequests,
                window: windowSeconds
            });

            res.status(429).json({
                success: false,
                message: message || `Too many requests from this IP. Limit: ${maxRequests} requests per ${windowSeconds} seconds.`,
                retryAfter: windowSeconds
            });
        }
    });
};

/**
 * Strict rate limiter for sensitive endpoints
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowSeconds - Time window in seconds
 */
export const strictRateLimit = (maxRequests = 10, windowSeconds = 900) => {
    return rateLimitByUser(maxRequests, windowSeconds, 
        `Too many attempts. This endpoint is strictly rate limited. Try again in ${Math.ceil(windowSeconds / 60)} minutes.`
    );
};

/**
 * Global rate limiter for all API endpoints
 */
export const globalRateLimit = rateLimitByIP(
    parseInt(process.env.API_RATE_LIMIT_PER_HOUR) || 1000,
    3600,
    'API rate limit exceeded. Please slow down your requests.'
);

/**
 * Flag submission rate limiter
 */
export const flagSubmissionRateLimit = rateLimitByUser(
    parseInt(process.env.FLAG_SUBMISSION_RATE_LIMIT_PER_MINUTE) || 10,
    60,
    'Too many flag submissions. Please wait before submitting again.'
);

/**
 * Session creation rate limiter
 */
export const sessionCreationRateLimit = rateLimitByUser(
    5, // Max 5 session attempts per hour
    3600,
    'Too many session creation attempts. Please wait before trying again.'
);

/**
 * Authentication rate limiter
 */
export const authRateLimit = rateLimitByIP(
    20, // Max 20 login attempts per 15 minutes
    900,
    'Too many login attempts. Please wait 15 minutes before trying again.'
);

/**
 * Admin action rate limiter
 */
export const adminRateLimit = rateLimitByUser(
    100, // Max 100 admin actions per hour
    3600,
    'Admin action rate limit exceeded.'
);

/**
 * Initialize rate limiting system
 */
export const initializeRateLimit = async () => {
    try {
        await initializeRedisForRateLimit();
        logger.info('Rate limiting system initialized', {
            redisConnected: !!redisClient,
            globalLimit: parseInt(process.env.API_RATE_LIMIT_PER_HOUR) || 1000,
            flagSubmissionLimit: parseInt(process.env.FLAG_SUBMISSION_RATE_LIMIT_PER_MINUTE) || 10
        });
    } catch (error) {
        logger.error('Failed to initialize rate limiting system:', error);
    }
};

/**
 * Get rate limit status for a key
 * @param {string} key - The rate limit key
 * @param {number} windowMs - Window size in milliseconds
 * @param {number} max - Maximum requests allowed
 */
export const getRateLimitStatus = async (key, windowMs, max) => {
    if (!redisClient) {
        return null;
    }

    try {
        const current = await redisClient.get(`rl:${key}`);
        const remaining = Math.max(0, max - (parseInt(current) || 0));
        const resetTime = Date.now() + windowMs;

        return {
            limit: max,
            used: parseInt(current) || 0,
            remaining,
            resetTime: new Date(resetTime)
        };
    } catch (error) {
        logger.error('Failed to get rate limit status:', error);
        return null;
    }
};

/**
 * Clear rate limit for a specific key (admin function)
 * @param {string} key - The rate limit key to clear
 */
export const clearRateLimit = async (key) => {
    if (!redisClient) {
        return false;
    }

    try {
        const pattern = `rl:*${key}*`;
        const keys = await redisClient.keys(pattern);
        
        if (keys.length > 0) {
            await redisClient.del(keys);
            logger.info('Rate limit cleared', { key, clearedKeys: keys.length });
            return true;
        }
        
        return false;
    } catch (error) {
        logger.error('Failed to clear rate limit:', error);
        return false;
    }
};

// Export Redis client for other middleware to use
export { redisClient };

// Clean up on process termination
process.on('SIGINT', async () => {
    if (redisClient) {
        await redisClient.quit();
        logger.info('Redis rate limit client disconnected');
    }
});

process.on('SIGTERM', async () => {
    if (redisClient) {
        await redisClient.quit();
        logger.info('Redis rate limit client disconnected');
    }
});