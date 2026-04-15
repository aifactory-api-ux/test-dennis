/**
 * Interaction Service - Routes
 * Handles CRUD operations for interactions and tasks
 * Listening Port: 8003
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { query as dbQuery } from '../../shared/db';
import { authMiddleware, AuthenticatedRequest } from '../../shared/auth';
import { Interaction, InteractionCreate, Task, TaskCreate, InteractionType } from '../../shared/types';

const router = Router();

// ============== VALIDATION MIDDLEWARE ==============

const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array() 
    });
    return;
  }
  next();
};

// ============== INTERACTION ROUTES ==============

/**
 * GET /api/interactions
 * Get all interactions, optionally filtered by opportunityId
 * Auth required: Yes
 */
router.get(
  '/',
  authMiddleware(),
  [
    query('opportunityId').optional().isUUID().withMessage('opportunityId must be a valid UUID')
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { opportunityId } = req.query;
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      let queryText = `
        SELECT id, opportunity_id, user_id, type, content, created_at
        FROM interactions
        WHERE user_id = $1
      `;
      const queryParams: unknown[] = [userId];

      if (opportunityId) {
        queryText += ' AND opportunity_id = $2';
        queryParams.push(opportunityId);
      }

      queryText += ' ORDER BY created_at DESC';

      const result = await dbQuery(queryText, queryParams);

      const interactions: Interaction[] = result.rows.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        opportunityId: row.opportunity_id as string,
        userId: row.user_id as string,
        type: row.type as InteractionType,
        content: row.content as string,
        createdAt: row.created_at as string
      }));

      res.status(200).json(interactions);
    } catch (error: unknown) {
      console.error('Error fetching interactions:', error);
      res.status(500).json({ error: 'Failed to fetch interactions' });
    }
  }
);

/**
 * POST /api/interactions
 * Create a new interaction
 * Auth required: Yes
 */
router.post(
  '/',
  authMiddleware(),
  [
    body('opportunityId').isUUID().withMessage('opportunityId must be a valid UUID'),
    body('type').isIn(['call', 'email', 'meeting', 'note']).withMessage('type must be one of: call, email, meeting, note'),
    body('content').isString().notEmpty().withMessage('content is required')
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { opportunityId, type, content } = req.body as InteractionCreate;
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = uuidv4();
      const createdAt = new Date().toISOString();

      await dbQuery(
        `INSERT INTO interactions (id, opportunity_id, user_id, type, content, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, opportunityId, userId, type, content, createdAt]
      );

      const interaction: Interaction = {
        id,
        opportunityId,
        userId,
        type,
        content,
        createdAt
      };

      res.status(201).json(interaction);
    } catch (error: unknown) {
      console.error('Error creating interaction:', error);
      res.status(500).json({ error: 'Failed to create interaction' });
    }
  }
);

// ============== TASK ROUTES ==============

/**
 * GET /api/interactions/tasks
 * Get all tasks, optionally filtered by opportunityId or status
 * Auth required: Yes
 */
router.get(
  '/tasks',
  authMiddleware(),
  [
    query('opportunityId').optional().isUUID().withMessage('opportunityId must be a valid UUID'),
    query('status').optional().isIn(['pending', 'in_progress', 'completed']).withMessage('status must be one of: pending, in_progress, completed')
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { opportunityId, status } = req.query;
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      let queryText = `
        SELECT id, title, description, status, due_date, completed_date, opportunity_id, user_id, created_at, updated_at
        FROM tasks
        WHERE user_id = $1
      `;
      const queryParams: unknown[] = [userId];
      let paramIndex = 2;

      if (opportunityId) {
        queryText += ` AND opportunity_id = $${paramIndex}`;
        queryParams.push(opportunityId);
        paramIndex++;
      }

      if (status) {
        queryText += ` AND status = $${paramIndex}`;
        queryParams.push(status);
      }

      queryText += ' ORDER BY due_date ASC';

      const result = await dbQuery(queryText, queryParams);

      const tasks: Task[] = result.rows.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        title: row.title as string,
        description: row.description as string,
        status: row.status as 'pending' | 'in_progress' | 'completed',
        dueDate: row.due_date as string,
        completedDate: row.completed_date as string | null,
        opportunityId: row.opportunity_id as string,
        userId: row.user_id as string,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string
      }));

      res.status(200).json(tasks);
    } catch (error: unknown) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }
);

/**
 * POST /api/interactions/tasks
 * Create a new task
 * Auth required: Yes
 */
router.post(
  '/tasks',
  authMiddleware(),
  [
    body('title').isString().notEmpty().withMessage('title is required'),
    body('description').optional().isString(),
    body('status').optional().isIn(['pending', 'in_progress', 'completed']).withMessage('status must be one of: pending, in_progress, completed'),
    body('dueDate').isISO8601().withMessage('dueDate must be a valid ISO8601 date'),
    body('opportunityId').isUUID().withMessage('opportunityId must be a valid UUID')
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, status, dueDate, opportunityId } = req.body as TaskCreate;
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = uuidv4();
      const taskStatus = status || 'pending';
      const createdAt = new Date().toISOString();
      const updatedAt = createdAt;

      await dbQuery(
        `INSERT INTO tasks (id, title, description, status, due_date, completed_date, opportunity_id, user_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, title, description || '', taskStatus, dueDate, null, opportunityId, userId, createdAt, updatedAt]
      );

      const task: Task = {
        id,
        title,
        description: description || '',
        status: taskStatus,
        dueDate,
        completedDate: null,
        opportunityId,
        userId,
        createdAt,
        updatedAt
      };

      res.status(201).json(task);
    } catch (error: unknown) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
);

