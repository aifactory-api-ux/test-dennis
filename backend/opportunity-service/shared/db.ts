/**
 * Database utilities for opportunity-service
 * Provides database connection and query functionality
 */

import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;

/**
 * Get the PostgreSQL connection pool
 * Creates pool if not already created
 * @returns PostgreSQL pool instance
 */
export function getPool(): Pool {
  if (!pool) {
    const requiredVars = ['POSTGRES_HOST', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB'];
    const missing = requiredVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    pool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || '20', 10),
      idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT || '2000', 10),
    });

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error:', err);
    });

    pool.on('connect', () => {
      console.log('New PostgreSQL client connected to pool');
    });
  }
  return pool;
}

/**
 * Execute a database query
 * @param text - SQL query text with parameter placeholders
 * @param params - Array of parameter values
 * @returns Query result
 */
export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const p = getPool();
  const start = Date.now();
  
  try {
    const result = await p.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', { text, params, error });
    throw error;
  }
}

/**
 * Check if database connection is healthy
 * @returns True if connection successful
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health');
    return result.rows[0]?.health === 1;
  } catch {
    return false;
  }
}

/**
 * Close the database connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('PostgreSQL pool closed');
  }
}

/**
 * Get a client from the pool for transactions
 * @returns Pooled client
 */
export async function getClient() {
  const p = getPool();
  return p.connect();
}
