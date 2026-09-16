import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import pg from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import * as schema from '../models/schema.js';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("WARNING: DATABASE_URL environment variable is not defined in backend/.env!");
}

let db;

try {
  if (connectionString && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1') || connectionString.includes('host.docker.internal'))) {
    // Local PG connection pooling
    const pool = new pg.Pool({ connectionString });
    db = drizzlePg(pool, { schema });
    console.log("Initialized local PostgreSQL connection pool using node-postgres.");
  } else if (connectionString) {
    // NeonDB HTTP serverless driver (high concurrency, stateless, auto-scaling)
    const sql = neon(connectionString);
    db = drizzleNeon(sql, { schema });
    db.transaction = undefined;
    console.log("Initialized NeonDB serverless HTTP client.");
  } else {
    // Fallback stub client for initialization without erroring on start
    db = null;
    console.warn("No DATABASE_URL configured. Database connection is inactive.");
  }
} catch (error) {
  console.error("Database connection initialization failed:", error);
  db = null;
}

export { db };
