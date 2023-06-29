import { InteractionReplyOptions } from 'discord.js'

export const getCustomId = (component: any) => component?.toJSON().components?.[0]?.custom_id

export const createChatInputInteraction = (command: string, args: any, onReply: (options: InteractionReplyOptions) => void) => {
  return {
    isChatInputCommand: () => true,
    isButton: () => false,
    commandName: command,
    reply: (arg: any) => onReply(typeof arg === 'string' ? { content: arg } : arg),
    ...args,
  }
}

export const createButtonInteraction = (command: string, args: any, onReply: (options: InteractionReplyOptions) => void) => {
  return {
    isChatInputCommand: () => false,
    isButton: () => true,
    customId: command,
    reply: (arg: any) => onReply(typeof arg === 'string' ? { content: arg } : arg),
    ...args,
  }
}

export const createButtonWithDataInteraction = (command: string, data: string, args: any, onReply: (options: InteractionReplyOptions) => void) => {
  return {
    isChatInputCommand: () => false,
    isButton: () => true,
    customId: `command@data`,
    reply: (arg: any) => onReply(typeof arg === 'string' ? { content: arg } : arg),
    ...args,
  }
}
