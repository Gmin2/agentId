import { input, select } from '@inquirer/prompts'
import chalk from 'chalk'
import { parseEther, type Hex } from 'viem'
import { createCapabilityTriple, CapabilityCategoryEnum } from '@agentid/sdk'
import { createWriteConfig, loadEnvConfig } from '../client.js'
import {
  success,
  error,
  labelValue,
  header,
  truncHex,
} from '../utils/display.js'

const CAPABILITY_CATEGORIES = CapabilityCategoryEnum.options

export async function capabilityAddCommand(atomId: string): Promise<void> {
  const env = loadEnvConfig()

  if (!env.privateKey) {
    console.log(error('PRIVATE_KEY not set in .env file.'))
    return
  }

  if (!atomId.startsWith('0x')) {
    console.log(error('Invalid atom ID. Must start with 0x.'))
    return
  }

  console.log(header('🔗', `Adding capability to agent: ${truncHex(atomId)}`))
  console.log()

  const capName = await input({
    message: 'Capability name:',
    validate: (v) => v.length > 0 || 'Required',
  })

  const capDesc = await input({
    message: 'Capability description:',
    default: '',
  })

  await select({
    message: 'Capability category:',
    choices: CAPABILITY_CATEGORIES.map((c) => ({ value: c, name: c })),
  })

  const depositInput = await input({
    message: 'Deposit on capability triple (ETH, default 0):',
    default: '0',
    validate: (v) => {
      const n = parseFloat(v)
      return (!isNaN(n) && n >= 0) || 'Must be a valid number >= 0'
    },
  })

  const depositAmount = parseEther(depositInput)

  try {
    const config = createWriteConfig(
      env.privateKey,
      env.pinataApiJwt || '',
      env.network,
    )

    console.log()
    console.log(chalk.dim(`Creating predicate atom "has-capability"...`))
    console.log(chalk.dim(`Creating capability atom "${capName}"...`))

    const result = await createCapabilityTriple(
      config,
      atomId as Hex,
      capName,
      depositAmount,
    )

    console.log(labelValue('Transaction', truncHex(result.txHash)))
    console.log()
    console.log(success('Capability added!'))
    console.log(labelValue('Triple ID', truncHex(result.tripleId)))
    console.log(labelValue('Predicate Atom', truncHex(result.predicateAtomId)))
    console.log(labelValue('Capability Atom', truncHex(result.capabilityAtomId)))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.log(error(`Failed to add capability: ${msg}`))
  }
}
