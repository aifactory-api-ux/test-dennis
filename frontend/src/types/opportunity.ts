/**
 * TypeScript types for Opportunity entities
 * Mirrors the backend types from SPEC.md and shared foundation
 */

import type { OpportunityStage } from '../../backend/shared/types';

export type { OpportunityStage };

/**
 * Opportunity entity representing a sales opportunity in the pipeline
 */
export interface Opportunity {
  /** Unique identifier (UUID) */
  id: string;
  /** Name of the opportunity */
  name: string;
  /** Company name associated with the opportunity */
  company: string;
  /** Potential value/amount in the pipeline */
  value: number;
  /** Current stage in the sales pipeline */
  stage: OpportunityStage;
  /** User ID of the opportunity owner */
  ownerId: string;
  /** Creation timestamp (ISO8601) */
  createdAt: string;
  /** Last update timestamp (ISO8601) */
  updatedAt: string;
}

/**
 * Data required to create a new opportunity
 */
export interface OpportunityCreate {
  /** Name of the opportunity */
  name: string;
  /** Company name associated with the opportunity */
  company: string;
  /** Potential value/amount in the pipeline */
  value: number;
  /** Initial stage in the sales pipeline */
  stage: OpportunityStage;
}

/**
 * Data required to update an existing opportunity
 * All fields are partial for PATCH-style updates
 */
export interface OpportunityUpdate {
  /** Name of the opportunity */
  name?: string;
  /** Company name associated with the opportunity */
  company?: string;
  /** Potential value/amount in the pipeline */
  value?: number;
  /** Current stage in the sales pipeline */
  stage?: OpportunityStage;
}

/**
 * Filter options for querying opportunities
 */
export interface OpportunityFilter {
  /** Filter by stage */
  stage?: OpportunityStage;
  /** Filter by owner */
  ownerId?: string;
  /** Search term for name/company */
  search?: string;
  /** Minimum value filter */
  minValue?: number;
  /** Maximum value filter */
  maxValue?: number;
}

/**
 * Sort options for opportunity list
 */
export interface OpportunitySort {
  /** Field to sort by */
  field: 'name' | 'company' | 'value' | 'stage' | 'createdAt' | 'updatedAt';
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Paginated response for opportunities
 */
export interface OpportunityPaginatedResponse {
  /** Array of opportunities */
  opportunities: Opportunity[];
  /** Total count matching the filter */
  total: number;
  /** Current page number */
  page: number;
  /** Page size */
  limit: number;
  /** Total pages available */
  totalPages: number;
}

/**
 * Stage statistics for dashboard
 */
export interface StageStats {
  /** Stage identifier */
  stage: OpportunityStage;
  /** Count of opportunities in this stage */
  count: number;
  /** Total value in this stage */
  value: number;
}

/**
 * Dashboard summary statistics
 */
export interface DashboardStats {
  /** Total opportunities count */
  totalOpportunities: number;
  /** Total pipeline value */
  totalValue: number;
  /** Count by stage */
  stageStats: StageStats[];
  /** Won opportunities value */
  wonValue: number;
  /** Won opportunities count */
  wonCount: number;
  /** Lost opportunities count */
  lostCount: number;
}

/**
 * Pipeline Kanban column data
 */
export interface PipelineColumn {
  /** Stage for this column */
  stage: OpportunityStage;
  /** Label to display */
  label: string;
  /** Opportunities in this stage */
  opportunities: Opportunity[];
  /** Total value in this stage */
  value: number;
}
