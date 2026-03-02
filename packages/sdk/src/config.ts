import type { Address, PublicClient, WalletClient } from 'viem'
import type { GraphQLClient } from 'graphql-request'

/** Configuration required for all AgentID SDK write operations. */
export interface AgentIdWriteConfig {
  /** Intuition MultiVault contract address */
  multiVaultAddress: Address
  /** Viem wallet client (signs transactions) */
  walletClient: WalletClient
  /** Viem public client (reads chain state) */
  publicClient: PublicClient
  /** GraphQL client for querying Intuition */
  graphqlClient: GraphQLClient
  /** Pinata JWT for IPFS uploads */
  pinataApiJwt: string
}

/** Configuration for read-only operations. */
export interface AgentIdReadConfig {
  graphqlClient: GraphQLClient
}

/** Intuition network constants. */
export const INTUITION_NETWORKS = {
  testnet: {
    chainId: 13579,
    rpcUrl: 'https://testnet.rpc.intuition.systems',
    multiVaultAddress: '0x6E35cF57A41fA15eA0EaE9C33e751b01A784Fe7e' as Address,
    graphqlUrl: 'https://testnet.intuition.sh/v1/graphql',
  },
  mainnet: {
    chainId: 8453,
    rpcUrl: 'https://mainnet.rpc.intuition.systems',
    multiVaultAddress: '0x430BbF52503Bd4801E51182f4cB9f8F534225DE5' as Address,
    graphqlUrl: 'https://mainnet.intuition.sh/v1/graphql',
  },
} as const
