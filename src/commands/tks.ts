import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

import { CommandHandler } from '../../bot'
import { prisma } from '../prismaClient'
import { ButtonCommandWithDataHandler } from './buttonHandlers'
import { ModalCommandHandler, ModalCommandWithDataHandler } from './modalHandlers'
import { getUserFromMentionable } from './helpers/mentionable'
import { uniq } from 'lodash'
import { SplatRuleSet, getRuleName } from '../rules'
import { calcTeamId } from '../models/TksTeam'
import { inspectTksTeam } from '../inspectors'
import { tksCreateParty } from '../operations/tksCreateParty'
import assertNever from 'assert-never'
import { createSplatZonesRegisterButton } from './helpers/buttons'
import { tksReport } from '../operations/tksReport'

const recruitingChannelId = '1043582923644874784'
const findingOpponentChannelId = '1043583020457807982'

// button and modals

export const createTksRecruitModal = () => {
  const modal = new ModalBuilder().setCustomId(`modal-tks-recruit`).setTitle('対抗戦味方募集')
  const input = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('募集の説明 (自分のパワー目安、持ちブキ、希望するパワー目安、開始時間など)') // length must be <45
    .setRequired(false)
    .setStyle(TextInputStyle.Paragraph)
  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input)
  modal.addComponents(firstActionRow)
  return modal
}

export const createTksLeaveRoomButton = (tksRecruitingRoomId: string) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`button-tks-leave-room@${tksRecruitingRoomId}`).setLabel('抜ける').setStyle(ButtonStyle.Secondary)
  )
}

export const createTksBreakRoomButton = (tksRecruitingRoomId: string) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`button-tks-break-room@${tksRecruitingRoomId}`).setLabel('解散').setStyle(ButtonStyle.Danger)
  )
}

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
  // const winCountOfMatchInput = new TextInputBuilder().setCustomId('winCountOfMatch').setLabel('N本先取(整数)').setRequired(true).setStyle(TextInputStyle.Short)
  const descriptionInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('募集の説明 (パーティーのウデマエ/パワー目安、対戦相手への希望、開始時間など)')
    .setRequired(false)
    .setStyle(TextInputStyle.Paragraph)
  // 一旦3先で固定する
  // const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(winCountOfMatchInput)
  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
  modal.addComponents(firstActionRow)
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
    const { guildId } = interaction
    const { id, username } = interaction.user

    const isAlreadyRecruiting = !!(await prisma.tksRecruitingRoomUser.findUnique({ where: { userId: id } }))
    if (isAlreadyRecruiting) {
      await interaction.reply(`${username} はすでに対抗戦味方募集中です。`)
      return
    }

    const rule: SplatRuleSet = 'SplatZones'
    const rating = await prisma.rating.findUnique({ where: { userId_guildId_rule: { userId: id, guildId: guildId!, rule } } })
    if (!rating) {
      await interaction.reply({
        content: `${username} のレーティングが未登録です。下のボタンを押して登録してください。`,
        components: [createSplatZonesRegisterButton()],
      })
    }

    await interaction.showModal(createTksRecruitModal())
  },
}

export const tksRecruitModalHandler: ModalCommandHandler = {
  customId: 'modal-tks-recruit',
  execute: async (interaction) => {
    const { id, username } = interaction.user

    const isAlreadyRecruiting = await prisma.tksRecruitingRoomUser.findUnique({ where: { userId: id } })
    if (isAlreadyRecruiting) {
      await interaction.reply(`${username} はすでに対抗戦味方募集中です。`)
      return
    }

    const description = interaction.fields.getTextInputValue('description') || null

    const { tksRecruitingRoom } = await prisma.$transaction(async (prisma) => {
      await prisma.user.upsert({ where: { id }, update: {}, create: { id, name: username } })
      const tksRecruitingRoom = await prisma.tksRecruitingRoom.create({
        data: {
          creatorUserId: id,
          description,
        },
      })
      await prisma.tksRecruitingRoomUser.create({ data: { userId: id, recruitingRoomId: tksRecruitingRoom.id } })
      return { tksRecruitingRoom }
    })
    // const messages = ['@everyone', `${username}: 対抗戦味方募集@3`]
    const messages = ['通知切ってますなう', `${username}: 対抗戦味方募集@3`]
    if (description) messages.push(description)
    await interaction.reply({
      content: messages.join('\n'),
      components: [createTksRoomJoinButton(tksRecruitingRoom.id), createTksBreakRoomButton(tksRecruitingRoom.id)],
    })
  },
}

