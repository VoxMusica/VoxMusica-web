import { hasChineseExclusiveKanji, hasJapaneseExclusiveKanji } from './script-signals.ts'

const hasKana = (text: string) => /[\u3040-\u30ff]/.test(text)
const hasHangul = (text: string) => /[\uac00-\ud7af]/.test(text)
const cjkChars = (text: string) => [...text].filter((c) => /[\u4e00-\u9fff]/.test(c))

export interface TitleScriptWeights {
  japanese: number
  chinese: number
  korean: number
}

const TITLE_MIN_WEIGHT = 0.5
const TITLE_MAX_WEIGHT = 1

// longer/more distinctive titles carry slightly more weight than very short ones
const titleWeight = (text: string): number => {
  const len = text.length
  return Math.min(TITLE_MAX_WEIGHT, TITLE_MIN_WEIGHT + len * 0.03)
}

/**
 * Give a score for the likelyhood of a string to be japanese or chinese
 * @param length length of a string with only sineograms
 * @returns 
 */
const estimateJapaneseRatio = (length: number): number => {
  if (length <= 2) return 0.65
  if (length <= 4) return 0.55
  if (length <= 6) return 0.35
  if (length <= 10) return 0.2
  return 0.1
}

export const scoreTitleScript = (text: string): TitleScriptWeights => {
  const weight = titleWeight(text)
  const empty = { japanese: 0, chinese: 0, korean: 0 }

  if (hasHangul(text)) return { ...empty, korean: weight }
  if (hasKana(text)) return { ...empty, japanese: weight }

  const kanji = cjkChars(text)
  if (kanji.length === 0) return empty

  // strong, near-definitive signals first
  if (hasJapaneseExclusiveKanji(text)) return { ...empty, japanese: weight }
  if (hasChineseExclusiveKanji(text)) return { ...empty, chinese: weight }

  // no exclusive characters found — fall back to length-based ratio, split the weight
  const jpRatio = estimateJapaneseRatio(kanji.length)
  return {
    ...empty,
    japanese: weight * jpRatio,
    chinese: weight * (1 - jpRatio),
  }
}
