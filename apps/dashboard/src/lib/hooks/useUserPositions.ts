import { useState, useEffect } from 'preact/hooks'
import {
  GET_USER_POSITIONS,
  type GetUserPositionsResponse,
  type PositionData,
} from '@agentid/graphql'
import { graphqlClient } from '../graphql.ts'
import { useWallet } from '../wallet.tsx'

export interface UserPosition {
  id: string
  agentName: string
  agentAtomId: string | null
  shares: string
  totalAssets: string
  vaultType: string
  isTriple: boolean
}

export interface UserAgent {
  atomId: string
  name: string
  image: string | null
  totalStaked: string
  stakersCount: number
}

function mapPosition(pos: PositionData): UserPosition {
  const term = pos.vault.term
  return {
    id: pos.id,
    agentName: term?.atom?.label || 'Unknown',
    agentAtomId: term?.atom?.term_id || null,
    shares: pos.shares,
    totalAssets: pos.vault.total_assets,
    vaultType: term?.triple ? 'AGAINST' : 'FOR',
    isTriple: !!term?.triple,
  }
}

export function useUserPositions() {
  const { address } = useWallet()
  const [positions, setPositions] = useState<UserPosition[]>([])
  const [myAgents, setMyAgents] = useState<UserAgent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setPositions([])
      setMyAgents([])
      return
    }

    let cancelled = false

    async function fetch() {
      setLoading(true)
      setError(null)
      try {
        // Fetch user positions
        const res = await graphqlClient.request<GetUserPositionsResponse>(
          GET_USER_POSITIONS,
          { userAddress: address!, limit: 50 }
        )

        if (cancelled) return

        // Filter out unlabeled "json object" atoms (from malformed deploys)
        const labeled = res.positions.filter((pos) => {
          const label = pos.vault.term?.atom?.label
          return label && label !== 'json object' && label !== 'Unknown'
        })

        setPositions(labeled.map(mapPosition))

        // For "My Agents" — use atom positions with proper labels
        const agentMap = new Map<string, UserAgent>()
        for (const pos of labeled) {
          const term = pos.vault.term
          if (term?.atom && !term.triple) {
            const atom = term.atom
            if (!agentMap.has(atom.term_id)) {
              agentMap.set(atom.term_id, {
                atomId: atom.term_id,
                name: atom.label || 'Unknown',
                image: atom.image || null,
                totalStaked: pos.vault.total_assets,
                stakersCount: 0,
              })
            }
          }
        }
        setMyAgents(Array.from(agentMap.values()))
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch positions')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [address])

  return { positions, myAgents, loading, error }
}