export const tksRoomJoinButtonHandler: ButtonCommandWithDataHandler = {
  customId: 'button-tks-room-join',
  execute: async (interaction, tksRecruitingRoomId) => {
    const { guildId } = interaction
    const { id, username } = interaction.user
    const room = await prisma.tksRecruitingRoom.findUnique({
      where: { id: tksRecruitingRoomId },
      include: { recruitingRoomUsers: { include: { user: true } } },
    })
    if (!room) {
      await interaction.reply({ content: 'その募集はすでに解散しています。', ephemeral: true })
      return
    }
    if (room.recruitingRoomUsers.some((ru) => ru.userId === id)) {
      await interaction.reply({ content: 'すでに参加しています。', ephemeral: true })
      return
    }

    const rule: SplatRuleSet = 'SplatZones'
    const rating = await prisma.rating.findUnique({ where: { userId_guildId_rule: { userId: id, guildId: guildId!, rule } } })
    if (!rating) {
      await interaction.reply({
        content: `${username} のレーティングが未登録です。下のボタンを押して登録してください。`,
        components: [createSplatZonesRegisterButton()],
      })
    }

    const users = room.recruitingRoomUsers.map((ru) => ru.user)
    if (users.length >= 4) {
      throw new Error(`bug: room is already full ${room.id}`)
    }

    if (users.length < 3) {
      await prisma.tksRecruitingRoomUser.create({ data: { recruitingRoomId: room.id, userId: id } })
      const messages = [`${username} が参加しました。`, `@everyone 対抗戦味方募集@${3 - users.length}`]
      if (room.description) messages.push(room.description)
      await interaction.reply({
        content: messages.join('\n'),
        components: [createTksRoomJoinButton(tksRecruitingRoomId), createTksLeaveRoomButton(tksRecruitingRoomId)],
      })
      return
    }

    // go to next stage!
    const userIds = [...users.map((user) => user.id), id]
    const usernames = [...users.map((user) => user.name), username]
    const teamId = calcTeamId(userIds)

    const result = await tksCreateParty(userIds, guildId!)
    if (result.error) {
      if (result.error === 'RATING_NOT_REGISTERED') {
        // 本当はこないはずだが一応
        const { ratingUnregisteredUserIds } = result
        const unregisteredUsernames = ratingUnregisteredUserIds.map((userId) => users.find((u) => (u.id = userId))?.name)
        await interaction.reply({
          content: `${unregisteredUsernames.join(' ')} のレーティングが未登録です。下のボタンを押して登録してください。`,
          components: [createSplatZonesRegisterButton()],
        })
        return
      }
    }
    const { team, teamRating, party } = result
    const teamNameMessage = inspectTksTeam(team, teamRating) // team.name ? `チーム名: ${team.name}` : `メンバー: ${usernames.join(' ')}`
    const message = [
      `${username} が参加しました。`,
      `対抗戦味方募集@うまり`,
      teamNameMessage,
      `メンバーは<#${findingOpponentChannelId}> に移動してください 🚀`,
    ].join('\n')

    await interaction.reply({ content: message })

    const channel = interaction.guild?.channels.cache.get(findingOpponentChannelId)
    const nextMessages = [`${usernames.join(' ')} がパーティーを結成したぞ!`]
    nextMessages.push(teamNameMessage)
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
    const team = await prisma.tksTeam.findUnique({ where: { id: tksTeamId }, include: { tksTeamUsers: true } })
    if (!team) {
      await interaction.reply({ content: 'チームがありません。', ephemeral: true })
      return
    }
    if (team.tksTeamUsers.every((tu) => tu.userId !== interaction.user.id)) {
      await interaction.reply({ content: 'チームのメンバーではありません。', ephemeral: true })
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
      await interaction.reply({ content: 'チームがありません。', ephemeral: true })
      return
    }
    await prisma.tksTeam.update({ where: { id: tksTeamId }, data: { name: teamName } })
    await interaction.reply({
      content: `チーム名を${team.name == null ? '登録' : '変更'}しました: ${teamName}`,
    })
  },
}

