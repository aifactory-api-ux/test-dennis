import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useOpportunities } from '../hooks/useOpportunities';
import OpportunityList from '../components/OpportunityList';
import type { Opportunity, OpportunityStage } from '../types/opportunity';

// Stage colors for statistics
const stageColors: Record<OpportunityStage, string> = {
  lead: 'bg-gray-100 text-gray-800',
  contacted: 'bg-blue-100 text-blue-800',
  qualified: 'bg-yellow-100 text-yellow-800',
  proposal: 'bg-orange-100 text-orange-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
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

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

function StatCard({ title, value, subtitle, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color || 'text-gray-900'}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function DashboardPage() {
  const { opportunities, loading, error } = useOpportunities();
  const [selectedStage, setSelectedStage] = useState<OpportunityStage | 'all'>('all');

  // Filter opportunities by stage
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    if (selectedStage === 'all') return opportunities;
    return opportunities.filter((opp) => opp.stage === selectedStage);
  }, [opportunities, selectedStage]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!opportunities) {
      return {
        total: 0,
        totalValue: 0,
        byStage: {} as Record<OpportunityStage, { count: number; value: number }>,
        won: 0,
        lost: 0,
        conversionRate: 0,
      };
    }

    const byStage: Record<OpportunityStage, { count: number; value: number }> = {
      lead: { count: 0, value: 0 },
      contacted: { count: 0, value: 0 },
      qualified: { count: 0, value: 0 },
      proposal: { count: 0, value: 0 },
      won: { count: 0, value: 0 },
      lost: { count: 0, value: 0 },
    };

    let totalValue = 0;
    let wonCount = 0;
    let lostCount = 0;
    let decidedCount = 0;

    opportunities.forEach((opp) => {
      totalValue += opp.value;
      byStage[opp.stage].count++;
      byStage[opp.stage].value += opp.value;

      if (opp.stage === 'won') {
        wonCount++;
        decidedCount++;
      } else if (opp.stage === 'lost') {
        lostCount++;
        decidedCount++;
      }
    });

    const conversionRate = decidedCount > 0 
      ? Math.round((wonCount / decidedCount) * 100) 
      : 0;

    return {
      total: opportunities.length,
      totalValue,
      byStage,
      won: wonCount,
      lost: lostCount,
      conversionRate,
    };
  }, [opportunities]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSelectOpportunity = (opportunity: Opportunity) => {
    // Navigate to opportunity detail
    window.location.href = `/opportunity/${opportunity.id}`;
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    window.location.href = `/opportunity/${opportunity.id}?edit=true`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando oportunidades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error al cargar datos</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard - Pipeline de Ventas
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gestión de oportunidades de pre-venta
              </p>
            </div>
            <Link
              to="/opportunity/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Nueva Oportunidad
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Oportunidades"
            value={stats.total}
            subtitle={`Valor total: ${formatCurrency(stats.totalValue)}`}
          />
          <StatCard
            title="Ganadas"
            value={stats.won}
            subtitle={`${formatCurrency(stats.byStage.won.value)}`}
            color="text-green-600"
          />
          <StatCard
            title="Perdidas"
            value={stats.lost}
            subtitle={`${formatCurrency(stats.byStage.lost.value)}`}
            color="text-red-600"
          />
          <StatCard
            title="Tasa de Conversión"
            value={`${stats.conversionRate}%`}
            subtitle={`${stats.won + stats.lost} decisiones`}
            color="text-blue-600"
          />
        </div>

        {/* Stage Breakdown */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Desglose por Etapa
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(Object.keys(stageLabels) as OpportunityStage[]).map((stage) => {
                const stageData = stats.byStage[stage];
                return (
                  <button
                    key={stage}
                    onClick={() => setSelectedStage(
                      selectedStage === stage ? 'all' : stage
                    )}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedStage === stage
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`text-xs font-medium px-2 py-1 rounded mb-2 ${stageColors[stage]}`}>
                      {stageLabels[stage]}
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {stageData.count}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(stageData.value)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Filtrar por etapa:
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as OpportunityStage | 'all')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas las etapas</option>
                {(Object.keys(stageLabels) as OpportunityStage[]).map((stage) => (
                  <option key={stage} value={stage}>
                    {stageLabels[stage]}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-500">
              Mostrando {filteredOpportunities.length} de {stats.total} oportunidades
            </p>
          </div>
        </div>

        {/* Opportunity List */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Oportunidades
            </h2>
          </div>
          {filteredOpportunities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-4">No hay oportunidades para mostrar.</p>
              <Link
                to="/opportunity/new"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Crear primera oportunidad
              </Link>
            </div>
          ) : (
            <OpportunityList
              onSelectOpportunity={handleSelectOpportunity}
              onEditOpportunity={handleEditOpportunity}
              showActions={true}
              showFilters={false}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
