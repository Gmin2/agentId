import chalk from 'chalk'
import { getAgentReputation } from '@agentid/sdk'
import { createReadConfig, loadEnvConfig } from '../client.js'
import {
  error,
  labelValue,
  header,
  truncHex,
  displayTrustScore,
} from '../utils/display.js'

export async function infoCommand(identifier: string): Promise<void> {
  const env = loadEnvConfig()
  const config = createReadConfig(env.network)

  console.log(chalk.dim(`\nFetching agent info for "${identifier}"...\n`))

  try {
    const rep = await getAgentReputation(config, identifier)

    if (!rep.found) {
      console.log(error(`No agent found with identifier: "${identifier}"`))
      return
    }

    console.log(header('📋', `Agent: ${rep.name}`))
    console.log(labelValue('Atom ID', rep.agentId ? truncHex(rep.agentId) : 'N/A'))
    if (rep.image) {
      console.log(labelValue('Image', rep.image))
    }
    console.log(labelValue('Active', 'Yes'))

    // Trust Score
    if (rep.trustScore) {
      console.log(displayTrustScore(rep.trustScore))
    } else {
      console.log(header('🏆', 'Trust Score: N/A'))
      console.log(chalk.dim('   Insufficient on-chain data to compute trust score.'))
    }

    // Capabilities
    if (rep.capabilities.length > 0) {
      console.log(header('🔧', 'Capabilities:'))
      for (const cap of rep.capabilities) {
        console.log(`   • ${cap.name} ${chalk.dim(`(Triple: ${truncHex(cap.tripleId)})`)}`)
      }
    } else {
      console.log(header('🔧', 'Capabilities:'))
      console.log(chalk.dim('   No capabilities registered yet.'))
    }

    // Recommendation
    console.log()
    console.log(`${chalk.bold('💬 Recommendation:')} ${rep.recommendation}`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.log(error(`Failed to fetch agent info: ${msg}`))
  }
}
