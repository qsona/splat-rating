"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveRoom = void 0;
const prismaClient_1 = require("../prismaClient");
const leaveRoom = async (userId, discordChannelId) => {
    // TODO: acquire lock
    const room = await prismaClient_1.prisma.room.findUnique({
        where: { discordChannelId },
    });
    if (!room) {
        return 'ROOM_DOES_NOT_EXIST';
    }
    if (room.creatorUserId === userId) {
        return 'CREATOR_CANNOT_LEAVE';
    }
    const joinedUser = await prismaClient_1.prisma.joinedUser.findUnique({
        where: {
            roomId_userId: {
                roomId: room.id,
                userId,
            },
        },
    });
    if (!joinedUser) {
        return 'USER_NOT_JOINED';
    }
    await prismaClient_1.prisma.joinedUsersSeparation.deleteMany({ where: { firstJoinedUserId: joinedUser.id } });
    await prismaClient_1.prisma.joinedUsersSeparation.deleteMany({ where: { secondJoinedUserId: joinedUser.id } });
    await prismaClient_1.prisma.joinedUser.delete({ where: { id: joinedUser.id } });
    const joinedUsersCount = await prismaClient_1.prisma.joinedUser.count({
        where: {
            roomId: room.id,
        },
    });
    return {
        room,
        joinedUsersCount: joinedUsersCount,
        remainMinUsersCount: 8 - joinedUsersCount,
        remainMaxUsersCount: 10 - joinedUsersCount,
    };
};
exports.leaveRoom = leaveRoom;
//# sourceMappingURL=leaveRoom.js.map