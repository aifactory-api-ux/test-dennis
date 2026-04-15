/**
 * InteractionList component - Displays a list of interactions
 */

import type { Interaction } from '../types/interaction';

interface InteractionListProps {
  /** List of interactions to display */
  interactions: Interaction[];
  /** Callback when an interaction is deleted */
  onDelete?: (id: string) => void;
}

export default function InteractionList({ interactions, onDelete }: InteractionListProps) {
  if (interactions.length === 0) {
    return <div className="text-gray-500">No interactions yet</div>;
  }

  return (
    <div className="space-y-3">
      {interactions.map((interaction) => (
        <div key={interaction.id} className="border-l-4 border-blue-500 pl-4 py-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                {interaction.type}
              </span>
              <p className="mt-2">{interaction.content}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(interaction.createdAt).toLocaleString()}
              </p>
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(interaction.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
