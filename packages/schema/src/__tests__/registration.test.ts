import { describe, it, expect } from 'vitest'
import { AgentRegistrationSchema } from '../registration'

describe('AgentRegistrationSchema', () => {
  const validRegistration = {
    type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1' as const,
    name: 'DataAnalysisAgent',
    description: 'AI agent specialized in financial data analysis',
    image: 'https://example.com/agent.png',
    endpoints: [
      {
        name: 'MCP' as const,
        endpoint: 'https://myagent.com/mcp',
        version: '2025-06-18',
      },
    ],
    x402Support: false,
    active: true,
    registrations: [],
    supportedTrust: ['reputation' as const, 'crypto-economic' as const],
  }

  it('should validate a correct registration', () => {
    const result = AgentRegistrationSchema.safeParse(validRegistration)
    expect(result.success).toBe(true)
  })

  it('should reject missing name', () => {
    const { name, ...noName } = validRegistration
    const result = AgentRegistrationSchema.safeParse(noName)
    expect(result.success).toBe(false)
  })

  it('should reject empty endpoints', () => {
    const result = AgentRegistrationSchema.safeParse({
      ...validRegistration,
      endpoints: [],
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid type field', () => {
    const result = AgentRegistrationSchema.safeParse({
      ...validRegistration,
      type: 'wrong-type',
    })
    expect(result.success).toBe(false)
  })

  it('should validate with agentidExtensions', () => {
    const result = AgentRegistrationSchema.safeParse({
      ...validRegistration,
      agentidExtensions: {
        operatorAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
        capabilities: [
          {
            name: 'data-analysis',
            description: 'Analyzes financial datasets',
            category: 'analysis',
          },
        ],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid operator address', () => {
    const result = AgentRegistrationSchema.safeParse({
      ...validRegistration,
      agentidExtensions: {
        operatorAddress: 'not-an-address',
        capabilities: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    })
    expect(result.success).toBe(false)
  })

  it('should default x402Support to false', () => {
    const { x402Support, ...noX402 } = validRegistration
    const result = AgentRegistrationSchema.parse(noX402)
    expect(result.x402Support).toBe(false)
  })

  it('should default active to true', () => {
    const { active, ...noActive } = validRegistration
    const result = AgentRegistrationSchema.parse(noActive)
    expect(result.active).toBe(true)
  })
})
