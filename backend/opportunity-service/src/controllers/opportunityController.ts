/**
 * Opportunity Controller
 * Business logic for opportunity management
 */

import { Request, Response, NextFunction } from 'express';
import { query } from '../../shared/db';
import { AuthenticatedRequest } from '../../shared/auth';
import { Opportunity, OpportunityCreate, OpportunityStage, OPPORTUNITY_STAGES } from '../../shared/types';

// Validation helper
function isValidStage(stage: string): stage is OpportunityStage {
  return OPPORTUNITY_STAGES.includes(stage as OpportunityStage);
}

export async function getAllOpportunities(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    
    let sql = `
      SELECT id, name, company, value, stage, owner_id as "ownerId",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM opportunities
    `;
    
    const params: unknown[] = [];
    
    if (userId) {
      sql += ' WHERE owner_id = $1';
      params.push(userId);
    }
    
    sql += ' ORDER BY create_at DESC';
    
    const result = await query<Opportunity>(sql, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

export async function getOpportunityById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT id, name, company, value, stage, owner_id as "ownerId",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM opportunities
      WHERE id = $1
    `;
    
    const result = await query<Opportunity>(sql, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function createOpportunity(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as OpportunityCreate;
    const userId = req.user?.userId;
    
    // Validation
    if (!data.name || data.name.trim().length === 0) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    
    if (!data.company || data.company.trim().length === 0) {
      res.status(400).json({ error: 'Company is required' });
      return;
    }
    
    if (typeof data.value !== 'number' || data.value < 0) {
      res.status(400).json({ error: 'Value must be a non-negative number' });
      return;
    }
    
    if (!data.stage || !isValidStage(data.stage)) {
      res.status(400).json({ error: `Stage must be one of: ${OPPORTUNITY_STAGES.join(', ')}` });
      return;
    }
    
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const sql = `
      INSERT INTO opportunities (id, name, company, value, stage, owner_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, company, value, stage, owner_id as "ownerId", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const params = [
      id,
      data.name,
      data.company,
      data.value,
      data.stage,
      userId,
      now,
      now
    ];
    
    const result = await query<Opportunity>(sql, params);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function updateOpportunity(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Check existence
    const checkResult = await query('SELECT id FROM opportunities WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }
    
    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;
    
    if (data.name !== undefined) {
      if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        res.status(400).json({ error: 'Name must be a non-empty string' });
        return;
      }
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    
    if (data.company !== undefined) {
      if (!data.company || typeof data.company !== 'string' || data.company.trim().length === 0) {
        res.status(400).json({ error: 'Company must be a non-empty string' });
        return;
      }
      updates.push(`company = $${paramIndex++}`);
      params.push(data.company);
    }
    
    if (data.value !== undefined) {
      if (typeof data.value !== 'number' || data.value < 0) {
        res.status(400).json({ error: 'Value must be a non-negative number' });
        return;
      }
      updates.push(`value = $${paramIndex++}`);
      params.push(data.value);
    }
    
    if (data.stage !== undefined) {
      if (!isValidStage(data.stage)) {
        res.status(400).json({ error: `Stage must be one of: ${OPPORTUNITY_STAGES.join(', ')}` });
        return;
      }
      updates.push(`stage = $${paramIndex++}`);
      params.push(data.stage);
    }
    
    if (updates.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }
    
    updates.push(`updated_at = $${paramIndex++}`);
    params.push(new Date().toISOString());
    params.push(id);
    
    const sql = `
      UPDATE opportunities
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, company, value, stage, owner_id as "ownerId", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await query<Opportunity>(sql, params);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function deleteOpportunity(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    
    const sql = 'DELETE FROM opportunities WHERE id = $1 RETURNING id';
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
