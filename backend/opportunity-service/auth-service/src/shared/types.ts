/**
 * Shared TypeScript types for opportunity-service auth module
 * Re-exports from main shared types and provides auth-specific types
 */

// Re-export opportunity types from parent shared module
export type OpportunityStage = 'lead' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

export const OPPORTUNITY_STAGES: OpportunityStage[] = [
  'lead',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost'
];

export interface Opportunity {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: OpportunityStage;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityCreate {
  name: string;
  company: string;
  value: number;
  stage: OpportunityStage;
}

export interface OpportunityUpdate {
  name?: string;
  company?: string;
  value?: number;
  stage?: OpportunityStage;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Interaction types
export type InteractionType = 'call' | 'email' | 'meeting' | 'note';

export const INTERACTION_TYPES: InteractionType[] = [
  'call',
  'email',
  'meeting',
  'note'
];

export interface Interaction {
  id: string;
  opportunityId: string;
  userId: string;
  type: InteractionType;
  content: string;
  createdAt: string;
}

export interface InteractionCreate {
  opportunityId: string;
  type: InteractionType;
  content: string;
}

// Task types
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string;
  completedDate?: string | null;
  opportunityId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate: string;
  opportunityId: string;
}

/**
 * Validate if a string is a valid opportunity stage
 */
export function isValidOpportunityStage(stage: string): stage is OpportunityStage {
  return OPPORTUNITY_STAGES.includes(stage as OpportunityStage);
}

/**
 * Validate if a string is a valid interaction type
 */
export function isValidInteractionType(type: string): type is InteractionType {
  return INTERACTION_TYPES.includes(type as InteractionType);
}
