import { prisma } from '../prismaClient'

export const resetJoinedUsersSeparation = async (discordChannelId: string) => {
  const room = await prisma.room.findUnique({
    where: { discordChannelId },
  })
  if (!room) {
    return { error: 'ROOM_DOES_NOT_EXIST' as const }
  }
  await prisma.joinedUsersSeparation.deleteMany({
    where: {
      roomId: room.id,
    },
  })

  return {}
}
