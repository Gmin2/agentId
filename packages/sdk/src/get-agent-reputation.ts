import {
  calculateTrustScore,
  type TrustScore,
  type TrustScoreInput,
} from '@agentid/schema'
import {
  GET_AGENT_BY_ATOM_ID,
  SEARCH_AGENTS_BY_NAME,
  type GetAgentByAtomIdResponse,
  type SearchAgentsByNameResponse,
  type AgentAtomData,
} from '@agentid/graphql'
import type { AgentIdReadConfig } from './config'

export interface AgentReputation {
  found: boolean
  agentId: string | null
  name: string | null
  image: string | null
  trustScore: TrustScore | null
  capabilities: Array<{ name: string; tripleId: string }>
  recommendation: string
}

/**
 * Get an agent's reputation by atom ID or name.
 * Queries Intuition GraphQL and calculates trust score from vault data.
 */
export async function getAgentReputation(
  config: AgentIdReadConfig,
  identifier: string,
): Promise<AgentReputation> {
  let agent: AgentAtomData | null = null

  // Try by atom ID first (starts with 0x)
  if (identifier.startsWith('0x')) {
    const response =
      await config.graphqlClient.request<GetAgentByAtomIdResponse>(
        GET_AGENT_BY_ATOM_ID,
        { atomId: identifier },
      )
    agent = response.atom
  }

  // Fallback to name search
  if (!agent) {
    const response =
      await config.graphqlClient.request<SearchAgentsByNameResponse>(
        SEARCH_AGENTS_BY_NAME,
        { name: `%${identifier}%`, limit: 1 },
      )
    if (response.atoms.length > 0) {
      // Re-fetch full data with triples
      const fullResponse =
        await config.graphqlClient.request<GetAgentByAtomIdResponse>(
          GET_AGENT_BY_ATOM_ID,
          { atomId: response.atoms[0].term_id },
        )
      agent = fullResponse.atom
    }
  }

  if (!agent) {
    return {
      found: false,
      agentId: null,
      name: null,
      image: null,
      trustScore: null,
      capabilities: [],
      recommendation: `No agent found with identifier: ${identifier}`,
    }
  }

  // Extract vault data
  const vault = agent.term?.vaults?.[0]
  let trustScore: TrustScore | null = null

  if (vault) {
    const input: TrustScoreInput = {
      totalStaked: BigInt(vault.total_assets || '0'),
      stakerCount: vault.position_count || 0,
      sharePrice: BigInt(vault.current_share_price || '1000000000000000000'),
      forStake: BigInt(vault.total_assets || '0'),
      againstStake: 0n, // Would need counter vault query for full data
      operatorStake: 0n, // Would need creator position query
      ageInDays: agent.created_at
        ? Math.floor(
            (Date.now() - new Date(agent.created_at).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0,
      feedbackCount: 0,
      averageFeedbackScore: 0,
    }
    trustScore = calculateTrustScore(input)
  }

  // Extract capabilities from triples
  const capabilities = (agent.as_subject_triples || [])
    .filter((t) => t.predicate?.label === 'has-capability')
    .map((t) => ({
      name: t.object?.label || 'unknown',
      tripleId: t.term_id,
    }))

  const recommendation = getRecommendation(trustScore)

  return {
    found: true,
    agentId: agent.term_id,
    name: agent.label,
    image: agent.image || null,
    trustScore,
    capabilities,
    recommendation,
  }
}

function getRecommendation(score: TrustScore | null): string {
  if (!score) return 'Insufficient data to assess trust.'
  switch (score.tier) {
    case 'elite':
      return 'Highly trusted agent with strong community backing. Suitable for critical tasks.'
    case 'high':
      return 'Trusted agent. Safe for most tasks.'
    case 'medium':
      return 'Moderate trust. Consider for low-stakes tasks or verify outputs.'
    case 'low':
      return 'Limited trust history. Exercise caution and verify all outputs.'
  }
}
