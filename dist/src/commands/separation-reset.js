"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_never_1 = __importDefault(require("assert-never"));
const resetJoinedUsersSeparation_1 = require("../operations/resetJoinedUsersSeparation");
const handler = {
    commandName: 'sr-separation-reset',
    execute: async (interaction) => {
        const { channelId } = interaction;
        const result = await (0, resetJoinedUsersSeparation_1.resetJoinedUsersSeparation)(channelId);
        if (result.error) {
            switch (result.error) {
                case 'ROOM_DOES_NOT_EXIST':
                    await interaction.reply('このチャンネルに募集中のゲームは現在ありません。');
                    return;
                default:
                    (0, assert_never_1.default)(result);
            }
        }
        await interaction.reply('ユーザのチーム分離の設定をリセットしました。');
    },
};
exports.default = handler;
//# sourceMappingURL=separation-reset.js.map