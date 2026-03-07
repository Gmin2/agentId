# @agentids/sdk

Core SDK for AgentID — create agent atoms, declare capabilities, stake on agents, and query trust scores on Intuition Protocol.

## Install

```bash
npm install @agentids/sdk
```

## Setup

```typescript
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { createGraphQLClient, INTUITION_NETWORKS } from '@agentids/sdk'

const net = INTUITION_NETWORKS.testnet

const account = privateKeyToAccount('0xYOUR_PRIVATE_KEY')
const publicClient = createPublicClient({ transport: http(net.rpcUrl) })
const walletClient = createWalletClient({ account, transport: http(net.rpcUrl) })
const graphqlClient = createGraphQLClient('testnet')

const config = {
  multiVaultAddress: net.multiVaultAddress,
  publicClient,
  walletClient,
  graphqlClient,
  graphqlUrl: net.graphqlUrl,
  pinataApiJwt: 'YOUR_PINATA_JWT',
}
```

## API

### Create an Agent Atom

```typescript
import { createAgentAtom } from '@agentids/sdk'

const result = await createAgentAtom(config, {
  name: 'CodeReviewBot',
  description: 'AI agent that reviews pull requests',
  image: 'https://example.com/bot.png',
  initialDeposit: 10_000_000_000_000_000n, // 0.01 ETH
})

console.log(result.atomId)               // '0x199aa1e...'
console.log(result.txHash)               // '0xaabb...'
console.log(result.fullRegistrationUri)   // 'ipfs://Qm...' (if Pinata JWT provided)
```

### Add a Capability

```typescript
import { createCapabilityTriple } from '@agentids/sdk'

const result = await createCapabilityTriple(config, {
  agentAtomId: '0x199aa1e...',
  capabilityName: 'code-generation',
  capabilityDescription: 'Generates code review comments and fix suggestions',
  capabilityCategory: 'code-generation',
})

console.log(result.tripleId)  // '0x9876...'
```

### Stake on an Agent

```typescript
import { stakeOnAgent, counterSignalTriple } from '@agentids/sdk'

// Stake FOR (trust signal)
const stake = await stakeOnAgent(config, {
  atomId: '0x199aa1e...',
  amount: 100_000_000_000_000_000n, // 0.1 ETH
})

// Counter-signal AGAINST a triple
const counter = await counterSignalTriple(config, {
  tripleId: '0x9876...',
  amount: 50_000_000_000_000_000n,
})
```

### Get Agent Reputation

```typescript
import { getAgentReputation } from '@agentids/sdk'

const rep = await getAgentReputation(readConfig, '0x199aa1e...')

console.log(rep.name)              // 'CodeReviewBot'
console.log(rep.trustScore)        // { normalized: 72, tier: 'high', ... }
console.log(rep.capabilities)      // ['code-generation', 'data-analysis']
console.log(rep.recommendation)    // 'Trusted agent. Safe for most tasks.'
```

### IPFS Uploads

```typescript
import { pinThing, uploadJsonToPinata } from '@agentids/sdk'

// Use Intuition's pinThing for atom labels (recommended)
const uri = await pinThing('https://testnet.intuition.sh/v1/graphql', {
  name: 'MyAgent',
  description: 'An AI agent',
  image: 'https://example.com/img.png',
})

// Or upload full JSON to Pinata
const pinata = await uploadJsonToPinata('YOUR_JWT', { name: 'MyAgent', ... })
```

## Re-exports

For convenience, `@agentids/sdk` re-exports everything from `@agentids/schema` and `@agentids/graphql`:

```typescript
import { calculateTrustScore, SEARCH_AGENTS_BY_NAME } from '@agentids/sdk'
```

## Network Constants

```typescript
import { INTUITION_NETWORKS } from '@agentids/sdk'

INTUITION_NETWORKS.testnet.chainId          // 13579
INTUITION_NETWORKS.testnet.rpcUrl           // 'https://testnet.rpc.intuition.systems'
INTUITION_NETWORKS.testnet.multiVaultAddress // '0x2Ece8D4d...'
INTUITION_NETWORKS.testnet.graphqlUrl       // 'https://testnet.intuition.sh/v1/graphql'
```

## License

MIT
