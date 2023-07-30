import assert from 'assert'
import { CommandHandler } from '../../bot'
import { prisma } from '../prismaClient'
import { createMatching } from '../operations/createMatching'
import { inspectTeamUsers } from '../inspectors'
import { createRow, createWinButton, createLoseButton, createCancelButton } from './helpers/buttons'
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js'
import { ButtonCommandHandler } from './buttonHandlers'

const matchExecute = async (interaction: ButtonInteraction | ChatInputCommandInteraction) => {
  const { id } = interaction.user
  const { channelId } = interaction

  const result = await createMatching(id, channelId)

  if (result === 'ROOM_DOES_NOT_EXIST') {
    await interaction.reply('このチャンネルに募集中のゲームは現在ありません。')
    return
  }
  if (result === 'MATCHING_EXISTS') {
    await interaction.reply('すでにマッチングが存在します。ホストは `/sr-report` コマンドで結果を報告してください。')
    return
  }
  if (result === 'JOINED_USERS_NOT_ENOUGH') {
    await interaction.reply(`参加人数が足りません。`)
    return
  }

  const { matching, watchingUserIds } = result
  const messages = [await inspectTeamsUsers(matching.teamsRatingIds as string[][])]
  if (watchingUserIds.length > 0) {
    const usernames = (await prisma.user.findMany({ where: { id: { in: watchingUserIds } }, select: { name: true } })).map((u) => u.name)
    messages.push(`観戦: ${usernames.join(' ')}`)
  }
  await interaction.reply({ content: messages.join('\n'), components: [createRow(createWinButton(), createLoseButton(), createCancelButton())] })
}

const handler: CommandHandler = {
  commandName: 'sr-match',
  execute: matchExecute,
}

const inspectTeamsUsers = async (teamsRatingIds: string[][]): Promise<string> => {
  const teamsUsers = await getTeamsUsers(teamsRatingIds)

  const [alphaTeamUsers, bravoTeamUsers] = teamsUsers.map((tus) => tus.map((tu) => ({ mu: tu.mu, username: tu.user.name })))

  return `アルファチーム: ${inspectTeamUsers(alphaTeamUsers)}\nブラボーチーム: ${inspectTeamUsers(bravoTeamUsers)}`
}

const getTeamsUsers = async (teamsRatingIds: string[][]) => {
  const ratingsWithUser = await prisma.rating.findMany({
    where: {
      id: { in: teamsRatingIds.flatMap((ids) => ids) },
    },
    include: { user: { select: { name: true } } },
  })
  return teamsRatingIds.map((teamRatingIds) =>
    teamRatingIds.map((ratingId) => {
      const ratingWithUser = ratingsWithUser.find((ru) => ru.id === ratingId)
      assert(ratingWithUser, `Rating not found. id: ${ratingId}`)
      return ratingWithUser
    })
  )
}

export default handler

export const matchButtonHandler: ButtonCommandHandler = {
  customId: 'button-match',
  execute: matchExecute,
}
