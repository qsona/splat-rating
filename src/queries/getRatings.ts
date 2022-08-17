import { prisma } from '../prismaClient'
import { User } from '@prisma/client'

export const getRatings = async (user: User) => {
  const ratings = await prisma.rating.findMany({
    where: { userId: user.id },
  })
  return ratings
}
