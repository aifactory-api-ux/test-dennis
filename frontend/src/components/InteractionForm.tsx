import { useState } from 'react';
import { useInteractions } from '../hooks/useInteractions';
import type { Interaction, InteractionCreate, InteractionType } from '../types/interaction';

// Type options for the dropdown
const typeOptions: { value: InteractionType; label: string }[] = [
  { value: 'call', label: 'Llamada' },
  { value: 'email', label: 'Correo' },
  { value: 'meeting', label: 'Reunión' },
  { value: 'note', label: 'Nota' },
];

interface InteractionFormProps {
  interaction?: Interaction;
  opportunityId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function InteractionForm({ interaction, opportunityId, onSuccess, onCancel }: InteractionFormProps) {
  const { createInteraction, loading, error } = useInteractions(opportunityId);
  
  const [formData, setFormData] = useState<InteractionCreate>({
    opportunityId: interaction?.opportunityId || opportunityId || '',
    type: interaction?.type || 'call',
    content: interaction?.content || '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.opportunityId.trim()) {
      errors.opportunityId = 'La oportunidad es requerida';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'El contenido es requerido';
    }
    
    if (formData.content.trim().length < 3) {
      errors.content = 'El contenido debe tener al menos 3 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createInteraction(formData);
      setFormData({
        opportunityId: '',
        type: 'call',
        content: '',
      });
      onSuccess?.();
    } catch (err) {
      console.error('Error saving interaction:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'opportunityId' || name === 'type' ? value : value,
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const isEditing = !!interaction;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {isEditing ? 'Editar Interacción' : 'Nueva Interacción'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Opportunity ID - Only show if not provided via props */}
        {(!opportunityId || isEditing) && (
          <div>
            <label htmlFor="opportunityId" className="block text-sm font-medium text-gray-700 mb-1">
              Oportunidad
            </label>
            <input
              type="text"
              id="opportunityId"
              name="opportunityId"
              value={formData.opportunityId}
              onChange={handleChange}
              disabled={!!opportunityId && !isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.opportunityId 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300'
              } ${opportunityId && !isEditing ? 'bg-gray-100' : ''}`}
              placeholder="ID de la oportunidad"
            />
            {formErrors.opportunityId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.opportunityId}</p>
            )}
          </div>
        )}

        {/* Interaction Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Interacción
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Contenido
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.content 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Describe los detalles de la interacción..."
          />
          {formErrors.content && (
            <p className="mt-1 text-sm text-red-600">{formErrors.content}</p>
          )}
        </div>

        {/* Error message from API */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InteractionForm;
