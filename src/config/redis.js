import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;
let isConnected = false;

// Create Redis client
export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
      },
      retry_delay_min: 100,
      retry_delay_max: 3000,
    });

    // Handle connection events
    redisClient.on('connect', () => {
      console.log('Redis client connecting...');
    });

    redisClient.on('ready', () => {
      console.log('Redis client connected and ready');
      isConnected = true;
    });

    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
      isConnected = false;
    });

    redisClient.on('end', () => {
      console.log('Redis connection closed');
      isConnected = false;
    });

    // Connect to Redis
    await redisClient.connect();

    // Handle process termination
    process.on('SIGINT', async () => {
      if (isConnected) {
        await redisClient.disconnect();
        console.log('Redis connection closed through app termination');
      }
    });

    return redisClient;
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
};

// Get Redis client instance
export const getRedisClient = () => {
  if (!redisClient || !isConnected) {
    throw new Error('Redis client not connected');
  }
  return redisClient;
};

// Redis utility functions
export const redisUtils = {
  // Set key with expiration
  async set(key, value, expirationInSeconds = 3600) {
    const client = getRedisClient();
    return await client.setEx(key, expirationInSeconds, JSON.stringify(value));
  },

  // Get key
  async get(key) {
    const client = getRedisClient();
    const result = await client.get(key);
    return result ? JSON.parse(result) : null;
  },

  // Delete key
  async del(key) {
    const client = getRedisClient();
    return await client.del(key);
  },

  // Check if key exists
  async exists(key) {
    const client = getRedisClient();
    return await client.exists(key);
  },

  // Set hash field
  async hSet(key, field, value) {
    const client = getRedisClient();
    return await client.hSet(key, field, JSON.stringify(value));
  },

  // Get hash field
  async hGet(key, field) {
    const client = getRedisClient();
    const result = await client.hGet(key, field);
    return result ? JSON.parse(result) : null;
  },

  // Get all hash fields
  async hGetAll(key) {
    const client = getRedisClient();
    const result = await client.hGetAll(key);
    const parsed = {};
    for (const [field, value] of Object.entries(result)) {
      parsed[field] = JSON.parse(value);
    }
    return parsed;
  },

  // Delete hash field
  async hDel(key, field) {
    const client = getRedisClient();
    return await client.hDel(key, field);
  },

  // Increment counter
  async incr(key) {
    const client = getRedisClient();
    return await client.incr(key);
  },

  // Set expiration
  async expire(key, seconds) {
    const client = getRedisClient();
    return await client.expire(key, seconds);
  },

  // Get keys by pattern
  async keys(pattern) {
    const client = getRedisClient();
    return await client.keys(pattern);
  }
};

// Check Redis connection status
export const getRedisStatus = () => {
  return {
    isConnected,
    client: redisClient ? 'initialized' : 'not initialized'
  };
};