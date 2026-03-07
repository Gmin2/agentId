import { defineChain } from 'viem'

export const intuitionTestnet = defineChain({
  id: 13579,
  name: 'Intuition Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Test Trust',
    symbol: 'tTRUST',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.rpc.intuition.systems/http'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Intuition Testnet Explorer',
      url: 'https://testnet.explorer.intuition.systems',
    },
  },
})

export const MULTIVAULT_ADDRESS = '0x2Ece8D4dEdcB9918A398528f3fa4688b1d2CAB91' as const
export const GRAPHQL_URL = 'https://testnet.intuition.sh/v1/graphql'
