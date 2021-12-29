import { Rating, User } from '@prisma/client'
import { sumBy } from 'lodash'
import { prisma } from '../prismaClient'
import { CommandHandler } from '../../bot'

import { joinRoom } from '../operations/joinRoom'
import assert from 'assert'

const handler: CommandHandler = {
  commandName: 'sr-join',
  execute: async (interaction) => {
    const { channelId } = interaction
    const { id, username } = interaction.user

    const result = await joinRoom(id, channelId)

    if (result === 'ROOM_DOES_NOT_EXIST') {
      await interaction.reply('このチャンネルに募集中のゲームは現在ありません。')
      return
    }
    if (result === 'RATING_DOES_NOT_EXIST') {
      await interaction.reply(`${username} さんはレーティング登録がまだです。/sr-register コマンドで登録してください。`)
      return
    }
    if (result === 'USER_ALREADY_JOINED') {
      await interaction.reply(`${username} さんはすでに参加しています。`)
      return
    }

    const isPlayable = result.remainUsersCount === 0

    if (isPlayable) {
      const messages = [`ゲーム参加 ${username} (R${result.rating.mu}) @うまり`, '`/sr-match` でチーム分けしてください']
      await interaction.reply(messages.join('\n'))
      return
    }

    await interaction.reply(`ゲーム参加 ${username} (R${result.rating.mu}) @${result.remainUsersCount}`)
  },
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

const inspectTeamsUsers = async (teamsRatingIds: string[][]): Promise<string> => {
  const teamsUsers = await getTeamsUsers(teamsRatingIds)

  const [alphaTeamUsers, bravoTeamUsers] = teamsUsers

  return `アルファチーム: ${inspectTeamUsers(alphaTeamUsers)}\nブラボーチーム: ${inspectTeamUsers(bravoTeamUsers)}`
}

// private
const inspectTeamUsers = (teamUsers: (Rating & { user: User })[]) => {
  const usersStr = teamUsers.map((ru) => `${ru.user.name} (R${ru.mu})`).join(' ')
  const totalStr = `合計R(${sumBy(teamUsers, (ru) => ru.mu)}`
  return `${totalStr} | ${usersStr}`
}

export default handler