export const tksLeaveRoomButtonHandler: ButtonCommandWithDataHandler = {
  customId: 'button-tks-leave-room',
  execute: async (interaction, tksRecruitingRoomId) => {
    const { user } = interaction
    const room = await prisma.tksRecruitingRoom.findUnique({
      where: { id: tksRecruitingRoomId },
      include: { recruitingRoomUsers: true },
    })
    if (!room) {
      await interaction.reply({ content: 'その募集はすでに解散しています。', ephemeral: true })
      return
    }
    const roomUser = room.recruitingRoomUsers.find((ru) => ru.userId === user.id)
    if (!roomUser) {
      await interaction.reply({ content: `${user.username} はこの募集に参加していません。`, ephemeral: true })
      return
    }
    await prisma.tksRecruitingRoomUser.delete({ where: { id: roomUser.id } })
    await interaction.reply(`${user.username} が募集から抜けました。`)
  },
}

export const tksBreakRoomButtonHandler: ButtonCommandWithDataHandler = {
  customId: 'button-tks-break-room',
  execute: async (interaction, tksRecruitingRoomId) => {
    const { user } = interaction
    const room = await prisma.tksRecruitingRoom.findUnique({ where: { id: tksRecruitingRoomId } })
    if (!room) {
      await interaction.reply({ content: 'その募集はすでに解散しています。', ephemeral: true })
      return
    }
    if (room.creatorUserId !== user.id) {
      await interaction.reply({ content: `${user.username} はこの募集のホストではありません。`, ephemeral: true })
      return
    }
    await prisma.tksRecruitingRoom.delete({ where: { id: tksRecruitingRoomId } })
    await interaction.reply('募集を解散しました。')
  },
}

