import { describe, it, expect } from 'vitest'
import { createGraphQLClient } from '../client'
import { GET_ATOM_BY_LABEL, SEARCH_AGENTS_BY_NAME } from '../queries'
import type {
  GetAtomByLabelResponse,
  SearchAgentsByNameResponse,
} from '../types'

/**
 * Integration tests that hit the real Intuition testnet GraphQL API.
 * These verify our query syntax is actually valid.
 *
 * Skip with: pnpm test -- --testPathIgnorePatterns integration
 */
describe('GraphQL integration (testnet)', () => {
  const client = createGraphQLClient('testnet')

  it('GET_ATOM_BY_LABEL should return valid response shape', async () => {
    const response = await client.request<GetAtomByLabelResponse>(
      GET_ATOM_BY_LABEL,
      { label: 'agent' },
    )

    expect(response).toHaveProperty('atoms')
    expect(Array.isArray(response.atoms)).toBe(true)

    if (response.atoms.length > 0) {
      const atom = response.atoms[0]
      expect(atom).toHaveProperty('term_id')
      expect(atom).toHaveProperty('label')
      expect(atom.term_id).toMatch(/^0x[a-fA-F0-9]+$/)
    }
  })

  it('SEARCH_AGENTS_BY_NAME should return atoms with vault data', async () => {
    const response = await client.request<SearchAgentsByNameResponse>(
      SEARCH_AGENTS_BY_NAME,
      { name: '%agent%', limit: 3 },
    )

    expect(response).toHaveProperty('atoms')
    expect(Array.isArray(response.atoms)).toBe(true)

    if (response.atoms.length > 0) {
      const atom = response.atoms[0]
      expect(atom).toHaveProperty('term_id')
      expect(atom).toHaveProperty('label')
      expect(atom).toHaveProperty('term')
      expect(atom.term).toHaveProperty('vaults')
      expect(Array.isArray(atom.term.vaults)).toBe(true)
    }
  })
})
