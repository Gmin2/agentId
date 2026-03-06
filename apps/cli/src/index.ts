import 'dotenv/config'
import { Command } from 'commander'
import { registerCommand } from './commands/register.js'
import { capabilityAddCommand } from './commands/capability-add.js'
import { infoCommand } from './commands/info.js'
import { searchCommand } from './commands/search.js'
import { stakeCommand } from './commands/stake.js'

const program = new Command()

program
  .name('agentid')
  .description('AgentID — Decentralized Trust Registry for AI Agents')
  .version('0.1.0')

program
  .command('register')
  .description('Register a new AI agent on Intuition testnet')
  .action(registerCommand)

program
  .command('capability-add')
  .description('Add a capability to an existing agent')
  .argument('<atomId>', 'Agent atom ID (0x...)')
  .action(capabilityAddCommand)

program
  .command('info')
  .description('View agent details and trust score')
  .argument('<identifier>', 'Agent atom ID (0x...) or name')
  .action(infoCommand)

program
  .command('search')
  .description('Search agents by name')
  .argument('<query>', 'Search query')
  .option('-l, --limit <number>', 'Max results', '10')
  .action(searchCommand)

program
  .command('stake')
  .description("Stake on an agent's FOR vault")
  .argument('<atomId>', 'Agent atom ID (0x...)')
  .action(stakeCommand)

program.parse()
