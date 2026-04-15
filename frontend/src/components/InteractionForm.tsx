/**
 * InteractionForm component - Form for creating new interactions
 */

import { useState } from 'react';
import type { InteractionType } from '../types/interaction';

interface InteractionFormProps {
  /** Callback when form is submitted */
  onSubmit: (data: { type: InteractionType; content: string }) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
}

export default function InteractionForm({ onSubmit, onCancel }: InteractionFormProps) {
  const [type, setType] = useState<InteractionType>('note');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit({ type, content });
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as InteractionType)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
          <option value="note">Note</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border rounded px-3 py-2 w-full h-24"
          placeholder="Enter interaction details..."
          required
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
