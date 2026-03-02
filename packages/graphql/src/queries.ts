import { gql } from 'graphql-request'

/** Fetch a single agent atom by its term_id, including vault and capability data. */
export const GET_AGENT_BY_ATOM_ID = gql`
  query GetAgentByAtomId($atomId: String!) {
    atom(term_id: $atomId) {
      term_id
      label
      image
      data
      type
      created_at
      creator {
        id
        label
      }
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          total_shares
          total_assets
          current_share_price
          market_cap
          position_count
        }
      }
      as_subject_triples {
        term_id
        predicate {
          term_id
          label
          data
        }
        object {
          term_id
          label
          data
        }
        term {
          vaults(where: { curve_id: { _eq: "1" } }) {
            total_shares
            total_assets
          }
        }
        counter_term {
          vaults(where: { curve_id: { _eq: "1" } }) {
            total_shares
            total_assets
          }
        }
      }
    }
  }
`

/** Search agents by name (label). */
export const SEARCH_AGENTS_BY_NAME = gql`
  query SearchAgentsByName($name: String!, $limit: Int = 10) {
    atoms(
      where: { label: { _ilike: $name } }
      order_by: [{ term: { vaults_aggregate: { sum: { total_assets: desc } } } }]
      limit: $limit
    ) {
      term_id
      label
      image
      data
      created_at
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          total_assets
          market_cap
          position_count
          current_share_price
        }
      }
    }
  }
`

/** Get all capability triples for an agent (where agent is subject). */
export const GET_AGENT_CAPABILITIES = gql`
  query GetAgentCapabilities($agentAtomId: String!) {
    triples(
      where: {
        _and: [
          { subject: { term_id: { _eq: $agentAtomId } } }
          { predicate: { label: { _eq: "has-capability" } } }
        ]
      }
    ) {
      term_id
      object {
        term_id
        label
        data
      }
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          total_shares
          total_assets
        }
      }
      counter_term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          total_shares
          total_assets
        }
      }
    }
  }
`

/** Search agents by capability name. */
export const SEARCH_AGENTS_BY_CAPABILITY = gql`
  query SearchAgentsByCapability($capability: String!, $limit: Int = 10) {
    triples(
      where: {
        _and: [
          { predicate: { label: { _eq: "has-capability" } } }
          { object: { label: { _ilike: $capability } } }
        ]
      }
      order_by: [{ term: { vaults_aggregate: { sum: { total_assets: desc } } } }]
      limit: $limit
    ) {
      term_id
      subject {
        term_id
        label
        image
        data
        term {
          vaults(where: { curve_id: { _eq: "1" } }) {
            total_assets
            market_cap
            position_count
          }
        }
      }
      object {
        term_id
        label
      }
    }
  }
`

/** Look up an atom by its exact label (used to check if predicate/capability atoms exist). */
export const GET_ATOM_BY_LABEL = gql`
  query GetAtomByLabel($label: String!) {
    atoms(where: { label: { _eq: $label } }, limit: 1) {
      term_id
      label
      data
    }
  }
`

/** Get a user's staking positions on agents. */
export const GET_USER_POSITIONS = gql`
  query GetUserPositions($userAddress: String!, $limit: Int = 20) {
    positions(
      where: { account: { id: { _eq: $userAddress } } }
      order_by: [{ vault: { market_cap: desc } }]
      limit: $limit
    ) {
      id
      shares
      vault {
        id
        type
        market_cap
        total_assets
        atom {
          term_id
          label
          image
        }
        triple {
          term_id
        }
      }
    }
  }
`
