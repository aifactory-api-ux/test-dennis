import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOpportunities } from '../hooks/useOpportunities';
import { useInteractions } from '../hooks/useInteractions';
import OpportunityForm from '../components/OpportunityForm';
import InteractionList from '../components/InteractionList';
import InteractionForm from '../components/InteractionForm';
import type { Opportunity, OpportunityStage } from '../types/opportunity';

// Stage colors mapping for visual distinction
const stageColors: Record<OpportunityStage, string> = {
  lead: 'bg-gray-100 text-gray-800 border-gray-300',
  contacted: 'bg-blue-100 text-blue-800 border-blue-300',
  qualified: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  proposal: 'bg-orange-100 text-orange-800 border-orange-300',
  won: 'bg-green-100 text-green-800 border-green-300',
  lost: 'bg-red-100 text-red-800 border-red-300',
};

// Stage labels in Spanish
const stageLabels: Record<OpportunityStage, string> = {
  lead: 'Lead',
  contacted: 'Contactado',
  qualified: 'Calificado',
  proposal: 'Propuesta',
  won: 'Ganado',
  lost: 'Perdido',
};

// Format currency to USD
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format date to Spanish format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

interface TabType {
  id: 'details' | 'interactions' | 'calendar';
  label: string;
}

const tabs: TabType[] = [
  { id: 'details', label: 'Detalles' },
  { id: 'interactions', label: 'Interacciones' },
  { id: 'calendar', label: 'Calendario' },
];

function OpportunityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { opportunities, loading: opportunitiesLoading, error: opportunitiesError, getOpportunity } = useOpportunities();
  const { interactions, loading: interactionsLoading, createInteraction, error: interactionsError } = useInteractions(id);

  const [activeTab, setActiveTab] = useState<'details' | 'interactions' | 'calendar'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [showInteractionForm, setShowInteractionForm] = useState(false);

  // Find the opportunity from the list or fetch it
  const opportunity = useMemo(() => {
    if (!id) return null;
    return getOpportunity(id);
  }, [id, opportunities]);

  // Calculate pipeline statistics from interactions
  const interactionStats = useMemo(() => {
    if (!interactions) return { total: 0, calls: 0, emails: 0, meetings: 0, notes: 0 };
    return {
      total: interactions.length,
      calls: interactions.filter(i => i.type === 'call').length,
      emails: interactions.filter(i => i.type === 'email').length,
      meetings: interactions.filter(i => i.type === 'meeting').length,
      notes: interactions.filter(i => i.type === 'note').length,
    };
  }, [interactions]);

  // Generate calendar events from interactions
  const calendarEvents = useMemo(() => {
    if (!interactions) return [];
    return interactions.map(interaction => ({
      id: interaction.id,
      title: getInteractionTitle(interaction.type),
      date: new Date(interaction.createdAt),
      type: interaction.type,
      content: interaction.content,
    }));
  }, [interactions]);

  const getInteractionTitle = (type: string): string => {
    const titles: Record<string, string> = {
      call: '📞 Llamada',
      email: '📧 Correo',
      meeting: '📅 Reunión',
      note: '📝 Nota',
    };
    return titles[type] || type;
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  const handleInteractionSuccess = () => {
    setShowInteractionForm(false);
  };

  const handleDeleteSuccess = () => {
    navigate('/dashboard');
  };

  if (opportunitiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando oportunidad...</p>
        </div>
      </div>
    );
  }

  if (opportunitiesError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{opportunitiesError}</p>
          </div>
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Advertencia</p>
            <p>No se encontró la oportunidad</p>
          </div>
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {opportunity.name}
              </h1>
              <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium border ${stageColors[opportunity.stage]}`}>
                {stageLabels[opportunity.stage]}
              </span>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-4 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {isEditing ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Editar Oportunidad</h2>
                  <OpportunityForm
                    opportunity={opportunity}
                    onSuccess={handleEditSuccess}
                    onCancel={() => setIsEditing(false)}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Información de la Oportunidad</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="font-medium">{opportunity.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Empresa</p>
                      <p className="font-medium">{opportunity.company}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Valor</p>
                      <p className="font-medium text-green-600">{formatCurrency(opportunity.value)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <p className="font-medium">{stageLabels[opportunity.stage]}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Creación</p>
                      <p className="font-medium">{formatDate(opportunity.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Última Actualización</p>
                      <p className="font-medium">{formatDate(opportunity.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Interaction Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Resumen de Interacciones</h2>
                  <button
                    onClick={() => {
                      setActiveTab('interactions');
                      setShowInteractionForm(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    + Nueva Interacción
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{interactionStats.calls}</p>
                    <p className="text-sm text-gray-600">Llamadas</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{interactionStats.emails}</p>
                    <p className="text-sm text-gray-600">Correos</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{interactionStats.meetings}</p>
                    <p className="text-sm text-gray-600">Reuniones</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{interactionStats.notes}</p>
                    <p className="text-sm text-gray-600">Notas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Valor de la Oportunidad
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(opportunity.value)}
                </p>
              </div>

              {/* Recent Interactions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Últimas Interacciones
                </h3>
                {interactions && interactions.length > 0 ? (
                  <ul className="space-y-3">
                    {interactions.slice(0, 3).map((interaction) => (
                      <li key={interaction.id} className="text-sm">
                        <div className="flex items-center">
                          <span className="font-medium">{getInteractionTitle(interaction.type)}</span>
                          <span className="ml-2 text-gray-500 text-xs">
                            {new Date(interaction.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <p className="text-gray-600 truncate">{interaction.content}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No hay interacciones aún</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Interactions Tab */}
        {activeTab === 'interactions' && (
          <div className="space-y-6">
            {/* Add Interaction Form */}
            {showInteractionForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Nueva Interacción</h2>
                  <button
                    onClick={() => setShowInteractionForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <InteractionForm
                  opportunityId={opportunity.id}
                  onSuccess={handleInteractionSuccess}
                  onCancel={() => setShowInteractionForm(false)}
                />
              </div>
            )}

            {/* Interaction List */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Historial de Interacciones</h2>
                {!showInteractionForm && (
                  <button
                    onClick={() => setShowInteractionForm(true)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    + Nueva Interacción
                  </button>
                )}
              </div>
              <InteractionList
                opportunityId={opportunity.id}
                showFilters={true}
                showActions={true}
              />
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Calendario de Actividades</h2>
            {calendarEvents.length > 0 ? (
              <div className="space-y-4">
                {calendarEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <p className="text-2xl font-bold text-gray-700">
                        {event.date.getDate()}
                      </p>
                      <p className="text-xs text-gray-500 uppercase">
                        {event.date.toLocaleDateString('es-ES', { month: 'short' })}
                      </p>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{event.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {event.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay actividades programadas</p>
                <p className="text-sm text-gray-400 mt-1">
                  Las interacciones aparecerán en el calendario
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OpportunityPage;