/**
 * PUT /api/interactions/tasks/:id
 * Update a task
 * Auth required: Yes
 */
router.put(
  '/tasks/:id',
  authMiddleware(),
  [
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('title').optional().isString().notEmpty().withMessage('title cannot be empty'),
    body('description').optional().isString(),
    body('status').optional().isIn(['pending', 'in_progress', 'completed']).withMessage('status must be one of: pending, in_progress, completed'),
    body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid ISO8601 date'),
    body('opportunityId').optional().isUUID().withMessage('opportunityId must be a valid UUID')
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Build dynamic update query
      const allowedFields = ['title', 'description', 'status', 'dueDate', 'opportunityId'];
      const setClauses: string[] = ['updated_at = $1'];
      const queryParams: unknown[] = [new Date().toISOString()];
      let paramIndex = 2;

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          // Convert camelCase to snake_case for database
          const dbField = field === 'dueDate' ? 'due_date' : 
                          field === 'opportunityId' ? 'opportunity_id' : field;
          setClauses.push(`${dbField} = $${paramIndex}`);
          queryParams.push(updates[field]);
          paramIndex++;
        }
      }

      // Add completion date if status is completed
      if (updates.status === 'completed') {
        setClauses.push(`completed_date = $${paramIndex}`);
        queryParams.push(new Date().toISOString());
        paramIndex++;
      }

      queryParams.push(id, userId);

      const queryText = `
        UPDATE tasks 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
        RETURNING id, title, description, status, due_date, completed_date, opportunity_id, user_id, created_at, updated_at
      `;

      const result = await dbQuery(queryText, queryParams);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      const row = result.rows[0] as Record<string, unknown>;
      const task: Task = {
        id: row.id as string,
        title: row.title as string,
        description: row.description as string,
        status: row.status as 'pending' | 'in_progress' | 'completed',
        dueDate: row.due_date as string,
        completedDate: row.completed_date as string | null,
        opportunityId: row.opportunity_id as string,
        userId: row.user_id as string,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string
      };

      res.status(200).json(task);
    } catch (error: unknown) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }
);

/**
 * DELETE /api/interactions/tasks/:id
 * Delete a task
 * Auth required: Yes
 */
router.delete(
  '/tasks/:id',
  authMiddleware(),
  [
    param('id').isUUID().withMessage('id must be a valid UUID')
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await dbQuery(
        'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(200).json({ success: true });
    } catch (error: unknown) {
      console.error('Error deleting task:', error);
      next(error);
    }
  }
);

export default router;
