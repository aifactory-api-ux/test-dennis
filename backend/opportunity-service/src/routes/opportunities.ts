import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../shared/auth';
import {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
} from '../controllers/opportunityController';

const router = Router();

// GET /api/opportunities
router.get('/', authMiddleware(), getAllOpportunities);

// GET /api/opportunities/:id
router.get('/:id', authMiddleware(), getOpportunityById);

// POST /api/opportunities
router.post('/', authMiddleware(), createOpportunity);

// PUT /api/opportunities/:id
router.put('/:id', authMiddleware(), updateOpportunity);

// DELETE /api/opportunities/:id
router.delete('/:id', authMiddleware(), deleteOpportunity);

export default router;
