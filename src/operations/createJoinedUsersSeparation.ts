import { intersection } from 'lodash'
import { prisma } from '../prismaClient'

export const createJoinedUsersSeparation = async (userIds: [string, string], discordChannelId: string) => {
  if (userIds[0] === userIds[1]) {
    return { error: 'SAME_USER_SPECIFIED' as const }
  }

  const room = await prisma.room.findUnique({
    where: { discordChannelId },
    include: { joinedUsers: true, joinedUsersSeparations: true },
  })
  if (!room) {
    return { error: 'ROOM_DOES_NOT_EXIST' as const }
  }

  const separatingJoinedUsers = room.joinedUsers.filter((ju) => userIds.includes(ju.userId))
  if (separatingJoinedUsers.length !== 2) {
    return { error: 'USER_NOT_JOINED' as const }
  }

  const joinedUsersSeparationUserIds = room.joinedUsersSeparations.flatMap((jus) => [jus.firstJoinedUserId, jus.secondJoinedUserId])
  const conflictedUserIds = intersection(joinedUsersSeparationUserIds, userIds)
  if (conflictedUserIds.length) {
    return { error: 'SEPARATION_CONFLICTED' as const, conflictedUserIds }
  }

  const joinedUsersSeparation = await prisma.joinedUsersSeparation.create({
    data: {
      firstJoinedUserId: separatingJoinedUsers[0].id,
      secondJoinedUserId: separatingJoinedUsers[1].id,
      roomId: room.id,
    },
  })

  return {
    joinedUsersSeparation,
  }
}
