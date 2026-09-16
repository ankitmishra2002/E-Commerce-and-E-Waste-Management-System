import { redis } from '../config/redis.js';

export const get = async (key) => {
  if (!redis) return null;
  try {
    const value = await redis.get(key);
    // Upstash client parses json automatically if it is returned as object or we store as json.
    // However, to be safe, if it's already an object we return it, else we parse it.
    if (value === null || value === undefined) return null;
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (err) {
    console.error(`[Redis Cache GET Error] Key: ${key} - ${err.message}`);
    return null;
  }
};

export const set = async (key, value, ttlSeconds = 300) => {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (err) {
    console.error(`[Redis Cache SET Error] Key: ${key} - ${err.message}`);
  }
};

export const del = async (...keys) => {
  if (!redis) return;
  try {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error(`[Redis Cache DEL Error] Keys: ${keys.join(', ')} - ${err.message}`);
  }
};

export const delPattern = async (pattern) => {
  if (!redis) return;
  try {
    let cursor = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
      if (keys && keys.length > 0) {
        await redis.del(...keys);
      }
      cursor = Number(nextCursor);
    } while (cursor !== 0);
  } catch (err) {
    console.error(`[Redis Cache delPattern Error] Pattern: ${pattern} - ${err.message}`);
  }
};

export default { get, set, del, delPattern };
