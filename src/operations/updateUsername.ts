import { prisma } from '../prismaClient'

export const updateUsername = async (userId: string, username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })
  if (!user) {
    return { error: 'USER_DOES_NOT_EXIST' as const }
  }
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: username,
    },
  })
  return {
    user: updatedUser,
  }
}
