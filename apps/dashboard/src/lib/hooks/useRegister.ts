import { useState, useCallback } from 'preact/hooks'
import { toHex, parseEther, decodeEventLog, type Hex } from 'viem'
import { MultiVaultAbi, GET_ATOM_BY_LABEL, pinThing, type GetAtomByLabelResponse } from '@agentids/sdk'
import type { AgentRegistration } from '@agentids/schema'
import { useWallet } from '../wallet.tsx'
import { graphqlClient } from '../graphql.ts'
import { GRAPHQL_URL } from '../chain.ts'

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

async function getOrCreateAtom(
  publicClient: any,
  walletClient: any,
  multiVaultAddress: any,
  label: string,
  atomCost: bigint,
): Promise<Hex> {
  // Check if atom already exists via GraphQL
  const response = await graphqlClient.request<GetAtomByLabelResponse>(
    GET_ATOM_BY_LABEL,
    { label },
  )

  if (response.atoms.length > 0) {
    return response.atoms[0].term_id as Hex
  }

  // Atom doesn't exist, create it
  const { request } = await publicClient.simulateContract({
    account: walletClient.account!,
    address: multiVaultAddress,
    abi: MultiVaultAbi,
    functionName: 'createAtoms',
    args: [[toHex(label)], [atomCost]],
    value: atomCost,
  })

  const txHash = await walletClient.writeContract(request)
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

  const atomLog = receipt.logs.find((log: any) => {
    try {
      const decoded = decodeEventLog({ abi: MultiVaultAbi, data: log.data, topics: log.topics })
      return decoded.eventName === 'AtomCreated'
    } catch { return false }
  })

  if (!atomLog) throw new Error(`Failed to create atom for "${label}"`)

  const decoded = decodeEventLog({ abi: MultiVaultAbi, data: atomLog.data, topics: atomLog.topics })
  return (decoded.args as { termId: Hex }).termId
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
    _pinataJwt: string,
    depositAmountEth: string,
    capabilities: Array<{ name: string; description: string; category: string }>,
  ) => {
    if (!walletClient) throw new Error('Wallet not connected')

    try {
      // Step 1: Pin via Intuition's pinThing (ensures indexer labels atom correctly)
      setProgress({ step: 'uploading', message: 'Pinning to IPFS via Intuition...', capabilitiesDone: 0, capabilitiesTotal: capabilities.length })
      const ipfsUri = await pinThing(GRAPHQL_URL, {
        name: registration.name,
        description: registration.description,
        image: registration.image,
      })

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

          // Look up or create predicate and object atoms
          const predicateId = await getOrCreateAtom(publicClient, walletClient, multiVaultAddress, 'has-capability', atomCost)
          const objectId = await getOrCreateAtom(publicClient, walletClient, multiVaultAddress, capabilities[i].name, atomCost)

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
