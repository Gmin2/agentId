import { createContext } from 'preact'
import { useState, useCallback, useContext, useEffect } from 'preact/hooks'
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  getAddress,
  type PublicClient,
  type WalletClient,
  type Address,
} from 'viem'
import { intuitionTestnet, MULTIVAULT_ADDRESS } from './chain.ts'

const STORAGE_KEY = 'agentid_wallet_connected'

interface WalletState {
  address: Address | null
  walletClient: WalletClient | null
  publicClient: PublicClient
  multiVaultAddress: Address
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const publicClient = createPublicClient({
  chain: intuitionTestnet,
  transport: http(),
})

const WalletContext = createContext<WalletState>({
  address: null,
  walletClient: null,
  publicClient,
  multiVaultAddress: MULTIVAULT_ADDRESS,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
})

function setupWalletClient(ethereum: any, addr: Address): WalletClient {
  return createWalletClient({
    account: addr,
    chain: intuitionTestnet,
    transport: custom(ethereum),
  })
}

export function WalletProvider({ children }: { children: preact.ComponentChildren }) {
  const [address, setAddress] = useState<Address | null>(null)
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const setConnected = useCallback((addr: Address, client: WalletClient) => {
    setAddress(addr)
    setWalletClient(client)
    localStorage.setItem(STORAGE_KEY, 'true')
  }, [])

  const connect = useCallback(async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) {
      alert('Please install MetaMask or another wallet extension')
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as Address[]

      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${intuitionTestnet.id.toString(16)}` }],
        })
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${intuitionTestnet.id.toString(16)}`,
              chainName: intuitionTestnet.name,
              nativeCurrency: intuitionTestnet.nativeCurrency,
              rpcUrls: [intuitionTestnet.rpcUrls.default.http[0]],
              blockExplorerUrls: [intuitionTestnet.blockExplorers.default.url],
            }],
          })
        }
      }

      const checksummed = getAddress(accounts[0])
      setConnected(checksummed, setupWalletClient(ethereum, checksummed))
    } catch (err) {
      console.error('Failed to connect wallet:', err)
    } finally {
      setIsConnecting(false)
    }
  }, [setConnected])

  const disconnect = useCallback(() => {
    setAddress(null)
    setWalletClient(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Auto-reconnect on mount if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem(STORAGE_KEY)
    if (!wasConnected) return

    const ethereum = (window as any).ethereum
    if (!ethereum) return

    // Use eth_accounts (no popup) to check if still authorized
    ethereum.request({ method: 'eth_accounts' }).then((accounts: Address[]) => {
      if (accounts.length > 0) {
        const checksummed = getAddress(accounts[0])
        setConnected(checksummed, setupWalletClient(ethereum, checksummed))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    }).catch(() => {
      localStorage.removeItem(STORAGE_KEY)
    })
  }, [setConnected])

  // Listen for account changes
  useEffect(() => {
    const ethereum = (window as any).ethereum
    if (!ethereum) return

    const handleAccountsChanged = (accounts: Address[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        const checksummed = getAddress(accounts[0])
        if (checksummed !== address) {
          setConnected(checksummed, setupWalletClient(ethereum, checksummed))
        }
      }
    }

    ethereum.on('accountsChanged', handleAccountsChanged)
    return () => ethereum.removeListener('accountsChanged', handleAccountsChanged)
  }, [address, disconnect, setConnected])

  return (
    <WalletContext.Provider value={{
      address,
      walletClient,
      publicClient,
      multiVaultAddress: MULTIVAULT_ADDRESS,
      isConnecting,
      connect,
      disconnect,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}
