import { useState, useEffect, useCallback } from 'react';
import type { Interaction, InteractionCreate } from '../types/interaction';
import { interactionsApi } from '../api/interactions';

export interface UseInteractionsReturn {
  interactions: Interaction[];
  loading: boolean;
  error: string | null;
  fetchInteractions: () => Promise<void>;
  createInteraction: (data: InteractionCreate) => Promise<Interaction>;
  deleteInteraction: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useInteractions(opportunityId?: string): UseInteractionsReturn {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInteractions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = opportunityId
        ? await interactionsApi.getByOpportunity(opportunityId)
        : await interactionsApi.getAll();
      setInteractions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching interactions');
    } finally {
      setLoading(false);
    }
  }, [opportunityId]);

  const createInteraction = useCallback(async (data: InteractionCreate): Promise<Interaction> => {
    const newInteraction = await interactionsApi.create(data);
    setInteractions((prev) => [...prev, newInteraction]);
    return newInteraction;
  }, []);

  const deleteInteraction = useCallback(async (id: string): Promise<void> => {
    await interactionsApi.delete(id);
    setInteractions((prev) => prev.filter((int) => int.id !== id));
  }, []);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  return {
    interactions,
    loading,
    error,
    fetchInteractions,
    createInteraction,
    deleteInteraction,
    refetch: fetchInteractions,
  };
}
