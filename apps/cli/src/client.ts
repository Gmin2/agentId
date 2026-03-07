import { createPublicClient, createWalletClient, http, type Chain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { GraphQLClient } from 'graphql-request'
import {
  type AgentIdWriteConfig,
  type AgentIdReadConfig,
  INTUITION_NETWORKS,
} from '@agentid/sdk'

const intuitionTestnet: Chain = {
  id: 13579,
  name: 'Intuition Testnet',
  nativeCurrency: { name: 'Test Trust', symbol: 'tTRUST', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.rpc.intuition.systems/http'] },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://testnet.explorer.intuition.systems',
    },
  },
}

const intuitionMainnet: Chain = {
  id: 8453,
  name: 'Intuition Mainnet',
  nativeCurrency: { name: 'Trust', symbol: 'TRUST', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.rpc.intuition.systems/http'] },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.intuition.systems',
    },
  },
}

type NetworkName = 'testnet' | 'mainnet'

function getChain(network: NetworkName): Chain {
  return network === 'mainnet' ? intuitionMainnet : intuitionTestnet
}

/**
 * Create a read-only config (no wallet needed).
 * Used by: info, search
 */
export function createReadConfig(network: NetworkName = 'testnet'): AgentIdReadConfig {
  const net = INTUITION_NETWORKS[network]
  return {
    graphqlClient: new GraphQLClient(net.graphqlUrl),
  }
}

/**
 * Create a write config from environment variables.
 * Used by: register, capability-add, stake
 */
export function createWriteConfig(
  privateKey: string,
  pinataApiJwt: string,
  network: NetworkName = 'testnet',
): AgentIdWriteConfig {
  const net = INTUITION_NETWORKS[network]
  const chain = getChain(network)
  const account = privateKeyToAccount(privateKey as `0x${string}`)

  const publicClient = createPublicClient({
    chain,
    transport: http(net.rpcUrl),
  })

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(net.rpcUrl),
  })

  const graphqlClient = new GraphQLClient(net.graphqlUrl)

  return {
    multiVaultAddress: net.multiVaultAddress,
    walletClient,
    publicClient,
    graphqlClient,
    graphqlUrl: net.graphqlUrl,
    pinataApiJwt,
  }
}

/**
 * Load config from environment variables.
 * Returns the network name and whether required write vars are available.
 */
export function loadEnvConfig(): {
  network: NetworkName
  privateKey: string | undefined
  pinataApiJwt: string | undefined
  hasWriteConfig: boolean
} {
  const network = (process.env.NETWORK || 'testnet') as NetworkName
  const privateKey = process.env.PRIVATE_KEY
  const pinataApiJwt = process.env.PINATA_API_JWT

  return {
    network,
    privateKey,
    pinataApiJwt,
    hasWriteConfig: !!privateKey,
  }
}
