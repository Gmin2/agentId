import chalk from 'chalk'
import { GraphQLClient } from 'graphql-request'
import {
  SEARCH_AGENTS_BY_NAME,
  INTUITION_GRAPHQL_ENDPOINTS,
  type SearchAgentsByNameResponse,
} from '@agentids/sdk'
import { loadEnvConfig } from '../client.js'
import {
  error,
  truncHex,
  formatEth,
  separator,
} from '../utils/display.js'

export async function searchCommand(
  query: string,
  options: { limit?: string },
): Promise<void> {
  const env = loadEnvConfig()
  const limit = parseInt(options.limit || '10', 10)

  const client = new GraphQLClient(INTUITION_GRAPHQL_ENDPOINTS[env.network])

  console.log(chalk.dim(`\n🔎 Searching for "${query}"...\n`))

  try {
    const response = await client.request<SearchAgentsByNameResponse>(
      SEARCH_AGENTS_BY_NAME,
      { name: `%${query}%`, limit },
    )

    const agents = response.atoms

    if (agents.length === 0) {
      console.log(`   No agents found matching "${query}"`)
      return
    }

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i]
      const vault = agent.term?.vaults?.[0]
      const stake = vault?.total_assets || '0'
      const stakers = vault?.position_count || 0

      console.log(`  ${chalk.bold(`${i + 1}. ${agent.label || 'Unnamed'}`)}`)
      console.log(`     Atom ID: ${truncHex(agent.term_id)}`)
      console.log(
        `     Stake:   ${formatEth(stake)} ETH | Stakers: ${stakers}`,
      )
      console.log(`     ${separator()}`)
      console.log()
    }

    console.log(`Found ${agents.length} agent${agents.length === 1 ? '' : 's'} matching "${query}"`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.log(error(`Search failed: ${msg}`))
  }
}
