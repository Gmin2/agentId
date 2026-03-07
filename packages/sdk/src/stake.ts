import { decodeEventLog, type Hex } from 'viem'
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
  for (const log of logs) {
    try {
      const decoded = decodeEventLog({
        abi: MultiVaultAbi,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      })
      if (decoded.eventName === 'Deposited') {
        return (decoded.args as { shares: bigint }).shares
      }
    } catch {
      continue
    }
  }
  return 0n
}
