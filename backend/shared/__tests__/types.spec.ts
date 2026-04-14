/**
 * Unit tests for shared types
 * Validates type definitions and validation functions
 */

import {
  OpportunityStage,
  OPPORTUNITY_STAGES,
  isValidOpportunityStage,
  InteractionType,
  INTERACTION_TYPES,
  isValidInteractionType,
  TaskStatus
} from '../types';

describe('OpportunityStage Type', () => {
  it('should have all required stages defined', () => {
    const expectedStages = ['lead', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
    expect(OPPORTUNITY_STAGES).toEqual(expectedStages);
  });

  it('should correctly validate valid stages', () => {
    expect(isValidOpportunityStage('lead')).toBe(true);
    expect(isValidOpportunityStage('contacted')).toBe(true);
    expect(isValidOpportunityStage('qualified')).toBe(true);
    expect(isValidOpportunityStage('proposal')).toBe(true);
    expect(isValidOpportunityStage('won')).toBe(true);
    expect(isValidOpportunityStage('lost')).toBe(true);
  });

  it('should reject invalid stages', () => {
    expect(isValidOpportunityStage('invalid')).toBe(false);
    expect(isValidOpportunityStage('')).toBe(false);
    expect(isValidOpportunityStage('LEAD')).toBe(false);
    expect(isValidOpportunityStage('Lead')).toBe(false);
    expect(isValidOpportunityStage('won_lost')).toBe(false);
    expect(isValidOpportunityStage('proposal_won')).toBe(false);
  });

  it('should only accept string type for stage validation', () => {
    // @ts-expect-error - Testing invalid input
    expect(isValidOpportunityStage(null)).toBe(false);
    // @ts-expect-error - Testing invalid input
    expect(isValidOpportunityStage(undefined)).toBe(false);
    // @ts-expect-error - Testing invalid input
    expect(isValidOpportunityStage(123)).toBe(false);
  });

  it('should have correct type narrowing with type predicate', () => {
    const stage: string = 'qualified';
    if (isValidOpportunityStage(stage)) {
      // TypeScript should know stage is OpportunityStage here
      const validStages: OpportunityStage[] = ['lead', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
      expect(validStages.includes(stage)).toBe(true);
    }
  });
});

describe('InteractionType Type', () => {
  it('should have all required types defined', () => {
    const expectedTypes = ['call', 'email', 'meeting', 'note'];
    expect(INTERACTION_TYPES).toEqual(expectedTypes);
  });

  it('should correctly validate valid interaction types', () => {
    expect(isValidInteractionType('call')).toBe(true);
    expect(isValidInteractionType('email')).toBe(true);
    expect(isValidInteractionType('meeting')).toBe(true);
    expect(isValidInteractionType('note')).toBe(true);
  });

  it('should reject invalid interaction types', () => {
    expect(isValidInteractionType('invalid')).toBe(false);
    expect(isValidInteractionType('')).toBe(false);
    expect(isValidInteractionType('CALL')).toBe(false);
    expect(isValidInteractionType('Call')).toBe(false);
    expect(isValidInteractionType('phone')).toBe(false);
    expect(isValidInteractionType('video')).toBe(false);
  });

  it('should only accept string type for type validation', () => {
    // @ts-expect-error - Testing invalid input
    expect(isValidInteractionType(null)).toBe(false);
    // @ts-expect-error - Testing invalid input
    expect(isValidInteractionType(undefined)).toBe(false);
    // @ts-expect-error - Testing invalid input
    expect(isValidInteractionType(0)).toBe(false);
  });

  it('should have correct type narrowing with type predicate', () => {
    const type: string = 'meeting';
    if (isValidInteractionType(type)) {
      // TypeScript should know type is InteractionType here
      const validTypes: InteractionType[] = ['call', 'email', 'meeting', 'note'];
      expect(validTypes.includes(type)).toBe(true);
    }
  });
});

describe('TaskStatus Type', () => {
  it('should have all required statuses defined', () => {
    const expectedStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed'];
    // Verify the type exists and has expected values
    const statuses: TaskStatus[] = ['pending', 'in_progress', 'completed'];
    expect(statuses).toEqual(expectedStatuses);
  });

  it('should accept all valid task statuses', () => {
    const pending: TaskStatus = 'pending';
    const inProgress: TaskStatus = 'in_progress';
    const completed: TaskStatus = 'completed';

    expect(pending).toBe('pending');
    expect(inProgress).toBe('in_progress');
    expect(completed).toBe('completed');
  });
});

describe('Type Exports', () => {
  it('should export OpportunityStage type', () => {
    const stage: OpportunityStage = 'lead';
    expect(stage).toBe('lead');
  });

  it('should export InteractionType type', () => {
    const type: InteractionType = 'call';
    expect(type).toBe('call');
  });

  it('should export TaskStatus type', () => {
    const status: TaskStatus = 'pending';
    expect(status).toBe('pending');
  });

  it('should export OPPORTUNITY_STAGES constant array', () => {
    expect(OPPORTUNITY_STAGES).toBeInstanceOf(Array);
    expect(OPPORTUNITY_STAGES.length).toBe(6);
  });

  it('should export INTERACTION_TYPES constant array', () => {
    expect(INTERACTION_TYPES).toBeInstanceOf(Array);
    expect(INTERACTION_TYPES.length).toBe(4);
  });

  it('should export isValidOpportunityStage function', () => {
    expect(typeof isValidOpportunityStage).toBe('function');
  });

  it('should export isValidInteractionType function', () => {
    expect(typeof isValidInteractionType).toBe('function');
  });
});
