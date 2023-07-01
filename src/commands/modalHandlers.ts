import assertNever from 'assert-never'
import { ModalSubmitInteraction } from 'discord.js'
import { registerUserAndRating } from '../operations/registerUserAndRating'
import { joinRoom } from '../operations/joinRoom'
import { SplatRuleSet, getRuleName, SPLAT_RULES_NAME_MAP } from '../rules'
import { inspectR } from '../inspectors'
import { createJoinButton, createMatchButton } from './helpers/buttons'
import { tksRecruitModalHandler, tksSetTeamNameModalHandler, tksFindOpponentModalHandler, tksReportModalHandler } from './tks'

export type ModalCommandHandler = {
  customId: string
  execute: (interaction: ModalSubmitInteraction) => Promise<void>
}

export type ModalCommandWithDataHandler = {
  customId: string
  execute: (interaction: ModalSubmitInteraction, data: string) => Promise<void>
}

const handlers = new Map<string, ModalCommandHandler>()
const withDataHandlers = new Map<string, ModalCommandWithDataHandler>()

export const execute = async (interaction: ModalSubmitInteraction) => {
  const { customId } = interaction
  console.log('Modal command customId:', customId)
  console.log('user:', interaction.user)

  const handler = handlers.get(customId)
  if (handler) {
    await handler.execute(interaction)
  }

  const result = customId.match(/(.+?)@(.+)/)
  if (result) {
    const handler = withDataHandlers.get(result[1])
    if (handler) {
      await handler.execute(interaction, result[2])
    }
  }
  return
}

const dashHandler: ModalCommandHandler = {
  customId: 'modal-dash',
  execute: async (interaction) => {
    const countStr = interaction.fields.getTextInputValue('countInput')
    const count = Math.min(Math.max(Math.trunc(Number(countStr)) || 0, 0), 100)
    await interaction.reply(`Dash! ⊂${'二'.repeat(count)}（ ＾ω＾）${'二'.repeat(count)}⊃`)
  },
}

const createRegisterAndJoinModalHandler = (rule: SplatRuleSet): ModalCommandHandler => {
  return {
    customId: `modal-register-and-join-${rule}`,
    execute: async (interaction) => {
      const { guildId, guild, channelId } = interaction
      if (!channelId) {
        console.log(`channelId not found. interaction: ${interaction.toJSON()}`)
        await interaction.reply('channelId が存在しません。管理者にご連絡ください。')
        return
      }
      if (!guildId) {
        console.log(`guildId not found. interaction: ${interaction.toJSON()}`)
        await interaction.reply('guildId が存在しません。管理者にご連絡ください。')
        return
      }
      const gachipowerStr = interaction.fields.getTextInputValue('gachipowerInput')
      const gachipower = Math.trunc(Number(gachipowerStr)) || 0
      if (gachipower < 600 || 3200 < gachipower) {
        await interaction.reply('gachipower には 600 から 3200 までの値を入力してください')
        return
      }
      const rulename = getRuleName(rule)

      const { id, username } = interaction.user
      const name = username

      // register rating
      const result = await registerUserAndRating(id, username, guildId, rule, gachipower)
      if (result === 'RATING_ALREADY_REGISTERED') {
        await interaction.reply(`${guild?.name} において ユーザー ${name} の ${rulename} のレーティングはすでに登録されています。`)
        return
      }

      const messages = []
      if (result.isNewUser) {
        messages.push(`ユーザー ${name} が新しく登録されました。(ID: ${id})`)
      }

      messages.push(`ユーザー ${name} の ${rulename} のレーティングが登録されました。 初期値: ${gachipower}`)

      // join room
      const joinResult = await joinRoom(id, channelId, guildId)

      if (joinResult.error) {
        if (joinResult.error === 'ROOM_DOES_NOT_EXIST') {
          messages.push('このチャンネルに募集中のゲームは現在ありません。')
        } else if (joinResult.error === 'USER_ALREADY_JOINED') {
          messages.push(`${username} さんはすでに参加しています。`)
        } else if (joinResult.error === 'TOO_MANY_JOINED_USERS') {
          messages.push('このチャンネルのゲームは定員を超えています。')
        } else if (joinResult.error === 'RATING_DOES_NOT_EXIST') {
          messages.push('(さっき登録されたはずなのになぜか)レーティングが登録されていません。')
        } else {
          assertNever(joinResult)
        }
        await interaction.reply(messages.join('\n'))
        return
      }

      const remainMinUsersCount = Math.max(joinResult.remainMinUsersCount, 0)
      const { remainMaxUsersCount } = joinResult
      messages.push(`${username} さんがゲームに参加しました。 (${inspectR(result.rating.mu)})\n@${remainMinUsersCount}~${remainMaxUsersCount}`)

      const components = []
      if (remainMinUsersCount === 0) components.push(createMatchButton())
      if (remainMaxUsersCount !== 0) components.push(createJoinButton())

      await interaction.reply({ content: messages.join('\n'), components })
    },
  }
}

const createRegisterModalHandler = (rule: SplatRuleSet): ModalCommandHandler => {
  return {
    customId: `modal-register-${rule}`,
    execute: async (interaction) => {
      const { guildId, guild } = interaction
      if (!guildId) {
        console.log(`guildId not found. interaction: ${interaction.toJSON()}`)
        await interaction.reply('guildId が存在しません。管理者にご連絡ください。')
        return
      }
      const gachipowerStr = interaction.fields.getTextInputValue('gachipowerInput')
      const gachipower = Math.trunc(Number(gachipowerStr)) || 0
      if (gachipower < 600 || 3200 < gachipower) {
        await interaction.reply('gachipower には 600 から 3200 までの値を入力してください')
        return
      }
      const rulename = getRuleName(rule)

      const { id, username } = interaction.user
      const name = username

      // register rating
      const result = await registerUserAndRating(id, username, guildId, rule, gachipower)
      if (result === 'RATING_ALREADY_REGISTERED') {
        await interaction.reply(`${guild?.name} において ユーザー ${name} の ${rulename} のレーティングはすでに登録されています。`)
        return
      }

      const messages = []
      if (result.isNewUser) {
        messages.push(`ユーザー ${name} が新しく登録されました。(ID: ${id})`)
      }

      messages.push(`ユーザー ${name} の ${rulename} のレーティングが登録されました。 初期値: ${gachipower}`)

      await interaction.reply({ content: messages.join('\n') })
    },
  }
}

const registerAndJoinModalHandlers = SPLAT_RULES_NAME_MAP.map(({ code }) => createRegisterAndJoinModalHandler(code))
const registerModalHandlers = SPLAT_RULES_NAME_MAP.map(({ code }) => createRegisterModalHandler(code))
;[...registerAndJoinModalHandlers, ...registerModalHandlers, dashHandler, tksRecruitModalHandler].forEach((handler) => handlers.set(handler.customId, handler))
;[tksSetTeamNameModalHandler, tksFindOpponentModalHandler, tksReportModalHandler].forEach((handler) => withDataHandlers.set(handler.customId, handler))
