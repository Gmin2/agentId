import { z } from 'zod'

/**
 * ERC-8004 Endpoint schema.
 * Agents advertise endpoints pointing to A2A agent cards, MCP servers,
 * ENS names, DIDs, wallets, or web interfaces.
 */
export const EndpointSchema = z.object({
  name: z.enum(['web', 'A2A', 'MCP', 'OASF', 'ENS', 'DID', 'email']),
  endpoint: z.string().min(1),
  version: z.string().optional(),
  /** MCP-specific: list of capabilities */
  capabilities: z.array(z.string()).optional(),
  /** OASF-specific: list of skills */
  skills: z.array(z.string()).optional(),
  /** OASF-specific: list of domains */
  domains: z.array(z.string()).optional(),
})

export type Endpoint = z.infer<typeof EndpointSchema>
