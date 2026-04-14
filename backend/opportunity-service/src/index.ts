/**
 * Opportunity Service - Main Entry Point
 * Handles CRUD operations for opportunities and prospects
 * Port: 8002
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import shared modules
import { authMiddleware, AuthenticatedRequest } from '../../shared/auth';
import { query, getPool } from '../../shared/db';
import { Opportunity, OpportunityCreate, OpportunityStage, Prospect, ProspectCreate } from '../../shared/types';

// Import routes
import opportunitiesRouter from './routes/opportunities';

// ============== ENVIRONMENT VALIDATION ==============

function validateEnvironment(): void {
  const requiredVars = [
    'PORT',
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
    'JWT_SECRET'
  ];

  const missingVars: string[] = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  console.log('Environment variables validated successfully');
}

// ============== EXPRESS SETUP ==============

const app = express();
const PORT = parseInt(process.env.PORT || '8002', 10);

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============== HEALTH CHECK ==============

app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const pool = getPool();
    await pool.query('SELECT 1');
    
    res.json({
      status: 'healthy',
      service: 'opportunity-service',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'opportunity-service',
      version: '1.0.0',
      error: 'Database connection failed'
    });
  }
});

// ============== PROSPECTS ROUTER (Inline for simplicity) ==============

import { Router } from 'express';
const prospectsRouter = Router();

// GET /api/prospects - List all prospects
prospectsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    const result = await query<Prospect>(
      'SELECT id, name, company, email, phone, status, notes, user_id, created_at, updated_at FROM prospects WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const prospects = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      company: row.company,
      email: row.email,
      phone: row.phone,
      status: row.status,
      notes: row.notes,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.json(prospects);
  } catch (error) {
    console.error('Error fetching prospects:', error);
    res.status(500).json({ error: 'Failed to fetch prospects' });
  }
});

// GET /api/prospects/:id - Get single prospect
prospectsRouter.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    const result = await query<Prospect>(
      'SELECT id, name, company, email, phone, status, notes, user_id, created_at, updated_at FROM prospects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prospect not found' });
    }
    
    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      company: row.company,
      email: row.email,
      phone: row.phone,
      status: row.status,
      notes: row.notes,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (error) {
    console.error('Error fetching prospect:', error);
    res.status(500).json({ error: 'Failed to fetch prospect' });
  }
});

// ============== ROUTES ==============

app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/prospects', prospectsRouter);

// ============== ERROR HANDLING ==============

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============== START SERVER ==============

validateEnvironment();

app.listen(PORT, () => {
  console.log(`Opportunity service running on port ${PORT}`);
});

export default app;
