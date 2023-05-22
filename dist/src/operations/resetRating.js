"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetRating = exports.resetSigmaAllInGuild = void 0;
const prismaClient_1 = require("../prismaClient");
const registerUserAndRating_1 = require("./registerUserAndRating");
const season_1 = require("../models/season");
const resetSigmaAllInGuild = async (guildId) => {
    const season = await (0, season_1.getCurrentSeason)(guildId);
    await prismaClient_1.prisma.$transaction(async (prisma) => {
        const ratings = await prisma.rating.findMany({ where: { guildId } });
        await prisma.rating.updateMany({
            where: { id: { in: ratings.map((r) => r.id) } },
            data: { sigma: registerUserAndRating_1.INITIAL_SIGMA },
        });
        await prisma.ratingChangedHistory.createMany({
            data: ratings.map((rating) => {
                return {
                    ratingId: rating.id,
                    muBefore: rating.mu,
                    muAfter: rating.mu,
                    sigmaBefore: rating.sigma,
                    sigmaAfter: registerUserAndRating_1.INITIAL_SIGMA,
                    seasonId: season?.id,
                    reason: 'RESET_SIGMA_ALL_IN_GUILD',
                };
            }),
        });
    });
};
exports.resetSigmaAllInGuild = resetSigmaAllInGuild;
const resetRating = async (ratingId, mu) => {
    const rating = await prismaClient_1.prisma.rating.findUnique({ where: { id: ratingId } });
    if (!rating) {
        return 'RATING_NOT_FOUND';
    }
    const season = await (0, season_1.getCurrentSeason)(rating.guildId);
    await prismaClient_1.prisma.$transaction(async (prisma) => {
        await prisma.rating.update({
            where: { id: rating.id },
            data: { mu, sigma: registerUserAndRating_1.INITIAL_SIGMA },
        });
        await prisma.ratingChangedHistory.create({
            data: {
                ratingId: rating.id,
                muBefore: rating.mu,
                muAfter: mu,
                sigmaBefore: rating.sigma,
                sigmaAfter: registerUserAndRating_1.INITIAL_SIGMA,
                seasonId: season?.id,
                reason: 'RESET_RATING',
            },
        });
    });
};
exports.resetRating = resetRating;
//# sourceMappingURL=resetRating.js.map