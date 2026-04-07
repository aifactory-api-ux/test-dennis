/**
 * Shared TypeScript types for frontend
 * Re-exports types used across the frontend application
 * Mirrors backend shared types for consistency
 */

/**
 * Opportunity stage in the sales pipeline
 */
export type OpportunityStage = 'lead' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

/**
 * All valid opportunity stages
 */
export const OPPORTUNITY_STAGES: OpportunityStage[] = [
  'lead',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost'
];

/**
 * Opportunity entity representing a sales opportunity in the pipeline
 */
export interface Opportunity {
  /** Unique identifier (UUID) */
  id: string;
  /** Name of the opportunity */
  name: string;
  /** Company name associated with the opportunity */
  company: string;
  /** Potential value/amount in the pipeline */
  value: number;
  /** Current stage in the sales pipeline */
  stage: OpportunityStage;
  /** User ID of the opportunity owner */
  ownerId: string;
  /** Creation timestamp (ISO8601) */
  createdAt: string;
  /** Last update timestamp (ISO8601) */
  updatedAt: string;
}

/**
 * Data required to create a new opportunity
 */
export interface OpportunityCreate {
  /** Name of the opportunity */
  name: string;
  /** Company name associated with the opportunity */
  company: string;
  /** Potential value/amount in the pipeline */
  value: number;
  /** Initial stage in the sales pipeline */
  stage: OpportunityStage;
}

/**
 * User entity representing a registered user in the system
 */
export interface User {
  /** Unique identifier (UUID) */
  id: string;
  /** User email address */
  email: string;
  /** User's full name */
  name: string;
  /** Hashed password (backend only) */
  passwordHash: string;
  /** Account creation timestamp */
  createdAt: string;
}

/**
 * Request payload for user login
 */
export interface UserLoginRequest {
  /** User email address */
  email: string;
  /** User password (plaintext) */
  password: string;
}

/**
 * Response payload after successful login
 */
export interface UserLoginResponse {
  /** JWT authentication token */
  token: string;
  /** Authenticated user information */
  user: {
    /** User unique identifier */
    id: string;
    /** User email address */
    email: string;
    /** User's full name */
    name: string;
  };
}

/**
 * Type of interaction in the sales process
 */
export type InteractionType = 'call' | 'email' | 'meeting' | 'note';

/**
 * All valid interaction types
 */
export const INTERACTION_TYPES: InteractionType[] = [
  'call',
  'email',
  'meeting',
  'note'
];

/**
 * Interaction entity representing a sales interaction
 */
export interface Interaction {
  /** Unique identifier (UUID) */
  id: string;
  /** Related opportunity ID */
  opportunityId: string;
  /** User who created the interaction */
  userId: string;
  /** Type of interaction */
  type: InteractionType;
  /** Content/details of the interaction */
  content: string;
  /** Creation timestamp (ISO8601) */
  createdAt: string;
}

/**
 * Data required to create a new interaction
 */
export interface InteractionCreate {
  /** Related opportunity ID */
  opportunityId: string;
  /** Type of interaction */
  type: InteractionType;
  /** Content/details of the interaction */
  content: string;
}

/**
 * Task status in the workflow
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Task entity representing a todo/action item
 */
export interface Task {
  /** Unique identifier (UUID) */
  id: string;
  /** Task title */
  title: string;
  /** Task description */
  description?: string;
  /** Current status */
  status: TaskStatus;
  /** Due date (ISO8601) */
  dueDate: string;
  /** Completion date if applicable */
  completedDate?: string | null;
  /** Related opportunity ID */
  opportunityId: string;
  /** User who owns the task */
  userId: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Data required to create a new task
 */
export interface TaskCreate {
  /** Task title */
  title: string;
  /** Task description */
  description?: string;
  /** Initial status */
  status?: TaskStatus;
  /** Due date (ISO8601) */
  dueDate: string;
  /** Related opportunity ID */
  opportunityId: string;
}

/**
 * Validate if a string is a valid opportunity stage
 * @param stage - Stage string to validate
 * @returns True if valid stage
 */
export function isValidOpportunityStage(stage: string): stage is OpportunityStage {
  return OPPORTUNITY_STAGES.includes(stage as OpportunityStage);
}

/**
 * Validate if a string is a valid interaction type
 * @param type - Type string to validate
 * @returns True if valid type
 */
export function isValidInteractionType(type: string): type is InteractionType {
  return INTERACTION_TYPES.includes(type as InteractionType);
}
