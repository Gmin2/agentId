# @agentid/graphql

GraphQL queries, client factory, and TypeScript types for querying AgentID data from Intuition Protocol's indexer.

## Install

```bash
npm install @agentid/graphql
```

## Usage

### Create a Client

```typescript
import { createGraphQLClient, INTUITION_GRAPHQL_ENDPOINTS } from '@agentid/graphql'

const client = createGraphQLClient('testnet')
// or with a custom endpoint:
// const client = createGraphQLClient('testnet', 'https://custom-endpoint.com/v1/graphql')
```

### Query Agents

```typescript
import {
  SEARCH_AGENTS_BY_NAME,
  GET_AGENT_BY_ATOM_ID,
  GET_AGENT_CAPABILITIES,
  type SearchAgentsByNameResponse,
  type GetAgentByAtomIdResponse,
} from '@agentid/graphql'

// Search agents by name
const results = await client.request<SearchAgentsByNameResponse>(
  SEARCH_AGENTS_BY_NAME,
  { name: '%code%', limit: 10 }
)

// Get agent by atom ID
const agent = await client.request<GetAgentByAtomIdResponse>(
  GET_AGENT_BY_ATOM_ID,
  { atomId: '0x199aa1e...' }
)

// Get agent capabilities (triples)
const caps = await client.request(
  GET_AGENT_CAPABILITIES,
  { subjectId: '0x199aa1e...' }
)
```

### Query User Positions

```typescript
import { GET_USER_POSITIONS, type GetUserPositionsResponse } from '@agentid/graphql'

const positions = await client.request<GetUserPositionsResponse>(
  GET_USER_POSITIONS,
  { address: '0x742d...bEb7' }
)
```

## Queries

| Query | Variables | Description |
|---|---|---|
| `SEARCH_AGENTS_BY_NAME` | `name`, `limit` | Search agents by name (ILIKE). Only returns atoms with `has-capability` triples. |
| `GET_AGENT_BY_ATOM_ID` | `atomId` | Get full agent data including vault stats |
| `GET_AGENT_CAPABILITIES` | `subjectId` | Get capability triples for an agent |
| `SEARCH_AGENTS_BY_CAPABILITY` | `capability`, `limit` | Find agents with a specific capability |
| `GET_ATOM_BY_LABEL` | `label` | Find an atom by exact label match |
| `GET_USER_POSITIONS` | `address` | Get all vault positions for a wallet address |

## Endpoints

| Network | URL |
|---|---|
| Testnet | `https://testnet.intuition.sh/v1/graphql` |
| Mainnet | `https://mainnet.intuition.sh/v1/graphql` |

## License

MIT
