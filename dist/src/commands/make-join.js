"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const joinRoom_1 = require("../operations/joinRoom");
const inspectors_1 = require("../inspectors");
const mentionable_1 = require("./helpers/mentionable");
const buttons_1 = require("./helpers/buttons");
const handler = {
    commandName: 'sr-make-join',
    execute: async (interaction) => {
        const { channelId, guildId } = interaction;
        (0, assert_1.default)(guildId);
        const mentionable = interaction.options.getMentionable('user');
        const user = (0, mentionable_1.getUserFromMentionable)(mentionable);
        if (!user) {
            console.log('Error mentionable:', mentionable);
            await interaction.reply('user にはユーザを指定してください');
            return;
        }
        const { id, username } = user;
        const result = await (0, joinRoom_1.joinRoom)(id, channelId, guildId);
        if (result.error === 'ROOM_DOES_NOT_EXIST') {
            await interaction.reply('このチャンネルに募集中のゲームは現在ありません。');
            return;
        }
        if (result.error === 'RATING_DOES_NOT_EXIST') {
            await interaction.reply(`${username} さんはレーティング登録がまだです。/sr-register コマンドで登録してください。`);
            return;
        }
        if (result.error === 'USER_ALREADY_JOINED') {
            await interaction.reply(`${username} さんはすでに参加しています。`);
            return;
        }
        if (result.error === 'TOO_MANY_JOINED_USERS') {
            await interaction.reply('このチャンネルのゲームは定員を超えています。');
            return;
        }
        const remainMinUsersCount = Math.max(result.remainMinUsersCount, 0);
        const { remainMaxUsersCount } = result;
        const message = `${username} さんがゲームに参加しました。 (${(0, inspectors_1.inspectRating)(result.rating.mu)})\n@${remainMinUsersCount}~${remainMaxUsersCount}`;
        const components = [];
        if (remainMinUsersCount === 0)
            components.push((0, buttons_1.createMatchButton)());
        if (remainMaxUsersCount !== 0)
            components.push((0, buttons_1.createJoinButton)());
        await interaction.reply({ content: message, components });
    },
};
exports.default = handler;
//# sourceMappingURL=make-join.js.map