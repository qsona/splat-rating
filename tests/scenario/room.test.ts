import { it } from '@jest/globals'
import { onInteractionCreated } from '../../bot'
import { getCustomId, createButtonInteraction, createChatInputInteraction } from './helper'
import { prisma } from '../../src/prismaClient'
import { registerUserAndRating } from '../../src/operations/registerUserAndRating'

const guildId = 'guild1'
const channelId = 'channel1'

describe('room scenario', () => {
  it('room scenario', async () => {
    // prepare
    await registerUserAndRating('user1', 'username1', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user2', 'username2', guildId, 'SplatZones', 2100)
    await registerUserAndRating('user3', 'username3', guildId, 'SplatZones', 2200)
    await registerUserAndRating('user4', 'username4', guildId, 'SplatZones', 2300)
    await registerUserAndRating('user5', 'username5', guildId, 'SplatZones', 2400)
    await registerUserAndRating('user6', 'username6', guildId, 'SplatZones', 2500)
    await registerUserAndRating('user7', 'username7', guildId, 'SplatZones', 2600)
    await registerUserAndRating('user8', 'username8', guildId, 'SplatZones', 2700)
    await registerUserAndRating('user9', 'username9', guildId, 'SplatZones', 2800)
    await registerUserAndRating('user10', 'username10', guildId, 'SplatZones', 2900)

    // new game
    await onInteractionCreated(
      createChatInputInteraction(
        'sr-newgame',
        {
          channelId,
          guildId,
          user: {
            id: 'user1',
            username: 'username1',
          },
          options: {
            getString: () => 'SplatZones', // TODO: use mock
          },
        },
        (options) => {
          expect(options.components).toHaveLength(1)
          expect(getCustomId(options.components![0])).toBe('button-join')

          expect(options).toMatchSnapshot()
        }
      )
    )

    const room = await prisma.room.findFirst({
      where: {
        creatorUserId: 'user1',
        discordChannelId: channelId,
      },
    })
    expect(room).toBeTruthy()

    // join
    await onInteractionCreated(
      createButtonInteraction(
        'button-join',
        {
          channelId,
          guildId,
          user: {
            id: 'user2',
            username: 'username2',
          },
        },
        (options) => {
          expect(options.components).toHaveLength(2)
          expect(getCustomId(options.components![0])).toBe('button-join')
          expect(getCustomId(options.components![1])).toBe('button-leave')

          expect(options).toMatchSnapshot()
        }
      )
    )

    // leave
    await onInteractionCreated(
      createButtonInteraction(
        'button-leave',
        {
          channelId,
          guildId,
          user: {
            id: 'user2',
            username: 'username2',
          },
        },
        (options) => {
          expect(options).toMatchSnapshot()
        }
      )
    )

    // join 2-7
    for (let i = 2; i <= 7; i++) {
      await onInteractionCreated(
        createButtonInteraction(
          'button-join',
          {
            channelId,
            guildId,
            user: {
              id: `user${i}`,
              username: `username${i}`,
            },
          },
          (options) => {
            expect(options.components).toHaveLength(2)
            expect(getCustomId(options.components![0])).toBe('button-join')
            expect(getCustomId(options.components![1])).toBe('button-leave')
          }
        )
      )
    }
    // join 8
    await onInteractionCreated(
      createButtonInteraction(
        'button-join',
        {
          channelId,
          guildId,
          user: {
            id: 'user8',
            username: 'username8',
          },
        },
        (options) => {
          expect(options.components).toHaveLength(3)
          expect(getCustomId(options.components![0])).toBe('button-match')
          expect(getCustomId(options.components![1])).toBe('button-join')
          expect(getCustomId(options.components![2])).toBe('button-leave')
          expect(options).toMatchSnapshot()
        }
      )
    )

    // leave
    // 7人になる
    await onInteractionCreated(
      createButtonInteraction(
        'button-leave',
        {
          channelId,
          guildId,
          user: {
            id: 'user2',
            username: 'username2',
          },
        },
        (options) => {
          // no button-match
          expect(options.components || []).toHaveLength(0)
          expect(options).toMatchSnapshot()
        }
      )
    )

    // re-join 8
    await onInteractionCreated(
      createButtonInteraction(
        'button-join',
        {
          channelId,
          guildId,
          user: {
            id: 'user2',
            username: 'username2',
          },
        },
        (options) => {
          expect(options.components).toHaveLength(3)
          expect(getCustomId(options.components![0])).toBe('button-match')
          expect(getCustomId(options.components![1])).toBe('button-join')
          expect(getCustomId(options.components![2])).toBe('button-leave')
        }
      )
    )

    // join 9
    await onInteractionCreated(
      createButtonInteraction(
        'button-join',
        {
          channelId,
          guildId,
          user: {
            id: 'user9',
            username: 'username9',
          },
        },
        (options) => {
          expect(options.components).toHaveLength(3)
          expect(getCustomId(options.components![0])).toBe('button-match')
          expect(getCustomId(options.components![1])).toBe('button-join')
          expect(getCustomId(options.components![2])).toBe('button-leave')
        }
      )
    )
    // join 10
    await onInteractionCreated(
      createButtonInteraction(
        'button-join',
        {
          channelId,
          guildId,
          user: {
            id: 'user10',
            username: 'username10',
          },
        },
        (options) => {
          expect(options.components).toHaveLength(2)
          expect(getCustomId(options.components![0])).toBe('button-match')
          expect(getCustomId(options.components![1])).toBe('button-leave')
          expect(options).toMatchSnapshot()
        }
      )
    )

    // break
    await onInteractionCreated(
      createChatInputInteraction(
        'sr-break',
        {
          channelId,
          guildId,
          user: {
            id: 'user1',
            username: 'username1',
          },
        },
        (options) => {
          expect(options).toMatchSnapshot()
        }
      )
    )

    const roomCount = await prisma.room.count({
      where: {
        creatorUserId: 'user1',
        discordChannelId: channelId,
      },
    })
    expect(roomCount).toBe(0)
  })
})
