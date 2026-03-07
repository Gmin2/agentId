import { useState, useCallback } from 'preact/hooks'
import { parseEther, type Hex } from 'viem'
import { MultiVaultAbi } from '@agentids/sdk'
import { useWallet } from '../wallet.tsx'

type StakeStatus = 'idle' | 'signing' | 'confirming' | 'success' | 'error'

export function useStake() {
  const { walletClient, publicClient, multiVaultAddress } = useWallet()
  const [status, setStatus] = useState<StakeStatus>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stakeFor = useCallback(async (atomId: string, amountEth: string) => {
    if (!walletClient) throw new Error('Wallet not connected')
    setStatus('signing')
    setError(null)
    setTxHash(null)

    try {
      const amount = parseEther(amountEth)
      const receiver = walletClient.account!.address

      const { request } = await publicClient.simulateContract({
        account: walletClient.account!,
        address: multiVaultAddress,
        abi: MultiVaultAbi,
        functionName: 'deposit',
        args: [receiver, atomId as Hex, 1n, 0n],
        value: amount,
      })

      setStatus('confirming')
      const hash = await walletClient.writeContract(request)
      setTxHash(hash)

      await publicClient.waitForTransactionReceipt({ hash })
      setStatus('success')
      return hash
    } catch (err: any) {
      setError(err.shortMessage || err.message || 'Transaction failed')
      setStatus('error')
      throw err
    }
  }, [walletClient, publicClient, multiVaultAddress])

  const stakeAgainst = useCallback(async (tripleId: string, amountEth: string) => {
    if (!walletClient) throw new Error('Wallet not connected')
    setStatus('signing')
    setError(null)
    setTxHash(null)

    try {
      const amount = parseEther(amountEth)

      // Get counter vault ID
      const counterTermId = await publicClient.readContract({
        address: multiVaultAddress,
        abi: MultiVaultAbi,
        functionName: 'getCounterIdFromTriple',
        args: [tripleId as Hex],
      })

      const receiver = walletClient.account!.address
      const { request } = await publicClient.simulateContract({
        account: walletClient.account!,
        address: multiVaultAddress,
        abi: MultiVaultAbi,
        functionName: 'deposit',
        args: [receiver, counterTermId, 1n, 0n],
        value: amount,
      })

      setStatus('confirming')
      const hash = await walletClient.writeContract(request)
      setTxHash(hash)

      await publicClient.waitForTransactionReceipt({ hash })
      setStatus('success')
      return hash
    } catch (err: any) {
      setError(err.shortMessage || err.message || 'Transaction failed')
      setStatus('error')
      throw err
    }
  }, [walletClient, publicClient, multiVaultAddress])

  const reset = useCallback(() => {
    setStatus('idle')
    setTxHash(null)
    setError(null)
  }, [])

  return { stakeFor, stakeAgainst, status, txHash, error, reset }
}
