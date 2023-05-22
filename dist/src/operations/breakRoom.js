"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.breakRoom = void 0;
const prismaClient_1 = require("../prismaClient");
const breakRoom = async (userId, discordChannelId) => {
    // TODO: acquire lock
    const room = await prismaClient_1.prisma.room.findUnique({
        where: { discordChannelId },
    });
    if (!room) {
        return 'ROOM_DOES_NOT_EXIST';
    }
    // TODO: who can break room?
    const matchingExists = !!(await prismaClient_1.prisma.matching.count({
        where: {
            roomId: room.id,
        },
    }));
    if (matchingExists) {
        return 'MATCHING_EXISTS';
    }
    await prismaClient_1.prisma.$transaction(async (prisma) => {
        await prisma.joinedUsersSeparation.deleteMany({ where: { roomId: room.id } });
        await prisma.joinedUser.deleteMany({ where: { roomId: room.id } });
        await prisma.room.delete({ where: { id: room.id } });
    });
    return { success: true };
};
exports.breakRoom = breakRoom;
//# sourceMappingURL=breakRoom.js.map