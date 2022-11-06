import { CommandHandler } from '../../bot'
import { getUserFromMentionable } from './helpers/mentionable'
import { createJoinedUsersSeparation } from '../operations/createJoinedUsersSeparation'
import assertNever from 'assert-never'

const handler: CommandHandler = {
  commandName: 'sr-separate',
  execute: async (interaction) => {
    const { channelId } = interaction

    const mentionable1 = interaction.options.getMentionable('user1')!
    const user1 = getUserFromMentionable(mentionable1)
    const mentionable2 = interaction.options.getMentionable('user2')!
    const user2 = getUserFromMentionable(mentionable2)

    if (!user1 || !user2) {
      console.log('Error mentionable:', mentionable1, mentionable2)
      await interaction.reply('user にはユーザを指定してください')
      return
    }

    const result = await createJoinedUsersSeparation([user1.id, user2.id], channelId)

    if (result.error) {
      let message: string
      switch (result.error) {
        case 'SAME_USER_SPECIFIED':
          message = '同じユーザが指定されています。'
          break
        case 'ROOM_DOES_NOT_EXIST':
          message = 'このチャンネルに募集中のゲームは現在ありません。'
          break
        case 'USER_NOT_JOINED':
          message = 'ユーザは募集中のゲームに参加していません。'
          break
        case 'SEPARATION_CONFLICTED':
          message = 'すでに登録されている Separation と衝突しています。解消したいときは /sr-reset-separation を利用してください。'
          break
        default:
          assertNever(result)
      }
      await interaction.reply(message)
      return
    }

    const messages = [
      `Separation を作成しました。 ${user1.username} と ${user2.username} は必ず別のチームになります。`,
      '(解消したいときは /sr-separation-reset を利用してください。)',
    ]
    await interaction.reply(messages.join('\n'))
  },
}

export default handler
