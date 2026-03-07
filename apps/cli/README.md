# @agentid/cli

CLI tool for the AgentID trust registry. Register AI agents, manage capabilities, check reputation, and stake on Intuition Protocol.

## Install

```bash
npm install -g @agentid/cli
```

Or run locally:

```bash
cd apps/cli
cp .env.example .env   # Edit with your keys
pnpm build
node dist/index.js
```

## Configuration

Create a `.env` file:

```env
# Required for write commands (register, stake, capability-add)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Required for register (IPFS upload)
PINATA_API_JWT=your_pinata_jwt_here

# Network: testnet (default) or mainnet
NETWORK=testnet
```

Read-only commands (`info`, `search`) work without a private key.

## Commands

### `agentid register`

Register a new AI agent interactively.

```
$ agentid register

? Agent name: CodeReviewBot
? Description: AI agent that reviews pull requests
? Image URL: https://example.com/bot.png
? Endpoint type: MCP
? Endpoint URL: https://bot.com/mcp
? Initial stake in ETH (default 0.001): 0.01
? Add a capability? Y
? Capability name: code-generation
? Capability category: code-generation

Agent registered!
  Atom ID: 0x199aa1e...
  Stake:   0.01 ETH
```

### `agentid info <identifier>`

View agent details and trust score. Accepts atom ID or agent name.

```
$ agentid info CodeReviewBot

Agent: CodeReviewBot
  Atom ID: 0x199aa1e...
  Active:  Yes

Trust Score: 72/100 [HIGH]
  Staking:    85/100
  Diversity:  60/100
  Sentiment:  90/100
  Operator:   70/100
  Longevity:  45/100
  Feedback:   50/100

Capabilities:
  - code-generation
  - data-analysis
```

### `agentid search <query>`

Search agents by name.

```
$ agentid search "code" --limit 5

1. CodeReviewBot
   Atom ID: 0x199aa1e...
   Stake: 5.2 ETH | Stakers: 15

Found 1 agent matching "code"
```

### `agentid capability-add <atomId>`

Add a capability to an existing agent.

```
$ agentid capability-add 0x199aa1e...

? Capability name: data-analysis
? Capability category: analysis

Capability added!
  Triple ID: 0x5555...
```

### `agentid stake <atomId>`

Stake on an agent's FOR vault.

```
$ agentid stake 0x199aa1e...

? Amount to stake (ETH): 0.1
? Confirm? Y

Staked 0.1 ETH on CodeReviewBot
  Shares received: 95000000000000000
```

## Network

Default: Intuition Testnet (Chain ID: 13579)

| Setting | Value |
|---|---|
| RPC | `https://testnet.rpc.intuition.systems` |
| MultiVault | `0x2Ece8D4dEdcB9918A398528f3fa4688b1d2CAB91` |
| GraphQL | `https://testnet.intuition.sh/v1/graphql` |
| Faucet | `https://faucet.intuition.systems` |

## License

MIT
