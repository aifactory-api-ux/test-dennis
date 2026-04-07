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

// ============== BASIC CACHE OPERATIONS ==============

/**
 * Cache options interface
 */
export interface CacheOptions {
  /**
   * Expiration time in seconds
   */
  expire?: number;
  /**
   * If true, won't set if key already exists
   */
  nx?: boolean;
  /**
   * If true, won't set if key already exists
   */
  xx?: boolean;
}

/**
 * Set a value in cache
 * @param key - Cache key
 * @param value - Value to cache (will be JSON stringified)
 * @param options - Cache options
 */
export async function cacheSet(
  key: string,
  value: any,
  options: CacheOptions = {}
): Promise<void> {
  const client = getRedisClient();
  
  const stringValue = JSON.stringify(value);
  
  if (options.expire) {
    await client.set(key, stringValue, {
      EX: options.expire,
      NX: options.nx,
      XX: options.xx
    });
  } else {
    await client.set(key, stringValue);
  }
}

/**
 * Get a value from cache
 * @param key - Cache key
 * @returns Cached value or null
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  const client = getRedisClient();
  
  const value = await client.get(key);
  
  if (!value) {
    return null;
  }
  
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Delete a value from cache
 * @param key - Cache key
 */
export async function cacheDel(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}

/**
 * Check if a key exists in cache
 * @param key - Cache key
 * @returns True if key exists
 */
export async function cacheExists(key: string): Promise<boolean> {
  const client = getRedisClient();
  const result = await client.exists(key);
  return result === 1;
}

/**
 * Set expiration time for a key
 * @param key - Cache key
 * @param seconds - Expiration time in seconds
 */
export async function cacheExpire(key: string, seconds: number): Promise<void> {
  const client = getRedisClient();
  await client.expire(key, seconds);
}

/**
 * Get TTL (time to live) for a key
 * @param key - Cache key
 * @returns TTL in seconds, or -1 if key doesn't exist / has no expiration
 */
export async function cacheTTL(key: string): Promise<number> {
  const client = getRedisClient();
  return await client.ttl(key);
}

// ============== JWT TOKEN CACHING ==============

/**
 * JWT cache key prefix
 */
const JWT_CACHE_PREFIX = 'jwt:';

/**
 * Default JWT cache expiration (1 hour)
 */
const DEFAULT_JWT_CACHE_TTL = 3600;

/**
 * Cache a JWT token
 * @param userId - User ID
 * @param token - JWT token
 * @param ttl - Time to live in seconds (default: 1 hour)
 */
export async function cacheJwtToken(
  userId: string,
  token: string,
  ttl: number = DEFAULT_JWT_CACHE_TTL
): Promise<void> {
  const key = `${JWT_CACHE_PREFIX}${userId}`;
  await cacheSet(key, token, { expire: ttl });
}

/**
 * Get a cached JWT token
 * @param userId - User ID
 * @returns Cached JWT token or null
 */
export async function getCachedJwtToken(userId: string): Promise<string | null> {
  const key = `${JWT_CACHE_PREFIX}${userId}`;
  return await cacheGet<string>(key);
}

/**
 * Invalidate a cached JWT token
 * @param userId - User ID
 */
export async function invalidateJwtToken(userId: string): Promise<void> {
  const key = `${JWT_CACHE_PREFIX}${userId}`;
  await cacheDel(key);
}

// ============== OPPORTUNITY CACHING ==============

/**
 * Opportunity cache key prefix
 */
const OPPORTUNITY_CACHE_PREFIX = 'opportunity:';

/**
 * Default opportunity cache expiration (5 minutes)
 */
const DEFAULT_OPPORTUNITY_CACHE_TTL = 300;

/**
 * Cache opportunity data
 * @param opportunityId - Opportunity ID
 * @param data - Opportunity data to cache
 * @param ttl - Time to live in seconds
 */
export async function cacheOpportunity(
  opportunityId: string,
  data: any,
  ttl: number = DEFAULT_OPPORTUNITY_CACHE_TTL
): Promise<void> {
  const key = `${OPPORTUNITY_CACHE_PREFIX}${opportunityId}`;
  await cacheSet(key, data, { expire: ttl });
}

/**
 * Get cached opportunity data
 * @param opportunityId - Opportunity ID
 * @returns Cached opportunity data or null
 */
