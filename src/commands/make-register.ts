import { CommandHandler } from '../../bot'

import { SplatRuleSet, getRuleName } from '../rules'
import { registerUserAndRating } from '../operations/registerUserAndRating'
import { getUserFromMentionable } from './helpers/mentionable'

const handler: CommandHandler = {
  commandName: 'sr-make-register',
  execute: async (interaction) => {
    const { guildId, guild } = interaction
    if (!guildId) {
      console.log(`guildId not found. interaction: ${interaction.toJSON()}`)
      await interaction.reply('guildId が存在しません。管理者にご連絡ください。')
      return
    }

    const mentionable = interaction.options.getMentionable('user')!
    const user = getUserFromMentionable(mentionable)
    if (!user) {
      console.log('Error mentionable:', mentionable)
      await interaction.reply('user にはユーザを指定してください')
      return
    }
    const gachipower = interaction.options.getNumber('gachipower')!
    const rule = interaction.options.getString('rule') as SplatRuleSet
    const rulename = getRuleName(rule)

    const { id, username } = user
    const name = username

    // register rating
    const result = await registerUserAndRating(id, username, guildId, rule, gachipower)
    if (result === 'RATING_ALREADY_REGISTERED') {
      await interaction.reply(`${guild?.name} において  ユーザー ${name} の ${rulename} のレーティングはすでに登録されています。`)
      return
    }

    const messages = []
    if (result.isNewUser) {
      messages.push(`ユーザー ${name} が新しく登録されました。(ID: ${id})`)
    }

    messages.push(`ユーザー ${name} の ${rulename} のレーティングが登録されました。 初期値: ${gachipower}`)

    await interaction.reply(messages.join('\n'))
  },
}

export default handler
