declare module 'openskill' {
  export type OpenSkillRating = {
    mu: number
    sigma: number
  }
  export type OpenSkillOption = {
    beta?: number
  }
  export function rate(ratings: OpenSkillRating[][], option?: OpenSkillOption): OpenSkillRating[][]
}
