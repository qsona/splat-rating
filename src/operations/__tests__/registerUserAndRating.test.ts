import assert from 'assert'
import { registerUserAndRating } from '../registerUserAndRating'
import { prisma } from '../../prismaClient'

describe('registerUserAndRating', () => {
  const userId = 'user1'
  describe('when new user', () => {
    it('', async () => {
      const result = await registerUserAndRating(userId, 'username1', 'guild1', 'SplatZones', 2000)
      assert(result !== 'RATING_ALREADY_REGISTERED')
      assert(result.isNewUser === true)
      assert(result.rating.mu === 2000)
    })
  })
  describe('when user is already registered', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          id: userId,
          name: 'username1',
        },
      })
    })
    describe('when rating is not registered', () => {
      it('', async () => {
        const result = await registerUserAndRating('user1', 'username1', 'guild1', 'SplatZones', 2000)
        assert(result !== 'RATING_ALREADY_REGISTERED')
        assert(result.isNewUser === false)
        assert(result.rating.mu === 2000)
      })
    })
    describe('when rating is already registered', () => {
      beforeEach(async () => {
        await prisma.rating.create({
          data: {
            rule: 'SplatZones',
            mu: 2000,
            sigma: 200,
            guildId: 'guild1',
            userId: 'user1',
          },
        })
      })
      it('', async () => {
        const result = await registerUserAndRating('user1', 'username1', 'guild1', 'SplatZones', 2000)
        assert(result === 'RATING_ALREADY_REGISTERED')
      })
    })
  })
})
