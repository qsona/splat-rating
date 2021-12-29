import { prisma } from '../prismaClient'

export const cancelMatching = async (discordChannelId: string) => {
  const room = await prisma.room.findUnique({
    where: { discordChannelId },
  })
  if (!room) {
    return 'ROOM_DOES_NOT_EXIST'
  }

  const matching = await prisma.matching.findUnique({ where: { roomId: room.id } })
  if (!matching) {
    return 'MATCHING_DOES_NOT_EXIST'
  }

  await prisma.matching.delete({
    where: { id: matching.id },
  })

  return { success: true }
}
