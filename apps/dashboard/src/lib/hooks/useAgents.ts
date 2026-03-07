import { useState, useEffect, useCallback } from 'preact/hooks'
import {
  SEARCH_AGENTS_BY_NAME,
  SEARCH_AGENTS_BY_CAPABILITY,
  type SearchAgentsByNameResponse,
  type SearchAgentsByCapabilityResponse,
  type AtomWithVault,
} from '@agentid/graphql'
import { graphqlClient } from '../graphql.ts'

export interface AgentListItem {
  atomId: string
  name: string
  image: string | null
  totalStaked: string
  stakersCount: number
  sharePrice: string
  createdAt: string | null
}

function mapAtomToAgent(atom: AtomWithVault): AgentListItem {
  const vault = atom.term?.vaults?.[0]
  return {
    atomId: atom.term_id,
    name: atom.label || 'Unknown',
    image: atom.image || null,
    totalStaked: vault?.total_assets || '0',
    stakersCount: vault?.position_count || 0,
    sharePrice: vault?.current_share_price || '0',
    createdAt: atom.created_at || null,
  }
}

export function useAgents(search: string, capabilities: string[], limit = 20) {
  const [agents, setAgents] = useState<AgentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (capabilities.length > 0) {
        // Search by capability — merge results
        const allAgents = new Map<string, AgentListItem>()
        for (const cap of capabilities) {
          const res = await graphqlClient.request<SearchAgentsByCapabilityResponse>(
            SEARCH_AGENTS_BY_CAPABILITY,
            { capability: `%${cap}%`, limit }
          )
          for (const triple of res.triples) {
            const agent = mapAtomToAgent(triple.subject)
            if (!allAgents.has(agent.atomId)) {
              if (!search || agent.name.toLowerCase().includes(search.toLowerCase())) {
                allAgents.set(agent.atomId, agent)
              }
            }
          }
        }
        setAgents(Array.from(allAgents.values()))
      } else {
        // Search by name
        const nameQuery = search ? `%${search}%` : '%'
        const res = await graphqlClient.request<SearchAgentsByNameResponse>(
          SEARCH_AGENTS_BY_NAME,
          { name: nameQuery, limit }
        )
        setAgents(
          res.atoms
            .filter((a) => a.label && a.label !== 'json object')
            .map(mapAtomToAgent)
        )
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch agents')
      setAgents([])
    } finally {
      setLoading(false)
    }
  }, [search, capabilities, limit])

  useEffect(() => {
    const timer = setTimeout(fetchAgents, 300) // debounce
    return () => clearTimeout(timer)
  }, [fetchAgents])

  return { agents, loading, error, refetch: fetchAgents }
}
