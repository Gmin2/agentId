/** Vault data returned from Intuition GraphQL. */
export interface VaultData {
  total_shares: string
  total_assets: string
  current_share_price?: string
  market_cap?: string
  position_count?: number
}

/** Term containing vault data. */
export interface TermData {
  vaults: VaultData[]
}

/** Basic atom fields. */
export interface AtomBasic {
  term_id: string
  label: string | null
  data: string | null
  image?: string | null
}

/** Atom with vault info. */
export interface AtomWithVault extends AtomBasic {
  created_at?: string
  type?: string | null
  creator?: { id: string; label: string | null } | null
  term: TermData
}

/** Triple relationship data. */
export interface TripleData {
  term_id: string
  predicate: AtomBasic
  object: AtomBasic
  term: TermData
  counter_term: TermData
}

/** Full agent data (atom + triples). */
export interface AgentAtomData extends AtomWithVault {
  as_subject_triples: TripleData[]
}

// --- Query response types ---

export interface GetAgentByAtomIdResponse {
  atom: AgentAtomData | null
}

export interface SearchAgentsByNameResponse {
  atoms: AtomWithVault[]
}

export interface GetAgentCapabilitiesResponse {
  triples: TripleData[]
}

export interface SearchAgentsByCapabilityResponse {
  triples: Array<{
    term_id: string
    subject: AtomWithVault
    object: AtomBasic
  }>
}

export interface GetAtomByLabelResponse {
  atoms: AtomBasic[]
}

export interface PositionData {
  id: string
  shares: string
  vault: {
    id: string
    type: string
    market_cap: string
    total_assets: string
    atom: AtomBasic | null
    triple: { term_id: string } | null
  }
}

export interface GetUserPositionsResponse {
  positions: PositionData[]
}
