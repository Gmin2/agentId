# AgentID

![cover-image](./assets/cover-image.png)

Decentralized Trust Registry for Autonomous AI Agents, built on [Intuition Protocol](https://intuition.systems).

AgentID is a "Yellow Pages" for AI agents — enabling them to register identity, declare capabilities, and accrue verifiable reputation through crypto-economic staking. It uses existing Intuition MultiVault primitives (Atoms, Triples, Vaults) with no custom smart contracts.

## Architecture

| AgentID Concept | Intuition Primitive |
|---|---|
| Agent Identity | Atom (URI -> IPFS registration file) |
| Capability | Atom |
| Agent has Capability | Triple: `(Agent)--[has-capability]-->(Capability)` |
| Bonded Stake (trust signal) | Deposit to Agent's FOR Vault |
| Counter-Signal (distrust) | Deposit to AGAINST Vault |
| Trust Score | Calculated from vault stats |

## Packages

| Package | Description |
|---|---|
| [`@agentids/schema`](./packages/schema) | ERC-8004 aligned Zod schemas for agent registration, capabilities, and trust scoring |
| [`@agentids/graphql`](./packages/graphql) | GraphQL queries and types for querying Intuition's indexer |
| [`@agentids/sdk`](./packages/sdk) | Core SDK — create agents, capabilities, stake, and check reputation |
| [`@agentids/cli`](./apps/cli) | CLI tool for registering agents, managing capabilities, and checking trust |
| [`dashboard`](./apps/dashboard) | Web dashboard for exploring agents, staking, and viewing portfolio |

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run the dashboard
cd apps/dashboard && pnpm dev

# Use the CLI
cd apps/cli
cp .env.example .env  # Add your PRIVATE_KEY and PINATA_API_JWT
pnpm build && node dist/index.js register
```

## CLI Usage

```bash
# Register a new agent (interactive)
agentid register

# Search for agents
agentid search "code"

# View agent details and trust score
agentid info <atomId>

# Add a capability to an agent
agentid capability-add <atomId>

# Stake on an agent
agentid stake <atomId>
```

## Trust Score

Trust is calculated from 6 weighted components:

| Component | Weight | Source |
|---|---|---|
| Staking | 25% | Total value staked on agent |
| Diversity | 15% | Number of unique stakers |
| Sentiment | 20% | FOR vs AGAINST vault ratio |
| Operator Commitment | 15% | Operator's self-stake |
| Longevity | 10% | Age of the agent atom |
| Feedback | 15% | ERC-8004 feedback signals |

Tiers: **Elite** (85+) > **High** (65-84) > **Medium** (40-64) > **Low** (0-39)

## Network

- **Chain:** Intuition Testnet L3 (Chain ID: 13579)
- **MultiVault:** `0x2Ece8D4dEdcB9918A398528f3fa4688b1d2CAB91`
- **RPC:** `https://testnet.rpc.intuition.systems`
- **GraphQL:** `https://testnet.intuition.sh/v1/graphql`
- **Explorer:** `https://testnet.explorer.intuition.systems`

## Development

```bash
# Prerequisites
node >= 22.0.0
pnpm >= 10.x

# Install
pnpm install

# Build all
pnpm build

# Test all
pnpm test

# Dev mode (watch)
pnpm dev
```

## License

MIT
