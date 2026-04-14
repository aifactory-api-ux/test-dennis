/**
 * Database utilities for opportunity-service
 * Shared PostgreSQL connection pool
 */

import { Pool, QueryResult } from 'pg';

let pool: Pool | null = null;

/**
 * Get or create the database connection pool
 * Uses DATABASE_URL from environment variables
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('Missing required environment variable: DATABASE_URL');
    }

    pool = new Pool({
      connectionString,
      max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || '20', 10),
      idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT || '2000', 10),
    });

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error:', err);
    });
  }
  return pool;
}

/**
 * Execute a SQL query with parameters
 * @param text - SQL query text with placeholders ($1, $2, etc.)
 * @param params - Array of parameter values
 * @returns Query result with rows
 */
export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const p = getPool();
  return p.query<T>(text, params);
}

/**
 * Execute a SQL query within a client from the pool
 * Use when you need to run multiple queries in a transaction
 * @param text - SQL query text
 * @param params - Array of parameter values
 * @returns Query result with rows
 */
export async function queryWithClient<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const client = await getPool().connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

/**
 * Check database connectivity
 * @returns true if connection successful
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Close the database connection pool
 * Call this during graceful shutdown
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
