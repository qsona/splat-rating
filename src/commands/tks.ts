import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

import { CommandHandler } from '../../bot'
import assertNever from 'assert-never'
import { prisma } from '../prismaClient'
import { ButtonCommandWithDataHandler } from './buttonHandlers'
import hash from 'object-hash'
import { ModalCommandWithDataHandler } from './modalHandlers'
import { getUserFromMentionable } from './helpers/mentionable'
import { uniq } from 'lodash'
import { SplatRuleSet, getRuleName } from '../rules'
import { match } from 'assert'

export const calcTeamId = (userIds: string[]) => {
  return hash(userIds, { unorderedArrays: true })
}

const recruitingChannelId = '1043582923644874784'
const findingOpponentChannelId = '1043583020457807982'

// button and modals

export const createTksRoomJoinButton = (tksRecruitingRoomId: string) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`button-tks-room-join@${tksRecruitingRoomId}`).setLabel('参加').setStyle(ButtonStyle.Primary)
  )
}

export const createTksSetTeamNameButton = (teamId: string) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`button-tks-set-team-name@${teamId}`).setLabel('チーム名設定/変更').setStyle(ButtonStyle.Secondary)
  )
}

export const createTksFindOpponentButton = (partyId: string) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`button-tks-find-opponent@${partyId}`).setLabel('相手募集').setStyle(ButtonStyle.Primary)
  )
}

export const createTksMatchButton = (targetPartyId: string) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`button-tks-match@${targetPartyId}`).setLabel('このパーティーと対戦').setStyle(ButtonStyle.Primary)
  )
}

export const createTksBreakPartyButton = (teamId: string) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`button-tks-break-party@${teamId}`).setLabel('パーティー解散').setStyle(ButtonStyle.Danger)
  )
}

export const createTksSetTeamNameModal = (teamId: string, isUpdating: boolean) => {
  const modal = new ModalBuilder().setCustomId(`modal-tks-set-team-name@${teamId}`).setTitle(isUpdating ? 'チーム名変更' : 'チーム名登録')
  const input = new TextInputBuilder().setCustomId('teamNameInput').setLabel('チーム名').setRequired(true).setStyle(TextInputStyle.Short)
  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input)
  modal.addComponents(firstActionRow)
  return modal
}

export const createTksFindOpponentModal = (partyId: string) => {
  const modal = new ModalBuilder().setCustomId(`modal-tks-find-opponent@${partyId}`).setTitle('対抗戦相手募集')
  const winCountOfMatchInput = new TextInputBuilder().setCustomId('winCountOfMatch').setLabel('N本先取(整数)').setRequired(true).setStyle(TextInputStyle.Short)
  const descriptionInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('募集の説明 (パーティーの強さ目安、対戦相手への希望、開始時間など)')
    .setRequired(false)
    .setStyle(TextInputStyle.Paragraph)
  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(winCountOfMatchInput)
  const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
  modal.addComponents(firstActionRow, secondActionRow)
  return modal
}

export const createTksReportButton = (matchId: string) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`button-tks-report@${matchId}`).setLabel('結果報告').setStyle(ButtonStyle.Primary)
  )
}

export const createTksReportModal = (matchId: string) => {
  const modal = new ModalBuilder().setCustomId(`modal-tks-report@${matchId}`).setTitle('対抗戦結果報告')
  const primaryWinCountInput = new TextInputBuilder()
    .setCustomId('primaryWinCount')
    .setLabel('アルファチーム勝利数')
    .setRequired(true)
    .setStyle(TextInputStyle.Short)
  const opponentWinCountInput = new TextInputBuilder()
    .setCustomId('opponentWinCount')
    .setLabel('ブラボーチーム勝利数')
    .setRequired(true)
    .setStyle(TextInputStyle.Short)
  const isInterruptedInput = new TextInputBuilder()
    .setCustomId('isInterrupted')
    .setLabel('中断フラグ (中断した場合は1を入力してください)')
    .setRequired(false)
    .setStyle(TextInputStyle.Short)

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(primaryWinCountInput)
  const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(opponentWinCountInput)
  const thirdRow = new ActionRowBuilder<TextInputBuilder>().addComponents(isInterruptedInput)
  modal.addComponents(firstActionRow, secondActionRow, thirdRow)
  return modal
}

