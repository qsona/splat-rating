import { InteractionReplyOptions, InteractionType } from 'discord.js'

export const getCustomId = (component: any) => component?.toJSON().components?.[0]?.custom_id
export const getCustomIdWithoutData = (component: any) => {
  const customId = getCustomId(component)
  return customId.match(/^(.+)@/)[1]
}
export const getModalCustomId = (modal: any) => modal.data.custom_id
export const getModalCustomIdWithoutData = (modal: any) => {
  const customId = modal.data.custom_id
  return customId.match(/^(.+)@/)[1]
}

export type CallbacksType =
  | ((options: InteractionReplyOptions) => Promise<void>)
  | {
      onReply?: (options: InteractionReplyOptions) => Promise<void>
      onChannelSend?: (options: InteractionReplyOptions) => Promise<void>
      onShowModal?: (options: any) => Promise<void>
    }

const createBaseInteraction = (args: any, callbacks: CallbacksType) => {
  callbacks = typeof callbacks === 'function' ? { onReply: callbacks } : callbacks
  const { onReply, onChannelSend, onShowModal } = callbacks
  return {
    reply: (arg: any) => onReply!(typeof arg === 'string' ? { content: arg } : arg),
    guild: { channels: { cache: { get: () => ({ send: onChannelSend }) } } },
    showModal: onShowModal,
    ...args,
  }
}

export const createChatInputInteraction = (command: string, args: any, callbacks: CallbacksType) => {
  return {
    isChatInputCommand: () => true,
    isButton: () => false,
    commandName: command,
    ...createBaseInteraction(args, callbacks),
  }
}

export const createButtonInteraction = (command: string, args: any, callbacks: CallbacksType) => {
  return {
    isChatInputCommand: () => false,
    isButton: () => true,
    customId: command,
    ...createBaseInteraction(args, callbacks),
  }
}

export const createButtonWithDataInteraction = (command: string, data: string, args: any, callbacks: CallbacksType) => {
  return {
    isChatInputCommand: () => false,
    isButton: () => true,
    customId: `${command}@${data}`,
    ...createBaseInteraction(args, callbacks),
  }
}

export const createModalInteraction = (command: string, args: any, callbacks: CallbacksType) => {
  return {
    isChatInputCommand: () => false,
    isButton: () => false,
    type: InteractionType.ModalSubmit,
    customId: command,
    ...createBaseInteraction(args, callbacks),
  }
}

export const createModalWithDataInteraction = (command: string, data: string, args: any, callbacks: CallbacksType) => {
  return {
    isChatInputCommand: () => false,
    isButton: () => false,
    type: InteractionType.ModalSubmit,
    customId: `${command}@${data}`,
    ...createBaseInteraction(args, callbacks),
  }
}
