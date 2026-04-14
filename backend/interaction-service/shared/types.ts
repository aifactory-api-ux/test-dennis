/**
 * Shared TypeScript types for interaction-service
 * Re-exports and local types for interaction management
 */

export type InteractionType = 'call' | 'email' | 'meeting' | 'note';

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

export const INTERACTION_TYPES: InteractionType[] = [
  'call',
  'email',
  'meeting',
  'note'
];

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
