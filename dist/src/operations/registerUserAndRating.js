"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserAndRating = exports.INITIAL_SIGMA = void 0;
const prismaClient_1 = require("../prismaClient");
exports.INITIAL_SIGMA = 200;
const registerUserAndRating = async (userId, username, guildId, rule, estimatedGachiPower) => {
    let isNewUser = true;
    let user = null;
    try {
        user = await prismaClient_1.prisma.user.create({
            data: {
                id: userId,
                name: username,
            },
        });
    }
    catch (e) {
        if (e.code === 'P2002') {
            // just user is already registered
            isNewUser = false;
        }
        else {
            throw e;
        }
    }
    let rating;
    try {
        rating = await prismaClient_1.prisma.rating.create({
            data: {
                guildId,
                mu: estimatedGachiPower,
                sigma: exports.INITIAL_SIGMA,
                user: { connect: { id: userId } },
                rule,
            },
        });
    }
    catch (e) {
        if (e.code === 'P2002') {
            return 'RATING_ALREADY_REGISTERED';
        }
        throw e;
    }
    if (isNewUser) {
        return {
            isNewUser: true,
            user: user,
            rating,
        };
    }
    else {
        return {
            isNewUser: false,
            rating,
        };
    }
};
exports.registerUserAndRating = registerUserAndRating;
//# sourceMappingURL=registerUserAndRating.js.map