import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import { prisma } from '../prismaClient'
import { ButtonCommandHandler } from './buttonHandlers'
import { ModalCommandHandler } from './modalHandlers'

export const updateUsernameButtonHandler: ButtonCommandHandler = {
  customId: 'button-update-username',
  execute: async (interaction) => {
    const user = await prisma.user.findUnique({ where: { id: interaction.user.id } })
    if (!user) {
      await interaction.reply({ content: `ユーザ ${interaction.user.username} はまだ登録されていません。`, ephemeral: true })
      return
    }

    const modal = createUpdateUsernameModal()
    await interaction.showModal(modal)
  },
}

export const createUpdateUsernameModal = () => {
  const modal = new ModalBuilder().setCustomId('modal-update-username').setTitle('ユーザ名を変更する')
  const usernameInput = new TextInputBuilder().setCustomId('usernameInput').setLabel('新しいユーザ名').setStyle(TextInputStyle.Short)

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(usernameInput)
  modal.addComponents(firstActionRow)
  return modal
}

export const updateUsernameModalHandler: ModalCommandHandler = {
  customId: 'modal-update-username',
  execute: async (interaction) => {
    const user = await prisma.user.findUnique({ where: { id: interaction.user.id } })
    if (!user) {
      await interaction.reply({ content: `ユーザ ${interaction.user.username} はまだ登録されていません。`, ephemeral: true })
      return
    }

    const newUsername = interaction.fields.getTextInputValue('usernameInput')
    if (!newUsername) {
      await interaction.reply({ content: `ユーザ名を入力してください。`, ephemeral: true })
      return
    }

    await prisma.user.update({ where: { id: interaction.user.id }, data: { name: newUsername } })
    await interaction.reply({ content: `ユーザ名を ${user.name} => ${newUsername} に変更しました。`, ephemeral: true })
  },
}
