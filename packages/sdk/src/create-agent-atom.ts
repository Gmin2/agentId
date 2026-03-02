import { toHex, decodeEventLog, type Hex } from 'viem'
import { AgentRegistrationSchema, type AgentRegistration } from '@agentid/schema'
import { MultiVaultAbi } from './abi'
import type { AgentIdWriteConfig } from './config'
import { uploadJsonToPinata } from './ipfs'

export interface CreateAgentAtomResult {
  /** Intuition Atom term_id */
  atomId: Hex
  /** IPFS URI of the registration file */
  ipfsUri: string
  /** Transaction hash */
  txHash: Hex
}

/**
 * Register a new AI agent on Intuition Protocol.
 *
 * 1. Validates the registration against the ERC-8004 schema
 * 2. Uploads registration JSON to IPFS via Pinata
 * 3. Creates an Atom on the MultiVault contract
 *
 * @param config - SDK write configuration
 * @param registration - ERC-8004 compliant agent registration
 * @param depositAmount - Optional additional deposit on top of atom base cost
 */
export async function createAgentAtom(
  config: AgentIdWriteConfig,
  registration: AgentRegistration,
  depositAmount: bigint = 0n,
): Promise<CreateAgentAtomResult> {
  // 1. Validate
  AgentRegistrationSchema.parse(registration)

  // 2. Upload to IPFS
  const pinResponse = await uploadJsonToPinata(config.pinataApiJwt, registration)
  const ipfsUri = `ipfs://${pinResponse.IpfsHash}`

  // 3. Get atom base cost
  const atomCost = await config.publicClient.readContract({
    address: config.multiVaultAddress,
    abi: MultiVaultAbi,
    functionName: 'getAtomCost',
  })

  const totalValue = atomCost + depositAmount

  // 4. Create atom on-chain
  const { request } = await config.publicClient.simulateContract({
    account: config.walletClient.account!,
    address: config.multiVaultAddress,
    abi: MultiVaultAbi,
    functionName: 'createAtoms',
    args: [[toHex(ipfsUri)], [totalValue]],
    value: totalValue,
  })

  const txHash = await config.walletClient.writeContract(request)

  // 5. Wait for receipt and parse AtomCreated event
  const receipt = await config.publicClient.waitForTransactionReceipt({
    hash: txHash,
  })

  const atomCreatedLog = receipt.logs.find((log) => {
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

  if (!atomCreatedLog) {
    throw new Error('AtomCreated event not found in transaction receipt')
  }

  const decoded = decodeEventLog({
    abi: MultiVaultAbi,
    data: atomCreatedLog.data,
    topics: atomCreatedLog.topics,
  })

  const atomId = (decoded.args as { termId: Hex }).termId

  return { atomId, ipfsUri, txHash }
}
