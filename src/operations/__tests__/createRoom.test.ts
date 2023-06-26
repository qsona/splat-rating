import { it } from '@jest/globals'
import { User } from '@prisma/client'
import assert from 'assert'
import { prisma } from '../../prismaClient'
import { createRoom } from '../createRoom'
import { registerUserAndRating } from '../registerUserAndRating'

describe('createRoom', () => {
  describe('when rating is registered', () => {
    let user: User
    beforeEach(async () => {
      const result = await registerUserAndRating('user1', 'username1', 'guild1', 'SplatZones', 2000)
      assert(result !== 'RATING_ALREADY_REGISTERED')
      assert(result.isNewUser === true)
      user = result.user
    })

    it('', async () => {
      const result = await createRoom(user.id, 'channel1', 'SplatZones', 'guild1')
      assert(result !== 'RATING_DOES_NOT_EXIST')
      assert(result !== 'ROOM_ALREADY_EXISTS')
      expect(result.joinedUser.userId).toBe(user.id)
    })
    describe('when room is already created', () => {
      beforeEach(async () => {
        const result = await registerUserAndRating('user2', 'username1', 'guild1', 'SplatZones', 2000)
        assert(result !== 'RATING_ALREADY_REGISTERED')
        assert(result.isNewUser === true)
        const anotherUser = result.user
        await createRoom(anotherUser.id, 'channel1', 'SplatZones', 'guild1')
      })
      it('', async () => {
        const result = await createRoom(user.id, 'channel1', 'SplatZones', 'guild1')
        assert(result === 'ROOM_ALREADY_EXISTS')
      })
    })
  })

  describe('when rating is not registered', () => {
    let user: User
    beforeEach(async () => {
      user = await prisma.user.create({
        data: {
          id: 'user1',
          name: 'username1',
        },
      })
    })
    it('', async () => {
      const result = await createRoom(user.id, 'channel1', 'SplatZones', 'guild1')
      assert(result === 'RATING_DOES_NOT_EXIST')
    })
  })
})
