import { z } from 'zod'

/** Standard capability categories for agent classification. */
export const CapabilityCategoryEnum = z.enum([
  'data-processing',
  'code-generation',
  'task-automation',
  'communication',
  'analysis',
  'creative',
  'financial',
  'research',
  'security',
  'infrastructure',
])

/** Pricing model for a capability. */
export const CapabilityPricingSchema = z.object({
  model: z.enum(['free', 'per-request', 'subscription']),
  amount: z.string().optional(),
  asset: z.string().optional(),
})

/**
 * A single capability that an agent can perform.
 * Stored as an Atom on Intuition and linked to the agent via a Triple.
 */
export const CapabilitySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  category: CapabilityCategoryEnum,
  inputSchema: z.record(z.unknown()).optional(),
  outputSchema: z.record(z.unknown()).optional(),
  pricing: CapabilityPricingSchema.optional(),
})

export type CapabilityCategory = z.infer<typeof CapabilityCategoryEnum>
export type CapabilityPricing = z.infer<typeof CapabilityPricingSchema>
export type Capability = z.infer<typeof CapabilitySchema>
