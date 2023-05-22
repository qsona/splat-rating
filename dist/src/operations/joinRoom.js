"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinRoom = void 0;
const prismaClient_1 = require("../prismaClient");
const joinRoom = async (userId, discordChannelId, guildId) => {
    // TODO: acquire lock
    const room = await prismaClient_1.prisma.room.findUnique({
        where: { discordChannelId },
    });
    if (!room) {
        return { error: 'ROOM_DOES_NOT_EXIST' };
    }
    const { rule } = room;
    const rating = await prismaClient_1.prisma.rating.findUnique({
        where: {
            userId_guildId_rule: { userId, guildId, rule },
        },
    });
    if (!rating) {
        return { error: 'RATING_DOES_NOT_EXIST', room };
    }
    let joinedUsersCount = await prismaClient_1.prisma.joinedUser.count({
        where: {
            roomId: room.id,
        },
    });
    if (joinedUsersCount >= 10) {
        return { error: 'TOO_MANY_JOINED_USERS' };
    }
    let joinedUser;
    try {
        joinedUser = await prismaClient_1.prisma.joinedUser.create({
            data: {
                room: { connect: { id: room.id } },
                user: { connect: { id: userId } },
                rating: { connect: { id: rating.id } },
            },
        });
    }
    catch (e) {
        if (e.code === 'P2002') {
            return { error: 'USER_ALREADY_JOINED' };
        }
        throw e;
    }
    joinedUsersCount += 1;
    return {
        joinedUser,
        room,
        joinedUsersCount: joinedUsersCount,
        remainMinUsersCount: 8 - joinedUsersCount,
        remainMaxUsersCount: 10 - joinedUsersCount,
        rating,
    };
};
exports.joinRoom = joinRoom;
//# sourceMappingURL=joinRoom.js.map