import { CommandInteraction, User } from 'discord.js'
type Mentionable = any // TODO // ReturnType<typeof CommandInteraction.prototype.options.getMentionable>

export const getUserFromMentionable = (mentionable: Mentionable): User | null => {
  if (!mentionable) {
    return null
  }
  if (mentionable.hasOwnProperty('username')) {
    return mentionable as User
  }
  if (mentionable.hasOwnProperty('user')) {
    return mentionable.user as User
  }
  return null
}
