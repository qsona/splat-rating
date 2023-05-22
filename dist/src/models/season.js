"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentSeason = void 0;
const prismaClient_1 = require("../prismaClient");
const getCurrentSeason = async (guildId) => {
    const season = await prismaClient_1.prisma.season.findFirst({
        where: {
            guildId,
            startAt: { lte: new Date() },
        },
        orderBy: {
            startAt: 'desc',
        },
    });
    return season;
};
exports.getCurrentSeason = getCurrentSeason;
//# sourceMappingURL=season.js.map