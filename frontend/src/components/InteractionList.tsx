import { Interaction, InteractionType } from '../types/interaction';

interface InteractionListProps {
  interactions: Interaction[];
  loading?: boolean;
  error?: string | null;
}

const typeIcons: Record<InteractionType, string> = {
  call: '📞',
  email: '📧',
  meeting: '📅',
  note: '📝',
};

const typeLabels: Record<InteractionType, string> = {
  call: 'Llamada',
  email: 'Correo',
  meeting: 'Reunión',
  note: 'Nota',
};

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InteractionList({ interactions, loading, error }: InteractionListProps) {
  if (loading) {
    return (
      <div className="loading">
        <span>Cargando interacciones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No hay interacciones registradas.
      </div>
    );
  }

  return (
    <div className="interaction-list">
      {interactions.map((interaction) => (
        <div
          key={interaction.id}
          style={{
            padding: '1rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            gap: '1rem',
          }}
        >
          <div style={{ fontSize: '1.5rem' }}>{typeIcons[interaction.type]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 500 }}>{typeLabels[interaction.type]}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {formatDateTime(interaction.createdAt)}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              {interaction.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
