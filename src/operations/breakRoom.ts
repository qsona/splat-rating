import { prisma } from '../prismaClient'

export const breakRoom = async (userId: string, discordChannelId: string) => {
  // TODO: acquire lock
  const room = await prisma.room.findUnique({
    where: { discordChannelId },
  })
  if (!room) {
    return 'ROOM_DOES_NOT_EXIST'
  }

  // TODO: who can break room?

  const matchingExists = !!(await prisma.matching.count({
    where: {
      roomId: room.id,
    },
  }))

  if (matchingExists) {
    return 'MATCHING_EXISTS'
  }

  await prisma.$transaction(async (prisma) => {
    await prisma.joinedUser.deleteMany({ where: { roomId: room.id } })
    await prisma.room.delete({ where: { id: room.id } })
  })
  return { success: true }
}
