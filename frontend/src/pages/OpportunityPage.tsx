import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOpportunities } from '../hooks/useOpportunities';
import OpportunityForm from '../components/OpportunityForm';
import type { Opportunity, OpportunityUpdate } from '../types/opportunity';

export default function OpportunityPage() {
  const { id } = useParams<{ id: string }>();
  const { getOpportunity, updateOpportunity } = useOpportunities();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOpportunity(id);
        setOpportunity(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch opportunity');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOpportunity();
  }, [id, getOpportunity]);

  const handleSubmit = async (data: OpportunityUpdate) => {
    if (!id) return;
    await updateOpportunity(id, data);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!opportunity) {
    return <div>Opportunity not found</div>;
  }

  return (
    <div className="opportunity-page">
      <h1>Opportunity Details</h1>
      <OpportunityForm
        opportunity={opportunity}
        onSubmit={handleSubmit}
        onCancel={() => window.history.back()}
      />
    </div>
  );
}
