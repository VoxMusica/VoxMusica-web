export const hasKana = (text: string) => /[\u3040-\u30ff]/.test(text)
export const hasHangul = (text: string) => /[\uac00-\ud7af]/.test(text)
export const cjkChars = (text: string) => [...text].filter((c) => /[\u4e00-\u9fff]/.test(c))

const JAPANESE_EXCLUSIVE_KANJI = new Set(['働', '込', '峠', '畑', '匂', '辻', '枠', '躾', '凪', '峰', '杢', '塀'])
const CHINESE_SIMPLIFIED_EXCLUSIVE = new Set(['华', '时', '长', '门', '东', '车', '书', '会', '产', '还', '这', '为', '来'])

export const hasJapaneseExclusiveKanji = (text: string): boolean =>
  [...text].some((char) => JAPANESE_EXCLUSIVE_KANJI.has(char))

export const hasChineseExclusiveKanji = (text: string): boolean =>
  [...text].some((char) => CHINESE_SIMPLIFIED_EXCLUSIVE.has(char))

// anything outside basic + extended Latin, punctuation, digits, and whitespace needs transliteration
const NON_LATIN_REGEX = /[^\u0000-\u024F\u1E00-\u1EFF\u2000-\u206F\s\p{P}\p{N}]/u

export const needsTransliteration = (text: string): boolean => NON_LATIN_REGEX.test(text)
