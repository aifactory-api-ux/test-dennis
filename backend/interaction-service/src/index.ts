/**
 * Interaction Service - Express Server Entry Point
 * Handles CRUD operations for interactions and tasks
 * Listening Port: 8003
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { getPool, checkDatabaseConnection } from '../shared/db';
import { authMiddleware, verifyToken, TokenPayload } from '../shared/auth';
import { Interaction, InteractionCreate, Task, TaskCreate, InteractionType } from '../shared/types';

// Load environment variables
dotenv.config();

// ============== ENVIRONMENT VALIDATION ==============

interface ServiceConfig {
  port: number;
  nodeEnv: string;
}

function getServiceConfig(): ServiceConfig {
  const port = process.env.PORT;
  
  if (!port) {
    throw new Error('Missing required environment variable: PORT');
  }

  return {
    port: parseInt(port, 10),
    nodeEnv: process.env.NODE_ENV || 'development'
  };
}

// ============== EXPRESS APP SETUP ==============

const app: Application = express();
const config = getServiceConfig();

// Middleware
app.use(cors());
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============== DATABASE INITIALIZATION ==============

async function initializeDatabase(): Promise<void> {
  const pool = getPool();
  
  // Create interactions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS interactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      opportunity_id UUID NOT NULL,
      user_id UUID NOT NULL,
      type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  // Create tasks table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
      due_date TIMESTAMP WITH TIME ZONE NOT NULL,
      completed_date TIMESTAMP WITH TIME ZONE,
      opportunity_id UUID NOT NULL,
      user_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  console.log('Database tables initialized successfully');
}

// ============== HEALTH CHECK ==============

app.get('/health', async (_req: Request, res: Response) => {
  try {
    const dbHealthy = await checkDatabaseConnection();
    
    if (dbHealthy) {
      res.json({
        status: 'healthy',
        service: 'interaction-service',
        version: '1.0.0',
        database: 'connected'
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'interaction-service',
        version: '1.0.0',
        database: 'disconnected'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'interaction-service',
      version: '1.0.0',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============== INTERACTION ROUTES ==============

import interactionsRouter from './routes/interactions';
app.use('/api/interactions', interactionsRouter);

// ============== START SERVER ==============

(async () => {
  try {
    await initializeDatabase();
    app.listen(config.port, () => {
      console.log(`Interaction service running on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start interaction service:', err);
    process.exit(1);
  }
})();

export default app;
