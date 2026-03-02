export {
  EndpointSchema,
  type Endpoint,
} from './endpoint'

export {
  CapabilitySchema,
  CapabilityCategoryEnum,
  CapabilityPricingSchema,
  type Capability,
  type CapabilityCategory,
  type CapabilityPricing,
} from './capability'

export {
  AgentRegistrationSchema,
  TrustModelEnum,
  RegistrationRefSchema,
  AgentIdExtensionsSchema,
  type AgentRegistration,
  type TrustModel,
  type RegistrationRef,
  type AgentIdExtensions,
} from './registration'

export {
  PREDICATES,
  type PredicateLabel,
} from './predicates'

export {
  TrustScoreSchema,
  TrustTierEnum,
  TrustComponentsSchema,
  calculateTrustScore,
  TRUST_WEIGHTS,
  TIER_THRESHOLDS,
  type TrustScore,
  type TrustTier,
  type TrustComponents,
  type TrustScoreInput,
} from './trust-score'
