import { describe, it, expect } from 'vitest'
import { INTUITION_NETWORKS } from '../config'

describe('INTUITION_NETWORKS', () => {
  it('should have testnet configuration', () => {
    expect(INTUITION_NETWORKS.testnet).toBeDefined()
    expect(INTUITION_NETWORKS.testnet.chainId).toBe(13579)
    expect(INTUITION_NETWORKS.testnet.multiVaultAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
    expect(INTUITION_NETWORKS.testnet.rpcUrl).toContain('testnet')
    expect(INTUITION_NETWORKS.testnet.graphqlUrl).toContain('testnet')
  })

  it('should have mainnet configuration', () => {
    expect(INTUITION_NETWORKS.mainnet).toBeDefined()
    expect(INTUITION_NETWORKS.mainnet.chainId).toBe(8453)
    expect(INTUITION_NETWORKS.mainnet.multiVaultAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
    expect(INTUITION_NETWORKS.mainnet.rpcUrl).toContain('mainnet')
    expect(INTUITION_NETWORKS.mainnet.graphqlUrl).toContain('mainnet')
  })

  it('testnet and mainnet should have different addresses', () => {
    expect(INTUITION_NETWORKS.testnet.multiVaultAddress).not.toBe(
      INTUITION_NETWORKS.mainnet.multiVaultAddress,
    )
  })
})
