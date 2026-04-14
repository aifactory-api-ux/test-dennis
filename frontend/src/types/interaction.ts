/**
 * TypeScript types for Interaction entities
 * Mirrors the backend types from SPEC.md and shared foundation
 */

import type { InteractionType } from '../../backend/shared/types';

export type { InteractionType };

/**
 * Interaction entity representing a communication or activity with a prospect
 */
export interface Interaction {
  /** Unique identifier (UUID) */
  id: string;
  /** Associated opportunity ID (UUID) */
  opportunityId: string;
  /** User who created the interaction (UUID) */
  userId: string;
  /** Type of interaction */
  type: InteractionType;
  /** Content/notes of the interaction */
  content: string;
  /** Creation timestamp (ISO8601) */
  createdAt: string;
}

/**
 * Data required to create a new interaction
 */
export interface InteractionCreate {
  /** Associated opportunity ID (UUID) */
  opportunityId: string;
  /** Type of interaction */
  type: InteractionType;
  /** Content/notes of the interaction */
  content: string;
}
