import { describe, it, expect, vi } from 'vitest'
import { getAgentReputation } from '../get-agent-reputation'
import type { AgentIdReadConfig } from '../config'
import type { GraphQLClient } from 'graphql-request'

function createMockGraphQLClient(
  responses: Record<string, unknown>,
): GraphQLClient {
  return {
    request: vi.fn().mockImplementation((query: string) => {
      // Match based on query content
      if (query.includes('GetAgentByAtomId') || query.includes('atom(term_id')) {
        return Promise.resolve(responses.getAgent ?? { atom: null })
      }
      if (query.includes('SearchAgentsByName') || query.includes('_ilike')) {
        return Promise.resolve(responses.searchAgents ?? { atoms: [] })
      }
      return Promise.resolve({})
    }),
  } as unknown as GraphQLClient
}

describe('getAgentReputation', () => {
  it('should return found=false for unknown agent', async () => {
    const client = createMockGraphQLClient({
      getAgent: { atom: null },
      searchAgents: { atoms: [] },
    })
    const config: AgentIdReadConfig = { graphqlClient: client }

    const result = await getAgentReputation(config, 'nonexistent-agent')

    expect(result.found).toBe(false)
    expect(result.agentId).toBeNull()
    expect(result.trustScore).toBeNull()
    expect(result.recommendation).toContain('No agent found')
  })

  it('should look up by atom ID when identifier starts with 0x', async () => {
    const mockAgent = {
      term_id: '0xabc123',
      label: 'TestAgent',
      image: 'https://example.com/img.png',
      created_at: '2025-01-01T00:00:00Z',
      term: {
        vaults: [
          {
            total_shares: '1000000000000000000',
            total_assets: '5000000000000000000',
            current_share_price: '1100000000000000000',
            market_cap: '5500000000000000000',
            position_count: 10,
          },
        ],
      },
      as_subject_triples: [
        {
          term_id: '0xtriple1',
          predicate: { term_id: '0xpred1', label: 'has-capability', data: null },
          object: { term_id: '0xobj1', label: 'data-analysis', data: null },
          term: { vaults: [{ total_shares: '100', total_assets: '100' }] },
          counter_term: { vaults: [{ total_shares: '0', total_assets: '0' }] },
        },
      ],
    }

    const client = createMockGraphQLClient({
      getAgent: { atom: mockAgent },
    })
    const config: AgentIdReadConfig = { graphqlClient: client }

    const result = await getAgentReputation(config, '0xabc123')

    expect(result.found).toBe(true)
    expect(result.agentId).toBe('0xabc123')
    expect(result.name).toBe('TestAgent')
    expect(result.trustScore).not.toBeNull()
    expect(result.trustScore!.normalized).toBeGreaterThanOrEqual(0)
    expect(result.trustScore!.normalized).toBeLessThanOrEqual(100)
    expect(result.capabilities).toHaveLength(1)
    expect(result.capabilities[0].name).toBe('data-analysis')
  })

  it('should fall back to name search when not starting with 0x', async () => {
    const mockAtom = {
      term_id: '0xfound123',
      label: 'FoundAgent',
      image: null,
      term: {
        vaults: [
          {
            total_assets: '1000000000000000000',
            market_cap: '1000000000000000000',
            position_count: 5,
            current_share_price: '1000000000000000000',
          },
        ],
      },
    }

    const mockFullAgent = {
      ...mockAtom,
      created_at: '2025-06-01T00:00:00Z',
      as_subject_triples: [],
    }

    const client = createMockGraphQLClient({
      getAgent: { atom: mockFullAgent },
      searchAgents: { atoms: [mockAtom] },
    })
    const config: AgentIdReadConfig = { graphqlClient: client }

    const result = await getAgentReputation(config, 'FoundAgent')

    expect(result.found).toBe(true)
    expect(result.name).toBe('FoundAgent')
  })

  it('should calculate trust score from vault data', async () => {
    const mockAgent = {
      term_id: '0xrich',
      label: 'RichAgent',
      image: null,
      created_at: '2024-01-01T00:00:00Z',
      term: {
        vaults: [
          {
            total_shares: '10000000000000000000',
            total_assets: '10000000000000000000', // 10 ETH
            current_share_price: '1200000000000000000',
            market_cap: '12000000000000000000',
            position_count: 50,
          },
        ],
      },
      as_subject_triples: [],
    }

    const client = createMockGraphQLClient({
      getAgent: { atom: mockAgent },
    })
    const config: AgentIdReadConfig = { graphqlClient: client }

    const result = await getAgentReputation(config, '0xrich')

    expect(result.trustScore).not.toBeNull()
    expect(result.trustScore!.tier).toBeDefined()
    expect(['low', 'medium', 'high', 'elite']).toContain(result.trustScore!.tier)
    expect(result.trustScore!.confidence).toBeGreaterThan(0)
  })

  it('should return appropriate recommendation per tier', async () => {
    // Low trust agent
    const lowAgent = {
      term_id: '0xlow',
      label: 'LowAgent',
      image: null,
      created_at: new Date().toISOString(),
      term: {
        vaults: [
          {
            total_shares: '100',
            total_assets: '100',
            current_share_price: '1000000000000000000',
            position_count: 1,
          },
        ],
      },
      as_subject_triples: [],
    }

    const client = createMockGraphQLClient({
      getAgent: { atom: lowAgent },
    })
    const config: AgentIdReadConfig = { graphqlClient: client }

    const result = await getAgentReputation(config, '0xlow')

    expect(result.recommendation).toBeTruthy()
    expect(typeof result.recommendation).toBe('string')
    expect(result.recommendation.length).toBeGreaterThan(10)
  })

  it('should filter capabilities by has-capability predicate', async () => {
    const mockAgent = {
      term_id: '0xmulticap',
      label: 'MultiCapAgent',
      image: null,
      created_at: '2025-01-01T00:00:00Z',
      term: {
        vaults: [
          {
            total_shares: '1000',
            total_assets: '1000',
            current_share_price: '1000000000000000000',
            position_count: 2,
          },
        ],
      },
      as_subject_triples: [
        {
          term_id: '0xt1',
          predicate: { term_id: '0xp1', label: 'has-capability', data: null },
          object: { term_id: '0xo1', label: 'code-gen', data: null },
          term: { vaults: [] },
          counter_term: { vaults: [] },
        },
        {
          term_id: '0xt2',
          predicate: { term_id: '0xp2', label: 'operated-by', data: null },
          object: { term_id: '0xo2', label: 'SomeOperator', data: null },
          term: { vaults: [] },
          counter_term: { vaults: [] },
        },
        {
          term_id: '0xt3',
          predicate: { term_id: '0xp1', label: 'has-capability', data: null },
          object: { term_id: '0xo3', label: 'data-analysis', data: null },
          term: { vaults: [] },
          counter_term: { vaults: [] },
        },
      ],
    }

    const client = createMockGraphQLClient({
      getAgent: { atom: mockAgent },
    })
    const config: AgentIdReadConfig = { graphqlClient: client }

    const result = await getAgentReputation(config, '0xmulticap')

    // Should only include has-capability triples, not operated-by
    expect(result.capabilities).toHaveLength(2)
    expect(result.capabilities.map((c) => c.name)).toContain('code-gen')
    expect(result.capabilities.map((c) => c.name)).toContain('data-analysis')
    expect(result.capabilities.map((c) => c.name)).not.toContain('SomeOperator')
  })
})
