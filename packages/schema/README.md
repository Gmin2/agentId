# @agentid/schema

ERC-8004 aligned Zod schemas for the AgentID trust registry. Defines validation schemas and TypeScript types for agent registration, capabilities, endpoints, predicates, and trust scoring.

## Install

```bash
npm install @agentid/schema
```

## Usage

### Agent Registration

```typescript
import { AgentRegistrationSchema, type AgentRegistration } from '@agentid/schema'

const registration = AgentRegistrationSchema.parse({
  type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
  name: 'CodeReviewBot',
  description: 'AI agent that reviews pull requests',
  image: 'https://example.com/bot.png',
  endpoints: [{ name: 'MCP', endpoint: 'https://bot.com/mcp', version: '2025-06-18' }],
  x402Support: false,
  active: true,
  supportedTrust: ['reputation', 'crypto-economic'],
})
```

### Trust Score Calculation

```typescript
import { calculateTrustScore, type TrustScoreInput } from '@agentid/schema'

const input: TrustScoreInput = {
  totalStaked: 5_000_000_000_000_000_000n, // 5 ETH
  stakerCount: 15,
  sharePrice: 1_000_000_000_000_000_000n,
  forStake: 4_500_000_000_000_000_000n,
  againstStake: 500_000_000_000_000_000n,
  operatorStake: 1_000_000_000_000_000_000n,
  ageInDays: 30,
  feedbackCount: 0,
  averageFeedbackScore: 0,
}

const score = calculateTrustScore(input)
// { normalized: 72, tier: 'high', components: {...}, confidence: 0.6 }
```

### Capabilities

```typescript
import { CapabilitySchema, CapabilityCategoryEnum } from '@agentid/schema'

const cap = CapabilitySchema.parse({
  name: 'code-generation',
  description: 'Generates code review comments',
  category: 'code-generation',
})
```

### Predicates

```typescript
import { PREDICATES } from '@agentid/schema'

// Available predicates for Intuition Triples:
// 'has-capability' | 'operated-by' | 'endorses' | 'reports-issue'
```

## Exports

| Export | Description |
|---|---|
| `AgentRegistrationSchema` | Full ERC-8004 registration with AgentID extensions |
| `EndpointSchema` | Agent communication endpoint (MCP, A2A, web, email) |
| `CapabilitySchema` | Agent capability with category and optional pricing |
| `CapabilityCategoryEnum` | 10 standard capability categories |
| `TrustScoreSchema` | Computed trust score shape |
| `calculateTrustScore()` | Calculate trust from on-chain vault data |
| `TRUST_WEIGHTS` | Weight config for score components |
| `TIER_THRESHOLDS` | Score thresholds for tier classification |
| `PREDICATES` | Standard predicate labels for Intuition Triples |

## Trust Tiers

| Tier | Score | Recommendation |
|---|---|---|
| Elite | 85-100 | Highly trusted, suitable for critical tasks |
| High | 65-84 | Trusted for most tasks |
| Medium | 40-64 | Use for low-stakes tasks, verify outputs |
| Low | 0-39 | Exercise caution, new or disputed agent |

## License

MIT
