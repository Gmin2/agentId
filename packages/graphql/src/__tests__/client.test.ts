import { describe, it, expect } from 'vitest'
import { createGraphQLClient, INTUITION_GRAPHQL_ENDPOINTS } from '../client'
import { GraphQLClient } from 'graphql-request'

describe('createGraphQLClient', () => {
  it('should create a GraphQLClient instance for testnet by default', () => {
    const client = createGraphQLClient()
    expect(client).toBeInstanceOf(GraphQLClient)
  })

  it('should create a client for testnet explicitly', () => {
    const client = createGraphQLClient('testnet')
    expect(client).toBeInstanceOf(GraphQLClient)
  })

  it('should create a client for mainnet', () => {
    const client = createGraphQLClient('mainnet')
    expect(client).toBeInstanceOf(GraphQLClient)
  })
})

describe('INTUITION_GRAPHQL_ENDPOINTS', () => {
  it('should have testnet and mainnet endpoints', () => {
    expect(INTUITION_GRAPHQL_ENDPOINTS).toHaveProperty('testnet')
    expect(INTUITION_GRAPHQL_ENDPOINTS).toHaveProperty('mainnet')
  })

  it('should have valid URL format', () => {
    for (const url of Object.values(INTUITION_GRAPHQL_ENDPOINTS)) {
      expect(url).toMatch(/^https:\/\/.*\/v1\/graphql$/)
    }
  })

  it('testnet should point to testnet.intuition.sh', () => {
    expect(INTUITION_GRAPHQL_ENDPOINTS.testnet).toBe(
      'https://testnet.intuition.sh/v1/graphql',
    )
  })

  it('mainnet should point to mainnet.intuition.sh', () => {
    expect(INTUITION_GRAPHQL_ENDPOINTS.mainnet).toBe(
      'https://mainnet.intuition.sh/v1/graphql',
    )
  })
})
