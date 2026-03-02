/**
 * Standard predicate labels used in AgentID Triples on Intuition.
 *
 * These are created as Atoms once and reused across all agent registrations.
 * Triple format: (SubjectAtom) --[PredicateAtom]--> (ObjectAtom)
 */
export const PREDICATES = {
  /** Agent has a specific capability */
  HAS_CAPABILITY: 'has-capability',
  /** Agent is operated by an address/entity */
  OPERATED_BY: 'operated-by',
  /** User endorses an agent */
  ENDORSES: 'endorses',
  /** User reports an issue with an agent */
  REPORTS_ISSUE: 'reports-issue',
} as const

export type PredicateLabel = (typeof PREDICATES)[keyof typeof PREDICATES]
