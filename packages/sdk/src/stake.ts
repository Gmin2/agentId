import type { Hex } from 'viem'
import { MultiVaultAbi } from './abi'
import type { AgentIdWriteConfig } from './config'

export interface StakeResult {
  txHash: Hex
  shares: bigint
}

/**
 * Stake $TRUST on an agent's FOR vault (endorsing the agent).
 *
 * @param config - SDK write configuration
 * @param agentAtomId - The agent's atom term_id
 * @param amount - Amount of $TRUST to stake (in wei)
 */
export async function stakeOnAgent(
  config: AgentIdWriteConfig,
  agentAtomId: Hex,
  amount: bigint,
): Promise<StakeResult> {
  const receiver = config.walletClient.account!.address

  const { request } = await config.publicClient.simulateContract({
    account: config.walletClient.account!,
    address: config.multiVaultAddress,
    abi: MultiVaultAbi,
    functionName: 'deposit',
    args: [
      receiver,       // receiver of shares
      agentAtomId,    // vault = agent's atom
      1n,             // curveId = 1 (default linear curve)
      0n,             // minShares = 0 (no slippage protection for simplicity)
    ],
    value: amount,
  })

  const txHash = await config.walletClient.writeContract(request)
  const receipt = await config.publicClient.waitForTransactionReceipt({
    hash: txHash,
  })

  // Parse Deposited event to get shares received
  const shares = parseDepositedShares(receipt.logs)

  return { txHash, shares }
}

/**
 * Counter-signal an agent by staking on its AGAINST vault.
 * This is used when an agent is behaving poorly or is suspicious.
 *
 * For triples, the counter vault is a separate term.
 * For atoms, we deposit to the atom vault but conceptually this
 * represents support. True counter-signaling happens on triples
 * (e.g., counter-staking on a capability triple).
 *
 * @param config - SDK write configuration
 * @param tripleId - The triple's term_id to counter-signal
 * @param amount - Amount of $TRUST to stake against (in wei)
 */
export async function counterSignalTriple(
  config: AgentIdWriteConfig,
  tripleId: Hex,
  amount: bigint,
): Promise<StakeResult> {
  // Get the counter vault ID for this triple
  const counterTermId = await config.publicClient.readContract({
    address: config.multiVaultAddress,
    abi: MultiVaultAbi,
    functionName: 'getCounterIdFromTriple',
    args: [tripleId],
  })

  const receiver = config.walletClient.account!.address

  const { request } = await config.publicClient.simulateContract({
    account: config.walletClient.account!,
    address: config.multiVaultAddress,
    abi: MultiVaultAbi,
    functionName: 'deposit',
    args: [
      receiver,
      counterTermId,
      1n,
      0n,
    ],
    value: amount,
  })

  const txHash = await config.walletClient.writeContract(request)
  const receipt = await config.publicClient.waitForTransactionReceipt({
    hash: txHash,
  })

  const shares = parseDepositedShares(receipt.logs)

  return { txHash, shares }
}

/** Extract shares from Deposited event logs. */
function parseDepositedShares(logs: readonly { data: Hex; topics: readonly Hex[] }[]): bigint {
  // The Deposited event has shares as the last indexed data field
  // For simplicity, we return 0n if we can't parse
  // In production, use decodeEventLog
  for (const log of logs) {
    if (log.topics.length >= 3 && log.data.length >= 130) {
      // shares is the third uint256 in data (after curveId and assets)
      const sharesHex = `0x${log.data.slice(130, 194)}` as Hex
      try {
        return BigInt(sharesHex)
      } catch {
        continue
      }
    }
  }
  return 0n
}
