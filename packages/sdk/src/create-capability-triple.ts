import { toHex, decodeEventLog, type Hex } from 'viem'
import { PREDICATES } from '@agentid/schema'
import { GET_ATOM_BY_LABEL, type GetAtomByLabelResponse } from '@agentid/graphql'
import { MultiVaultAbi } from './abi'
import type { AgentIdWriteConfig } from './config'

export interface CreateCapabilityTripleResult {
  /** Triple term_id */
  tripleId: Hex
  /** Predicate atom ID used */
  predicateAtomId: Hex
  /** Capability atom ID (object) */
  capabilityAtomId: Hex
  /** Transaction hash */
  txHash: Hex
}

/**
 * Find an existing atom by label, or create one from string.
 * Returns the atom's term_id.
 */
async function getOrCreateAtom(
  config: AgentIdWriteConfig,
  label: string,
): Promise<Hex> {
  // Check if atom already exists
  const response = await config.graphqlClient.request<GetAtomByLabelResponse>(
    GET_ATOM_BY_LABEL,
    { label },
  )

  if (response.atoms.length > 0) {
    return response.atoms[0].term_id as Hex
  }

  // Create new atom from string
  const atomCost = await config.publicClient.readContract({
    address: config.multiVaultAddress,
    abi: MultiVaultAbi,
    functionName: 'getAtomCost',
  })

  const { request } = await config.publicClient.simulateContract({
    account: config.walletClient.account!,
    address: config.multiVaultAddress,
    abi: MultiVaultAbi,
    functionName: 'createAtoms',
    args: [[toHex(label)], [atomCost]],
    value: atomCost,
  })

  const txHash = await config.walletClient.writeContract(request)
  const receipt = await config.publicClient.waitForTransactionReceipt({
    hash: txHash,
  })

  const atomLog = receipt.logs.find((log) => {
    try {
      const decoded = decodeEventLog({
        abi: MultiVaultAbi,
        data: log.data,
        topics: log.topics,
      })
      return decoded.eventName === 'AtomCreated'
    } catch {
      return false
    }
  })

  if (!atomLog) {
    throw new Error(`Failed to create atom for "${label}"`)
  }

  const decoded = decodeEventLog({
    abi: MultiVaultAbi,
    data: atomLog.data,
    topics: atomLog.topics,
  })

  return (decoded.args as { termId: Hex }).termId
}

/**
 * Create a capability triple: (Agent) --[has-capability]--> (Capability)
 *
 * Automatically creates the predicate and capability atoms if they don't exist.
 *
 * @param config - SDK write configuration
 * @param agentAtomId - The agent's atom term_id
 * @param capabilityName - Human-readable capability name (e.g., "data-analysis")
 * @param depositAmount - Optional deposit on the triple's vault
 */
export async function createCapabilityTriple(
  config: AgentIdWriteConfig,
  agentAtomId: Hex,
  capabilityName: string,
  depositAmount: bigint = 0n,
): Promise<CreateCapabilityTripleResult> {
  // 1. Get or create predicate atom ("has-capability")
  const predicateAtomId = await getOrCreateAtom(
    config,
    PREDICATES.HAS_CAPABILITY,
  )

  // 2. Get or create capability atom
  const capabilityAtomId = await getOrCreateAtom(config, capabilityName)

  // 3. Get triple base cost
  const tripleCost = await config.publicClient.readContract({
    address: config.multiVaultAddress,
    abi: MultiVaultAbi,
    functionName: 'getTripleCost',
  })

  const totalValue = tripleCost + depositAmount

  // 4. Create triple on-chain
  const { request } = await config.publicClient.simulateContract({
    account: config.walletClient.account!,
    address: config.multiVaultAddress,
    abi: MultiVaultAbi,
    functionName: 'createTriples',
    args: [
      [agentAtomId],        // subjectIds
      [predicateAtomId],    // predicateIds
      [capabilityAtomId],   // objectIds
      [totalValue],         // assets
    ],
    value: totalValue,
  })

  const txHash = await config.walletClient.writeContract(request)
  const receipt = await config.publicClient.waitForTransactionReceipt({
    hash: txHash,
  })

  const tripleLog = receipt.logs.find((log) => {
    try {
      const decoded = decodeEventLog({
        abi: MultiVaultAbi,
        data: log.data,
        topics: log.topics,
      })
      return decoded.eventName === 'TripleCreated'
    } catch {
      return false
    }
  })

  if (!tripleLog) {
    throw new Error('TripleCreated event not found in transaction receipt')
  }

  const decoded = decodeEventLog({
    abi: MultiVaultAbi,
    data: tripleLog.data,
    topics: tripleLog.topics,
  })

  const tripleId = (decoded.args as { tripleId: Hex }).tripleId

  return { tripleId, predicateAtomId, capabilityAtomId, txHash }
}
