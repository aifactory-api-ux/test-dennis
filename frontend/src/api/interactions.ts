import type { Interaction, InteractionCreate } from '../types/interaction';

const BASE_URL = '/api/interactions';

export const interactionsApi = {
  getAll: async (): Promise<Interaction[]> => {
    const response = await fetch(BASE_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) throw new Error('Failed to fetch interactions');
    return response.json();
  },

  getById: async (id: string): Promise<Interaction> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) throw new Error('Failed to fetch interaction');
    return response.json();
  },

  getByOpportunity: async (opportunityId: string): Promise<Interaction[]> => {
    const response = await fetch(`${BASE_URL}?opportunityId=${opportunityId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) throw new Error('Failed to fetch interactions');
    return response.json();
  },

  create: async (data: InteractionCreate): Promise<Interaction> => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create interaction');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) throw new Error('Failed to delete interaction');
  },
};

export const getInteractions = interactionsApi.getAll;
