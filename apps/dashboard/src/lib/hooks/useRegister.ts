import { useState, useCallback } from 'preact/hooks'
import { toHex, parseEther, decodeEventLog, type Hex } from 'viem'
import { MultiVaultAbi } from '@agentids/sdk'
import type { AgentRegistration } from '@agentids/schema'
import { useWallet } from '../wallet.tsx'

type RegisterStep = 'idle' | 'uploading' | 'creating-atom' | 'adding-capabilities' | 'success' | 'error'

interface RegisterProgress {
  step: RegisterStep
  message: string
  ipfsUri?: string
  atomId?: string
  txHash?: string
  capabilitiesDone: number
  capabilitiesTotal: number
}

async function uploadToPinata(jwt: string, data: any): Promise<string> {
  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      pinataContent: data,
      pinataMetadata: { name: `agentid-${data.name}` },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Pinata upload failed: ${text}`)
  }

  const result = await res.json()
  return `ipfs://${result.IpfsHash}`
}

export function useRegister() {
  const { walletClient, publicClient, multiVaultAddress } = useWallet()
  const [progress, setProgress] = useState<RegisterProgress>({
    step: 'idle',
    message: '',
    capabilitiesDone: 0,
    capabilitiesTotal: 0,
  })

  const register = useCallback(async (
    registration: AgentRegistration,
    pinataJwt: string,
    depositAmountEth: string,
    capabilities: Array<{ name: string; description: string; category: string }>,
  ) => {
    if (!walletClient) throw new Error('Wallet not connected')

    try {
      // Step 1: Upload to IPFS
      setProgress({ step: 'uploading', message: 'Uploading to IPFS...', capabilitiesDone: 0, capabilitiesTotal: capabilities.length })
      const ipfsUri = await uploadToPinata(pinataJwt, registration)

      // Step 2: Create atom on-chain
      setProgress(p => ({ ...p, step: 'creating-atom', message: 'Creating agent atom on-chain...', ipfsUri }))

      const atomCost = await publicClient.readContract({
        address: multiVaultAddress,
        abi: MultiVaultAbi,
        functionName: 'getAtomCost',
      })

      const depositAmount = depositAmountEth ? parseEther(depositAmountEth) : 0n
      const totalValue = atomCost + depositAmount

      const { request: atomRequest } = await publicClient.simulateContract({
        account: walletClient.account!,
        address: multiVaultAddress,
        abi: MultiVaultAbi,
        functionName: 'createAtoms',
        args: [[toHex(ipfsUri)], [totalValue]],
        value: totalValue,
      })

      const atomTxHash = await walletClient.writeContract(atomRequest)
      const atomReceipt = await publicClient.waitForTransactionReceipt({ hash: atomTxHash })

      // Parse AtomCreated event
      const atomLog = atomReceipt.logs.find(log => {
        try {
          const decoded = decodeEventLog({ abi: MultiVaultAbi, data: log.data, topics: log.topics })
          return decoded.eventName === 'AtomCreated'
        } catch { return false }
      })

      if (!atomLog) throw new Error('AtomCreated event not found')

      const decoded = decodeEventLog({ abi: MultiVaultAbi, data: atomLog.data, topics: atomLog.topics })
      const atomId = (decoded.args as { termId: Hex }).termId

      setProgress(p => ({ ...p, atomId, txHash: atomTxHash }))

      // Step 3: Add capabilities as triples
      if (capabilities.length > 0) {
        setProgress(p => ({ ...p, step: 'adding-capabilities', message: `Adding capabilities (0/${capabilities.length})...` }))

        const tripleCost = await publicClient.readContract({
          address: multiVaultAddress,
          abi: MultiVaultAbi,
          functionName: 'getTripleCost',
        })

        for (let i = 0; i < capabilities.length; i++) {
          setProgress(p => ({
            ...p,
            message: `Adding capability: ${capabilities[i].name} (${i + 1}/${capabilities.length})...`,
            capabilitiesDone: i,
          }))

          // For each capability, we need predicate and object atoms
          // The SDK handles this, but for the dashboard we create triples directly
          // We need: has-capability predicate atom ID and capability atom ID
          // For simplicity, create the triple with the capability name as the object

          const predicateUri = toHex('has-capability')
          const objectUri = toHex(capabilities[i].name)

          // Create predicate + object atoms first (they may already exist)
          const atomsCost = atomCost * 2n
          const { request: atomsReq } = await publicClient.simulateContract({
            account: walletClient.account!,
            address: multiVaultAddress,
            abi: MultiVaultAbi,
            functionName: 'createAtoms',
            args: [[predicateUri, objectUri], [atomCost, atomCost]],
            value: atomsCost,
          })

          const atomsTxHash = await walletClient.writeContract(atomsReq)
          const atomsReceipt = await publicClient.waitForTransactionReceipt({ hash: atomsTxHash })

          // Parse atom IDs from events
          const atomEvents = atomsReceipt.logs
            .map(log => {
              try {
                return decodeEventLog({ abi: MultiVaultAbi, data: log.data, topics: log.topics })
              } catch { return null }
            })
            .filter((e): e is NonNullable<typeof e> => e?.eventName === 'AtomCreated')

          if (atomEvents.length < 2) throw new Error('Failed to create predicate/object atoms')

          const predicateId = (atomEvents[0].args as { termId: Hex }).termId
          const objectId = (atomEvents[1].args as { termId: Hex }).termId

          // Create the triple
          const { request: tripleReq } = await publicClient.simulateContract({
            account: walletClient.account!,
            address: multiVaultAddress,
            abi: MultiVaultAbi,
            functionName: 'createTriples',
            args: [[atomId], [predicateId], [objectId], [tripleCost]],
            value: tripleCost,
          })

          await walletClient.writeContract(tripleReq)

          setProgress(p => ({ ...p, capabilitiesDone: i + 1 }))
        }
      }

      setProgress({
        step: 'success',
        message: 'Agent registered successfully!',
        ipfsUri,
        atomId,
        txHash: atomTxHash,
        capabilitiesDone: capabilities.length,
        capabilitiesTotal: capabilities.length,
      })

      return { atomId, ipfsUri, txHash: atomTxHash }
    } catch (err: any) {
      setProgress(p => ({
        ...p,
        step: 'error',
        message: err.shortMessage || err.message || 'Registration failed',
      }))
      throw err
    }
  }, [walletClient, publicClient, multiVaultAddress])

  const reset = useCallback(() => {
    setProgress({ step: 'idle', message: '', capabilitiesDone: 0, capabilitiesTotal: 0 })
  }, [])

  return { register, progress, reset }
}
