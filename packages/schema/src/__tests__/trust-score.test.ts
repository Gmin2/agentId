import { describe, it, expect } from 'vitest'
import { calculateTrustScore } from '../trust-score'
import type { TrustScoreInput } from '../trust-score'

const baseInput: TrustScoreInput = {
  totalStaked: 0n,
  stakerCount: 0,
  sharePrice: 1_000_000_000_000_000_000n,
  forStake: 0n,
  againstStake: 0n,
  operatorStake: 0n,
  ageInDays: 0,
  feedbackCount: 0,
  averageFeedbackScore: 0,
}

describe('calculateTrustScore', () => {
  it('should return low tier for zero-stake agent', () => {
    const result = calculateTrustScore(baseInput)
    expect(result.tier).toBe('low')
    expect(result.normalized).toBeLessThan(40)
    expect(result.confidence).toBe(0)
  })

  it('should return higher score with more stake', () => {
    const low = calculateTrustScore(baseInput)
    const high = calculateTrustScore({
      ...baseInput,
      totalStaked: 5_000_000_000_000_000_000n, // 5 ETH
      forStake: 5_000_000_000_000_000_000n,
      stakerCount: 20,
      operatorStake: 1_000_000_000_000_000_000n,
      ageInDays: 30,
      feedbackCount: 15,
      averageFeedbackScore: 85,
    })
    expect(high.normalized).toBeGreaterThan(low.normalized)
    expect(['medium', 'high', 'elite']).toContain(high.tier)
  })

  it('should penalize high counter-signal ratio', () => {
    const forOnly = calculateTrustScore({
      ...baseInput,
      totalStaked: 1_000_000_000_000_000_000n,
      forStake: 1_000_000_000_000_000_000n,
      againstStake: 0n,
      stakerCount: 10,
    })

    const splitVote = calculateTrustScore({
      ...baseInput,
      totalStaked: 1_000_000_000_000_000_000n,
      forStake: 500_000_000_000_000_000n,
      againstStake: 500_000_000_000_000_000n,
      stakerCount: 10,
    })

    expect(splitVote.normalized).toBeLessThan(forOnly.normalized)
  })

  it('should always return score between 0 and 100', () => {
    const result = calculateTrustScore({
      ...baseInput,
      totalStaked: 100_000_000_000_000_000_000n, // 100 ETH
      forStake: 100_000_000_000_000_000_000n,
      stakerCount: 1000,
      operatorStake: 50_000_000_000_000_000_000n,
      ageInDays: 365,
      feedbackCount: 100,
      averageFeedbackScore: 100,
    })
    expect(result.normalized).toBeGreaterThanOrEqual(0)
    expect(result.normalized).toBeLessThanOrEqual(100)
  })

  it('should classify elite tier correctly', () => {
    const result = calculateTrustScore({
      ...baseInput,
      totalStaked: 100_000_000_000_000_000_000n, // 100 ETH
      forStake: 98_000_000_000_000_000_000n,
      againstStake: 2_000_000_000_000_000_000n,
      stakerCount: 1000,
      operatorStake: 50_000_000_000_000_000_000n,
      ageInDays: 365,
      feedbackCount: 100,
      averageFeedbackScore: 99,
    })
    expect(result.tier).toBe('elite')
    expect(result.normalized).toBeGreaterThanOrEqual(85)
  })

  it('should increase confidence with more data', () => {
    const sparse = calculateTrustScore(baseInput)
    const rich = calculateTrustScore({
      ...baseInput,
      totalStaked: 2_000_000_000_000_000_000n,
      stakerCount: 25,
      ageInDays: 60,
      feedbackCount: 20,
      forStake: 2_000_000_000_000_000_000n,
    })
    expect(rich.confidence).toBeGreaterThan(sparse.confidence)
  })
})
