import { input, select, confirm, checkbox } from '@inquirer/prompts'
import chalk from 'chalk'
import { parseEther } from 'viem'
import {
  createAgentAtom,
  createCapabilityTriple,
  type AgentRegistration,
  type CapabilityCategory,
  CapabilityCategoryEnum,
} from '@agentid/sdk'
import { createWriteConfig, loadEnvConfig } from '../client.js'
import {
  success,
  error,
  labelValue,
  header,
  truncHex,
  formatEth,
} from '../utils/display.js'

const CAPABILITY_CATEGORIES = CapabilityCategoryEnum.options

const ENDPOINT_TYPES = ['MCP', 'A2A', 'web', 'email', 'ENS', 'DID', 'OASF'] as const

export async function registerCommand(): Promise<void> {
  const env = loadEnvConfig()

  if (!env.privateKey) {
    console.log(error('PRIVATE_KEY not set in .env file.'))
    console.log('   Create a .env file with your private key to sign transactions.')
    return
  }

  if (!env.pinataApiJwt) {
    console.log(error('PINATA_API_JWT not set in .env file.'))
    console.log('   A Pinata JWT is required to upload registration data to IPFS.')
    return
  }

  console.log(header('📝', 'Register a new AI Agent on Intuition'))
  console.log()

  // Interactive prompts
  const name = await input({
    message: 'Agent name:',
    validate: (v) => (v.length > 0 && v.length <= 100) || 'Name must be 1-100 characters',
  })

  const description = await input({
    message: 'Description:',
    validate: (v) =>
      (v.length > 0 && v.length <= 1000) || 'Description must be 1-1000 characters',
  })

  const image = await input({
    message: 'Image URL:',
    validate: (v) => {
      try {
        new URL(v)
        return true
      } catch {
        return 'Must be a valid URL'
      }
    },
  })

  const endpointType = await select({
    message: 'Endpoint type:',
    choices: ENDPOINT_TYPES.map((t) => ({ value: t, name: t })),
  })

  const endpointUrl = await input({
    message: 'Endpoint URL:',
    validate: (v) => v.length > 0 || 'Endpoint URL is required',
  })

  const endpointVersion = await input({
    message: 'Endpoint version (optional):',
    default: '',
  })

  const x402Support = await confirm({
    message: 'Supports x402 payments?',
    default: false,
  })

  const supportedTrust = await checkbox({
    message: 'Trust models supported:',
    choices: [
      { value: 'reputation' as const, name: 'reputation', checked: true },
      { value: 'crypto-economic' as const, name: 'crypto-economic', checked: true },
      { value: 'tee-attestation' as const, name: 'tee-attestation' },
      { value: 'zkml' as const, name: 'zkml' },
    ],
  })

  const stakeInput = await input({
    message: 'Initial stake in ETH (default 0.001):',
    default: '0.001',
    validate: (v) => {
      const n = parseFloat(v)
      return (!isNaN(n) && n >= 0) || 'Must be a valid number >= 0'
    },
  })

  // Capability collection loop
  const capabilities: Array<{
    name: string
    description: string
    category: CapabilityCategory
  }> = []

  let addCapability = await confirm({
    message: 'Add a capability now?',
    default: true,
  })

  while (addCapability) {
    const capName = await input({
      message: 'Capability name:',
      validate: (v) => v.length > 0 || 'Required',
    })

    const capDesc = await input({
      message: 'Capability description:',
      default: '',
    })

    const capCategory = await select({
      message: 'Capability category:',
      choices: CAPABILITY_CATEGORIES.map((c) => ({ value: c, name: c })),
    })

    capabilities.push({
      name: capName,
      description: capDesc,
      category: capCategory,
    })

    addCapability = await confirm({
      message: 'Add another capability?',
      default: false,
    })
  }

  // Build registration
  const registration: AgentRegistration = {
    type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
    name,
    description,
    image,
    endpoints: [
      {
        name: endpointType,
        endpoint: endpointUrl,
        ...(endpointVersion ? { version: endpointVersion } : {}),
      },
    ],
    x402Support,
    active: true,
    registrations: [],
    supportedTrust,
    agentidExtensions: {
      operatorAddress: '0x0000000000000000000000000000000000000000',
      capabilities: capabilities.map((c) => ({
        name: c.name,
        description: c.description,
        category: c.category,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  const depositAmount = parseEther(stakeInput)

  // Execute
  console.log()
  console.log(chalk.dim('🚀 Uploading registration to IPFS...'))

  try {
    const config = createWriteConfig(env.privateKey, env.pinataApiJwt, env.network)

    // Update operator address from wallet
    registration.agentidExtensions!.operatorAddress =
      config.walletClient.account!.address

    const result = await createAgentAtom(config, registration, depositAmount)

    console.log(labelValue('IPFS URI', result.ipfsUri))
    console.log()
    console.log(chalk.dim('📝 Creating agent atom on Intuition Testnet...'))
    console.log(labelValue('Transaction', truncHex(result.txHash)))
    console.log(success('Agent registered!'))
    console.log()
    console.log(labelValue('Agent Atom ID', result.atomId))
    console.log(labelValue('Name', name))
    console.log(labelValue('IPFS URI', result.ipfsUri))
    console.log(labelValue('Stake', `${stakeInput} ETH`))

    // Create capability triples
    for (const cap of capabilities) {
      console.log()
      console.log(chalk.dim(`🔗 Adding capability: ${cap.name}`))

      const tripleResult = await createCapabilityTriple(
        config,
        result.atomId,
        cap.name,
      )

      console.log(labelValue('Transaction', truncHex(tripleResult.txHash)))
      console.log(success('Capability triple created!'))
      console.log(labelValue('Triple ID', truncHex(tripleResult.tripleId)))
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)

    if (msg.includes('insufficient') || msg.includes('balance')) {
      console.log(error('Insufficient balance.'))
      console.log('   Fund your wallet on Intuition Testnet (Chain 13579)')
      console.log('   Faucet: https://faucet.intuition.systems')
    } else {
      console.log(error(`Registration failed: ${msg}`))
    }
  }
}
