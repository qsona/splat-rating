// Require the necessary discord.js classes
import { Client, Intents, CommandInteraction } from 'discord.js'

import registerHandler from './src/commands/register'
import newgameHandler from './src/commands/newgame'
import joinHandler from './src/commands/join'
import leaveHandler from './src/commands/leave'
import breakHandler from './src/commands/break'
import matchHandler from './src/commands/match'
import resultHandler from './src/commands/report'
import mRegisterHandler from './src/commands/m-register'
import mJoinHandler from './src/commands/m-join'

require('dotenv').config()

const token = process.env.DISCORD_TOKEN

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!')
})

// Login to Discord with your client's token
if (token) {
  client.login(token)
} else {
  console.log('DISCORD_TOKEN is not set')
}

export interface CommandHandler {
  commandName: string
  execute: (interaction: CommandInteraction) => Promise<void>
}

const handlers = new Map<string, CommandHandler>()
const pingHandler: CommandHandler = {
  commandName: 'sr-ping',
  execute: async (interaction) => {
    await interaction.reply('Pong!')
  },
}

;[registerHandler, newgameHandler, joinHandler, leaveHandler, matchHandler, breakHandler, resultHandler, mRegisterHandler, mJoinHandler, pingHandler].forEach(
  (handler) => {
    handlers.set(handler.commandName, handler)
  }
)

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return
  }

  const { commandName } = interaction
  console.log(commandName)
  console.log(interaction.user)

  const handler = handlers.get(commandName)
  if (handler) {
    handler.execute(interaction)
  }
})
