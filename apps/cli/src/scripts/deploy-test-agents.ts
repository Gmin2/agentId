/**
 * Deploy 10 test agents to Intuition Testnet.
 *
 * Usage:
 *   1. Create apps/cli/.env with PRIVATE_KEY and PINATA_API_JWT
 *   2. Run: npx tsx apps/cli/src/scripts/deploy-test-agents.ts
 *
 * Each agent gets:
 *   - Registration JSON uploaded to IPFS
 *   - An Atom created on MultiVault
 *   - Capability triples linked to the agent
 *   - A small initial stake (0.001 ETH)
 */
import 'dotenv/config'
import { parseEther, type Hex } from 'viem'
import {
  createAgentAtom,
  createCapabilityTriple,
  type AgentRegistration,
  type CapabilityCategory,
} from '@agentids/sdk'
import { createWriteConfig, loadEnvConfig } from '../client.js'

// ── Agent Definitions ──────────────────────────────────────────────────

interface AgentDef {
  name: string
  description: string
  image: string
  endpointType: 'MCP' | 'A2A' | 'web'
  endpointUrl: string
  capabilities: Array<{ name: string; category: CapabilityCategory }>
}

const AGENTS: AgentDef[] = [
  {
    name: 'CodeReviewBot',
    description: 'AI agent that reviews pull requests for bugs, security issues, and style consistency.',
    image: 'https://api.dicebear.com/9.x/bottts/svg?seed=CodeReviewBot',
    endpointType: 'MCP',
    endpointUrl: 'https://codereviewbot.example.com/mcp',
    capabilities: [
      { name: 'code-generation', category: 'code-generation' },
      { name: 'analysis', category: 'analysis' },
    ],
  },
  {
    name: 'DataAnalyzer',
    description: 'Analyzes structured and unstructured datasets, producing insights and visualizations.',
    image: 'https://api.dicebear.com/9.x/bottts/svg?seed=DataAnalyzer',
    endpointType: 'MCP',
    endpointUrl: 'https://dataanalyzer.example.com/mcp',
    capabilities: [
      { name: 'data-processing', category: 'data-processing' },
      { name: 'analysis', category: 'analysis' },
    ],
  },
  {
    name: 'TweetComposer',
    description: 'Composes engaging social media content with brand voice consistency.',
    image: 'https://api.dicebear.com/9.x/bottts/svg?seed=TweetComposer',
    endpointType: 'web',
    endpointUrl: 'https://tweetcomposer.example.com',
    capabilities: [
      { name: 'creative', category: 'creative' },
      { name: 'communication', category: 'communication' },
    ],
  },
  {
    name: 'DeFiSwapper',
    description: 'Executes optimal token swaps across DEXes with MEV protection.',
    image: 'https://api.dicebear.com/9.x/bottts/svg?seed=DeFiSwapper',
    endpointType: 'A2A',
    endpointUrl: 'https://defiswapper.example.com/a2a',
    capabilities: [
      { name: 'financial', category: 'financial' },
      { name: 'task-automation', category: 'task-automation' },
    ],
  },
  {
    name: 'ResearchAssistant',
    description: 'Performs deep research across academic papers, patents, and web sources.',
    image: 'https://api.dicebear.com/9.x/bottts/svg?seed=ResearchAssistant',
    endpointType: 'MCP',
    endpointUrl: 'https://researchassistant.example.com/mcp',
    capabilities: [
      { name: 'research', category: 'research' },
      { name: 'analysis', category: 'analysis' },
    ],
  },
  {
    name: 'SecurityAuditor',
    description: 'Audits smart contracts and codebases for vulnerabilities and best practice violations.',
    image: 'https://api.dicebear.com/9.x/bottts/svg?seed=SecurityAuditor',
    endpointType: 'MCP',
    endpointUrl: 'https://securityauditor.example.com/mcp',
    capabilities: [
      { name: 'security', category: 'security' },
      { name: 'code-generation', category: 'code-generation' },
    ],
  },
  {
    name: 'DocWriter',
    description: 'Generates technical documentation, API references, and user guides.',
    image: 'https://api.dicebear.com/9.x/bottts/svg?seed=DocWriter',
    endpointType: 'web',
    endpointUrl: 'https://docwriter.example.com',
    capabilities: [
      { name: 'creative', category: 'creative' },
      { name: 'communication', category: 'communication' },
    ],
  },
  {
    name: 'InfraMonitor',
    description: 'Monitors cloud infrastructure health and auto-remediates common issues.',
    image: 'https://api.dicebear.com/9.x/bottts/svg?seed=InfraMonitor',
    endpointType: 'A2A',
    endpointUrl: 'https://inframonitor.example.com/a2a',
    capabilities: [
      { name: 'infrastructure', category: 'infrastructure' },
      { name: 'analysis', category: 'analysis' },
    ],
  },
  {
    name: 'TranslationAgent',
    description: 'Translates text between 50+ languages with context-aware quality.',
    image: 'https://api.dicebear.com/9.x/bottts/svg?seed=TranslationAgent',
    endpointType: 'MCP',
    endpointUrl: 'https://translationagent.example.com/mcp',
    capabilities: [
      { name: 'communication', category: 'communication' },
      { name: 'creative', category: 'creative' },
    ],
  },
  {
    name: 'TaskOrchestrator',
    description: 'Orchestrates multi-agent workflows, routing tasks to specialized agents.',
    image: 'https://api.dicebear.com/9.x/bottts/svg?seed=TaskOrchestrator',
    endpointType: 'A2A',
    endpointUrl: 'https://taskorchestrator.example.com/a2a',
    capabilities: [
      { name: 'task-automation', category: 'task-automation' },
      { name: 'infrastructure', category: 'infrastructure' },
    ],
  },
]

