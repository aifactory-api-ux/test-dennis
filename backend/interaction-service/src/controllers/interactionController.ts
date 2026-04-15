/**
 * Interaction Controller
 * Handles business logic for interactions and tasks CRUD operations
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query as dbQuery } from '../../shared/db';
import { authMiddleware, AuthenticatedRequest } from '../../shared/auth';
import { Interaction, InteractionCreate, InteractionType } from '../../shared/types';

// ============== ERROR CLASSES ==============

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// ============== VALIDATION CONSTANTS ==============

const MAX_CONTENT_LENGTH = 5000;
const VALID_INTERACTION_TYPES: InteractionType[] = ['call', 'email', 'meeting', 'note'];

// ============== VALIDATION FUNCTIONS ==============

/**
 * Validate UUID format
 */
function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validate interaction type
 */
function isValidInteractionType(type: string): type is InteractionType {
  return VALID_INTERACTION_TYPES.includes(type as InteractionType);
}

/**
 * Validate InteractionCreate payload
 */
function validateInteractionCreate(data: InteractionCreate): void {
  if (!data.opportunityId) {
    throw new ValidationError('opportunityId is required', 'opportunityId');
  }

  if (!isValidUUID(data.opportunityId)) {
    throw new ValidationError('opportunityId must be a valid UUID', 'opportunityId');
  }

  if (!data.type) {
    throw new ValidationError('type is required', 'type');
  }

  if (!isValidInteractionType(data.type)) {
    throw new ValidationError(`type must be one of: ${VALID_INTERACTION_TYPES.join(', ')}`, 'type');
  }

  if (!data.content) {
    throw new ValidationError('content is required', 'content');
  }

  if (typeof data.content !== 'string') {
    throw new ValidationError('content must be a string', 'content');
  }

  if (data.content.trim().length === 0) {
    throw new ValidationError('content cannot be empty', 'content');
  }

  if (data.content.length > MAX_CONTENT_LENGTH) {
    throw new ValidationError(`content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters`, 'content');
  }
}

// ============== CONTROLLER FUNCTIONS ==============

/**
 * Create a new interaction
 * POST /api/interactions
 */
export async function createInteraction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data: InteractionCreate = req.body;

    // Validate input
    validateInteractionCreate(data);

    // Check if opportunity exists
    const opportunityCheck = await dbQuery(
      'SELECT id FROM opportunities WHERE id = $1',
      [data.opportunityId]
    );

    if (opportunityCheck.rowCount === 0) {
      throw new NotFoundError('Opportunity not found', 'opportunityId');
    }

    // Create interaction
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const result = await dbQuery(
      `INSERT INTO interactions (id, opportunity_id, user_id, type, content, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, opportunity_id, user_id, type, content, created_at`,
      [id, data.opportunityId, userId, data.type, data.content, createdAt]
    );

    const row = result.rows[0];

    const interaction: Interaction = {
      id: row.id,
      opportunityId: row.opportunity_id,
      userId: row.user_id,
      type: row.type as InteractionType,
      content: row.content,
      createdAt: row.created_at
    };

    res.status(201).json(interaction);
  } catch (error) {
    next(error);
  }
}

/**
 * Get interactions by opportunity ID
 * GET /api/interactions?opportunityId=...
 */
export async function getInteractionsByOpportunityId(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { opportunityId } = req.query;

    if (opportunityId) {
      if (typeof opportunityId !== 'string') {
        throw new ValidationError('opportunityId must be a string', 'opportunityId');
      }

      if (!isValidUUID(opportunityId)) {
        throw new ValidationError('opportunityId must be a valid UUID', 'opportunityId');
      }

      const result = await dbQuery(
        `SELECT id, opportunity_id, user_id, type, content, created_at
         FROM interactions
         WHERE user_id = $1 AND opportunity_id = $2
         ORDER BY created_at DESC`,
        [userId, opportunityId]
      );

      const interactions: Interaction[] = result.rows.map(row => ({
        id: row.id,
        opportunityId: row.opportunity_id,
        userId: row.user_id,
        type: row.type as InteractionType,
        content: row.content,
        createdAt: row.created_at
      }));

      res.json(interactions);
    } else {
      // Return all interactions for the user
      const result = await dbQuery(
        `SELECT id, opportunity_id, user_id, type, content, created_at
         FROM interactions
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      const interactions: Interaction[] = result.rows.map(row => ({
        id: row.id,
        opportunityId: row.opportunity_id,
        userId: row.user_id,
        type: row.type as InteractionType,
        content: row.content,
        createdAt: row.created_at
      }));

      res.json(interactions);
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single interaction by ID
 * GET /api/interactions/:id
 */
export async function getInteractionById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!id || !isValidUUID(id)) {
      throw new ValidationError('id must be a valid UUID', 'id');
    }

    const result = await dbQuery(
      `SELECT id, opportunity_id, user_id, type, content, created_at
       FROM interactions
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Interaction not found', 'id');
    }

    const row = result.rows[0];

    const interaction: Interaction = {
      id: row.id,
      opportunityId: row.opportunity_id,
      userId: row.user_id,
      type: row.type as InteractionType,
      content: row.content,
      createdAt: row.created_at
    };

    res.json(interaction);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an interaction
 * DELETE /api/interactions/:id
 */
export async function deleteInteraction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!id || !isValidUUID(id)) {
      throw new ValidationError('id must be a valid UUID', 'id');
    }

    const result = await dbQuery(
      'DELETE FROM interactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Interaction not found', 'id');
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

// ============== ERROR HANDLING MIDDLEWARE ==============

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Interaction Controller Error:', err);

  if (err instanceof ValidationError) {
    res.status(400).json({
      error: err.message,
      field: err.field,
      type: 'ValidationError'
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({
      error: err.message,
      field: err.field,
      type: 'NotFoundError'
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error'
  });
}
