/**
 * Shared TypeScript types for opportunity-service
 * Re-exports and local types for opportunity management
 */

// Re-export opportunity types from main shared module path
// These are used by the routes and controllers

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

export interface Interaction {
  id: string;
  opportunityId: string;
  userId: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  content: string;
  createdAt: string;
}

export interface InteractionCreate {
  opportunityId: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  content: string;
}

export type InteractionType = 'call' | 'email' | 'meeting' | 'note';

export const INTERACTION_TYPES: InteractionType[] = [
  'call',
  'email',
  'meeting',
  'note'
];

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
