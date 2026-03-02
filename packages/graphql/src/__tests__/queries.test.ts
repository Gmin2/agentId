import { describe, it, expect } from 'vitest'
import {
  GET_AGENT_BY_ATOM_ID,
  SEARCH_AGENTS_BY_NAME,
  GET_AGENT_CAPABILITIES,
  SEARCH_AGENTS_BY_CAPABILITY,
  GET_ATOM_BY_LABEL,
  GET_USER_POSITIONS,
} from '../queries'

describe('GraphQL queries', () => {
  const queries = {
    GET_AGENT_BY_ATOM_ID,
    SEARCH_AGENTS_BY_NAME,
    GET_AGENT_CAPABILITIES,
    SEARCH_AGENTS_BY_CAPABILITY,
    GET_ATOM_BY_LABEL,
    GET_USER_POSITIONS,
  }

  for (const [name, query] of Object.entries(queries)) {
    it(`${name} should be a non-empty string`, () => {
      expect(typeof query).toBe('string')
      expect(query.length).toBeGreaterThan(0)
    })

    it(`${name} should contain a query or mutation keyword`, () => {
      expect(query).toMatch(/\b(query|mutation|subscription)\b/)
    })
  }

  it('GET_AGENT_BY_ATOM_ID should query atom with term_id and vaults', () => {
    expect(GET_AGENT_BY_ATOM_ID).toContain('$atomId')
    expect(GET_AGENT_BY_ATOM_ID).toContain('term_id')
    expect(GET_AGENT_BY_ATOM_ID).toContain('vaults')
    expect(GET_AGENT_BY_ATOM_ID).toContain('as_subject_triples')
  })

  it('SEARCH_AGENTS_BY_NAME should use _ilike for fuzzy search', () => {
    expect(SEARCH_AGENTS_BY_NAME).toContain('_ilike')
    expect(SEARCH_AGENTS_BY_NAME).toContain('$name')
    expect(SEARCH_AGENTS_BY_NAME).toContain('$limit')
  })

  it('GET_AGENT_CAPABILITIES should filter by has-capability predicate', () => {
    expect(GET_AGENT_CAPABILITIES).toContain('has-capability')
    expect(GET_AGENT_CAPABILITIES).toContain('$agentAtomId')
  })

  it('SEARCH_AGENTS_BY_CAPABILITY should filter by capability name', () => {
    expect(SEARCH_AGENTS_BY_CAPABILITY).toContain('has-capability')
    expect(SEARCH_AGENTS_BY_CAPABILITY).toContain('$capability')
  })

  it('GET_ATOM_BY_LABEL should search by exact label', () => {
    expect(GET_ATOM_BY_LABEL).toContain('_eq')
    expect(GET_ATOM_BY_LABEL).toContain('$label')
  })

  it('GET_USER_POSITIONS should query by user address', () => {
    expect(GET_USER_POSITIONS).toContain('$userAddress')
    expect(GET_USER_POSITIONS).toContain('shares')
  })
})
