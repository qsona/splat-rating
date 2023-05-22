"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../prismaClient");
const inspectors_1 = require("../inspectors");
const assert_1 = __importDefault(require("assert"));
const buttons_1 = require("./helpers/buttons");
const handler = {
    commandName: 'sr-display',
    execute: async (interaction) => {
        const { channelId } = interaction;
        const room = await prismaClient_1.prisma.room.findUnique({ where: { discordChannelId: channelId } });
        if (!room) {
            await interaction.reply('このチャンネルに募集中のゲームは現在ありません。');
            return;
        }
        const joinedUsers = await prismaClient_1.prisma.joinedUser.findMany({ where: { roomId: room.id }, include: { user: true } });
        const ratings = await prismaClient_1.prisma.rating.findMany({ where: { id: { in: joinedUsers.map((ju) => ju.ratingId) } } });
        // TODO: commonize logic
        const remainMinUsersCount = Math.max(8 - joinedUsers.length, 0);
        const remainMaxUsersCount = 10 - joinedUsers.length;
        const usersInfo = joinedUsers.map((ju) => {
            const name = ju.user.name;
            const rating = ratings.find((r) => r.id === ju.ratingId);
            (0, assert_1.default)(rating);
            return { rating, name };
        });
        const isJoinable = remainMaxUsersCount > 0;
        const messages = [
            isJoinable ? `ゲーム募集中@${remainMinUsersCount}~${remainMaxUsersCount}` : 'ゲーム中(満員)',
            usersInfo.map((u) => `${u.name} (${(0, inspectors_1.inspectRating)(u.rating.mu)})`).join(' '),
        ];
        const components = isJoinable ? [(0, buttons_1.createJoinButton)()] : [];
        await interaction.reply({ content: messages.join('\n'), components });
    },
};
exports.default = handler;
//# sourceMappingURL=display.js.map