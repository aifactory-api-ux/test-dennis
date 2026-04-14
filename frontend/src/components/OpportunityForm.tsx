import { useState, useEffect, FormEvent } from 'react';
import { Opportunity, OpportunityCreate, OPPORTUNITY_STAGES, OpportunityStage } from '../types/opportunity';

interface OpportunityFormProps {
  opportunity?: Opportunity | null;
  onSubmit: (data: OpportunityCreate) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const stageLabels: Record<OpportunityStage, string> = {
  lead: 'Lead',
  contacted: 'Contactado',
  qualified: 'Calificado',
  proposal: 'Propuesta',
  won: 'Ganado',
  lost: 'Perdido',
};

interface FormErrors {
  name?: string;
  company?: string;
  value?: string;
  stage?: string;
}

export default function OpportunityForm({ opportunity, onSubmit, onCancel, loading }: OpportunityFormProps) {
  const [formData, setFormData] = useState<OpportunityCreate>({
    name: '',
    company: '',
    value: 0,
    stage: 'lead',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (opportunity) {
      setFormData({
        name: opportunity.name,
        company: opportunity.company,
        value: opportunity.value,
        stage: opportunity.stage,
      });
    }
  }, [opportunity]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.company.trim()) {
      newErrors.company = 'La empresa es requerida';
    }
    if (formData.value < 0) {
      newErrors.value = 'El valor debe ser positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof OpportunityCreate, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="form-group">
        <label className="label" htmlFor="name">Nombre de la oportunidad</label>
        <input
          id="name"
          type="text"
          className="input"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ingresa el nombre de la oportunidad"
        />
        {errors.name && <p className="error-message">{errors.name}</p>}
      </div>

      <div className="form-group">
        <label className="label" htmlFor="company">Empresa</label>
        <input
          id="company"
          type="text"
          className="input"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          placeholder="Nombre de la empresa"
        />
        {errors.company && <p className="error-message">{errors.company}</p>}
      </div>

      <div className="form-group">
        <label className="label" htmlFor="value">Valor ($)</label>
        <input
          id="value"
          type="number"
          className="input"
          value={formData.value}
          onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
          placeholder="0"
          min="0"
          step="0.01"
        />
        {errors.value && <p className="error-message">{errors.value}</p>}
      </div>

      <div className="form-group">
        <label className="label" htmlFor="stage">Etapa</label>
        <select
          id="stage"
          className="input"
          value={formData.stage}
          onChange={(e) => handleChange('stage', e.target.value as OpportunityStage)}
        >
          {OPPORTUNITY_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stageLabels[stage]}
            </option>
          ))}
        </select>
        {errors.stage && <p className="error-message">{errors.stage}</p>}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Guardando...' : opportunity ? 'Actualizar' : 'Crear'}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
