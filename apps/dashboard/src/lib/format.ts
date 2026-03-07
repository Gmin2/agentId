import { formatEther } from 'viem'

/** Format wei to human-readable ETH/tTRUST string */
export function formatTrust(wei: string | bigint): string {
  const val = typeof wei === 'string' ? BigInt(wei) : wei
  const num = Number(formatEther(val))
  if (num === 0) return '0'
  if (num < 0.001) return '<0.001'
  if (num < 1) return num.toFixed(3)
  if (num < 1000) return num.toFixed(2)
  if (num < 1_000_000) return `${(num / 1000).toFixed(1)}k`
  return `${(num / 1_000_000).toFixed(1)}M`
}

/** Truncate hex address: 0x1234...5678 */
export function truncAddress(addr: string, chars = 4): string {
  if (addr.length <= chars * 2 + 4) return addr
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`
}

/** Tier label from trust score normalized value */
export function getTierFromScore(score: number): string {
  if (score >= 85) return 'ELITE'
  if (score >= 65) return 'HIGH'
  if (score >= 40) return 'MEDIUM'
  return 'LOW'
}
