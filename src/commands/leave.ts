import { CommandHandler } from '../../bot'

const handler: CommandHandler = {
  commandName: 'sr-leave',
  execute: async (interaction) => {
    await interaction.reply('まだつくってないですごめんなさい')
  },
}

export default handler
