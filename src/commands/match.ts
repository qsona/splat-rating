import assert from 'assert'
import { Rating, User } from '@prisma/client'
import { sumBy } from 'lodash'
import { CommandHandler } from '../../bot'
import { prisma } from '../prismaClient'
import { createMatching } from '../operations/createMatching'

const handler: CommandHandler = {
  commandName: 'sr-match',
  execute: async (interaction) => {
    const { channelId } = interaction
    const { id, username } = interaction.user

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

    const { matching } = result
    const message = await inspectTeamsUsers(matching.teamsRatingIds as string[][])
    await interaction.reply(message)
  },
}

const inspectTeamsUsers = async (teamsRatingIds: string[][]): Promise<string> => {
  const teamsUsers = await getTeamsUsers(teamsRatingIds)

  const [alphaTeamUsers, bravoTeamUsers] = teamsUsers

  return `アルファチーム: ${inspectTeamUsers(alphaTeamUsers)}\nブラボーチーム: ${inspectTeamUsers(bravoTeamUsers)}`
}

const getTeamsUsers = async (teamsRatingIds: string[][]) => {
  const ratingsWithUser = await prisma.rating.findMany({
    where: {
      id: { in: teamsRatingIds.flatMap((ids) => ids) },
    },
    include: { user: true },
  })
  return teamsRatingIds.map((teamRatingIds) =>
    teamRatingIds.map((ratingId) => {
      const ratingWithUser = ratingsWithUser.find((ru) => ru.id === ratingId)
      assert(ratingWithUser, `Rating not found. id: ${ratingId}`)
      return ratingWithUser
    })
  )
}

// private
const inspectTeamUsers = (teamUsers: (Rating & { user: User })[]) => {
  const usersStr = teamUsers.map((ru) => `${ru.user.name} (R${ru.mu})`).join(' ')
  const totalStr = `合計R(${sumBy(teamUsers, (ru) => ru.mu)}`
  return `${totalStr} | ${usersStr}`
}

export default handler
