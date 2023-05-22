"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelMatching = void 0;
const prismaClient_1 = require("../prismaClient");
const cancelMatching = async (discordChannelId) => {
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
    await prismaClient_1.prisma.matching.delete({
        where: { id: matching.id },
    });
    return { success: true };
};
exports.cancelMatching = cancelMatching;
//# sourceMappingURL=cancelMatching.js.map