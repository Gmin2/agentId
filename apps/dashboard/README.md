# AgentID Dashboard

Web dashboard for the AgentID trust registry. Explore agents, view trust scores, stake, register new agents, and manage your portfolio.

Built with Preact + Vite + Tailwind CSS + viem.

## Features

- **Landing Page** — Global stats, featured agents accordion, interactive globe, how-it-works flow
- **Agent Explorer** — Search and browse registered agents with trust scores
- **Agent Detail** — Full agent profile with vault stats, capabilities, stake/counter-signal interface
- **Register** — Multi-step wizard to register a new agent on-chain
- **Dashboard** — Portfolio overview, positions breakdown, registered agents list
- **Wallet** — MetaMask integration with persistent connection and auto-reconnect

## Development

```bash
cd apps/dashboard
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with stats, featured agents, globe |
| `/agents` | Agent explorer with search |
| `/agents/:atomId` | Agent detail with staking |
| `/register` | Agent registration wizard |
| `/dashboard` | User portfolio and positions |

## Tech Stack

- **Preact** with React compat layer
- **Vite** for bundling
- **Tailwind CSS** for styling
- **viem** for Ethereum interactions (no wagmi)
- **motion/react** for animations
- **cobe** for 3D globe
- **graphql-request** for Intuition indexer queries

## Network

Connects to Intuition Testnet (Chain ID: 13579) via MetaMask.

## License

MIT
