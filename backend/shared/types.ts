// Opportunity types
export type OpportunityStage = 'lead' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
export const OPPORTUNITY_STAGES: OpportunityStage[] = ['lead', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

export interface Opportunity {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: OpportunityStage;
  ownerId: string;
  created_at: string;
  updated_at: string;
}

export interface OpportunityCreate {
  name: string;
  company: string;
  value: number;
  stage: OpportunityStage;
}

export function isValidOpportunityStage(stage: string): stage is OpportunityStage {
  return OPPORTUNITY_STAGES.includes(stage as OpportunityStage);
}

// Prospect types
export interface Prospect {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  notes: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProspectCreate {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  notes: string;
}

// User types
export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  token: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Interaction types
export type InteractionType = 'call' | 'email' | 'meeting' | 'note';
export const INTERACTION_TYPES: InteractionType[] = ['call', 'email', 'meeting', 'note'];

export function isValidInteractionType(type: string): type is InteractionType {
  return INTERACTION_TYPES.includes(type as InteractionType);
}

export interface Interaction {
  id: string;
  type: InteractionType;
  content: string;
  opportunityId: string;
  userId: string;
  createdAt: string;
}

export interface InteractionCreate {
  type: InteractionType;
  content: string;
  opportunityId: string;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  completedDate?: string;
  opportunityId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreate {
  title: string;
  description: string;
  status: string;
  dueDate: string;
  completedDate?: string;
  opportunityId: string;
}