// ── Deployment Logic ───────────────────────────────────────────────────

const INITIAL_STAKE = parseEther('0.001')

interface DeployedAgent {
  name: string
  atomId: Hex
  ipfsUri: string
  txHash: Hex
  capabilities: Array<{ name: string; tripleId: Hex }>
}

async function deployAgent(
  config: ReturnType<typeof createWriteConfig>,
  agentDef: AgentDef,
): Promise<DeployedAgent> {
  const now = new Date().toISOString()

  const registration: AgentRegistration = {
    type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
    name: agentDef.name,
    description: agentDef.description,
    image: agentDef.image,
    endpoints: [
      {
        name: agentDef.endpointType,
        endpoint: agentDef.endpointUrl,
      },
    ],
    x402Support: false,
    active: true,
    registrations: [],
    supportedTrust: ['reputation', 'crypto-economic'],
    agentidExtensions: {
      operatorAddress: config.walletClient.account!.address,
      capabilities: agentDef.capabilities.map((c) => ({
        name: c.name,
        description: `${c.name} capability`,
        category: c.category,
      })),
      createdAt: now,
      updatedAt: now,
    },
  }

  // 1. Register agent atom
  console.log(`\n  Uploading ${agentDef.name} to IPFS...`)
  const atomResult = await createAgentAtom(config, registration, INITIAL_STAKE)
  console.log(`  Atom created: ${atomResult.atomId}`)
  console.log(`  IPFS (pinThing): ${atomResult.ipfsUri}`)
  if (atomResult.fullRegistrationUri) {
    console.log(`  IPFS (full reg): ${atomResult.fullRegistrationUri}`)
  }
  console.log(`  Tx: ${atomResult.txHash}`)

  // 2. Create capability triples
  const deployedCaps: Array<{ name: string; tripleId: Hex }> = []

  for (const cap of agentDef.capabilities) {
    console.log(`  Adding capability: ${cap.name}...`)
    const tripleResult = await createCapabilityTriple(
      config,
      atomResult.atomId,
      cap.name,
    )
    console.log(`  Triple: ${tripleResult.tripleId}`)
    deployedCaps.push({ name: cap.name, tripleId: tripleResult.tripleId })
  }

  return {
    name: agentDef.name,
    atomId: atomResult.atomId,
    ipfsUri: atomResult.ipfsUri,
    txHash: atomResult.txHash,
    capabilities: deployedCaps,
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('  AgentID — Deploy 10 Test Agents to Intuition Testnet')
  console.log('='.repeat(60))

  const env = loadEnvConfig()

  if (!env.privateKey) {
    console.error('\nError: PRIVATE_KEY not set in .env')
    console.error('Create apps/cli/.env with:')
    console.error('  PRIVATE_KEY=0x...')
    console.error('  PINATA_API_JWT=...')
    process.exit(1)
  }

  if (!env.pinataApiJwt) {
    console.error('\nError: PINATA_API_JWT not set in .env')
    process.exit(1)
  }

  const config = createWriteConfig(env.privateKey, env.pinataApiJwt, env.network)
  const walletAddress = config.walletClient.account!.address

  console.log(`\nNetwork:  ${env.network}`)
  console.log(`Wallet:   ${walletAddress}`)
  console.log(`Agents:   ${AGENTS.length}`)
  console.log(`Stake:    0.001 ETH each`)
  console.log()

  const deployed: DeployedAgent[] = []
  const failed: Array<{ name: string; error: string }> = []

  for (let i = 0; i < AGENTS.length; i++) {
    const agentDef = AGENTS[i]
    console.log(`\n[${ i + 1}/${AGENTS.length}] Deploying ${agentDef.name}...`)

    try {
      const result = await deployAgent(config, agentDef)
      deployed.push(result)
      console.log(`  Done!`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  FAILED: ${msg}`)
      failed.push({ name: agentDef.name, error: msg })
    }
  }

  // ── Summary ──
  console.log('\n' + '='.repeat(60))
  console.log('  DEPLOYMENT SUMMARY')
  console.log('='.repeat(60))
  console.log(`\nSucceeded: ${deployed.length}/${AGENTS.length}`)
  if (failed.length > 0) {
    console.log(`Failed:    ${failed.length}/${AGENTS.length}`)
  }

  if (deployed.length > 0) {
    console.log('\n  Deployed Agents:')
    console.log('  ' + '-'.repeat(56))
    for (const agent of deployed) {
      console.log(`  ${agent.name}`)
      console.log(`    Atom ID:  ${agent.atomId}`)
      console.log(`    IPFS:     ${agent.ipfsUri}`)
      console.log(`    Caps:     ${agent.capabilities.map((c) => c.name).join(', ')}`)
    }
  }

  if (failed.length > 0) {
    console.log('\n  Failed Agents:')
    for (const f of failed) {
      console.log(`  ${f.name}: ${f.error}`)
    }
  }

  // Output JSON for verification
  const outputPath = 'deployed-agents.json'
  const fs = await import('fs')
  const serializable = deployed.map((d) => ({
    ...d,
    atomId: d.atomId,
    txHash: d.txHash,
    capabilities: d.capabilities.map((c) => ({
      name: c.name,
      tripleId: c.tripleId,
    })),
  }))
  fs.writeFileSync(outputPath, JSON.stringify(serializable, null, 2))
  console.log(`\nDeployment data saved to: ${outputPath}`)

  console.log('\nVerification commands:')
  if (deployed.length > 0) {
    console.log(`  node dist/index.js search "agent"`)
    console.log(`  node dist/index.js info ${deployed[0].name}`)
  }
}

main().catch((err) => {
  console.error('\nFatal error:', err)
  process.exit(1)
})
