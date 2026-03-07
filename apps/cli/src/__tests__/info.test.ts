import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@agentids/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@agentids/sdk')>()
  return {
    ...actual,
    getAgentReputation: vi.fn(),
  }
})

vi.mock('../client.js', () => ({
  loadEnvConfig: vi.fn().mockReturnValue({
    network: 'testnet',
    privateKey: undefined,
    pinataApiJwt: undefined,
    hasWriteConfig: false,
  }),
  createReadConfig: vi.fn().mockReturnValue({
    graphqlClient: {},
  }),
}))

import { infoCommand } from '../commands/info.js'
import { getAgentReputation } from '@agentids/sdk'

describe('infoCommand', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should display not-found message for unknown agent', async () => {
    vi.mocked(getAgentReputation).mockResolvedValue({
      found: false,
      agentId: null,
      name: null,
      image: null,
      trustScore: null,
      capabilities: [],
      recommendation: 'No agent found with identifier: nonexistent',
    })

    await infoCommand('nonexistent')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('No agent found'),
    )
  })

  it('should display agent name and atom ID', async () => {
    vi.mocked(getAgentReputation).mockResolvedValue({
      found: true,
      agentId: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
      name: 'CodeReviewBot',
      image: 'https://example.com/img.png',
      trustScore: {
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
      },
      capabilities: [
        { name: 'code-generation', tripleId: '0xtriple1' },
      ],
      recommendation: 'Trusted agent. Safe for most tasks.',
    })

    await infoCommand('0xabc123')

    // Check agent name is displayed
    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('CodeReviewBot')
    expect(allOutput).toContain('72/100')
    expect(allOutput).toContain('code-generation')
    expect(allOutput).toContain('Trusted agent')
  })

  it('should display trust score breakdown when available', async () => {
    vi.mocked(getAgentReputation).mockResolvedValue({
      found: true,
      agentId: '0xabc1',
      name: 'ScoreBot',
      image: null,
      trustScore: {
        normalized: 50,
        tier: 'medium',
        components: {
          stakingScore: 40,
          diversityScore: 30,
          sentimentScore: 60,
          operatorCommitment: 50,
          longevityScore: 70,
          feedbackScore: 80,
        },
        confidence: 0.4,
      },
      capabilities: [],
      recommendation: 'Moderate trust.',
    })

    await infoCommand('ScoreBot')

    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('Staking')
    expect(allOutput).toContain('Diversity')
    expect(allOutput).toContain('Sentiment')
    expect(allOutput).toContain('Operator')
    expect(allOutput).toContain('Longevity')
    expect(allOutput).toContain('Feedback')
    expect(allOutput).toContain('0.4')
  })

  it('should show N/A when no trust score data', async () => {
    vi.mocked(getAgentReputation).mockResolvedValue({
      found: true,
      agentId: '0xnodata',
      name: 'NoDataBot',
      image: null,
      trustScore: null,
      capabilities: [],
      recommendation: 'Insufficient data to assess trust.',
    })

    await infoCommand('NoDataBot')

    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('N/A')
  })

  it('should display multiple capabilities', async () => {
    vi.mocked(getAgentReputation).mockResolvedValue({
      found: true,
      agentId: '0xmulti',
      name: 'MultiBot',
      image: null,
      trustScore: null,
      capabilities: [
        { name: 'code-generation', tripleId: '0xt1' },
        { name: 'data-analysis', tripleId: '0xt2' },
        { name: 'security', tripleId: '0xt3' },
      ],
      recommendation: 'Test.',
    })

    await infoCommand('MultiBot')

    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('code-generation')
    expect(allOutput).toContain('data-analysis')
    expect(allOutput).toContain('security')
  })

  it('should show no capabilities message when empty', async () => {
    vi.mocked(getAgentReputation).mockResolvedValue({
      found: true,
      agentId: '0xnocap',
      name: 'NoCapBot',
      image: null,
      trustScore: null,
      capabilities: [],
      recommendation: 'Test.',
    })

    await infoCommand('NoCapBot')

    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('No capabilities registered')
  })

  it('should handle SDK errors gracefully', async () => {
    vi.mocked(getAgentReputation).mockRejectedValue(
      new Error('GraphQL timeout'),
    )

    await infoCommand('ErrorBot')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch agent info'),
    )
  })

  it('should display image when available', async () => {
    vi.mocked(getAgentReputation).mockResolvedValue({
      found: true,
      agentId: '0ximgbot',
      name: 'ImgBot',
      image: 'https://example.com/avatar.png',
      trustScore: null,
      capabilities: [],
      recommendation: 'Test.',
    })

    await infoCommand('ImgBot')

    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('https://example.com/avatar.png')
  })
})
