import { useState, useEffect } from 'react';
import * as api from '../api/opportunities';
import type { Opportunity, OpportunityCreate, OpportunityUpdate } from '../types/opportunity';

export interface UseOpportunitiesReturn {
  opportunities: Opportunity[];
  isLoading: boolean;
  error: string | null;
  getOpportunity: (id: string) => Promise<Opportunity>;
  createOpportunity: (data: OpportunityCreate) => Promise<Opportunity>;
  updateOpportunity: (id: string, data: OpportunityUpdate) => Promise<Opportunity>;
  deleteOpportunity: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useOpportunities(): UseOpportunitiesReturn {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getOpportunities();
      setOpportunities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return {
    opportunities,
    isLoading,
    error,
    getOpportunity: api.getOpportunity,
    createOpportunity: async (data: OpportunityCreate) => {
      const newOpportunity = await api.createOpportunity(data);
      setOpportunities((prev) => [...prev, newOpportunity]);
      return newOpportunity;
    },
    updateOpportunity: async (id: string, data: OpportunityUpdate) => {
      const updated = await api.updateOpportunity(id, data);
      setOpportunities((prev) =>
        prev.map((opp) => (opp.id === id ? updated : opp))
      );
      return updated;
    },
    deleteOpportunity: async (id: string) => {
      await api.deleteOpportunity(id);
      setOpportunities((prev) => prev.filter((opp) => opp.id !== id));
    },
    refetch: fetchOpportunities,
  };
}
