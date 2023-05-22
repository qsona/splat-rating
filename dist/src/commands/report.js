"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportCancelButtonHandler = exports.reportLoseButtonHandler = exports.reportWinButtonHandler = void 0;
const assert_1 = __importDefault(require("assert"));
const prismaClient_1 = require("../prismaClient");
const inspectors_1 = require("../inspectors");
const reportMatching_1 = require("../operations/reportMatching");
const cancelMatching_1 = require("../operations/cancelMatching");
const buttons_1 = require("./helpers/buttons");
const reportExecute = async (result, interaction) => {
    const { channelId } = interaction;
    const { id, username } = interaction.user;
    if (result === 'cancel') {
        const cancelMatchingResult = await (0, cancelMatching_1.cancelMatching)(channelId);
        if (cancelMatchingResult === 'ROOM_DOES_NOT_EXIST') {
            await interaction.reply(`現在このチャンネルにゲームはありません。`);
            return;
        }
        if (cancelMatchingResult === 'MATCHING_DOES_NOT_EXIST') {
            await interaction.reply(`マッチングされていません。`);
            return;
        }
        await interaction.reply(`マッチングをキャンセルしました。`);
        return;
    }
    (0, assert_1.default)(result === 'win' || result === 'lose', result);
    const reportMatchingResult = await (0, reportMatching_1.reportMatching)(id, channelId, result === 'win');
    if (reportMatchingResult === 'ROOM_DOES_NOT_EXIST') {
        await interaction.reply(`現在このチャンネルにゲームはありません。`);
        return;
    }
    if (reportMatchingResult === 'MATCHING_DOES_NOT_EXIST') {
        await interaction.reply(`マッチングされていません。`);
        return;
    }
    if (reportMatchingResult === 'USER_IS_NOT_CREATOR') {
        await interaction.reply(`${username} はホストではありません。ホストが報告を行ってください。`);
        return;
    }
    const { gameResult } = reportMatchingResult;
    const winnerTeamsRatings = gameResult.winnerTeamRatings;
    const loserTeamsRatings = gameResult.loserTeamRatings;
    const ratingsWithUser = await prismaClient_1.prisma.rating.findMany({
        where: {
            id: { in: [winnerTeamsRatings, loserTeamsRatings].flatMap((rs) => rs.map((r) => r.ratingId)) },
        },
        include: { user: true },
    });
    const inspectTeamUsers = (teamRatings) => {
        return teamRatings
            .map((ratingResult) => {
            const ratingWithUser = ratingsWithUser.find((ru) => ru.id === ratingResult.ratingId);
            (0, assert_1.default)(ratingWithUser, `Rating not found. id: ${ratingResult.ratingId}`);
            return `${ratingWithUser.user.name} (${(0, inspectors_1.inspectRating)(ratingResult.before.mu)}=>${(0, inspectors_1.inspectRating)(ratingResult.after.mu)})`;
        })
            .join(' ');
    };
    const messages = [`Winners: ${inspectTeamUsers(winnerTeamsRatings)}`, `Losers: ${inspectTeamUsers(loserTeamsRatings)}`];
    await interaction.reply({ content: messages.join('\n'), components: [(0, buttons_1.createMatchButton)()] });
};
const handler = {
    commandName: 'sr-report',
    execute: async (interaction) => {
        const result = interaction.options.getString('result');
        return await reportExecute(result, interaction);
    },
};
exports.default = handler;
exports.reportWinButtonHandler = {
    customId: 'button-report-win',
    execute: (interaction) => reportExecute('win', interaction),
};
exports.reportLoseButtonHandler = {
    customId: 'button-report-lose',
    execute: (interaction) => reportExecute('lose', interaction),
};
exports.reportCancelButtonHandler = {
    customId: 'button-report-cancel',
    execute: (interaction) => reportExecute('cancel', interaction),
};
//# sourceMappingURL=report.js.map