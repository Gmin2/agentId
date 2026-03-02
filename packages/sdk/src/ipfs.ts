export interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

/** Upload JSON to Pinata and return the IPFS hash. */
export async function uploadJsonToPinata(
  apiJwt: string,
  data: unknown,
): Promise<PinataResponse> {
  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiJwt}`,
    },
    body: JSON.stringify({ pinataContent: data }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Pinata upload failed (${res.status}): ${text}`)
  }

  return res.json() as Promise<PinataResponse>
}
