import axios from 'axios';
import type { Opportunity, OpportunityCreate, OpportunityUpdate } from '../types/opportunity';

const API_URL = '/api/opportunities';

// Get all opportunities
export async function getOpportunities(): Promise<Opportunity[]> {
  const response = await axios.get<Opportunity[]>(API_URL);
  return response.data;
}

// Get a single opportunity by ID
export async function getOpportunity(id: string): Promise<Opportunity> {
  const response = await axios.get<Opportunity>(`${API_URL}/${id}`);
  return response.data;
}

// Create a new opportunity
export async function createOpportunity(data: OpportunityCreate): Promise<Opportunity> {
  const response = await axios.post<Opportunity>(API_URL, data);
  return response.data;
}

// Update an existing opportunity
export async function updateOpportunity(id: string, data: OpportunityUpdate): Promise<Opportunity> {
  const response = await axios.put<Opportunity>(`${API_URL}/${id}`, data);
  return response.data;
}

// Delete an opportunity
export async function deleteOpportunity(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}
