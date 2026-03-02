import { describe, it, expect, vi } from 'vitest'
import type { AgentRegistration } from '@agentid/schema'
import type { AgentIdWriteConfig } from '../config'
import { createAgentAtom } from '../create-agent-atom'

// Mock ipfs module — persists across all tests
vi.mock('../ipfs', () => ({
  uploadJsonToPinata: vi.fn().mockResolvedValue({
    IpfsHash: 'QmMockAgentHash',
    PinSize: 512,
    Timestamp: '2025-01-01T00:00:00Z',
  }),
}))

// Mock viem's decodeEventLog
vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    decodeEventLog: vi.fn().mockReturnValue({
      eventName: 'AtomCreated',
      args: {
        termId:
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      },
    }),
  }
})

const MOCK_TX_HASH =
  '0xaabbccdd00000000000000000000000000000000000000000000000000000001' as const

function createMockConfig(): AgentIdWriteConfig {
  return {
    multiVaultAddress: '0x6E35cF57A41fA15eA0EaE9C33e751b01A784Fe7e',
    pinataApiJwt: 'test-jwt',
    walletClient: {
      account: {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
      },
      writeContract: vi.fn().mockResolvedValue(MOCK_TX_HASH),
    } as any,
    publicClient: {
      readContract: vi.fn().mockResolvedValue(100000000000000n),
      simulateContract: vi.fn().mockResolvedValue({ request: {} }),
      waitForTransactionReceipt: vi.fn().mockResolvedValue({
        logs: [
          {
            topics: ['0xsig', '0xcreator', '0xatomId'],
            data: '0x1234',
          },
        ],
      }),
    } as any,
    graphqlClient: {} as any,
  }
}

const validRegistration: AgentRegistration = {
  type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
  name: 'TestAgent',
  description: 'A test agent for unit tests',
  image: 'https://example.com/agent.png',
  endpoints: [{ name: 'MCP', endpoint: 'https://test.com/mcp' }],
  x402Support: false,
  active: true,
  registrations: [],
  supportedTrust: ['reputation'],
}

describe('createAgentAtom', () => {
  it('should reject invalid registration schema', async () => {
    const config = createMockConfig()
    const invalidReg = { name: 'bad' } as any

    await expect(createAgentAtom(config, invalidReg)).rejects.toThrow()
  })

  it('should call uploadJsonToPinata with registration data', async () => {
    const { uploadJsonToPinata } = await import('../ipfs')
    const config = createMockConfig()

    await createAgentAtom(config, validRegistration)

    expect(uploadJsonToPinata).toHaveBeenCalledWith(
      'test-jwt',
      validRegistration,
    )
  })

  it('should read atom cost from the MultiVault contract', async () => {
    const config = createMockConfig()

    await createAgentAtom(config, validRegistration, 50000n)

    expect(config.publicClient.readContract).toHaveBeenCalledWith({
      address: config.multiVaultAddress,
      abi: expect.any(Array),
      functionName: 'getAtomCost',
    })
  })

  it('should simulate the createAtoms transaction before writing', async () => {
    const config = createMockConfig()

    await createAgentAtom(config, validRegistration)

    expect(config.publicClient.simulateContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'createAtoms',
        address: config.multiVaultAddress,
      }),
    )
  })

  it('should pass total value = atomCost + depositAmount', async () => {
    const config = createMockConfig()
    const deposit = 500000n

    await createAgentAtom(config, validRegistration, deposit)

    // atomCost mock returns 100000000000000n, so total = 100000000000000n + 500000n
    expect(config.publicClient.simulateContract).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 100000000000000n + deposit,
      }),
    )
  })

  it('should wait for transaction receipt', async () => {
    const config = createMockConfig()

    await createAgentAtom(config, validRegistration)

    expect(
      config.publicClient.waitForTransactionReceipt,
    ).toHaveBeenCalledWith({ hash: MOCK_TX_HASH })
  })

  it('should return atomId, ipfsUri, and txHash', async () => {
    const config = createMockConfig()

    const result = await createAgentAtom(config, validRegistration)

    expect(result.ipfsUri).toBe('ipfs://QmMockAgentHash')
    expect(result.txHash).toBe(MOCK_TX_HASH)
    expect(result.atomId).toBe(
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    )
  })
})
