import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis = null;

if (!url || !token) {
  console.warn(' WARNING: Upstash Redis environment variables are missing. Caching is disabled.');
} else {
  try {
    redis = new Redis({
      url,
      token,
    });
    console.log(' Connected to Upstash Redis successfully.');
  } catch (error) {
    console.error(' Failed to initialize Upstash Redis:', error.message);
  }
}

export { redis };
export default redis;
