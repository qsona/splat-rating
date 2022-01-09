require('dotenv').config()

import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { SPLAT_RULES_NAME_MAP } from './src/rules'

const token = process.env.DISCORD_TOKEN
const guildId = process.env.GUILD_ID
const clientId = process.env.CLIENT_ID
if (!token || !guildId || !clientId) {
  throw new Error('Some environment variables are not set')
}

const commands = [
  new SlashCommandBuilder().setName('sr-ping').setDescription('Replies with pong!'),
  new SlashCommandBuilder()
    .setName('sr-register')
    .setDescription('レーティング登録')
    .addStringOption((option) =>
      option
        .setName('rule')
        .setDescription('ルール種別')
        .addChoices(SPLAT_RULES_NAME_MAP.map(({ code, name }) => [name, code]))
        .setRequired(true)
    )
    .addNumberOption((option) => option.setName('gachipower').setMaxValue(3200).setMinValue(600).setRequired(true).setDescription('推定ガチパワー'))
    .setDescription('ユーザー登録'),
  new SlashCommandBuilder()
    .setName('sr-newgame')
    .setDescription('ゲームを立てて参加者を募集する')
    .addStringOption((option) =>
      option
        .setName('rule')
        .setDescription('ルール種別')
        .addChoices(SPLAT_RULES_NAME_MAP.map(({ code, name }) => [name, code]))
        .setRequired(true)
    ),
  new SlashCommandBuilder().setName('sr-join').setDescription('ゲームに参加する'),
  new SlashCommandBuilder().setName('sr-leave').setDescription('ゲームから抜ける'),
  new SlashCommandBuilder().setName('sr-break').setDescription('ゲームを解散する'),
  new SlashCommandBuilder().setName('sr-match').setDescription('自動チーム分けを行う'),
  new SlashCommandBuilder()
    .setName('sr-report')
    .setDescription('結果を報告/キャンセルする')
    .addStringOption((option) =>
      option
        .setName('result')
        .setDescription('勝敗')
        .addChoices([
          ['win', 'win'],
          ['lose', 'lose'],
          ['cancel', 'cancel'],
        ])
        .setRequired(true)
    ),
].map((command) => command.toJSON())

const rest = new REST({ version: '9' }).setToken(token)

rest
  // .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error)
