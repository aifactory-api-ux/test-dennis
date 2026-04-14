import { useState, useCallback } from 'react';
import { Interaction, InteractionCreate } from '../types/interaction';
import * as api from '../api/interactions';

interface UseInteractionsReturn {
  interactions: Interaction[];
  loading: boolean;
  error: string | null;
  fetchInteractions: (opportunityId?: string) => Promise<void>;
  createInteraction: (data: InteractionCreate) => Promise<Interaction>;
  clearError: () => void;
}

export function useInteractions(): UseInteractionsReturn {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInteractions = useCallback(async (opportunityId?: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getInteractions(opportunityId);
      setInteractions(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener interacciones');
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createInteraction = useCallback(async (data: InteractionCreate): Promise<Interaction> => {
    setLoading(true);
    setError(null);
    
    try {
      const newInteraction = await api.createInteraction(data);
      setInteractions((prev) => [newInteraction, ...prev]);
      return newInteraction;
    } catch (err: any) {
      setError(err.message || 'Error al crear interacción');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    interactions,
    loading,
    error,
    fetchInteractions,
    createInteraction,
    clearError,
  };
}
