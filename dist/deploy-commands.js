"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const discord_js_1 = require("discord.js");
const rest_1 = require("@discordjs/rest");
const v10_1 = require("discord-api-types/v10");
const rules_1 = require("./src/rules");
const token = process.env.DISCORD_TOKEN;
const guildId = process.env.GUILD_ID;
const clientId = process.env.DISCORD_CLIENT_ID;
if (!token || !guildId || !clientId) {
    throw new Error('Some environment variables are not set');
}
const commands = [
    new discord_js_1.SlashCommandBuilder().setName('sr-ping').setDescription('Replies with pong!'),
    new discord_js_1.SlashCommandBuilder().setName('sr-help').setDescription('ヘルプを表示します'),
    new discord_js_1.SlashCommandBuilder()
        .setName('sr-register')
        .addStringOption((option) => option
        .setName('rule')
        .setDescription('ルール種別')
        .addChoices(...rules_1.SPLAT_RULES_NAME_MAP.map(({ code, name }) => ({ name, value: code })))
        .setRequired(true))
        .addNumberOption((option) => option.setName('gachipower').setMaxValue(3200).setMinValue(600).setRequired(true).setDescription('推定ガチパワー'))
        .setDescription('レーティング登録'),
    new discord_js_1.SlashCommandBuilder()
        .setName('sr-newgame')
        .setDescription('ゲームを立てて参加者を募集する')
        .addStringOption((option) => option
        .setName('rule')
        .setDescription('ルール種別')
        .addChoices(...rules_1.SPLAT_RULES_NAME_MAP.map(({ code, name }) => ({ name, value: code })))
        .setRequired(true)),
    new discord_js_1.SlashCommandBuilder().setName('sr-join').setDescription('ゲームに参加する'),
    new discord_js_1.SlashCommandBuilder().setName('sr-leave').setDescription('ゲームから抜ける'),
    new discord_js_1.SlashCommandBuilder().setName('sr-break').setDescription('ゲームを解散する'),
    new discord_js_1.SlashCommandBuilder().setName('sr-match').setDescription('自動チーム分けを行う'),
    new discord_js_1.SlashCommandBuilder().setName('sr-display').setDescription('現在のゲーム情報を表示する'),
    new discord_js_1.SlashCommandBuilder()
        .setName('sr-report')
        .setDescription('結果を報告/キャンセルする')
        .addStringOption((option) => option
        .setName('result')
        .setDescription('勝敗')
        .addChoices({ name: 'win', value: 'win' }, { name: 'lose', value: 'lose' }, { name: 'cancel', value: 'cancel' })
        .setRequired(true)),
    new discord_js_1.SlashCommandBuilder()
        .setName('sr-make-register')
        .addMentionableOption((option) => option.setName('user').setDescription('対象ユーザ').setRequired(true))
        .addStringOption((option) => option
        .setName('rule')
        .setDescription('ルール種別')
        .addChoices(...rules_1.SPLAT_RULES_NAME_MAP.map(({ code, name }) => ({ name, value: code })))
        .setRequired(true))
        .addNumberOption((option) => option.setName('gachipower').setMaxValue(3200).setMinValue(600).setRequired(true).setDescription('推定ガチパワー'))
        .setDescription('他ユーザーをレーティング登録させる'),
    new discord_js_1.SlashCommandBuilder()
        .setName('sr-make-join')
        .addMentionableOption((option) => option.setName('user').setDescription('対象ユーザ').setRequired(true))
        .setDescription('他ユーザーをゲームに参加させる'),
    new discord_js_1.SlashCommandBuilder()
        .setName('sr-make-leave')
        .addMentionableOption((option) => option.setName('user').setDescription('対象ユーザ').setRequired(true))
        .setDescription('他ユーザーをゲームから抜けさせる'),
    new discord_js_1.SlashCommandBuilder()
        .setName('sr-separate')
        .addMentionableOption((option) => option.setName('user1').setDescription('対象ユーザ1').setRequired(true))
        .addMentionableOption((option) => option.setName('user2').setDescription('対象ユーザ2').setRequired(true))
        .setDescription('ユーザーのチーム分離の設定をする'),
    new discord_js_1.SlashCommandBuilder().setName('sr-separation-reset').setDescription('ユーザーのチーム分離の設定を解除する'),
].map((command) => command.toJSON());
const rest = new rest_1.REST({ version: '9' }).setToken(token);
rest
    // .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .put(v10_1.Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
//# sourceMappingURL=deploy-commands.js.map