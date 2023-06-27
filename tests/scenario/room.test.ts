import { it } from '@jest/globals'
import { User } from '@prisma/client'
import assert from 'assert'
import { onInteractionCreated } from '../../bot'
import { ButtonBuilder, InteractionReplyOptions } from 'discord.js'
import { prisma } from '../../src/prismaClient'
import { registerUserAndRating } from '../../src/operations/registerUserAndRating'

const guildId = 'guild1'
const channelId = 'channel1'

const getCustomId = (component: any) => component?.toJSON().components?.[0]?.custom_id

const createChatInputInteraction = (command: string, args: any, onReply: (options: InteractionReplyOptions) => void) => {
  return {
    isChatInputCommand: () => true,
    isButton: () => false,
    commandName: command,
    reply: (arg: any) => onReply(typeof arg === 'string' ? { content: arg } : arg),
    ...args,
  }
}

const createButtonInteraction = (command: string, args: any, onReply: (options: InteractionReplyOptions) => void) => {
  return {
    isChatInputCommand: () => false,
    isButton: () => true,
    customId: command,
    reply: (arg: any) => onReply(typeof arg === 'string' ? { content: arg } : arg),
    ...args,
  }
}

const createButtonWithDataInteraction = (command: string, data: string, args: any, onReply: (options: InteractionReplyOptions) => void) => {
  return {
    isChatInputCommand: () => false,
    isButton: () => true,
    customId: `command@data`,
    reply: (arg: any) => onReply(typeof arg === 'string' ? { content: arg } : arg),
    ...args,
  }
}

describe('room scenario', () => {
  it('room scenario', async () => {
    // prepare
    const user1 = await registerUserAndRating('user1', 'username1', guildId, 'SplatZones', 2000)
    const user2 = await registerUserAndRating('user2', 'username2', guildId, 'SplatZones', 2100)
    const user3 = await registerUserAndRating('user3', 'username3', guildId, 'SplatZones', 2200)
    const user4 = await registerUserAndRating('user4', 'username4', guildId, 'SplatZones', 2300)
    const user5 = await registerUserAndRating('user5', 'username5', guildId, 'SplatZones', 2400)
    const user6 = await registerUserAndRating('user6', 'username6', guildId, 'SplatZones', 2500)
    const user7 = await registerUserAndRating('user7', 'username7', guildId, 'SplatZones', 2600)
    const user8 = await registerUserAndRating('user8', 'username8', guildId, 'SplatZones', 2700)
    const user9 = await registerUserAndRating('user9', 'username9', guildId, 'SplatZones', 2800)
    const user10 = await registerUserAndRating('user10', 'username10', guildId, 'SplatZones', 2900)

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
          expect(options.components).toHaveLength(2)
          expect(getCustomId(options.components![0])).toBe('button-join')
          expect(getCustomId(options.components![1])).toBe('button-leave')

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
