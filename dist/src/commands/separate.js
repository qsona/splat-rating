"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mentionable_1 = require("./helpers/mentionable");
const createJoinedUsersSeparation_1 = require("../operations/createJoinedUsersSeparation");
const assert_never_1 = __importDefault(require("assert-never"));
const handler = {
    commandName: 'sr-separate',
    execute: async (interaction) => {
        const { channelId } = interaction;
        const mentionable1 = interaction.options.getMentionable('user1');
        const user1 = (0, mentionable_1.getUserFromMentionable)(mentionable1);
        const mentionable2 = interaction.options.getMentionable('user2');
        const user2 = (0, mentionable_1.getUserFromMentionable)(mentionable2);
        if (!user1 || !user2) {
            console.log('Error mentionable:', mentionable1, mentionable2);
            await interaction.reply('user にはユーザを指定してください');
            return;
        }
        const result = await (0, createJoinedUsersSeparation_1.createJoinedUsersSeparation)([user1.id, user2.id], channelId);
        if (result.error) {
            let message;
            switch (result.error) {
                case 'SAME_USER_SPECIFIED':
                    message = '同じユーザが指定されています。';
                    break;
                case 'ROOM_DOES_NOT_EXIST':
                    message = 'このチャンネルに募集中のゲームは現在ありません。';
                    break;
                case 'USER_NOT_JOINED':
                    message = 'ユーザは募集中のゲームに参加していません。';
                    break;
                case 'SEPARATION_CONFLICTED':
                    message = 'すでに登録されている Separation と衝突しています。解消したいときは /sr-reset-separation を利用してください。';
                    break;
                default:
                    (0, assert_never_1.default)(result);
            }
            await interaction.reply(message);
            return;
        }
        const messages = [
            `Separation を作成しました。 ${user1.username} と ${user2.username} は必ず別のチームになります。`,
            '(解消したいときは /sr-separation-reset を利用してください。)',
        ];
        await interaction.reply(messages.join('\n'));
    },
};
exports.default = handler;
//# sourceMappingURL=separate.js.map