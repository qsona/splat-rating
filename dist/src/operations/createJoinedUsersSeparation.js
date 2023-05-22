"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJoinedUsersSeparation = void 0;
const lodash_1 = require("lodash");
const prismaClient_1 = require("../prismaClient");
const createJoinedUsersSeparation = async (userIds, discordChannelId) => {
    if (userIds[0] === userIds[1]) {
        return { error: 'SAME_USER_SPECIFIED' };
    }
    const room = await prismaClient_1.prisma.room.findUnique({
        where: { discordChannelId },
        include: { joinedUsers: true, joinedUsersSeparations: true },
    });
    if (!room) {
        return { error: 'ROOM_DOES_NOT_EXIST' };
    }
    const separatingJoinedUsers = room.joinedUsers.filter((ju) => userIds.includes(ju.userId));
    if (separatingJoinedUsers.length !== 2) {
        return { error: 'USER_NOT_JOINED' };
    }
    const joinedUsersSeparationJoinedUserIds = room.joinedUsersSeparations.flatMap((jus) => [jus.firstJoinedUserId, jus.secondJoinedUserId]);
    const separatingJoinedUserIds = separatingJoinedUsers.map((ju) => ju.id);
    const conflictedJoinedUserIds = (0, lodash_1.intersection)(joinedUsersSeparationJoinedUserIds, separatingJoinedUserIds);
    if (conflictedJoinedUserIds.length) {
        return { error: 'SEPARATION_CONFLICTED' };
    }
    const joinedUsersSeparation = await prismaClient_1.prisma.joinedUsersSeparation.create({
        data: {
            firstJoinedUserId: separatingJoinedUsers[0].id,
            secondJoinedUserId: separatingJoinedUsers[1].id,
            roomId: room.id,
        },
    });
    return {
        joinedUsersSeparation,
    };
};
exports.createJoinedUsersSeparation = createJoinedUsersSeparation;
//# sourceMappingURL=createJoinedUsersSeparation.js.map