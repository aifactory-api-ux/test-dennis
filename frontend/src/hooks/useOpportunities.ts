import { useState, useCallback } from 'react';
import { Opportunity, OpportunityCreate } from '../types/opportunity';
import * as opportunitiesApi from '../api/opportunities';

export interface UseOpportunitiesReturn {
  opportunities: Opportunity[];
  loading: boolean;
  error: string | null;
  fetchOpportunities: () => Promise<void>;
  getOpportunity: (id: string) => Promise<Opportunity | null>;
  createOpportunity: (data: OpportunityCreate) => Promise<Opportunity | null>;
  updateOpportunity: (id: string, data: OpportunityCreate) => Promise<Opportunity | null>;
  deleteOpportunity: (id: string) => Promise<boolean>;
}

export function useOpportunities(): UseOpportunitiesReturn {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await opportunitiesApi.getOpportunities();
      setOpportunities(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar oportunidades');
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getOpportunity = useCallback(async (id: string): Promise<Opportunity | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await opportunitiesApi.getOpportunity(id);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al cargar oportunidad');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOpportunity = useCallback(async (data: OpportunityCreate): Promise<Opportunity | null> => {
    setLoading(true);
    setError(null);
    try {
      const newOpportunity = await opportunitiesApi.createOpportunity(data);
      setOpportunities(prev => [...prev, newOpportunity]);
      return newOpportunity;
    } catch (err: any) {
      setError(err.message || 'Error al crear oportunidad');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOpportunity = useCallback(async (id: string, data: OpportunityCreate): Promise<Opportunity | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedOpportunity = await opportunitiesApi.updateOpportunity(id, data);
      setOpportunities(prev =>
        prev.map(opp => (opp.id === id ? updatedOpportunity : opp))
      );
      return updatedOpportunity;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar oportunidad');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOpportunity = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const success = await opportunitiesApi.deleteOpportunity(id);
      if (success) {
        setOpportunities(prev => prev.filter(opp => opp.id !== id));
      }
      return success;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar oportunidad');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    opportunities,
    loading,
    error,
    fetchOpportunities,
    getOpportunity,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
  };
}

export default useOpportunities;
