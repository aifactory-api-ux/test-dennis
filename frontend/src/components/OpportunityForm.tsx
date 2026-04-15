/**
 * OpportunityForm component for creating and editing opportunities
 * Provides a form with validation for opportunity data entry
 */

import { useState, type FormEvent } from 'react';
import type { Opportunity, OpportunityCreate, OpportunityUpdate, OpportunityStage } from '../types/opportunity';

interface OpportunityFormProps {
  /** Opportunity data for editing (alternative to initialData) */
  opportunity?: Opportunity;
  /** Callback when form is submitted */
  onSubmit: (data: OpportunityCreate | OpportunityUpdate) => Promise<void>;
  /** Initial data for the form */
  initialData?: Opportunity;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
}

const STAGES: OpportunityStage[] = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

export function OpportunityForm({ onSubmit, initialData, onCancel, opportunity }: OpportunityFormProps) {
  // Use opportunity prop if provided, otherwise use initialData
  const data = opportunity || initialData;
  
  const [name, setName] = useState(data?.name || '');
  const [company, setCompany] = useState(data?.company || '');
  const [value, setValue] = useState(data?.value?.toString() || '');
  const [stage, setStage] = useState<OpportunityStage>(data?.stage || 'Prospecting');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name,
        company,
        value: parseFloat(value),
        stage,
      };

      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
          Company
        </label>
        <input
          type="text"
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-700">
          Value
        </label>
        <input
          type="number"
          id="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
          Stage
        </label>
        <select
          id="stage"
          value={stage}
          onChange={(e) => setStage(e.target.value as OpportunityStage)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : initialData || opportunity ? 'Update' : 'Create'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default OpportunityForm;
