import { z } from 'zod'
import { EndpointSchema } from './endpoint'
import { CapabilitySchema } from './capability'

/** ERC-8004 supported trust model types. */
export const TrustModelEnum = z.enum([
  'reputation',
  'crypto-economic',
  'tee-attestation',
  'zkml',
])

/** Cross-chain registration reference per ERC-8004. */
export const RegistrationRefSchema = z.object({
  agentId: z.number().int().nonnegative(),
  /** Format: {namespace}:{chainId}:{identityRegistry} e.g. eip155:1:0x742... */
  agentRegistry: z.string().regex(
    /^[a-z0-9]+:\d+:0x[a-fA-F0-9]{40}$/,
    'Must be {namespace}:{chainId}:{address}',
  ),
})

/** AgentID-specific extensions stored alongside the ERC-8004 registration. */
export const AgentIdExtensionsSchema = z.object({
  /** Intuition Atom ID once registered on-chain */
  intuitionAtomId: z.string().optional(),
  /** Ethereum address of the agent operator */
  operatorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  /** Agent capabilities (also represented as Triples on Intuition) */
  capabilities: z.array(CapabilitySchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  /** Amount staked by operator on this agent's vault */
  bondedStake: z.string().optional(),
  /** Minimum stake others must hold to use this agent */
  minimumStakeToUse: z.string().optional(),
})

/**
 * Full Agent Registration File — ERC-8004 compliant with AgentID extensions.
 *
 * This is the document stored on IPFS and referenced by the Intuition Atom URI.
 * It follows the ERC-8004 registration-v1 format exactly, with an optional
 * `agentidExtensions` field for Intuition-specific data.
 */
export const AgentRegistrationSchema = z.object({
  /** ERC-8004 type identifier */
  type: z.literal('https://eips.ethereum.org/EIPS/eip-8004#registration-v1'),
  /** Agent display name */
  name: z.string().min(1).max(100),
  /** Natural language description of what the agent does */
  description: z.string().min(1).max(1000),
  /** Image URL (IPFS or HTTPS) */
  image: z.string().url(),
  /** Agent communication endpoints */
  endpoints: z.array(EndpointSchema).min(1),
  /** Whether this agent supports x402 payments */
  x402Support: z.boolean().default(false),
  /** Whether the agent is currently active */
  active: z.boolean().default(true),
  /** Cross-chain ERC-8004 registrations */
  registrations: z.array(RegistrationRefSchema).default([]),
  /** Trust models this agent supports */
  supportedTrust: z.array(TrustModelEnum).default([]),

  /** AgentID / Intuition-specific extensions */
  agentidExtensions: AgentIdExtensionsSchema.optional(),
})

export type TrustModel = z.infer<typeof TrustModelEnum>
export type RegistrationRef = z.infer<typeof RegistrationRefSchema>
export type AgentIdExtensions = z.infer<typeof AgentIdExtensionsSchema>
export type AgentRegistration = z.infer<typeof AgentRegistrationSchema>
