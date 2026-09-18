import { hasChineseExclusiveKanji, hasHangul, hasJapaneseExclusiveKanji, hasKana } from "./script-signals.ts"


export type Script = 'japanese' | 'chinese' | 'korean'

export const detectTitleScript = (
  text: string,
  artistScriptHint: Script | null
): Script | null => {
  if (hasHangul(text)) return 'korean'
  if (hasKana(text)) return 'japanese'
  if (hasJapaneseExclusiveKanji(text)) return 'japanese'
  if (hasChineseExclusiveKanji(text)) return 'chinese'

  // ambiguous kanji-only text, rather use the artist country
  return artistScriptHint
}
