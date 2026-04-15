/**
 * Auth Service
 * Express server for user authentication
 * Port: 8001
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import { checkDatabaseConnection } from '../shared/db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', async (req, res) => {
  const dbConnected = await checkDatabaseConnection();
  res.json({
    status: dbConnected ? 'healthy' : 'degraded',
    service: 'auth-service',
    version: '1.0.0',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
  try {
    // Verify database connection
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.warn('Warning: Database connection failed. Service may not function correctly.');
    }

    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start auth service:', error);
    process.exit(1);
  }
}

start();

export default app;
