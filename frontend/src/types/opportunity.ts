/**
 * TypeScript types for Opportunity entities
 * Mirrors the backend types from SPEC.md and shared foundation
 */

// Define OpportunityStage locally since backend path doesn't exist
export type OpportunityStage = 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

// Type for stage-to-label mapping (includes 'lead' for backwards compatibility)
export type OpportunityStageLabel = Record<OpportunityStage, string> & { lead: string };

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
 * Props for the OpportunityList component
 */
export interface OpportunityListProps {
  /** List of opportunities to display */
  opportunities: Opportunity[];
  /** Callback when an opportunity is deleted */
  onDelete?: (id: string) => Promise<void>;
  /** Callback when an opportunity is edited */
  onEdit?: (opportunity: Opportunity | null) => void;
}
