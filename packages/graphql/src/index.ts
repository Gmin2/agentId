export {
  createGraphQLClient,
  INTUITION_GRAPHQL_ENDPOINTS,
  type Network,
} from './client'

export {
  GET_AGENT_BY_ATOM_ID,
  SEARCH_AGENTS_BY_NAME,
  GET_AGENT_CAPABILITIES,
  SEARCH_AGENTS_BY_CAPABILITY,
  GET_ATOM_BY_LABEL,
  GET_USER_POSITIONS,
} from './queries'

export type {
  VaultData,
  TermData,
  AtomBasic,
  AtomWithVault,
  TripleData,
  AgentAtomData,
  GetAgentByAtomIdResponse,
  SearchAgentsByNameResponse,
  GetAgentCapabilitiesResponse,
  SearchAgentsByCapabilityResponse,
  GetAtomByLabelResponse,
  PositionData,
  GetUserPositionsResponse,
} from './types'
