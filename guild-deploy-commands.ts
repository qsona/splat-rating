require('dotenv').config()

import { SlashCommandBuilder } from 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'

const token = process.env.DISCORD_TOKEN
const guildId = process.env.GUILD_ID
const clientId = process.env.DISCORD_CLIENT_ID
if (!token || !guildId || !clientId) {
  throw new Error('Some environment variables are not set')
}

const commands = [
  new SlashCommandBuilder().setName('tks-recruit').setDescription('対抗戦味方募集'),
  new SlashCommandBuilder()
    .setName('tks-party')
    .addMentionableOption((option) => option.setName('user2').setDescription('対象ユーザ2').setRequired(true))
    .addMentionableOption((option) => option.setName('user3').setDescription('対象ユーザ3').setRequired(true))
    .addMentionableOption((option) => option.setName('user4').setDescription('対象ユーザ4').setRequired(true))
    .setDescription('パーティーを組む'),
].map((command) => command.toJSON())

const rest = new REST({ version: '9' }).setToken(token)

rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error)