// handlers

export const tksRecruitHandler: CommandHandler = {
  commandName: 'tks-recruit',
  execute: async (interaction) => {
    const { id, username } = interaction.user

    // TODO: const isAlreadyRecruiting =
    const { tksRecruitingRoom } = await prisma.$transaction(async (prisma) => {
      await prisma.user.upsert({ where: { id }, update: {}, create: { id, name: username } })
      const tksRecruitingRoom = await prisma.tksRecruitingRoom.create({ data: { creatorUserId: id } })
      await prisma.tksRecruitingRoomUser.create({ data: { userId: id, recruitingRoomId: tksRecruitingRoom.id } })
      return { tksRecruitingRoom }
    })
    const message = [`${username}: 対抗戦味方募集@3`, '強い人', '募集垢❌'].join('\n')
    await interaction.reply({ content: message, components: [createTksRoomJoinButton(tksRecruitingRoom.id)] })
  },
}

export const tksRoomJoinButtonHandler: ButtonCommandWithDataHandler = {
  customId: 'button-tks-room-join',
  execute: async (interaction, tksRecruitingRoomId) => {
    const { id, username } = interaction.user
    const room = await prisma.tksRecruitingRoom.findUnique({
      where: { id: tksRecruitingRoomId },
      include: { recruitingRoomUsers: { include: { user: true } } },
    })
    if (!room) {
      await interaction.reply('その募集はすでに解散しています。')
      return
    }
    if (room.recruitingRoomUsers.some((ru) => ru.userId === id)) {
      await interaction.reply('すでに参加しています。')
      return
    }

    const users = room.recruitingRoomUsers.map((ru) => ru.user)
    if (users.length >= 4) {
      throw new Error(`bug: room is already full ${room.id}`)
    }

    if (users.length < 3) {
      await prisma.tksRecruitingRoomUser.create({ data: { recruitingRoomId: room.id, userId: id } })
      const message = [`${username} が参加しました。`, `対抗戦味方募集@${3 - users.length}`, '強い人', '募集垢❌'].join('\n')
      await interaction.reply({ content: message, components: [createTksRoomJoinButton(tksRecruitingRoomId)] })
      return
    }

    // go to next stage!
    const userIds = [...users.map((user) => user.id), id]
    const usernames = [...users.map((user) => user.name), username]
    const teamId = calcTeamId(userIds)

    const { team, party } = await prisma.$transaction(async (prisma) => {
      const team = await prisma.tksTeam.upsert({
        where: { id: teamId },
        update: {},
        create: {
          id: teamId,
          tksTeamUsers: {
            create: userIds.map((userId) => ({
              userId,
            })),
          },
        },
      })
      const party = await prisma.tksParty.create({ data: { teamId } })

      await prisma.tksRecruitingRoom.delete({ where: { id: room.id } })
      return { team, party }
    })
    const teamNameMessage = team.name ? `チーム名: ${team.name}` : `メンバー: ${usernames.join(' ')}`
    const message = [
      `${username} が参加しました。`,
      `対抗戦味方募集@うまり`,
      teamNameMessage,
      `メンバーは<#${findingOpponentChannelId}> に移動してください 🚀`,
    ].join('\n')

    await interaction.reply({ content: message })

    const channel = interaction.guild?.channels.cache.get(findingOpponentChannelId)
    const nextMessages = [`${usernames.join(' ')} がパーティーを結成したぞ!`]
    if (team.name) {
      nextMessages.push(`チーム名: ${team.name}`)
    }
    const components = [
      createTksFindOpponentButton(party.id),
      // createTksMatchButton(teamId),
      createTksSetTeamNameButton(teamId),
      createTksBreakPartyButton(teamId),
    ]
    // なぜか型ついてない
    await (channel as any).send({ content: nextMessages.join('\n'), components })
  },
}

