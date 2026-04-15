import { useState } from 'react';
import { useOpportunities } from '../hooks/useOpportunities';
import { useInteractions } from '../hooks/useInteractions';
import OpportunityList from '../components/OpportunityList';
import InteractionList from '../components/InteractionList';
import OpportunityForm from '../components/OpportunityForm';
import type { OpportunityCreate, OpportunityUpdate } from '../types/opportunity';

export default function DashboardPage() {
  const { opportunities, isLoading, error, createOpportunity, updateOpportunity, deleteOpportunity } = useOpportunities();
  const { interactions } = useInteractions();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async (data: OpportunityCreate | OpportunityUpdate) => {
    await createOpportunity(data as OpportunityCreate);
    setShowForm(false);
  };

  const handleUpdate = async (data: OpportunityCreate | OpportunityUpdate) => {
    if (editingId) {
      await updateOpportunity(editingId, data as OpportunityUpdate);
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this opportunity?')) {
      await deleteOpportunity(id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <button onClick={() => setShowForm(true)}>New Opportunity</button>
      
      {(showForm || editingId) && (
        <OpportunityForm
          onSubmit={editingId ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}

      <h2>Opportunities</h2>
      <OpportunityList
        opportunities={opportunities}
        onEdit={setEditingId}
        onDelete={handleDelete}
      />

      <h2>Recent Interactions</h2>
      <InteractionList interactions={interactions} />
    </div>
  );
}
