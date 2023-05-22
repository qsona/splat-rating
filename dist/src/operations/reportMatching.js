"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportMatching = void 0;
const aigle_1 = __importDefault(require("aigle"));
const openskill_1 = require("openskill");
const prismaClient_1 = require("../prismaClient");
const BETA = 200;
const reportMatching = async (userId, discordChannelId, isAlphaWin) => {
    const room = await prismaClient_1.prisma.room.findUnique({
        where: { discordChannelId },
    });
    if (!room) {
        return 'ROOM_DOES_NOT_EXIST';
    }
    const matching = await prismaClient_1.prisma.matching.findUnique({ where: { roomId: room.id } });
    if (!matching) {
        return 'MATCHING_DOES_NOT_EXIST';
    }
    if (room.creatorUserId !== userId) {
        return 'USER_IS_NOT_CREATOR';
    }
    const { seasonId } = matching;
    const teamsRatingIds = matching.teamsRatingIds;
    return await prismaClient_1.prisma.$transaction(async (prisma) => {
        const teamsRatings = await aigle_1.default.map(teamsRatingIds, async (teamRatingIds) => {
            const teamRatings = await prisma.rating.findMany({
                where: { id: { in: teamRatingIds } },
            });
            return teamRatingIds.map((teamRatingId) => {
                const rating = teamRatings.find((r) => r.id === teamRatingId);
                if (!rating) {
                    throw new Error(`rating not found. id: ${teamRatingId}`);
                }
                return rating;
            });
        });
        const sortedTeamsRatings = isAlphaWin ? [teamsRatings[0], teamsRatings[1]] : [teamsRatings[1], teamsRatings[0]];
        const newTeamsRatings = (0, openskill_1.rate)(sortedTeamsRatings, { beta: BETA });
        console.log('win', newTeamsRatings[0]);
        console.log('lose', newTeamsRatings[1]);
        const [winnerTeamRatings, loserTeamRatings] = await aigle_1.default.map(sortedTeamsRatings, async (teamRatings, teamIndex) => {
            const isWinner = teamIndex === 0;
            return await aigle_1.default.map(teamRatings, async (rating, ratingIndex) => {
                const newRating = newTeamsRatings[teamIndex][ratingIndex];
                const updateData = {
                    mu: newRating.mu,
                    sigma: newRating.sigma,
                };
                const winLoseCountCreateData = { winCount: isWinner ? 1 : 0, loseCount: isWinner ? 0 : 1 };
                const winLoseCountUpdateData = isWinner ? { winCount: { increment: 1 } } : { loseCount: { increment: 1 } };
                await prisma.rating.update({
                    where: {
                        id: rating.id,
                    },
                    data: { ...updateData, ...winLoseCountUpdateData },
                });
                if (seasonId) {
                    const rankPoint = updateData.mu - 3 * updateData.sigma;
                    const seasonUpdateData = {
                        ...updateData,
                        rankPoint,
                    };
                    await prisma.seasonRecord.upsert({
                        where: { ratingId_seasonId: { ratingId: rating.id, seasonId } },
                        update: { ...seasonUpdateData, ...winLoseCountUpdateData },
                        create: {
                            seasonId,
                            ratingId: rating.id,
                            ...seasonUpdateData,
                            ...winLoseCountCreateData,
                        },
                    });
                }
                return {
                    ratingId: rating.id,
                    userId: rating.userId,
                    before: {
                        mu: rating.mu,
                        sigma: rating.sigma,
                    },
                    after: {
                        mu: newRating.mu,
                        sigma: newRating.sigma,
                    },
                };
            });
        });
        const gameResult = await prisma.gameResult.create({
            data: {
                beta: BETA,
                rule: room.rule,
                winnerTeamRatings,
                loserTeamRatings,
                seasonId,
            },
        });
        await prisma.gameResultRating.createMany({
            data: [
                ...winnerTeamRatings.map((r) => {
                    return {
                        ratingId: r.ratingId,
                        muBefore: r.before.mu,
                        sigmaBefore: r.before.sigma,
                        muAfter: r.after.mu,
                        sigmaAfter: r.after.sigma,
                        isWinner: true,
                        userId: r.userId,
                        gameResultId: gameResult.id,
                    };
                }),
                ...loserTeamRatings.map((r) => {
                    return {
                        ratingId: r.ratingId,
                        muBefore: r.before.mu,
                        sigmaBefore: r.before.sigma,
                        muAfter: r.after.mu,
                        sigmaAfter: r.after.sigma,
                        isWinner: false,
                        userId: r.userId,
                        gameResultId: gameResult.id,
                    };
                }),
            ],
        });
        await prisma.matching.delete({ where: { id: matching.id } });
        return { gameResult };
    });
};
exports.reportMatching = reportMatching;
//# sourceMappingURL=reportMatching.js.map