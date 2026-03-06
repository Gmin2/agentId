import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all external dependencies
vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
  select: vi.fn(),
  confirm: vi.fn(),
  checkbox: vi.fn(),
}))

vi.mock('@agentid/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@agentid/sdk')>()
  return {
    ...actual,
    createAgentAtom: vi.fn().mockResolvedValue({
      atomId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      ipfsUri: 'ipfs://QmMockHash',
      txHash: '0xaabb000000000000000000000000000000000000000000000000000000000001',
    }),
    createCapabilityTriple: vi.fn().mockResolvedValue({
      tripleId: '0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef',
      predicateAtomId: '0xpred000000000000000000000000000000000000000000000000000000000001',
      capabilityAtomId: '0xcap0000000000000000000000000000000000000000000000000000000000001',
      txHash: '0xccdd000000000000000000000000000000000000000000000000000000000002',
    }),
  }
})

vi.mock('../client.js', () => ({
  loadEnvConfig: vi.fn(),
  createWriteConfig: vi.fn().mockReturnValue({
    multiVaultAddress: '0x6E35cF57A41fA15eA0EaE9C33e751b01A784Fe7e',
    walletClient: {
      account: { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7' },
    },
    publicClient: {},
    graphqlClient: {},
    pinataApiJwt: 'test-jwt',
  }),
}))

import { registerCommand } from '../commands/register.js'
import { input, select, confirm, checkbox } from '@inquirer/prompts'
import { createAgentAtom, createCapabilityTriple } from '@agentid/sdk'
import { loadEnvConfig } from '../client.js'

describe('registerCommand', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should error if PRIVATE_KEY is not set', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: undefined,
      pinataApiJwt: 'jwt',
      hasWriteConfig: false,
    })

    await registerCommand()

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('PRIVATE_KEY'),
    )
    expect(createAgentAtom).not.toHaveBeenCalled()
  })

  it('should error if PINATA_API_JWT is not set', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0xkey',
      pinataApiJwt: undefined,
      hasWriteConfig: true,
    })

    await registerCommand()

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('PINATA_API_JWT'),
    )
    expect(createAgentAtom).not.toHaveBeenCalled()
  })

  it('should prompt for all fields and call createAgentAtom', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pinataApiJwt: 'test-jwt',
      hasWriteConfig: true,
    })

    // Mock prompt responses in order
    vi.mocked(input)
      .mockResolvedValueOnce('TestBot')       // name
      .mockResolvedValueOnce('A test bot')    // description
      .mockResolvedValueOnce('https://example.com/img.png') // image
      .mockResolvedValueOnce('https://test.com/mcp')        // endpoint URL
      .mockResolvedValueOnce('')              // endpoint version
      .mockResolvedValueOnce('0.001')         // stake

    vi.mocked(select).mockResolvedValueOnce('MCP') // endpoint type
    vi.mocked(confirm)
      .mockResolvedValueOnce(false)           // x402
      .mockResolvedValueOnce(false)           // add capability? → no
    vi.mocked(checkbox).mockResolvedValueOnce(['reputation'])

    await registerCommand()

    expect(createAgentAtom).toHaveBeenCalledOnce()
    expect(createAgentAtom).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        name: 'TestBot',
        description: 'A test bot',
        image: 'https://example.com/img.png',
        type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      }),
      expect.any(BigInt),
    )
  })

  it('should create capability triples when capabilities are added', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pinataApiJwt: 'test-jwt',
      hasWriteConfig: true,
    })

    vi.mocked(input)
      .mockResolvedValueOnce('CapBot')              // name
      .mockResolvedValueOnce('Bot with capabilities') // description
      .mockResolvedValueOnce('https://example.com/img.png') // image
      .mockResolvedValueOnce('https://test.com/mcp')  // endpoint URL
      .mockResolvedValueOnce('')                       // endpoint version
      .mockResolvedValueOnce('0.001')                  // stake
      .mockResolvedValueOnce('code-gen')               // capability name
      .mockResolvedValueOnce('Generates code')         // capability description

    vi.mocked(select)
      .mockResolvedValueOnce('MCP')             // endpoint type
      .mockResolvedValueOnce('code-generation') // capability category

    vi.mocked(confirm)
      .mockResolvedValueOnce(false)  // x402
      .mockResolvedValueOnce(true)   // add capability? → yes
      .mockResolvedValueOnce(false)  // add another? → no

    vi.mocked(checkbox).mockResolvedValueOnce(['reputation'])

    await registerCommand()

    expect(createAgentAtom).toHaveBeenCalledOnce()
    expect(createCapabilityTriple).toHaveBeenCalledOnce()
    expect(createCapabilityTriple).toHaveBeenCalledWith(
      expect.any(Object),
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      'code-gen',
    )
  })

  it('should handle createAgentAtom errors gracefully', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pinataApiJwt: 'test-jwt',
      hasWriteConfig: true,
    })

    vi.mocked(input)
      .mockResolvedValueOnce('FailBot')
      .mockResolvedValueOnce('Will fail')
      .mockResolvedValueOnce('https://example.com/img.png')
      .mockResolvedValueOnce('https://test.com/mcp')
      .mockResolvedValueOnce('')
      .mockResolvedValueOnce('0.001')

    vi.mocked(select).mockResolvedValueOnce('MCP')
    vi.mocked(confirm)
      .mockResolvedValueOnce(false) // x402
      .mockResolvedValueOnce(false) // no capabilities
    vi.mocked(checkbox).mockResolvedValueOnce(['reputation'])

    vi.mocked(createAgentAtom).mockRejectedValueOnce(
      new Error('Something went wrong'),
    )

    await registerCommand()

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Registration failed'),
    )
  })

  it('should show faucet info on insufficient balance error', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pinataApiJwt: 'test-jwt',
      hasWriteConfig: true,
    })

    vi.mocked(input)
      .mockResolvedValueOnce('PoorBot')
      .mockResolvedValueOnce('No funds')
      .mockResolvedValueOnce('https://example.com/img.png')
      .mockResolvedValueOnce('https://test.com/mcp')
      .mockResolvedValueOnce('')
      .mockResolvedValueOnce('0.001')

    vi.mocked(select).mockResolvedValueOnce('MCP')
    vi.mocked(confirm)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
    vi.mocked(checkbox).mockResolvedValueOnce(['reputation'])

    vi.mocked(createAgentAtom).mockRejectedValueOnce(
      new Error('insufficient balance for transfer'),
    )

    await registerCommand()

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Insufficient balance'),
    )
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('faucet.intuition.systems'),
    )
  })
})
