import { useState, useEffect } from 'preact/hooks'
import {
  GET_AGENT_BY_ATOM_ID,
  type GetAgentByAtomIdResponse,
  type AgentAtomData,
} from '@agentid/graphql'
import { calculateTrustScore, type TrustScore, type TrustScoreInput } from '@agentid/schema'
import { graphqlClient } from '../graphql.ts'

export interface AgentDetail {
  atomId: string
  name: string
  image: string | null
  description: string | null
  createdAt: string | null
  creatorAddress: string | null
  totalStaked: string
  stakersCount: number
  sharePrice: string
  marketCap: string
  capabilities: Array<{ name: string; tripleId: string }>
  trustScore: TrustScore | null
  recommendation: string
  ipfsData: any | null
}

function parseIpfsData(data: string | null): any | null {
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

function buildTrustScore(agent: AgentAtomData): TrustScore | null {
  const vault = agent.term?.vaults?.[0]
  if (!vault) return null

  const input: TrustScoreInput = {
    totalStaked: BigInt(vault.total_assets || '0'),
    stakerCount: vault.position_count || 0,
    sharePrice: BigInt(vault.current_share_price || '1000000000000000000'),
    forStake: BigInt(vault.total_assets || '0'),
    againstStake: 0n,
    operatorStake: 0n,
    ageInDays: agent.created_at
      ? Math.floor((Date.now() - new Date(agent.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    feedbackCount: 0,
    averageFeedbackScore: 0,
  }
  return calculateTrustScore(input)
}

function getRecommendation(score: TrustScore | null): string {
  if (!score) return 'Insufficient data to assess trust.'
  switch (score.tier) {
    case 'elite': return 'Highly trusted agent. Suitable for critical tasks.'
    case 'high': return 'Trusted agent. Safe for most tasks.'
    case 'medium': return 'Moderate trust. Consider for low-stakes tasks.'
    case 'low': return 'Limited trust. Exercise caution.'
    default: return 'Unknown trust level.'
  }
}

export function useAgentDetail(atomId: string | undefined) {
  const [agent, setAgent] = useState<AgentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!atomId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetch() {
      setLoading(true)
      setError(null)
      try {
        const res = await graphqlClient.request<GetAgentByAtomIdResponse>(
          GET_AGENT_BY_ATOM_ID,
          { atomId }
        )

        if (cancelled) return

        if (!res.atom) {
          setError('Agent not found')
          setAgent(null)
          return
        }

        const atom = res.atom
        const vault = atom.term?.vaults?.[0]
        const ipfsData = parseIpfsData(atom.data)
        const trustScore = buildTrustScore(atom)

        const capabilities = (atom.as_subject_triples || [])
          .filter(t => t.predicate?.label === 'has-capability')
          .map(t => ({
            name: t.object?.label || 'unknown',
            tripleId: t.term_id,
          }))

        setAgent({
          atomId: atom.term_id,
          name: atom.label || ipfsData?.name || 'Unknown',
          image: atom.image || ipfsData?.image || null,
          description: ipfsData?.description || null,
          createdAt: atom.created_at || null,
          creatorAddress: atom.creator?.id || null,
          totalStaked: vault?.total_assets || '0',
          stakersCount: vault?.position_count || 0,
          sharePrice: vault?.current_share_price || '0',
          marketCap: vault?.market_cap || '0',
          capabilities,
          trustScore,
          recommendation: getRecommendation(trustScore),
          ipfsData,
        })
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch agent')
          setAgent(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [atomId])

  return { agent, loading, error }
}
