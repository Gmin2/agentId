import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRequest = vi.fn()

vi.mock('graphql-request', async (importOriginal) => {
  const actual = await importOriginal<typeof import('graphql-request')>()
  return {
    ...actual,
    GraphQLClient: vi.fn().mockImplementation(() => ({
      request: mockRequest,
    })),
  }
})

vi.mock('../client.js', () => ({
  loadEnvConfig: vi.fn().mockReturnValue({
    network: 'testnet',
    privateKey: undefined,
    pinataApiJwt: undefined,
    hasWriteConfig: false,
  }),
}))

import { searchCommand } from '../commands/search.js'

describe('searchCommand', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should display no results message when nothing found', async () => {
    mockRequest.mockResolvedValue({ atoms: [] })

    await searchCommand('xyznonexist', {})

    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('No agents found matching "xyznonexist"')
  })

  it('should display found agents with name and stake', async () => {
    mockRequest.mockResolvedValue({
      atoms: [
        {
          term_id: '0xagent1',
          label: 'CodeReviewBot',
          image: null,
          data: null,
          created_at: '2025-01-01',
          term: {
            vaults: [
              {
                total_assets: '5000000000000000000',
                market_cap: '5000000000000000000',
                position_count: 15,
                current_share_price: '1000000000000000000',
              },
            ],
          },
        },
        {
          term_id: '0xagent2',
          label: 'CodeAnalyzer',
          image: null,
          data: null,
          created_at: '2025-02-01',
          term: {
            vaults: [
              {
                total_assets: '1100000000000000000',
                market_cap: '1100000000000000000',
                position_count: 4,
                current_share_price: '1000000000000000000',
              },
            ],
          },
        },
      ],
    })

    await searchCommand('code', {})

    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('CodeReviewBot')
    expect(allOutput).toContain('CodeAnalyzer')
    expect(allOutput).toContain('5.000')
    expect(allOutput).toContain('15')
    expect(allOutput).toContain('Found 2 agents')
  })

  it('should pass limit option to GraphQL query', async () => {
    mockRequest.mockResolvedValue({ atoms: [] })

    await searchCommand('test', { limit: '5' })

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ limit: 5 }),
    )
  })

  it('should default limit to 10', async () => {
    mockRequest.mockResolvedValue({ atoms: [] })

    await searchCommand('test', {})

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ limit: 10 }),
    )
  })

  it('should pass wildcard-wrapped query', async () => {
    mockRequest.mockResolvedValue({ atoms: [] })

    await searchCommand('myquery', {})

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ name: '%myquery%' }),
    )
  })

  it('should handle single result with correct grammar', async () => {
    mockRequest.mockResolvedValue({
      atoms: [
        {
          term_id: '0xsingle',
          label: 'OnlyBot',
          image: null,
          data: null,
          term: {
            vaults: [
              {
                total_assets: '0',
                position_count: 0,
              },
            ],
          },
        },
      ],
    })

    await searchCommand('only', {})

    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('Found 1 agent matching')
    // Should say "agent" not "agents"
    expect(allOutput).not.toContain('1 agents')
  })

  it('should handle agents with no vault data', async () => {
    mockRequest.mockResolvedValue({
      atoms: [
        {
          term_id: '0xnovault',
          label: 'NoVaultBot',
          image: null,
          data: null,
          term: { vaults: [] },
        },
      ],
    })

    await searchCommand('novault', {})

    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n')
    expect(allOutput).toContain('NoVaultBot')
    expect(allOutput).toContain('0.000')
  })

  it('should handle GraphQL errors gracefully', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'))

    await searchCommand('fail', {})

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Search failed'),
    )
  })
})