export async function getCachedOpportunity(opportunityId: string): Promise<any | null> {
  const key = `${OPPORTUNITY_CACHE_PREFIX}${opportunityId}`;
  return await cacheGet(key);
}

/**
 * Invalidate cached opportunity data
 * @param opportunityId - Opportunity ID
 */
export async function invalidateOpportunity(opportunityId: string): Promise<void> {
  const key = `${OPPORTUNITY_CACHE_PREFIX}${opportunityId}`;
  await cacheDel(key);
}

/**
 * Cache opportunity list for a user
 * @param userId - User ID
 * @param data - List of opportunities
 * @param ttl - Time to live in seconds
 */
export async function cacheOpportunityList(
  userId: string,
  data: any[],
  ttl: number = DEFAULT_OPPORTUNITY_CACHE_TTL
): Promise<void> {
  const key = `${OPPORTUNITY_CACHE_PREFIX}list:${userId}`;
  await cacheSet(key, data, { expire: ttl });
}

/**
 * Get cached opportunity list
 * @param userId - User ID
 * @returns Cached opportunity list or null
 */
export async function getCachedOpportunityList(userId: string): Promise<any[] | null> {
  const key = `${OPPORTUNITY_CACHE_PREFIX}list:${userId}`;
  return await cacheGet<any[]>(key);
}

/**
 * Invalidate cached opportunity list
 * @param userId - User ID
 */
export async function invalidateOpportunityList(userId: string): Promise<void> {
  const key = `${OPPORTUNITY_CACHE_PREFIX}list:${userId}`;
  await cacheDel(key);
}

// ============== INTERACTION CACHING ==============


/**
 * Interaction cache key prefix
 */
const INTERACTION_CACHE_PREFIX = 'interaction:';

/**
 * Default interaction cache expiration (5 minutes)
 */
const DEFAULT_INTERACTION_CACHE_TTL = 300;

/**
 * Cache interactions for an opportunity
 * @param opportunityId - Opportunity ID
 * @param data - List of interactions
 * @param ttl - Time to live in seconds
 */
export async function cacheInteractions(
  opportunityId: string,
  data: any[],
  ttl: number = DEFAULT_INTERACTION_CACHE_TTL
): Promise<void> {
  const key = `${INTERACTION_CACHE_PREFIX}list:${opportunityId}`;
  await cacheSet(key, data, { expire: ttl });
}

/**
 * Get cached interactions for an opportunity
 * @param opportunityId - Opportunity ID
 * @returns Cached interactions or null
 */
export async function getCachedInteractions(opportunityId: string): Promise<any[] | null> {
  const key = `${INTERACTION_CACHE_PREFIX}list:${opportunityId}`;
  return await cacheGet<any[]>(key);
}

/**
 * Invalidate cached interactions for an opportunity
 * @param opportunityId - Opportunity ID
 */
export async function invalidateInteractions(opportunityId: string): Promise<void> {
  const key = `${INTERACTION_CACHE_PREFIX}list:${opportunityId}`;
  await cacheDel(key);
}

// ============== HEALTH CHECK ==============

/**
 * Check Redis connection health
 * @returns True if Redis is connected and responsive
 */
export async function checkRedisConnection(): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

// ============== CACHE CLEAR ==============

/**
 * Clear all cached data (use with caution)
 */
export async function clearAllCache(): Promise<void> {
  const client = getRedisClient();
  await client.flushdb();
}

/**
 * Clear only application cache (JWT, opportunities, interactions)
 * Keeps other cache data intact
 */
export async function clearAppCache(): Promise<void> {
  const client = getRedisClient();
  const keys: string[] = [];

  // Get all keys with our prefixes
  const jwtKeys = await client.keys(`${JWT_CACHE_PREFIX}*`);
  const oppKeys = await client.keys(`${OPPORTUNITY_CACHE_PREFIX}*`);
  const interKeys = await client.keys(`${INTERACTION_CACHE_PREFIX}*`);

  keys.push(...jwtKeys, ...oppKeys, ...interKeys);

  if (keys.length > 0) {
    await client.del(...keys);
  }
}

// ============== ERROR TYPES ==============

export class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
  }
}

export class RedisConnectionError extends CacheError {
  constructor() {
    super('Failed to connect to Redis');
    this.name = 'RedisConnectionError';
  }
}
