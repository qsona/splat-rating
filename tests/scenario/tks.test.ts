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
import { tksCreateParty } from '../../src/operations/tksCreateParty'
import assert from 'assert'
import { SplatRuleSet } from '../../src/rules'

const guildId = 'guild1'
const channelId = 'channel1'

describe('tks scenario', () => {
  it('tks scenario', async () => {
    const rule = 'SplatZones'
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

    const firstPartyRatingInitial = await prisma.tksRating.findFirst({ where: { teamId: firstParty!.teamId, rule } })
    expect(firstPartyRatingInitial).toBeTruthy()

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

    const firstPartyRating = await prisma.tksRating.findFirst({
      where: { teamId: firstParty!.teamId, rule: 'SplatZones' },
    })
    expect(firstPartyRating).toBeTruthy()
    expect(firstPartyRating!.mu).toBeGreaterThan(firstPartyRatingInitial!.mu)
    expect(firstPartyRating!.sigma).toBeLessThan(firstPartyRatingInitial!.sigma)
  })

  it('should work with 2 matches', async () => {
    const rule: SplatRuleSet = 'SplatZones'
    await registerUserAndRating('user1', 'username1', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user2', 'username2', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user3', 'username3', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user4', 'username4', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user5', 'username5', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user6', 'username6', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user7', 'username7', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user8', 'username8', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user9', 'username1', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user10', 'username2', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user11', 'username3', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user12', 'username4', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user13', 'username5', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user14', 'username6', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user15', 'username7', guildId, 'SplatZones', 2000)
    await registerUserAndRating('user16', 'username8', guildId, 'SplatZones', 2000)

    const { party: party1 } = await tksCreateParty(['user1', 'user2', 'user3', 'user4'], guildId)
    const { party: party2 } = await tksCreateParty(['user5', 'user6', 'user7', 'user8'], guildId)
    const { party: party3 } = await tksCreateParty(['user9', 'user10', 'user11', 'user12'], guildId)
    const { party: party4 } = await tksCreateParty(['user13', 'user14', 'user15', 'user16'], guildId)
    assert(party1)
    assert(party2)
    assert(party3)
    assert(party4)

    // party 1, party 4 が募集
    await onInteractionCreated(
      createModalWithDataInteraction(
        'modal-tks-find-opponent',
        party1!.id,
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
            expect(options.components).toHaveLength(1)
            expect(getCustomId(options.components![0])).toBe(`button-tks-match@${party1!.id}`)
          },
        }
      )
    )
    await onInteractionCreated(
      createModalWithDataInteraction(
        'modal-tks-find-opponent',
        party4!.id,
        {
          channelId,
          guildId,
          user: {
            id: 'user13',
            username: 'username13',
          },
          fields: { getTextInputValue: () => '3' }, // TODO: use mock
        },
        {
          onReply: async (options) => {
            expect(options.components).toHaveLength(1)
            expect(getCustomId(options.components![0])).toBe(`button-tks-match@${party4!.id}`)
          },
        }
      )
    )

    // party3 => party4 に申しこみ
    await onInteractionCreated(
      createButtonWithDataInteraction(
        'button-tks-match',
        party4!.id,
        {
          channelId,
          guildId,
          user: {
            id: 'user9',
            username: 'username9',
          },
        },
        {
          onReply: async (options) => {
            expect(options.components).toHaveLength(1)
            const match = await prisma.tksMatch.findFirst({ where: { primaryTeamId: party4.teamId, opponentTeamId: party3.teamId } })
            expect(match).toBeTruthy()
            expect(getCustomId(options.components![0])).toBe(`button-tks-report@${match!.id}`)
          },
        }
      )
    )

    // party 2 => party1 に申し込み
    await onInteractionCreated(
      createButtonWithDataInteraction(
        'button-tks-match',
        party1!.id,
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
            expect(options.components).toHaveLength(1)
            const match = await prisma.tksMatch.findFirst({ where: { primaryTeamId: party1.teamId, opponentTeamId: party2.teamId } })
            expect(match).toBeTruthy()
            expect(getCustomId(options.components![0])).toBe(`button-tks-report@${match!.id}`)
          },
        }
      )
    )

    const match43 = await prisma.tksMatch.findFirst({ where: { primaryTeamId: party4.teamId, opponentTeamId: party3.teamId } })!
    const match12 = await prisma.tksMatch.findFirst({ where: { primaryTeamId: party1.teamId, opponentTeamId: party2.teamId } })!

    await onInteractionCreated(
      createButtonWithDataInteraction(
        'button-tks-report',
        match12!.id,
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
            expect(getModalCustomId(options)).toBe(`modal-tks-report@${match12!.id}`)
          },
        }
      )
    )
    await onInteractionCreated(
      createModalWithDataInteraction(
        'modal-tks-report',
        match12!.id,
        {
          channelId,
          guildId,
          user: {
            id: 'user1',
            username: 'username1',
          },
          fields: { getTextInputValue: (arg: string) => (arg === 'primaryWinCount' ? '3' : '2') }, // TODO: use mock
        },
        {
          onReply: async (options) => {
            expect(options.components || []).toHaveLength(0)
          },
        }
      )
    )
    await onInteractionCreated(
      createButtonWithDataInteraction(
        'button-tks-report',
        match43!.id,
        {
          channelId,
          guildId,
          user: {
            id: 'user13',
            username: 'username13',
          },
        },
        {
          onShowModal: async (options) => {
            expect(getModalCustomId(options)).toBe(`modal-tks-report@${match43!.id}`)
          },
        }
      )
    )
    await onInteractionCreated(
      createModalWithDataInteraction(
        'modal-tks-report',
        match43!.id,
        {
          channelId,
          guildId,
          user: {
            id: 'user13',
            username: 'username13',
          },
          fields: { getTextInputValue: (arg: string) => (arg === 'primaryWinCount' ? '2' : '3') }, // TODO: use mock
        },
        {
          onReply: async (options) => {
            expect(options.components || []).toHaveLength(0)
          },
        }
      )
    )
    expect(await prisma.tksMatch.findFirst()).toBeNull()
    const matchResult12 = await prisma.tksMatchResult.findFirst({ where: { primaryTeamId: party1.teamId, opponentTeamId: party2.teamId } })
    expect(matchResult12).toBeTruthy()
    expect(matchResult12!.primaryWinCount).toBe(3)
    expect(matchResult12!.opponentWinCount).toBe(2)

    const matchResult43 = await prisma.tksMatchResult.findFirst({ where: { primaryTeamId: party4.teamId, opponentTeamId: party3.teamId } })
    expect(matchResult43).toBeTruthy()
    expect(matchResult43!.primaryWinCount).toBe(2)
    expect(matchResult43!.opponentWinCount).toBe(3)

    // win: party 1, lose: party 2
    // win: party 3, lose: party 4

    const party1Rating = await prisma.tksRating.findFirst({
      where: { teamId: party1!.teamId, rule: 'SplatZones' },
    })
    expect(party1Rating).toBeTruthy()
    expect(party1Rating!.mu).toBeGreaterThan(2000)
    expect(party1Rating!.playCount).toBe(1)
    expect(party1Rating!.winCount).toBe(1)
    expect(party1Rating!.loseCount).toBe(0)

    const party2Rating = await prisma.tksRating.findFirst({
      where: { teamId: party2!.teamId, rule: 'SplatZones' },
    })
    expect(party2Rating).toBeTruthy()
    expect(party2Rating!.mu).toBeLessThan(2000)
    expect(party2Rating!.playCount).toBe(1)
    expect(party2Rating!.winCount).toBe(0)
    expect(party2Rating!.loseCount).toBe(1)

    const party3Rating = await prisma.tksRating.findFirst({
      where: { teamId: party3!.teamId, rule: 'SplatZones' },
    })
    expect(party3Rating).toBeTruthy()
    expect(party3Rating!.mu).toBeGreaterThan(2000)
    expect(party3Rating!.playCount).toBe(1)
    expect(party3Rating!.winCount).toBe(1)
    expect(party3Rating!.loseCount).toBe(0)

    const party4Rating = await prisma.tksRating.findFirst({
      where: { teamId: party4!.teamId, rule: 'SplatZones' },
    })
    expect(party4Rating).toBeTruthy()
    expect(party4Rating!.mu).toBeLessThan(2000)
    expect(party4Rating!.playCount).toBe(1)
    expect(party4Rating!.winCount).toBe(0)
    expect(party4Rating!.loseCount).toBe(1)
  })
})
