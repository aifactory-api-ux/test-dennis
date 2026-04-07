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
  createdAt: string;
  updatedAt: string;
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
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectCreate {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  notes: string;
}

// Interaction types
export type InteractionType = 'call' | 'email' | 'meeting' | 'note';
export const INTERACTION_TYPES: InteractionType[] = ['call', 'email', 'meeting', 'note'];

export function isValidInteractionType(type: string): type is InteractionType {
  return INTERACTION_TYPES.includes(type as InteractionType);
}

