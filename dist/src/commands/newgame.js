"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const buttons_1 = require("./helpers/buttons");
const createRoom_1 = require("../operations/createRoom");
const rules_1 = require("../rules");
const inspectors_1 = require("../inspectors");
const handler = {
    commandName: 'sr-newgame',
    execute: async (interaction) => {
        const { channelId, guildId } = interaction;
        const { id, username } = interaction.user;
        (0, assert_1.default)(guildId);
        const rule = interaction.options.getString('rule');
        const ruleName = (0, rules_1.getRuleName)(rule);
        const result = await (0, createRoom_1.createRoom)(id, channelId, rule, guildId);
        if (result === 'ROOM_ALREADY_EXISTS') {
            await interaction.reply('すでにこのチャンネルに募集中のゲームがあります。');
            return;
        }
        if (result === 'RATING_DOES_NOT_EXIST') {
            await interaction.reply(`${username} さんは ${ruleName} のレーティング登録がまだです。/sr-register コマンドで登録してください。`);
            return;
        }
        await interaction.reply({
            content: `ゲーム募集 ${ruleName} ホスト: ${username} (${(0, inspectors_1.inspectRating)(result.rating.mu)}) @7~9`,
            components: [(0, buttons_1.createJoinButton)()],
        });
    },
};
exports.default = handler;
//# sourceMappingURL=newgame.js.map