"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPowerGraphData = void 0;
const prismaClient_1 = require("../prismaClient");
const rules_1 = require("../../src/rules");
const graphData_1 = require("../../src/models/graphData");
const getPowerGraphData = async (user) => {
    const gameResultRatings = await prismaClient_1.prisma.gameResultRating.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
        include: { gameResult: true },
    });
    let powerGraphData = new Map();
    rules_1.SPLAT_RULES_NAME_MAP.forEach(function (rule) {
        // do clone without npm clone module
        powerGraphData.set(rule.code, JSON.parse(JSON.stringify(graphData_1.Template)));
    });
    if (gameResultRatings) {
        gameResultRatings.forEach(function (gameResultRating) {
            let templateData = powerGraphData.get(gameResultRating.gameResult.rule);
            const formattedCreatedAt = gameResultRating.createdAt.getMonth() +
                1 +
                '/' +
                gameResultRating.createdAt.getDate() +
                ' ' +
                ('0' + gameResultRating.createdAt.getHours()).slice(-2) +
                ':' +
                ('0' + gameResultRating.createdAt.getMinutes()).slice(-2);
            templateData.data.labels.push(formattedCreatedAt);
            templateData.data.datasets[0].data.push(Math.floor(gameResultRating.muAfter));
        });
    }
    return powerGraphData;
};
exports.getPowerGraphData = getPowerGraphData;
//# sourceMappingURL=getPowerGraphData.js.map