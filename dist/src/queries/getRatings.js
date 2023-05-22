"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRatings = void 0;
const prismaClient_1 = require("../prismaClient");
const getRatings = async (user) => {
    const ratings = await prismaClient_1.prisma.rating.findMany({
        where: { userId: user.id },
    });
    return ratings;
};
exports.getRatings = getRatings;
//# sourceMappingURL=getRatings.js.map