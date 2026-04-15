import { api } from './config';
import type { Opportunity, OpportunityCreate, OpportunityUpdate } from '../types/opportunity';

// Get all opportunities
export async function getOpportunities(): Promise<Opportunity[]> {
  const response = await api.get<Opportunity[]>('/opportunities');
  return response.data;
}

// Get a single opportunity by ID
export async function getOpportunity(id: string): Promise<Opportunity> {
  const response = await api.get<Opportunity>(`/opportunities/${id}`);
  return response.data;
}

// Create a new opportunity
export async function createOpportunity(data: OpportunityCreate): Promise<Opportunity> {
  const response = await api.post<Opportunity>('/opportunities', data);
  return response.data;
}

// Update an existing opportunity
export async function updateOpportunity(id: string, data: OpportunityUpdate): Promise<Opportunity> {
  const response = await api.put<Opportunity>(`/opportunities/${id}`, data);
  return response.data;
}

// Delete an opportunity
export async function deleteOpportunity(id: string): Promise<void> {
  await api.delete(`/opportunities/${id}`);
}
