import { input, confirm } from '@inquirer/prompts'
import chalk from 'chalk'
import { parseEther, type Hex } from 'viem'
import { stakeOnAgent } from '@agentid/sdk'
import { createWriteConfig, loadEnvConfig } from '../client.js'
import {
  success,
  error,
  labelValue,
  header,
  truncHex,
} from '../utils/display.js'

export async function stakeCommand(atomId: string): Promise<void> {
  const env = loadEnvConfig()

  if (!env.privateKey) {
    console.log(error('PRIVATE_KEY not set in .env file.'))
    return
  }

  if (!atomId.startsWith('0x')) {
    console.log(error('Invalid atom ID. Must start with 0x.'))
    return
  }

  console.log(header('💰', `Stake on agent: ${truncHex(atomId)}`))
  console.log()

  const amountStr = await input({
    message: 'Amount to stake (ETH):',
    validate: (v) => {
      const n = parseFloat(v)
      return (!isNaN(n) && n > 0) || 'Must be a positive number'
    },
  })

  const confirmed = await confirm({
    message: `Confirm staking ${amountStr} ETH on ${truncHex(atomId)}?`,
    default: true,
  })

  if (!confirmed) {
    console.log(chalk.dim('\nStaking cancelled.'))
    return
  }

  const amount = parseEther(amountStr)

  try {
    const config = createWriteConfig(
      env.privateKey,
      env.pinataApiJwt || '',
      env.network,
    )

    console.log()
    console.log(chalk.dim(`💰 Staking ${amountStr} ETH on ${truncHex(atomId)}...`))

    const result = await stakeOnAgent(config, atomId as Hex, amount)

    console.log()
    console.log(labelValue('Transaction', truncHex(result.txHash)))
    console.log(labelValue('Shares received', result.shares.toString()))
    console.log()
    console.log(success('Staked successfully!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)

    if (msg.includes('insufficient') || msg.includes('balance')) {
      console.log(error('Insufficient balance.'))
      console.log('   Fund your wallet on Intuition Testnet (Chain 13579)')
      console.log('   Faucet: https://faucet.intuition.systems')
    } else {
      console.log(error(`Staking failed: ${msg}`))
    }
  }
}
