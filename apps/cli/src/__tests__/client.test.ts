import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock viem before importing client
vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    createPublicClient: vi.fn().mockReturnValue({ readContract: vi.fn() }),
    createWalletClient: vi.fn().mockReturnValue({
      account: { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7' },
      writeContract: vi.fn(),
    }),
    http: vi.fn().mockReturnValue('http-transport'),
  }
})

vi.mock('viem/accounts', () => ({
  privateKeyToAccount: vi.fn().mockReturnValue({
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
  }),
}))

vi.mock('graphql-request', async (importOriginal) => {
  const actual = await importOriginal<typeof import('graphql-request')>()
  return {
    ...actual,
    GraphQLClient: vi.fn().mockImplementation(() => ({
      request: vi.fn(),
    })),
  }
})

import { createReadConfig, createWriteConfig, loadEnvConfig } from '../client.js'
import { GraphQLClient } from 'graphql-request'
import { privateKeyToAccount } from 'viem/accounts'

describe('client', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  describe('loadEnvConfig', () => {
    it('should return testnet as default network', () => {
      vi.stubEnv('NETWORK', '')
      vi.stubEnv('PRIVATE_KEY', '')
      vi.stubEnv('PINATA_API_JWT', '')

      const config = loadEnvConfig()
      expect(config.network).toBe('testnet')
    })

    it('should read NETWORK from env', () => {
      vi.stubEnv('NETWORK', 'mainnet')

      const config = loadEnvConfig()
      expect(config.network).toBe('mainnet')
    })

    it('should read PRIVATE_KEY from env', () => {
      vi.stubEnv('PRIVATE_KEY', '0xabcdef')

      const config = loadEnvConfig()
      expect(config.privateKey).toBe('0xabcdef')
      expect(config.hasWriteConfig).toBe(true)
    })

    it('should report hasWriteConfig=false when no PRIVATE_KEY', () => {
      vi.stubEnv('PRIVATE_KEY', '')

      const config = loadEnvConfig()
      expect(config.hasWriteConfig).toBe(false)
    })

    it('should read PINATA_API_JWT from env', () => {
      vi.stubEnv('PINATA_API_JWT', 'test-jwt')

      const config = loadEnvConfig()
      expect(config.pinataApiJwt).toBe('test-jwt')
    })
  })

  describe('createReadConfig', () => {
    it('should create a read config with graphqlClient', () => {
      const config = createReadConfig('testnet')
      expect(config.graphqlClient).toBeDefined()
    })

    it('should default to testnet', () => {
      createReadConfig()
      expect(GraphQLClient).toHaveBeenCalledWith(
        expect.stringContaining('testnet'),
      )
    })

    it('should use mainnet URL when specified', () => {
      createReadConfig('mainnet')
      expect(GraphQLClient).toHaveBeenCalledWith(
        expect.stringContaining('mainnet'),
      )
    })
  })

  describe('createWriteConfig', () => {
    it('should return a config with all required fields', () => {
      const config = createWriteConfig(
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        'test-jwt',
        'testnet',
      )

      expect(config.multiVaultAddress).toBeDefined()
      expect(config.walletClient).toBeDefined()
      expect(config.publicClient).toBeDefined()
      expect(config.graphqlClient).toBeDefined()
      expect(config.pinataApiJwt).toBe('test-jwt')
    })

    it('should use the testnet MultiVault address for testnet', () => {
      const config = createWriteConfig(
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        'jwt',
        'testnet',
      )

      expect(config.multiVaultAddress).toBe(
        '0x6E35cF57A41fA15eA0EaE9C33e751b01A784Fe7e',
      )
    })

    it('should call privateKeyToAccount with the provided key', () => {
      const key =
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'

      createWriteConfig(key, 'jwt', 'testnet')

      expect(privateKeyToAccount).toHaveBeenCalledWith(key)
    })
  })
})
