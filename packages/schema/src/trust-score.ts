import { z } from 'zod'

/** Trust tier classification. */
export const TrustTierEnum = z.enum(['low', 'medium', 'high', 'elite'])

/** Breakdown of individual trust score components. */
export const TrustComponentsSchema = z.object({
  stakingScore: z.number().min(0).max(100),
  diversityScore: z.number().min(0).max(100),
  sentimentScore: z.number().min(0).max(100),
  operatorCommitment: z.number().min(0).max(100),
  longevityScore: z.number().min(0).max(100),
  feedbackScore: z.number().min(0).max(100),
})

/** Computed trust score for an agent. */
export const TrustScoreSchema = z.object({
  /** Normalized score from 0-100 */
  normalized: z.number().min(0).max(100),
  /** Trust tier classification */
  tier: TrustTierEnum,
  /** Individual component scores */
  components: TrustComponentsSchema,
  /** Confidence in score accuracy (0-1) */
  confidence: z.number().min(0).max(1),
})

export type TrustTier = z.infer<typeof TrustTierEnum>
export type TrustComponents = z.infer<typeof TrustComponentsSchema>
export type TrustScore = z.infer<typeof TrustScoreSchema>

/** Inputs needed to calculate a trust score from on-chain vault data. */
export interface TrustScoreInput {
  totalStaked: bigint
  stakerCount: number
  sharePrice: bigint
  forStake: bigint
  againstStake: bigint
  operatorStake: bigint
  ageInDays: number
  feedbackCount: number
  averageFeedbackScore: number
}

/** Weight configuration for trust score calculation. */
export const TRUST_WEIGHTS = {
  staking: 0.25,
  diversity: 0.15,
  sentiment: 0.20,
  operatorCommitment: 0.15,
  longevity: 0.10,
  feedback: 0.15,
} as const

/** Score thresholds for tier classification. */
export const TIER_THRESHOLDS = {
  elite: 85,
  high: 65,
  medium: 40,
  low: 0,
} as const

/**
 * Calculate a trust score from on-chain vault data.
 */
export function calculateTrustScore(input: TrustScoreInput): TrustScore {
  const NETWORK_MEDIAN_STAKE = 1_000_000_000_000_000_000n // 1 ETH

  // 1. Staking Score
  const stakingScore = Math.min(
    100,
    Number((input.totalStaked * 100n) / (NETWORK_MEDIAN_STAKE * 10n)),
  )

  // 2. Diversity Score (logarithmic, rewards more unique stakers)
  const diversityScore = Math.min(
    100,
    Math.log10(input.stakerCount + 1) * 33,
  )

  // 3. Sentiment Score (FOR vs AGAINST ratio)
  const totalVotes = input.forStake + input.againstStake
  const sentimentScore =
    totalVotes > 0n
      ? Number((input.forStake * 100n) / totalVotes)
      : 50 // Neutral if no votes

  // 4. Operator Commitment Score
  const operatorCommitment =
    input.totalStaked > 0n
      ? Math.min(100, Number((input.operatorStake * 100n) / input.totalStaked))
      : 0

  // 5. Longevity Score
  const longevityScore = Math.min(
    100,
    Math.log10(input.ageInDays + 1) * 30,
  )

  // 6. Feedback Score
  const feedbackScore =
    input.feedbackCount > 0 ? input.averageFeedbackScore : 50

  // Weighted total
  const rawScore =
    stakingScore * TRUST_WEIGHTS.staking +
    diversityScore * TRUST_WEIGHTS.diversity +
    sentimentScore * TRUST_WEIGHTS.sentiment +
    operatorCommitment * TRUST_WEIGHTS.operatorCommitment +
    longevityScore * TRUST_WEIGHTS.longevity +
    feedbackScore * TRUST_WEIGHTS.feedback

  const normalized = Math.round(Math.min(100, rawScore))

  // Tier classification
  let tier: TrustTier
  if (normalized >= TIER_THRESHOLDS.elite) tier = 'elite'
  else if (normalized >= TIER_THRESHOLDS.high) tier = 'high'
  else if (normalized >= TIER_THRESHOLDS.medium) tier = 'medium'
  else tier = 'low'

  // Confidence based on data availability
  let confidence = 0
  if (input.totalStaked > 100_000_000_000_000n) confidence += 0.2
  if (input.totalStaked > 1_000_000_000_000_000_000n) confidence += 0.1
  if (input.stakerCount > 5) confidence += 0.2
  if (input.stakerCount > 20) confidence += 0.1
  if (input.ageInDays > 7) confidence += 0.1
  if (input.ageInDays > 30) confidence += 0.1
  if (input.feedbackCount > 10) confidence += 0.2
  confidence = Math.min(1, confidence)

  return {
    normalized,
    tier,
    components: {
      stakingScore,
      diversityScore,
      sentimentScore,
      operatorCommitment,
      longevityScore,
      feedbackScore,
    },
    confidence,
  }
}
