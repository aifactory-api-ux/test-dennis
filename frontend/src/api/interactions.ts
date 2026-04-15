import type { Interaction, InteractionCreate } from '../types/interaction';
import { api } from './config';

const BASE_URL = '/api/interactions';

export const interactionsApi = {
  getAll: async (): Promise<Interaction[]> => {
    const response = await api.get<Interaction[]>(BASE_URL);
    return response.data;
  },

  getById: async (id: string): Promise<Interaction> => {
    const response = await api.get<Interaction>(`${BASE_URL}/${id}`);
    return response.data;
  },

  getByOpportunity: async (opportunityId: string): Promise<Interaction[]> => {
    const response = await api.get<Interaction[]>(`${BASE_URL}?opportunityId=${opportunityId}`);
    return response.data;
  },

  create: async (data: InteractionCreate): Promise<Interaction> => {
    const response = await api.post<Interaction>(BASE_URL, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};

export const getInteractions = interactionsApi.getAll;
