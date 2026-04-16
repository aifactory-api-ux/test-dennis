/**
 * Tests for database connection and query utilities
 * Validates PostgreSQL connection pool and query functionality
 */

import { query, checkDatabaseConnection, closePool } from '../db';

describe('backend/shared/db.ts', () => {

  describe('Database connection pool', () => {
    it('should establish PostgreSQL connection pool with valid config', async () => {
      // This test requires POSTGRES_* environment variables to be set
      // In test environment, we expect the pool to be created
      const canConnect = await checkDatabaseConnection();
      
      // If environment variables are properly set, should connect
      // Otherwise, will throw error about missing environment variables
      expect(canConnect).toBe(true);
    });

    it('should throw error if required environment variables are missing', async () => {
      // Verify that calling query without proper env vars will fail
      // This test verifies the pool connection logic
      const originalEnv = { ...process.env };
      
      // Remove required environment variables
      delete process.env.POSTGRES_HOST;
      delete process.env.POSTGRES_PORT;
      delete process.env.POSTGRES_USER;
      delete process.env.POSTGRES_PASSWORD;
      delete process.env.POSTGRES_DB;

      // Try to query without env vars - should fail
      let threwError = false;
      
      try {
        jest.resetModules();
        const db = require('../db');
        // Querying without env vars will fail
        await db.query('SELECT 1');
      } catch (error: any) {
        threwError = true;
      }

      // Restore original env
      process.env = originalEnv;

      // Verify error was thrown
      expect(threwError).toBe(true);
    });
  });

  describe('Query execution', () => {
    it('should execute a simple query successfully', async () => {
      // Execute a simple SELECT query
      const result = await query<{ result: number }>('SELECT 1 as result');
      
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].result).toBe(1);
    });

    it('should handle query errors gracefully', async () => {
      // Try to query a non-existing table
      let errorOccurred = false;
      let errorMessage = '';
      
      try {
        await query('SELECT * FROM non_existing_table');
      } catch (error: any) {
        errorOccurred = true;
        errorMessage = error.message;
      }

      // Verify error was handled
      expect(errorOccurred).toBe(true);
      expect(errorMessage.includes('relation') || errorMessage.includes('does not exist')).toBe(true);
    });
  });

  afterAll(async () => {
    // Clean up pool after tests
    await closePool();
  });
});