export const tksSetTeamNameButtonHandler: ButtonCommandWithDataHandler = {
  customId: 'button-tks-set-team-name',
  execute: async (interaction, tksTeamId) => {
    const team = await prisma.tksTeam.findUnique({ where: { id: tksTeamId } })
    if (!team) {
      await interaction.reply('チームがありません。')
      return
    }
    await interaction.showModal(createTksSetTeamNameModal(tksTeamId, team.name != null))
  },
}

export const tksSetTeamNameModalHandler: ModalCommandWithDataHandler = {
  customId: 'modal-tks-set-team-name',
  execute: async (interaction, tksTeamId) => {
    const teamName = interaction.fields.getTextInputValue('teamNameInput')
    const team = await prisma.tksTeam.findUnique({ where: { id: tksTeamId } })
    if (!team) {
      await interaction.reply('チームがありません。')
      return
    }
    await prisma.tksTeam.update({ where: { id: tksTeamId }, data: { name: teamName } })
    await interaction.reply({
      content: `チーム名を${team.name == null ? '登録' : '変更'}しました: ${teamName}`,
    })
  },
}

export const tksPartyHandler: CommandHandler = {
  commandName: 'tks-party',
  execute: async (interaction) => {
    const { user, channelId } = interaction
    const mentionable2 = interaction.options.getMentionable('user2')!
    const user2 = getUserFromMentionable(mentionable2)!
    const mentionable3 = interaction.options.getMentionable('user3')!
    const user3 = getUserFromMentionable(mentionable3)!
    const mentionable4 = interaction.options.getMentionable('user4')!
    const user4 = getUserFromMentionable(mentionable4)!

    const users = [user, user2, user3, user4]
    const userIds = users.map((user) => user.id)
    if (uniq(userIds).length !== 4) {
      await interaction.reply('同一のユーザーが含まれています。')
      return
    }
    for (const { id, username } of users) {
      await prisma.user.upsert({ where: { id }, update: {}, create: { id, name: username } })
    }
    const usernames = users.map((user) => user.username)
    const teamId = calcTeamId(userIds)
    const { team, party } = await prisma.$transaction(async (prisma) => {
      const team = await prisma.tksTeam.upsert({
        where: { id: teamId },
        update: {},
        create: {
          id: teamId,
          tksTeamUsers: {
            create: userIds.map((userId) => ({
              userId,
            })),
          },
        },
      })
      const party = await prisma.tksParty.create({ data: { teamId } })
      return { team, party }
    })

    const nextMessages = [`${usernames.join(' ')} がパーティーを結成したぞ!`]
    if (team.name) {
      nextMessages.push(`チーム名: ${team.name}`)
    }

    const components = [
      createTksFindOpponentButton(party.id),
      // createTksMatchButton(teamId),
      createTksSetTeamNameButton(teamId),
      createTksBreakPartyButton(teamId),
    ]
    if (channelId === findingOpponentChannelId) {
      await interaction.reply({ content: nextMessages.join('\n'), components })
    } else {
      const firstMessages = [...nextMessages, `メンバーは<#${findingOpponentChannelId}> に移動してください 🚀`]
      await interaction.reply({ content: firstMessages.join('\n') })

      const channel = interaction.guild?.channels.cache.get(findingOpponentChannelId)
      // なぜか型ついてない
      await (channel as any).send({ content: nextMessages.join('\n'), components })
    }
  },
}

export const tksBreakPartyButtonHandler: ButtonCommandWithDataHandler = {
  customId: 'button-tks-break-party',
  execute: async (interaction, teamId) => {
    const party = await prisma.tksParty.findUnique({ where: { teamId } })
    if (!party) {
      await interaction.reply('パーティーがありません。')
      return
    }
    await prisma.tksParty.delete({ where: { teamId } })
    await interaction.reply('パーティーを解散しました。')
    return
  },
}

export const tksFindOpponentButtonHandler: ButtonCommandWithDataHandler = {
  customId: 'button-tks-find-opponent',
  execute: async (interaction, partyId) => {
    const party = await prisma.tksParty.findUnique({ where: { id: partyId } })
    if (!party) {
      await interaction.reply('パーティーがありません。')
      return
    }
    const findingOpponent = await prisma.tksFindingOpponent.findUnique({ where: { partyId } })
    if (findingOpponent) {
      await interaction.reply('すでに対戦相手を募集中です。')
      return
    }
    // TODO: check if user is in party

    await interaction.showModal(createTksFindOpponentModal(partyId))
  },
}

