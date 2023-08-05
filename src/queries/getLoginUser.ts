import { prisma } from '../prismaClient'
import { Profile } from '../../src/models/profile'

export const getLoginUser = async (req: any) => {
  const profile = <Profile>req.user
  if (profile === undefined || profile === null) {
    throw new Error('login user not found in request')
  }
  console.log('profile:', profile)
  const loginUser = await prisma.user.findUnique({
    where: { id: profile.id },
  })
  return loginUser
}
