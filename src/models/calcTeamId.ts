import hash from 'object-hash'

export const calcTeamId = (userIds: string[]) => {
  return hash(userIds, { unorderedArrays: true })
}
