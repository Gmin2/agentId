import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
  select: vi.fn(),
}))

vi.mock('@agentids/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@agentids/sdk')>()
  return {
    ...actual,
    createCapabilityTriple: vi.fn().mockResolvedValue({
      tripleId: '0x5555000000000000000000000000000000000000000000000000000000006666',
      predicateAtomId: '0xpred000000000000000000000000000000000000000000000000000000000001',
      capabilityAtomId: '0xcap0000000000000000000000000000000000000000000000000000000000001',
      txHash: '0xaabb000000000000000000000000000000000000000000000000000000001122',
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
    pinataApiJwt: '',
  }),
}))

import { capabilityAddCommand } from '../commands/capability-add.js'
import { input, select } from '@inquirer/prompts'
import { createCapabilityTriple } from '@agentids/sdk'
import { loadEnvConfig } from '../client.js'

describe('capabilityAddCommand', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should error if PRIVATE_KEY is not set', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: undefined,
      pinataApiJwt: undefined,
      hasWriteConfig: false,
    })

    await capabilityAddCommand('0x1234')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('PRIVATE_KEY'),
    )
    expect(createCapabilityTriple).not.toHaveBeenCalled()
  })

  it('should error on invalid atom ID', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0xkey',
      pinataApiJwt: undefined,
      hasWriteConfig: true,
    })

    await capabilityAddCommand('badId')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid atom ID'),
    )
    expect(createCapabilityTriple).not.toHaveBeenCalled()
  })

  it('should prompt and create capability triple', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pinataApiJwt: undefined,
      hasWriteConfig: true,
    })

    vi.mocked(input)
      .mockResolvedValueOnce('data-analysis')  // capability name
      .mockResolvedValueOnce('Analyzes data')  // description
      .mockResolvedValueOnce('0.005')          // deposit

    vi.mocked(select).mockResolvedValueOnce('analysis')

    const atomId = '0xagent123'
    await capabilityAddCommand(atomId)

    expect(createCapabilityTriple).toHaveBeenCalledOnce()
    expect(createCapabilityTriple).toHaveBeenCalledWith(
      expect.any(Object),
      atomId,
      'data-analysis',
      expect.any(BigInt),
    )

    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('Capability added')
  })

  it('should display triple and atom IDs on success', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pinataApiJwt: undefined,
      hasWriteConfig: true,
    })

    vi.mocked(input)
      .mockResolvedValueOnce('security')
      .mockResolvedValueOnce('Security audits')
      .mockResolvedValueOnce('0')

    vi.mocked(select).mockResolvedValueOnce('security')

    await capabilityAddCommand('0xagent456')

    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('Triple ID')
    expect(allOutput).toContain('Predicate Atom')
    expect(allOutput).toContain('Capability Atom')
  })

  it('should pass zero deposit when default is used', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pinataApiJwt: undefined,
      hasWriteConfig: true,
    })

    vi.mocked(input)
      .mockResolvedValueOnce('code-gen')
      .mockResolvedValueOnce('')
      .mockResolvedValueOnce('0')

    vi.mocked(select).mockResolvedValueOnce('code-generation')

    await capabilityAddCommand('0xagent789')

    expect(createCapabilityTriple).toHaveBeenCalledWith(
      expect.any(Object),
      '0xagent789',
      'code-gen',
      0n,
    )
  })

  it('should handle SDK errors gracefully', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pinataApiJwt: undefined,
      hasWriteConfig: true,
    })

    vi.mocked(input)
      .mockResolvedValueOnce('fail-cap')
      .mockResolvedValueOnce('fails')
      .mockResolvedValueOnce('0')

    vi.mocked(select).mockResolvedValueOnce('analysis')

    vi.mocked(createCapabilityTriple).mockRejectedValueOnce(
      new Error('Triple creation reverted'),
    )

    await capabilityAddCommand('0xagentFail')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to add capability'),
    )
  })
})
