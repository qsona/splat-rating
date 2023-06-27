require('dotenv').config()

import { SlashCommandBuilder } from 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'
import { SPLAT_RULES_NAME_MAP } from './src/rules'

const token = process.env.DISCORD_TOKEN
const guildId = process.env.GUILD_ID
const clientId = process.env.DISCORD_CLIENT_ID
if (!token || !guildId || !clientId) {
  throw new Error('Some environment variables are not set')
}

const commands = [
  new SlashCommandBuilder().setName('sr-ping').setDescription('Replies with pong!'),
  // new SlashCommandBuilder().setName('sr-help').setDescription('ヘルプを表示します'),
  new SlashCommandBuilder()
    .setName('sr-register')
    .addStringOption((option) =>
      option
        .setName('rule')
        .setDescription('ルール種別')
        .addChoices(...SPLAT_RULES_NAME_MAP.map(({ code, name }) => ({ name, value: code })))
        .setRequired(true)
    )
    .addNumberOption((option) => option.setName('gachipower').setMaxValue(3200).setMinValue(600).setRequired(true).setDescription('推定ガチパワー'))
    .setDescription('レーティング登録'),
  new SlashCommandBuilder()
    .setName('sr-newgame')
    .setDescription('ゲームを立てて参加者を募集する')
    .addStringOption((option) =>
      option
        .setName('rule')
        .setDescription('ルール種別')
        .addChoices(...SPLAT_RULES_NAME_MAP.map(({ code, name }) => ({ name, value: code })))
        .setRequired(true)
    ),
  // new SlashCommandBuilder().setName('sr-join').setDescription('ゲームに参加する'),
  // new SlashCommandBuilder().setName('sr-leave').setDescription('ゲームから抜ける'),
  new SlashCommandBuilder().setName('sr-break').setDescription('ゲームを解散する'),
  // new SlashCommandBuilder().setName('sr-match').setDescription('自動チーム分けを行う'),
  new SlashCommandBuilder().setName('sr-display').setDescription('現在のゲーム情報を表示する'),
  // new SlashCommandBuilder()
  //   .setName('sr-report')
  //   .setDescription('結果を報告/キャンセルする')
  //   .addStringOption((option) =>
  //     option
  //       .setName('result')
  //       .setDescription('勝敗')
  //       .addChoices({ name: 'win', value: 'win' }, { name: 'lose', value: 'lose' }, { name: 'cancel', value: 'cancel' })
  //       .setRequired(true)
  //   ),
  // new SlashCommandBuilder()
  //   .setName('sr-make-register')
  //   .addMentionableOption((option) => option.setName('user').setDescription('対象ユーザ').setRequired(true))
  //   .addStringOption((option) =>
  //     option
  //       .setName('rule')
  //       .setDescription('ルール種別')
  //       .addChoices(...SPLAT_RULES_NAME_MAP.map(({ code, name }) => ({ name, value: code })))
  //       .setRequired(true)
  //   )
  //   .addNumberOption((option) => option.setName('gachipower').setMaxValue(3200).setMinValue(600).setRequired(true).setDescription('推定ガチパワー'))
  //   .setDescription('他ユーザーをレーティング登録させる'),
  // new SlashCommandBuilder()
  //   .setName('sr-make-join')
  //   .addMentionableOption((option) => option.setName('user').setDescription('対象ユーザ').setRequired(true))
  //   .setDescription('他ユーザーをゲームに参加させる'),
  new SlashCommandBuilder()
    .setName('sr-make-leave')
    .addMentionableOption((option) => option.setName('user').setDescription('対象ユーザ').setRequired(true))
    .setDescription('他ユーザーをゲームから抜けさせる'),
  new SlashCommandBuilder()
    .setName('sr-separate')
    .addMentionableOption((option) => option.setName('user1').setDescription('対象ユーザ1').setRequired(true))
    .addMentionableOption((option) => option.setName('user2').setDescription('対象ユーザ2').setRequired(true))
    .setDescription('ユーザーのチーム分離の設定をする'),
  new SlashCommandBuilder().setName('sr-separation-reset').setDescription('ユーザーのチーム分離の設定を解除する'),
].map((command) => command.toJSON())

const rest = new REST({ version: '9' }).setToken(token)

rest
  // .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error)
