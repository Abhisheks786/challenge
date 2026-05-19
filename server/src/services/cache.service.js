// server/src/services/cache.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Redis caching strategy with specific TTL rules and invalidation.
// Gracefully falls back to in-memory Map if Redis is unavailable.
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from 'redis';

let redisClient = null;
let inMemoryFallback = new Map();
let isRedisConnected = false;

// TTLs in seconds
export const CACHE_TTL = {
  TIMELINE: 30 * 24 * 60 * 60,   // 30 days
  ELIGIBILITY: 7 * 24 * 60 * 60, // 7 days
  FAQ: 60 * 60,                  // 1 hour
  WIDGET: 24 * 60 * 60,          // 24 hours
};

export const connectRedis = async () => {
  try {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = createClient({ 
      url,
      socket: {
        reconnectStrategy: false // Don't keep retrying and spamming the console
      }
    });

    redisClient.on('error', (err) => {
      // Only log the error if we previously thought we were connected
      if (isRedisConnected) {
        console.warn('⚠️ Redis connection lost, using in-memory fallback.');
        isRedisConnected = false;
      }
    });

    await redisClient.connect();
    isRedisConnected = true;
    console.log('✅ Redis connected successfully');
  } catch (err) {
    console.warn('⚠️ Redis unavailable, using in-memory fallback. App is fully functional.');
    isRedisConnected = false;
  }
};

export const getCache = async (key) => {
  if (isRedisConnected) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn(`Redis get error for ${key}:`, err);
      return null;
    }
  } else {
    const item = inMemoryFallback.get(key);
    if (!item) return null;
    if (item.expiresAt < Date.now()) {
      inMemoryFallback.delete(key);
      return null;
    }
    return item.data;
  }
};

export const setCache = async (key, data, ttlSeconds) => {
  if (isRedisConnected) {
    try {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
    } catch (err) {
      console.warn(`Redis set error for ${key}:`, err);
    }
  } else {
    inMemoryFallback.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
};

export const invalidateEligibilityRules = async () => {
  if (isRedisConnected) {
    try {
      const keys = await redisClient.keys('eligibility:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`🧹 Invalidated ${keys.length} eligibility cache keys`);
      }
    } catch (err) {
      console.warn('Redis keys/del error:', err);
    }
  } else {
    for (const key of inMemoryFallback.keys()) {
      if (key.startsWith('eligibility:')) {
        inMemoryFallback.delete(key);
      }
    }
    console.log('🧹 Invalidated eligibility rules in in-memory fallback');
  }
};