export const tksPartyHandler: CommandHandler = {
  commandName: 'tks-party',
  execute: async (interaction) => {
    const { user, channelId, guildId } = interaction
    const mentionable2 = interaction.options.getMentionable('user2')!
    const user2 = getUserFromMentionable(mentionable2)!
    const mentionable3 = interaction.options.getMentionable('user3')!
    const user3 = getUserFromMentionable(mentionable3)!
    const mentionable4 = interaction.options.getMentionable('user4')!
    const user4 = getUserFromMentionable(mentionable4)!

    const users = [user, user2, user3, user4]
    const userIds = users.map((user) => user.id)
    if (uniq(userIds).length !== 4) {
      await interaction.reply({ content: '同一のユーザーが含まれています。', ephemeral: true })
      return
    }

    const result = await tksCreateParty(userIds, guildId!)
    if (result.error) {
      if (result.error === 'RATING_NOT_REGISTERED') {
        const { ratingUnregisteredUserIds } = result
        const usernames = ratingUnregisteredUserIds.map((userId) => users.find((u) => (u.id = userId))?.username)
        await interaction.reply({
          content: `${usernames.join(' ')} のレーティングが未登録です。下のボタンを押して登録してください。`,
          components: [createSplatZonesRegisterButton()],
        })
        return
      }
      assertNever(result)
    }

    const { team, party, teamRating } = result
    const usernames = users.map((user) => user.username)

    const nextMessages = [`${usernames.join(' ')} がパーティーを結成したぞ!`]
    nextMessages.push(inspectTksTeam(team, teamRating))

    const components = [
      createTksFindOpponentButton(party.id),
      // createTksMatchButton(teamId),
      createTksSetTeamNameButton(team.id),
      createTksBreakPartyButton(team.id),
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
      await interaction.reply({ content: 'パーティーがありません。', ephemeral: true })
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
      await interaction.reply({ content: 'パーティーがありません。', ephemeral: true })
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
      await interaction.reply({ content: 'パーティーがありません。', ephemeral: true })
      return
    }
    const findingOpponent = await prisma.tksFindingOpponent.findUnique({ where: { partyId } })
    if (findingOpponent) {
      await interaction.reply('すでに対戦相手を募集中です。')
      return
    }
    // 一旦 winCountOfMatch は 3 で固定
    // const winCountOfMatchStr = interaction.fields.getTextInputValue('winCountOfMatch')
    // const winCountOfMatch = Math.trunc(Number(winCountOfMatchStr))
    // if (Number.isNaN(winCountOfMatch) || winCountOfMatch <= 0 || 10 < winCountOfMatch) {
    //   await interaction.reply('N本先取の値が不正です。')
    // }
    const winCountOfMatch = 3
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
      await interaction.reply({ content: 'そのパーティーは対戦相手を募集していないか、解散しています', ephemeral: true })
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

    const primaryWinCountStr = interaction.fields.getTextInputValue('primaryWinCount')
    const primaryWinCount = Math.trunc(Number(primaryWinCountStr))
    const opponentWinCountStr = interaction.fields.getTextInputValue('opponentWinCount')
    const opponentWinCount = Math.trunc(Number(opponentWinCountStr))
    const isInterruptedStr = interaction.fields.getTextInputValue('isInterrupted')
    const isInterrupted = isInterruptedStr === '1'

    const result = await tksReport(user.id, matchId, primaryWinCount, opponentWinCount, isInterrupted)

    if (result.error) {
      switch (result.error) {
        case 'MATCH_NOT_FOUND':
          await interaction.reply('対抗戦が存在しません。')
          return
        case 'USER_NOT_IN_PRIMARY_TEAM':
          await interaction.reply('報告はアルファチームのメンバーが行ってください。')
          return
        case 'INVALID_WIN_COUNT':
          await interaction.reply('勝利数が不正です。')
          return
        case 'WIN_COUNT_GREATER_THAN_WIN_COUNT_OF_MATCH':
          await interaction.reply(`${result.match.winCountOfMatch} 本先取の値より大きい勝利数は登録できません。`)
          return
        case 'BOTH_WIN_COUNT_ARE_WIN_COUNT_OF_MATCH':
          await interaction.reply(`${result.match.winCountOfMatch} 本先取の値に両チームが到達することはできません。`)
          return
        case 'BOTH_WIN_COUNT_ARE_NOT_WIN_COUNT_OF_MATCH':
          await interaction.reply(
            `${result.match.winCountOfMatch} 本先取の値に両チームとも到達していません。この入力が正しい場合、中断フラグに1を入力してください。`
          )
          return
        default:
          assertNever(result)
      }
    }

    const { deletedMatch: match } = result
    const { primaryTeam, opponentTeam } = match
    const messages = [
      `アルファ: [チーム名: ${primaryTeam.name || '(未定)'}] ${primaryTeam.tksTeamUsers.map((tu) => tu.user.name).join(' ')}`,
      `ブラボー: [チーム名: ${opponentTeam.name || '(未定)'}] ${opponentTeam.tksTeamUsers.map((tu) => tu.user.name).join(' ')}`,
      '',
      `結果: アルファ ${primaryWinCount} - ${opponentWinCount} ブラボー 💡`,
    ]
    if (isInterrupted) {
      messages.push('中断')
    }
    interaction.reply({ content: messages.join('\n') })
  },
}
