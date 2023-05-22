"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetJoinedUsersSeparation = void 0;
const prismaClient_1 = require("../prismaClient");
const resetJoinedUsersSeparation = async (discordChannelId) => {
    const room = await prismaClient_1.prisma.room.findUnique({
        where: { discordChannelId },
    });
    if (!room) {
        return { error: 'ROOM_DOES_NOT_EXIST' };
    }
    await prismaClient_1.prisma.joinedUsersSeparation.deleteMany({
        where: {
            roomId: room.id,
        },
    });
    return {};
};
exports.resetJoinedUsersSeparation = resetJoinedUsersSeparation;
//# sourceMappingURL=resetJoinedUsersSeparation.js.map