import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadJsonToPinata } from '../ipfs'

describe('uploadJsonToPinata', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should call Pinata API with correct headers and body', async () => {
    const mockResponse = {
      IpfsHash: 'QmTestHash123',
      PinSize: 256,
      Timestamp: '2025-01-01T00:00:00Z',
    }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    )

    const data = { name: 'TestAgent', description: 'A test agent' }
    const result = await uploadJsonToPinata('test-jwt-token', data)

    expect(fetchSpy).toHaveBeenCalledOnce()
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-jwt-token',
        },
        body: JSON.stringify({ pinataContent: data }),
      },
    )

    expect(result.IpfsHash).toBe('QmTestHash123')
    expect(result.PinSize).toBe(256)
  })

  it('should throw on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Unauthorized', { status: 401 }),
    )

    await expect(
      uploadJsonToPinata('bad-token', { foo: 'bar' }),
    ).rejects.toThrow('Pinata upload failed (401)')
  })

  it('should handle complex JSON payloads', async () => {
    const mockResponse = {
      IpfsHash: 'QmComplexHash456',
      PinSize: 1024,
      Timestamp: '2025-01-01T00:00:00Z',
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    )

    const complexData = {
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      name: 'ComplexAgent',
      endpoints: [{ name: 'MCP', endpoint: 'https://example.com/mcp' }],
      nested: { deep: { value: [1, 2, 3] } },
    }

    const result = await uploadJsonToPinata('jwt', complexData)
    expect(result.IpfsHash).toBe('QmComplexHash456')
  })
})
