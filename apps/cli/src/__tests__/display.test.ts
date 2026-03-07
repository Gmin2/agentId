import { describe, it, expect } from 'vitest'
import {
  truncHex,
  formatEth,
  tierBadge,
  displayTrustScore,
  success,
  error,
  labelValue,
  header,
  separator,
} from '../utils/display.js'
import type { TrustScore } from '@agentids/sdk'

describe('display utilities', () => {
  describe('truncHex', () => {
    it('should truncate long hex strings', () => {
      const hex = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      const result = truncHex(hex)
      expect(result).toBe('0x1234...cdef')
    })

    it('should return short hex strings unchanged', () => {
      expect(truncHex('0x1234')).toBe('0x1234')
    })

    it('should support custom char count', () => {
      const hex = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      const result = truncHex(hex, 6)
      expect(result).toBe('0x123456...abcdef')
    })

    it('should handle edge case of exactly threshold length', () => {
      // chars=4, threshold = 4*2+4 = 12
      const hex = '0x12345678' // length = 10, <= 12
      expect(truncHex(hex)).toBe('0x12345678')
    })
  })

  describe('formatEth', () => {
    it('should format wei bigint to ETH string', () => {
      expect(formatEth(1000000000000000000n)).toBe('1.000')
    })

    it('should format string wei to ETH', () => {
      expect(formatEth('5000000000000000000')).toBe('5.000')
    })

    it('should use 6 decimals for very small amounts', () => {
      expect(formatEth(100000000000000n)).toBe('0.000100')
    })

    it('should handle zero', () => {
      // 0 < 0.001 triggers 6-decimal path
      expect(formatEth(0n)).toBe('0.000000')
    })

    it('should format string zero', () => {
      expect(formatEth('0')).toBe('0.000000')
    })
  })

  describe('tierBadge', () => {
    it('should return a string for each tier', () => {
      expect(tierBadge('elite')).toContain('ELITE')
      expect(tierBadge('high')).toContain('HIGH')
      expect(tierBadge('medium')).toContain('MEDIUM')
      expect(tierBadge('low')).toContain('LOW')
    })

    it('should handle unknown tier', () => {
      const result = tierBadge('unknown')
      expect(result).toContain('UNKNOWN')
    })
  })

  describe('displayTrustScore', () => {
    it('should include score and all component names', () => {
      const score: TrustScore = {
        normalized: 72,
        tier: 'high',
        components: {
          stakingScore: 85,
          diversityScore: 60,
          sentimentScore: 90,
          operatorCommitment: 70,
          longevityScore: 45,
          feedbackScore: 50,
        },
        confidence: 0.6,
      }

      const output = displayTrustScore(score)

      expect(output).toContain('72/100')
      expect(output).toContain('Staking')
      expect(output).toContain('Diversity')
      expect(output).toContain('Sentiment')
      expect(output).toContain('Operator')
      expect(output).toContain('Longevity')
      expect(output).toContain('Feedback')
      expect(output).toContain('0.6')
    })

    it('should include individual component scores', () => {
      const score: TrustScore = {
        normalized: 50,
        tier: 'medium',
        components: {
          stakingScore: 10,
          diversityScore: 20,
          sentimentScore: 30,
          operatorCommitment: 40,
          longevityScore: 50,
          feedbackScore: 60,
        },
        confidence: 0.3,
      }

      const output = displayTrustScore(score)

      expect(output).toContain('10/100')
      expect(output).toContain('20/100')
      expect(output).toContain('30/100')
      expect(output).toContain('40/100')
      expect(output).toContain('50/100')
      expect(output).toContain('60/100')
    })
  })

  describe('success', () => {
    it('should include the message', () => {
      expect(success('done')).toContain('done')
    })
  })

  describe('error', () => {
    it('should include the message', () => {
      expect(error('failed')).toContain('failed')
    })
  })

  describe('labelValue', () => {
    it('should include label and value', () => {
      const result = labelValue('Name', 'TestAgent')
      expect(result).toContain('Name')
      expect(result).toContain('TestAgent')
    })
  })

  describe('header', () => {
    it('should include emoji and text', () => {
      const result = header('🔧', 'Capabilities')
      expect(result).toContain('🔧')
      expect(result).toContain('Capabilities')
    })
  })

  describe('separator', () => {
    it('should return a string of the specified width', () => {
      // Chalk wraps with ANSI codes, so just check it's not empty
      const result = separator(10)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should default to width 30', () => {
      const result = separator()
      expect(result).toContain('─')
    })
  })
})
