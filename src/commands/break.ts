import { CommandHandler } from '../../bot'

const handler: CommandHandler = {
  commandName: 'sr-break',
  execute: async (interaction) => {
    await interaction.reply('まだつくってないですごめんなさい')
  },
}

export default handler
