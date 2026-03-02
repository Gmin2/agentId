import { GraphQLClient } from 'graphql-request'

export const INTUITION_GRAPHQL_ENDPOINTS = {
  testnet: 'https://testnet.intuition.sh/v1/graphql',
  mainnet: 'https://mainnet.intuition.sh/v1/graphql',
} as const

export type Network = keyof typeof INTUITION_GRAPHQL_ENDPOINTS

export function createGraphQLClient(
  network: Network = 'testnet',
): GraphQLClient {
  return new GraphQLClient(INTUITION_GRAPHQL_ENDPOINTS[network])
}
