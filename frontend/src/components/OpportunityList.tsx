import { Link } from 'react-router-dom';
import { Opportunity, OpportunityStage } from '../types/opportunity';

interface OpportunityListProps {
  opportunities: Opportunity[];
  loading?: boolean;
  error?: string | null;
  onDelete?: (id: string) => void;
}

const stageColors: Record<OpportunityStage, string> = {
  lead: '#64748b',
  contacted: '#3b82f6',
  qualified: '#8b5cf6',
  proposal: '#f59e0b',
  won: '#22c55e',
  lost: '#ef4444',
};

const stageLabels: Record<OpportunityStage, string> = {
  lead: 'Lead',
  contacted: 'Contactado',
  qualified: 'Calificado',
  proposal: 'Propuesta',
  won: 'Ganado',
  lost: 'Perdido',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function OpportunityList({ opportunities, loading, error, onDelete }: OpportunityListProps) {
  if (loading) {
    return (
      <div className="loading">
        <span>Cargando oportunidades...</span>
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

  if (opportunities.length === 0) {
    return (
      <div className="card">
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          No hay oportunidades registradas. Crea tu primera oportunidad.
        </p>
      </div>
    );
  }

  return (
    <div className="opportunity-list">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Empresa</th>
            <th style={{ textAlign: 'right', padding: '0.75rem', color: 'var(--text-secondary)' }}>Valor</th>
            <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-secondary)' }}>Etapa</th>
            <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Fecha</th>
            <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-secondary)' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opportunity) => (
            <tr
              key={opportunity.id}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <td style={{ padding: '0.75rem' }}>
                <Link
                  to={`/opportunity/${opportunity.id}`}
                  style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}
                >
                  {opportunity.name}
                </Link>
              </td>
              <td style={{ padding: '0.75rem' }}>{opportunity.company}</td>
              <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                {formatCurrency(opportunity.value)}
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    backgroundColor: `${stageColors[opportunity.stage]}20`,
                    color: stageColors[opportunity.stage],
                  }}
                >
                  {stageLabels[opportunity.stage]}
                </span>
              </td>
              <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                {formatDate(opportunity.updatedAt)}
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <Link
                  to={`/opportunity/${opportunity.id}`}
                  className="btn btn-outline"
                  style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                >
                  Ver
                </Link>
                {onDelete && (
                  <button
                    onClick={() => onDelete(opportunity.id)}
                    className="btn btn-danger"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                  >
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
