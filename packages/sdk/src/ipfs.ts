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

export interface PinThingParams {
  name: string
  description?: string
  image?: string
  url?: string
}

/**
 * Pin a "thing" via Intuition's GraphQL pinThing mutation.
 * This ensures the indexer properly labels the atom with name/image.
 */
export async function pinThing(
  graphqlUrl: string,
  params: PinThingParams,
): Promise<string> {
  const query = `mutation pinThing($name: String!, $description: String, $image: String, $url: String) {
  pinThing(thing: {name: $name, description: $description, image: $image, url: $url}) {
    uri
  }
}`
  const body = JSON.stringify({ query, variables: params })

  const res = await fetch(graphqlUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  if (!res.ok) {
    throw new Error(`pinThing failed (${res.status}): ${await res.text()}`)
  }

  const json = await res.json() as { data?: { pinThing?: { uri?: string } }; errors?: Array<{ message: string }> }

  if (json.errors?.length) {
    throw new Error(`pinThing error: ${json.errors[0].message}`)
  }

  const uri = json.data?.pinThing?.uri
  if (!uri) {
    throw new Error('pinThing returned no URI')
  }

  return uri
}
