require('dotenv').config()

import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { SPLAT_RULES_NAME_MAP } from './src/rules'

const token = process.env.DISCORD_TOKEN
const guildId = process.env.GUILD_ID
const clientId = process.env.DISCORD_CLIENT_ID
if (!token || !guildId || !clientId) {
  throw new Error('Some environment variables are not set')
}

const commands: SlashCommandBuilder[] = [
  // new SlashCommandBuilder()
  //   .setName('sr-m-register')
  //   .setDescription('レーティング登録')
  //   .addMentionableOption((option) => option.setName('user').setDescription('対象ユーザ').setRequired(true))
  //   .addStringOption((option) =>
  //     option
  //       .setName('rule')
  //       .setDescription('ルール種別')
  //       .addChoices(SPLAT_RULES_NAME_MAP.map(({ code, name }) => [name, code]))
  //       .setRequired(true)
  //   )
  //   .addNumberOption((option) => option.setName('gachipower').setMaxValue(3200).setMinValue(600).setRequired(true).setDescription('推定ガチパワー'))
  //   .setDescription('ユーザー登録'),
  // new SlashCommandBuilder()
  //   .setName('sr-m-join')
  //   .addMentionableOption((option) => option.setName('user').setDescription('対象ユーザ').setRequired(true))
  //   .setDescription('ゲームに参加する'),
] // .map((command) => command.toJSON())

const rest = new REST({ version: '9' }).setToken(token)

rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error)