export const tksFindOpponentModalHandler: ModalCommandWithDataHandler = {
  customId: 'modal-tks-find-opponent',
  execute: async (interaction, partyId) => {
    const party = await prisma.tksParty.findUnique({
      where: { id: partyId },
      include: { team: { include: { tksTeamUsers: { include: { user: true } } } } },
    })
    if (!party) {
      await interaction.reply('パーティーがありません。')
      return
    }
    const findingOpponent = await prisma.tksFindingOpponent.findUnique({ where: { partyId } })
    if (findingOpponent) {
      await interaction.reply('すでに対戦相手を募集中です。')
      return
    }
    const winCountOfMatchStr = interaction.fields.getTextInputValue('winCountOfMatch')
    const winCountOfMatch = Math.trunc(Number(winCountOfMatchStr))
    if (Number.isNaN(winCountOfMatch) || winCountOfMatch <= 0 || 10 < winCountOfMatch) {
      await interaction.reply('N本先取の値が不正です。')
    }
    const description = interaction.fields.getTextInputValue('description') || null
    const rule: SplatRuleSet = 'SplatZones'
    await prisma.tksFindingOpponent.create({
      data: {
        partyId,
        rule,
        winCountOfMatch,
        description,
      },
    })

    const { team } = party
    const teamNameMessage = team.name ? `チーム名: ${team.name}` : `メンバー: ${team.tksTeamUsers.map((u) => u.user.name).join(' ')}`
    const messages = ['対抗戦相手募集', teamNameMessage, `ルール: ${getRuleName(rule)} ${winCountOfMatch}本先取`, description || '']
    await interaction.reply({ content: messages.join('\n'), components: [createTksMatchButton(partyId)] })
    return
  },
}

export const tksMatchButtonHandler: ButtonCommandWithDataHandler = {
  customId: 'button-tks-match',
  execute: async (interaction, targetPartyId) => {
    const { user } = interaction
    const findingOpponent = await prisma.tksFindingOpponent.findUnique({
      where: { partyId: targetPartyId },
      include: { party: { include: { team: { include: { tksTeamUsers: { include: { user: true } } } } } } },
    })
    if (!findingOpponent) {
      await interaction.reply('そのパーティーは対戦相手を募集していないか、解散しています')
      return
    }
    const targetParty = findingOpponent.party

    const parties = await prisma.tksParty.findMany({
      include: { team: { include: { tksTeamUsers: { include: { user: true } } } } },
    })
    const myParty = parties.find((party) => {
      return party.team.tksTeamUsers.some((tu) => tu.userId === user.id)
    })
    if (!myParty) {
      await interaction.reply(`${user.username} はパーティーを結成していません。\n/tks-party で結成するか、/tks-recruit で味方募集してください。`)
      return
    }
    if (myParty.id === targetPartyId) {
      await interaction.reply('自分のパーティーとは対戦できません。')
      return
    }

    const { rule, winCountOfMatch } = findingOpponent
    const { match } = await prisma.$transaction(async (prisma) => {
      await prisma.tksParty.delete({ where: { id: targetParty.id } })
      await prisma.tksParty.delete({ where: { id: myParty.id } })
      const match = await prisma.tksMatch.create({
        data: {
          primaryTeamId: targetParty.teamId,
          opponentTeamId: myParty.teamId,
          winCountOfMatch,
          rule,
        },
      })
      return { match }
    })
    const alphaTeam = targetParty.team
    const bravoTeam = myParty.team
    const messages = [
      '対抗戦開始 🚀',
      `アルファ: [チーム名: ${alphaTeam.name || '(未定)'}] ${alphaTeam.tksTeamUsers.map((tu) => tu.user.name).join(' ')}`,
      `ブラボー: [チーム名: ${bravoTeam.name || '(未定)'}] ${bravoTeam.tksTeamUsers.map((tu) => tu.user.name).join(' ')}`,
      '',
      '結果報告はアルファチームが行ってください 💪',
    ]
    const components = [createTksReportButton(match.id)]
    await interaction.reply({ content: messages.join('\n'), components })
  },
}

