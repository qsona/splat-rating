"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchButtonHandler = void 0;
const assert_1 = __importDefault(require("assert"));
const prismaClient_1 = require("../prismaClient");
const createMatching_1 = require("../operations/createMatching");
const inspectors_1 = require("../inspectors");
const buttons_1 = require("./helpers/buttons");
const matchExecute = async (interaction) => {
    const { id } = interaction.user;
    const { channelId } = interaction;
    const result = await (0, createMatching_1.createMatching)(id, channelId);
    if (result === 'ROOM_DOES_NOT_EXIST') {
        await interaction.reply('このチャンネルに募集中のゲームは現在ありません。');
        return;
    }
    if (result === 'MATCHING_EXISTS') {
        await interaction.reply('すでにマッチングが存在します。ホストは `/sr-report` コマンドで結果を報告してください。');
        return;
    }
    if (result === 'JOINED_USERS_NOT_ENOUGH') {
        await interaction.reply(`参加人数が足りません。`);
        return;
    }
    const { matching, watchingUserIds } = result;
    const messages = [await inspectTeamsUsers(matching.teamsRatingIds)];
    if (watchingUserIds.length > 0) {
        const usernames = (await prismaClient_1.prisma.user.findMany({ where: { id: { in: watchingUserIds } }, select: { name: true } })).map((u) => u.name);
        messages.push(`観戦: ${usernames.join(' ')}`);
    }
    await interaction.reply({ content: messages.join('\n'), components: [(0, buttons_1.createWinButton)(), (0, buttons_1.createLoseButton)(), (0, buttons_1.createCancelButton)()] });
};
const handler = {
    commandName: 'sr-match',
    execute: matchExecute,
};
const inspectTeamsUsers = async (teamsRatingIds) => {
    const teamsUsers = await getTeamsUsers(teamsRatingIds);
    const [alphaTeamUsers, bravoTeamUsers] = teamsUsers.map((tus) => tus.map((tu) => ({ mu: tu.mu, username: tu.user.name })));
    return `アルファチーム: ${(0, inspectors_1.inspectTeamUsers)(alphaTeamUsers)}\nブラボーチーム: ${(0, inspectors_1.inspectTeamUsers)(bravoTeamUsers)}`;
};
const getTeamsUsers = async (teamsRatingIds) => {
    const ratingsWithUser = await prismaClient_1.prisma.rating.findMany({
        where: {
            id: { in: teamsRatingIds.flatMap((ids) => ids) },
        },
        include: { user: { select: { name: true } } },
    });
    return teamsRatingIds.map((teamRatingIds) => teamRatingIds.map((ratingId) => {
        const ratingWithUser = ratingsWithUser.find((ru) => ru.id === ratingId);
        (0, assert_1.default)(ratingWithUser, `Rating not found. id: ${ratingId}`);
        return ratingWithUser;
    }));
};
exports.default = handler;
exports.matchButtonHandler = {
    customId: 'button-match',
    execute: matchExecute,
};
//# sourceMappingURL=match.js.map