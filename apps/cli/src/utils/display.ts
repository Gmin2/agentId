import chalk from 'chalk'
import type { TrustScore } from '@agentid/sdk'

/** Truncate a hex string for display: 0x1234...5678 */
export function truncHex(hex: string, chars = 4): string {
  if (hex.length <= chars * 2 + 4) return hex
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`
}

/** Format ETH from wei bigint */
export function formatEth(wei: bigint | string): string {
  const value = typeof wei === 'string' ? BigInt(wei) : wei
  const eth = Number(value) / 1e18
  return eth.toFixed(eth < 0.001 ? 6 : 3)
}

/** Color-coded tier badge */
export function tierBadge(tier: string): string {
  switch (tier) {
    case 'elite':
      return chalk.bgMagenta.white.bold(` ELITE `)
    case 'high':
      return chalk.bgGreen.white.bold(` HIGH `)
    case 'medium':
      return chalk.bgYellow.black.bold(` MEDIUM `)
    case 'low':
      return chalk.bgRed.white.bold(` LOW `)
    default:
      return chalk.bgGray.white(` ${tier.toUpperCase()} `)
  }
}

/** Component score bar */
function scoreBar(score: number, width = 20): string {
  const filled = Math.round((score / 100) * width)
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
  const color =
    score >= 75 ? chalk.green : score >= 50 ? chalk.yellow : chalk.red
  return color(bar)
}

/** Display a full trust score breakdown */
export function displayTrustScore(score: TrustScore): string {
  const lines = [
    '',
    `${chalk.bold('🏆 Trust Score:')} ${score.normalized}/100 ${tierBadge(score.tier)}`,
    `   ├── Staking:    ${scoreBar(score.components.stakingScore)}  ${score.components.stakingScore}/100`,
    `   ├── Diversity:  ${scoreBar(score.components.diversityScore)}  ${score.components.diversityScore}/100`,
    `   ├── Sentiment:  ${scoreBar(score.components.sentimentScore)}  ${score.components.sentimentScore}/100`,
    `   ├── Operator:   ${scoreBar(score.components.operatorCommitment)}  ${score.components.operatorCommitment}/100`,
    `   ├── Longevity:  ${scoreBar(score.components.longevityScore)}  ${score.components.longevityScore}/100`,
    `   └── Feedback:   ${scoreBar(score.components.feedbackScore)}  ${score.components.feedbackScore}/100`,
    `   Confidence: ${score.confidence.toFixed(1)}`,
  ]
  return lines.join('\n')
}

/** Success message */
export function success(msg: string): string {
  return chalk.green('✅ ') + msg
}

/** Error message */
export function error(msg: string): string {
  return chalk.red('❌ ') + msg
}

/** Info label/value pair */
export function labelValue(label: string, value: string): string {
  return `   ${chalk.dim(label + ':')} ${value}`
}

/** Section header */
export function header(emoji: string, text: string): string {
  return `\n${emoji} ${chalk.bold(text)}`
}

/** Separator line */
export function separator(width = 30): string {
  return chalk.dim('─'.repeat(width))
}
