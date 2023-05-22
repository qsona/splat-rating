"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const breakRoom_1 = require("../operations/breakRoom");
const handler = {
    commandName: 'sr-break',
    execute: async (interaction) => {
        const { channelId } = interaction;
        const { id, username } = interaction.user;
        const result = await (0, breakRoom_1.breakRoom)(id, channelId);
        if (result === 'ROOM_DOES_NOT_EXIST') {
            await interaction.reply('このチャンネルに募集中のゲームは現在ありません。');
            return;
        }
        if (result === 'MATCHING_EXISTS') {
            await interaction.reply('マッチングが存在しています。ホストは `/sr-report` コマンドで結果を報告してください。');
            return;
        }
        await interaction.reply('このチャンネルのゲームを解散しました。');
    },
};
exports.default = handler;
//# sourceMappingURL=break.js.map