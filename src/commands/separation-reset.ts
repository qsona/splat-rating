import assertNever from 'assert-never'
import { CommandHandler } from '../../bot'
import { resetJoinedUsersSeparation } from '../operations/resetJoinedUsersSeparation'

const handler: CommandHandler = {
  commandName: 'sr-separation-reset',
  execute: async (interaction) => {
    const { channelId } = interaction

    const result = await resetJoinedUsersSeparation(channelId)

    if (result.error) {
      switch (result.error) {
        case 'ROOM_DOES_NOT_EXIST':
          await interaction.reply('このチャンネルに募集中のゲームは現在ありません。')
          return
        default:
          assertNever(result)
      }
    }

    await interaction.reply('ユーザのチーム分離の設定をリセットしました。')
  },
}

export default handler
