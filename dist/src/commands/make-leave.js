"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const leaveRoom_1 = require("../operations/leaveRoom");
const mentionable_1 = require("./helpers/mentionable");
const handler = {
    commandName: 'sr-make-leave',
    execute: async (interaction) => {
        const { channelId } = interaction;
        const mentionable = interaction.options.getMentionable('user');
        const user = (0, mentionable_1.getUserFromMentionable)(mentionable);
        if (!user) {
            console.log('Error mentionable:', mentionable);
            await interaction.reply('user にはユーザを指定してください');
            return;
        }
        const { id, username } = user;
        const result = await (0, leaveRoom_1.leaveRoom)(id, channelId);
        if (result === 'ROOM_DOES_NOT_EXIST') {
            await interaction.reply('このチャンネルに募集中のゲームは現在ありません。');
            return;
        }
        if (result === 'CREATOR_CANNOT_LEAVE') {
            await interaction.reply('ホストは抜けられません。やめるときは `/sr-break` コマンドでゲームを解散してください。');
            return;
        }
        if (result === 'USER_NOT_JOINED') {
            await interaction.reply(`${username} はこのチャンネルのゲームに参加していません。`);
            return;
        }
        // TODO: commonize this logic with join.ts
        const remainMinUsersCount = Math.max(result.remainMinUsersCount, 0);
        await interaction.reply(`${username} さんがゲームから抜けました。\n@${remainMinUsersCount}~${result.remainMaxUsersCount}`);
    },
};
exports.default = handler;
//# sourceMappingURL=make-leave.js.map