export const tksReportButtonHandler: ButtonCommandWithDataHandler = {
  customId: 'button-tks-report',
  execute: async (interaction, matchId) => {
    const { user } = interaction
    const match = await prisma.tksMatch.findUnique({
      where: { id: matchId },
      include: { primaryTeam: { include: { tksTeamUsers: true } } },
    })
    if (!match) {
      await interaction.reply('対抗戦が存在しません。')
      return
    }
    if (!match.primaryTeam.tksTeamUsers.some((tu) => tu.userId === user.id)) {
      await interaction.reply('報告はアルファチームのメンバーが行ってください。')
      return
    }
    await interaction.showModal(createTksReportModal(matchId))
  },
}
export const tksReportModalHandler: ModalCommandWithDataHandler = {
  customId: 'modal-tks-report',
  execute: async (interaction, matchId) => {
    const { user } = interaction
    const match = await prisma.tksMatch.findUnique({
      where: { id: matchId },
      include: {
        primaryTeam: { include: { tksTeamUsers: { include: { user: true } } } },
        opponentTeam: { include: { tksTeamUsers: { include: { user: true } } } },
      },
    })
    if (!match) {
      await interaction.reply('対抗戦が存在しません。')
      return
    }
    if (!match.primaryTeam.tksTeamUsers.some((tu) => tu.userId === user.id)) {
      await interaction.reply('報告はアルファチームのメンバーが行ってください。')
      return
    }

    const primaryWinCountStr = interaction.fields.getTextInputValue('primaryWinCount')
    const primaryWinCount = Math.trunc(Number(primaryWinCountStr))
    const opponentWinCountStr = interaction.fields.getTextInputValue('opponentWinCount')
    const opponentWinCount = Math.trunc(Number(opponentWinCountStr))
    const isInterruptedStr = interaction.fields.getTextInputValue('isInterrupted')
    const isInterrupted = isInterruptedStr === '1'

    if (primaryWinCount < 0 || opponentWinCount < 0) {
      await interaction.reply('勝利数が不正です。')
      return
    }
    if (primaryWinCount > match.winCountOfMatch || opponentWinCount > match.winCountOfMatch) {
      await interaction.reply(`${match.winCountOfMatch} 本先取の値より大きい勝利数は登録できません。`)
      return
    }
    if (primaryWinCount === match.winCountOfMatch && opponentWinCount === match.winCountOfMatch) {
      await interaction.reply(`${match.winCountOfMatch} 本先取の値に両チームが到達することはできません。`)
      return
    }
    if (!isInterrupted && primaryWinCount !== match.winCountOfMatch && opponentWinCount !== match.winCountOfMatch) {
      await interaction.reply(`${match.winCountOfMatch} 本先取の値に両チームとも到達していません。この入力が正しい場合、中断フラグに1を入力してください。`)
      return
    }

    const { primaryTeamId, opponentTeamId, winCountOfMatch, rule } = match
    await prisma.$transaction(async (prisma) => {
      await prisma.tksMatch.delete({ where: { id: matchId } })
      await prisma.tksMatchResult.create({
        data: {
          primaryTeamId,
          opponentTeamId,
          winCountOfMatch,
          primaryWinCount,
          opponentWinCount,
          matchStartedAt: match.createdAt,
          rule,
        },
      })
    })
    const { primaryTeam, opponentTeam } = match
    const messages = [
      `アルファ: [チーム名: ${primaryTeam.name || '(未定)'}] ${primaryTeam.tksTeamUsers.map((tu) => tu.user.name).join(' ')}`,
      `ブラボー: [チーム名: ${opponentTeam.name || '(未定)'}] ${opponentTeam.tksTeamUsers.map((tu) => tu.user.name).join(' ')}`,
      '',
      `結果: アルファ ${primaryWinCount} - ${opponentWinCount} ブラボー 💡`,
    ]
    interaction.reply({ content: messages.join('\n') })
  },
}
