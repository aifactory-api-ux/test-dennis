/*
 * Shared config loader and validator for environment variables.
 * Throws on missing required variables.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (typeof value === 'undefined' || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT ? Number(process.env.PORT) : undefined;

// Postgres
export const POSTGRES_HOST = requireEnv('POSTGRES_HOST');
export const POSTGRES_PORT = process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432;
export const POSTGRES_USER = requireEnv('POSTGRES_USER');
export const POSTGRES_PASSWORD = requireEnv('POSTGRES_PASSWORD');
export const POSTGRES_DB = requireEnv('POSTGRES_DB');

// JWT
export const JWT_SECRET = requireEnv('JWT_SECRET');

// Redis
export const REDIS_HOST = requireEnv('REDIS_HOST');
export const REDIS_PORT = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
