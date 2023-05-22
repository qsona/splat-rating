"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = void 0;
const prismaClient_1 = require("../prismaClient");
const createRoom = async (creatorUserId, discordChannelId, rule, guildId) => {
    const rating = await prismaClient_1.prisma.rating.findUnique({
        where: {
            userId_guildId_rule: { userId: creatorUserId, guildId, rule },
        },
    });
    if (!rating) {
        return 'RATING_DOES_NOT_EXIST';
    }
    return await prismaClient_1.prisma.$transaction(async (prisma) => {
        let room;
        try {
            room = await prisma.room.create({
                data: {
                    discordChannelId,
                    creatorUserId: creatorUserId,
                    rule,
                    guildId,
                },
            });
        }
        catch (e) {
            if (e.code === 'P2002') {
                return 'ROOM_ALREADY_EXISTS';
            }
            throw e;
        }
        const joinedUser = await prisma.joinedUser.create({
            data: {
                room: { connect: { id: room.id } },
                user: { connect: { id: creatorUserId } },
                rating: { connect: { id: rating.id } },
            },
        });
        return { rating, room, joinedUser };
    });
};
exports.createRoom = createRoom;
//# sourceMappingURL=createRoom.js.map