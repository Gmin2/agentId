import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
  confirm: vi.fn(),
}))

vi.mock('@agentid/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@agentid/sdk')>()
  return {
    ...actual,
    stakeOnAgent: vi.fn().mockResolvedValue({
      txHash: '0xffee000000000000000000000000000000000000000000000000000000000001',
      shares: 95000000000000000n,
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

import { stakeCommand } from '../commands/stake.js'
import { input, confirm } from '@inquirer/prompts'
import { stakeOnAgent } from '@agentid/sdk'
import { loadEnvConfig } from '../client.js'

describe('stakeCommand', () => {
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

    await stakeCommand('0x1234')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('PRIVATE_KEY'),
    )
    expect(stakeOnAgent).not.toHaveBeenCalled()
  })

  it('should error on invalid atom ID (no 0x prefix)', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0xkey',
      pinataApiJwt: undefined,
      hasWriteConfig: true,
    })

    await stakeCommand('invalidId')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid atom ID'),
    )
    expect(stakeOnAgent).not.toHaveBeenCalled()
  })

  it('should stake on confirmation and display success', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pinataApiJwt: undefined,
      hasWriteConfig: true,
    })

    vi.mocked(input).mockResolvedValueOnce('0.1')
    vi.mocked(confirm).mockResolvedValueOnce(true)

    await stakeCommand('0xagentId123')

    expect(stakeOnAgent).toHaveBeenCalledOnce()
    expect(stakeOnAgent).toHaveBeenCalledWith(
      expect.any(Object),
      '0xagentId123',
      expect.any(BigInt),
    )

    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('Staked successfully')
  })

  it('should cancel when user denies confirmation', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pinataApiJwt: undefined,
      hasWriteConfig: true,
    })

    vi.mocked(input).mockResolvedValueOnce('0.5')
    vi.mocked(confirm).mockResolvedValueOnce(false)

    await stakeCommand('0xagentId123')

    expect(stakeOnAgent).not.toHaveBeenCalled()
    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('cancelled')
  })

  it('should handle insufficient balance error with faucet info', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pinataApiJwt: undefined,
      hasWriteConfig: true,
    })

    vi.mocked(input).mockResolvedValueOnce('100')
    vi.mocked(confirm).mockResolvedValueOnce(true)

    vi.mocked(stakeOnAgent).mockRejectedValueOnce(
      new Error('insufficient balance'),
    )

    await stakeCommand('0xagentId123')

    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('Insufficient balance')
    expect(allOutput).toContain('faucet.intuition.systems')
  })

  it('should handle generic staking errors', async () => {
    vi.mocked(loadEnvConfig).mockReturnValue({
      network: 'testnet',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pinataApiJwt: undefined,
      hasWriteConfig: true,
    })

    vi.mocked(input).mockResolvedValueOnce('0.01')
    vi.mocked(confirm).mockResolvedValueOnce(true)

    vi.mocked(stakeOnAgent).mockRejectedValueOnce(
      new Error('Transaction reverted'),
    )

    await stakeCommand('0xagentId123')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Staking failed'),
    )
  })
})
