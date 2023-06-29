import { it } from '@jest/globals'
import { onInteractionCreated } from '../../bot'
import {
  getCustomId,
  getCustomIdWithoutData,
  createButtonInteraction,
  createButtonWithDataInteraction,
  createChatInputInteraction,
  getModalCustomId,
  createModalWithDataInteraction,
  createModalInteraction,
  getModalCustomIdWithoutData,
} from './helper'
import { prisma } from '../../src/prismaClient'
import { registerUserAndRating } from '../../src/operations/registerUserAndRating'

const guildId = 'guild1'
const channelId = 'channel1'

describe('tks scenario', () => {
  it('tks scenario', async () => {
    // prepare
    await registerUserAndRating('user1', 'username1', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user2', 'username2', guildId, 'SplatZones', 2100)
    await registerUserAndRating('user3', 'username3', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user4', 'username4', guildId, 'SplatZones', 2300)
    await registerUserAndRating('user5', 'username5', guildId, 'SplatZones', 2400)
    await registerUserAndRating('user6', 'username6', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user7', 'username7', guildId, 'SplatZones', 2100)
    await registerUserAndRating('user8', 'username8', guildId, 'SplatZones', 1900)

    // new party
    await onInteractionCreated(
      createChatInputInteraction(
        'tks-party',
        {
          channelId,
          guildId,
          user: {
            id: 'user1',
            username: 'username1',
          },
          options: {
            getMentionable: (arg: string) =>
              arg === 'user2'
                ? { id: 'user2', username: 'username2' }
                : arg === 'user3'
                ? { id: 'user3', username: 'username3' }
                : arg === 'user4'
                ? { id: 'user4', username: 'username4' }
                : null,
          },
        },
        {
          onReply: async (options) => {
            expect(options).toMatchSnapshot()
          },
          onChannelSend: async (options) => {
            expect(options.components).toHaveLength(3)
            const party = await prisma.tksParty.findFirst()
            expect(getCustomId(options.components![0])).toBe(`button-tks-find-opponent@${party!.id}`)
            expect(getCustomId(options.components![1])).toBe(`button-tks-set-team-name@${party!.teamId}`)
            expect(getCustomId(options.components![2])).toBe(`button-tks-break-party@${party!.teamId}`)
          },
        }
      )
    )

    const firstParty = await prisma.tksParty.findFirst({ include: { team: { include: { tksTeamUsers: true } } } })
    expect(firstParty).toBeTruthy()
    expect(firstParty?.team).toBeTruthy()
    expect(firstParty?.team.tksTeamUsers).toHaveLength(4)

    // new recruit
    await onInteractionCreated(
      createChatInputInteraction(
        'tks-recruit',
        {
          channelId,
          guildId,
          user: {
            id: 'user5',
            username: 'username5',
          },
        },
        {
          onShowModal: async (options) => {
            expect(getModalCustomId(options)).toBe('modal-tks-recruit')
          },
        }
      )
    )

    await onInteractionCreated(
      createModalInteraction(
        'modal-tks-recruit',
        {
          channelId,
          guildId,
          user: {
            id: 'user5',
            username: 'username5',
          },
          fields: {
            getTextInputValue: () => 'description 1', // TODO: use mock
          },
        },
        {
          onReply: async (options) => {
            expect(options.content).toMatchSnapshot()
            expect(options.components).toHaveLength(2)
            const room = await prisma.tksRecruitingRoom.findFirst()
            expect(getCustomId(options.components![0])).toBe(`button-tks-room-join@${room!.id}`)
            expect(getCustomId(options.components![1])).toBe(`button-tks-break-room@${room!.id}`)
          },
        }
      )
    )
    const recruitingRoom = await prisma.tksRecruitingRoom.findFirst({ include: { recruitingRoomUsers: true } })
    expect(recruitingRoom).toBeTruthy()
    expect(recruitingRoom!.description).toBe('description 1')
    expect(recruitingRoom!.recruitingRoomUsers).toHaveLength(1)
    expect(recruitingRoom!.recruitingRoomUsers[0].userId).toBe('user5')

    await onInteractionCreated(
      createButtonWithDataInteraction(
        'button-tks-room-join',
        recruitingRoom!.id,
        {
          channelId,
          guildId,
          user: {
            id: 'user6',
            username: 'username6',
          },
        },
        {
          onReply: async (options) => {
            expect(options.components).toHaveLength(2)
            expect(getCustomId(options.components![0])).toBe(`button-tks-room-join@${recruitingRoom!.id}`)
            expect(getCustomId(options.components![1])).toBe(`button-tks-leave-room@${recruitingRoom!.id}`)
          },
        }
      )
    )

    await onInteractionCreated(
      createButtonWithDataInteraction(
        'button-tks-room-join',
        recruitingRoom!.id,
        {
          channelId,
          guildId,
          user: {
            id: 'user7',
            username: 'username7',
          },
        },
        {
          onReply: async (options) => {
            expect(options.components).toHaveLength(2)
            expect(getCustomId(options.components![0])).toBe(`button-tks-room-join@${recruitingRoom!.id}`)
            expect(getCustomId(options.components![1])).toBe(`button-tks-leave-room@${recruitingRoom!.id}`)
          },
        }
      )
    )

    // 4人目, party 結成
    await onInteractionCreated(
      createButtonWithDataInteraction(
        'button-tks-room-join',
        recruitingRoom!.id,
        {
          channelId,
          guildId,
          user: {
            id: 'user8',
            username: 'username8',
          },
        },
        {
          onReply: async (options) => {
            expect(options).toMatchSnapshot()
          },
          onChannelSend: async (options) => {
            expect(options.content).toMatchSnapshot()
            expect(options.components).toHaveLength(3)
            expect(getCustomIdWithoutData(options.components![0])).toBe(`button-tks-find-opponent`)
            expect(getCustomIdWithoutData(options.components![1])).toBe(`button-tks-set-team-name`)
            expect(getCustomIdWithoutData(options.components![2])).toBe(`button-tks-break-party`)
          },
        }
      )
    )

    // party1 が対戦相手を探す
    await onInteractionCreated(
      createButtonWithDataInteraction(
        'button-tks-find-opponent',
        firstParty!.id,
        {
          channelId,
          guildId,
          user: {
            id: 'user1',
            username: 'username1',
          },
        },
        {
          onShowModal: async (options) => {
            expect(getModalCustomIdWithoutData(options)).toBe('modal-tks-find-opponent')
          },
        }
      )
    )
    await onInteractionCreated(
      createModalWithDataInteraction(
        'modal-tks-find-opponent',
        firstParty!.id,
        {
          channelId,
          guildId,
          user: {
            id: 'user1',
            username: 'username1',
          },
          fields: { getTextInputValue: () => '3' }, // TODO: use mock
        },
        {
          onReply: async (options) => {
            expect(options.content).toMatchSnapshot()
            expect(options.components).toHaveLength(1)
            expect(getCustomId(options.components![0])).toBe(`button-tks-match@${firstParty!.id}`)
          },
        }
      )
    )
    const findingOpponent = await prisma.tksFindingOpponent.findFirst()
    expect(findingOpponent).toBeTruthy()
    expect(findingOpponent!.winCountOfMatch).toBe(3)

    await onInteractionCreated(
      createButtonWithDataInteraction(
        'button-tks-match',
        firstParty!.id,
        {
          channelId,
          guildId,
          user: {
            id: 'user5',
            username: 'username5',
          },
        },
        {
          onReply: async (options) => {
            expect(options.content).toMatchSnapshot()
            expect(options.components).toHaveLength(1)
            expect(getCustomIdWithoutData(options.components![0])).toBe(`button-tks-report`)
          },
        }
      )
    )
    expect(await prisma.tksFindingOpponent.findFirst()).toBeNull()
    const match = await prisma.tksMatch.findFirst()
    expect(match).toBeTruthy()
    expect(match!.primaryTeamId).toBe(firstParty!.teamId)

    // report
    await onInteractionCreated(
      createButtonWithDataInteraction(
        'button-tks-report',
        match!.id,
        {
          channelId,
          guildId,
          user: {
            id: 'user2',
            username: 'username2',
          },
        },
        {
          onShowModal: async (options) => {
            expect(getModalCustomId(options)).toBe(`modal-tks-report@${match!.id}`)
          },
        }
      )
    )
    await onInteractionCreated(
      createModalWithDataInteraction(
        'modal-tks-report',
        match!.id,
        {
          channelId,
          guildId,
          user: {
            id: 'user2',
            username: 'username2',
          },
          fields: { getTextInputValue: (arg: string) => (arg === 'primaryWinCount' ? '3' : '2') }, // TODO: use mock
        },
        {
          onReply: async (options) => {
            expect(options.content).toMatchSnapshot()
            expect(options.components || []).toHaveLength(0)
          },
        }
      )
    )
    expect(await prisma.tksMatch.findFirst()).toBeNull()
    const matchResult = await prisma.tksMatchResult.findFirst()
    expect(matchResult).toBeTruthy()
    expect(matchResult!.primaryTeamId).toBe(firstParty!.teamId)
    expect(matchResult!.primaryWinCount).toBe(3)
    expect(matchResult!.opponentWinCount).toBe(2)
  })
})
