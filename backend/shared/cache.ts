/**
 * Redis cache utilities for test Dennis project
 * Provides caching functionality for JWT tokens and application data
 */

import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// ============== ENVIRONMENT VARIABLES ==============

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
}

function getRedisConfig(): RedisConfig {
  const host = process.env.REDIS_HOST;
  
  if (!host) {
    throw new Error('Missing required environment variable: REDIS_HOST');
  }

  return {
    host,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    database: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : undefined
  };
}

// ============== CLIENT CREATION ==============

let redisClient: redis.RedisClient | null = null;

/**
 * Create and configure Redis client
 * @returns Configured Redis client
 */
export function createRedisClient(): redis.RedisClient {
  if (redisClient) {
    return redisClient;
  }

  const config = getRedisConfig();

  const clientOptions: redis.ClientOptions = {
    host: config.host,
    port: config.port,
    password: config.password,
    db: config.database,
    retry_strategy: (options) => {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        console.error('Redis connection refused');
        return new Error('Redis connection failed');
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        return new Error('Redis retry time exhausted');
      }
      if (options.attempt > 10) {
        return undefined;
      }
      return Math.min(options.attempt * 100, 3000);
    },
    enable_offline_queue: false
  };

  redisClient = redis.createClient(clientOptions);

  redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis client connected');
  });

  redisClient.on('ready', () => {
    console.log('Redis client ready');
  });

  redisClient.on('reconnecting', () => {
    console.log('Redis client reconnecting...');
  });

  return redisClient;
}

// ============== CONNECTION MANAGEMENT ==============

/**
 * Connect to Redis server
 */
export async function connectRedis(): Promise<void> {
  const client = createRedisClient();
  
  return new Promise((resolve, reject) => {
    if (client.isOpen) {
      return resolve();
    }

    client.connect((err) => {
      if (err) {
        console.error('Failed to connect to Redis:', err);
        return reject(err);
      }
      resolve();
    });
  });
}

/**
 * Disconnect from Redis server
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

/**
 * Get Redis client instance
 * @returns Redis client
 */
export function getRedisClient(): redis.RedisClient {
  if (!redisClient) {
    return createRedisClient();
  }
  return redisClient;
}
