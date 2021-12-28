export type SplatRuleSet = 'SplatZones' | 'TowerControl' | 'Rainmaker' | 'ClamBlitz'

export const SPLAT_RULES_NAME_MAP: { code: SplatRuleSet; name: string }[] = [
  { code: 'SplatZones', name: 'ガチエリア' },
  { code: 'TowerControl', name: 'ガチヤグラ' },
  { code: 'Rainmaker', name: 'ガチホコバトル' },
  { code: 'ClamBlitz', name: 'ガチアサリ' },
  { code: 'SplatZones', name: 'splatzones' },
  { code: 'TowerControl', name: 'towercontrol' },
  { code: 'Rainmaker', name: 'rainmaker' },
  { code: 'ClamBlitz', name: 'clamblitz' },
]

export const getRuleName = (rule: SplatRuleSet) => {
  return SPLAT_RULES_NAME_MAP.find((r) => r.code === rule)?.name
}
