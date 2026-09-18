import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import Kuroshiro from '@sglkc/kuroshiro'
import KuromojiAnalyzer from '@sglkc/kuroshiro-analyzer-kuromoji'
import anyAscii from 'any-ascii'
import { pinyin } from 'pinyin'

import type { Script } from './detect-title-script.ts'
import type { Logger } from 'pino'

const require = createRequire(import.meta.url)
const kuromojiPkgPath = require.resolve('@sglkc/kuromoji/package.json')
const dictPath = join(dirname(kuromojiPkgPath), 'dict')

let kuroshiroPromise: Promise<Kuroshiro> | null = null

const getKuroshiro = (): Promise<Kuroshiro> => {
  kuroshiroPromise ??= (async () => {
      const instance = new Kuroshiro()
      await instance.init(new KuromojiAnalyzer({ dictPath }))
      return instance
    })();
  return kuroshiroPromise
}
export const transliterate = async (
  text: string,
  script: Script | null,
  logger: Logger
): Promise<string | null> => {
  try {
    if (script === 'japanese') {
      const kuroshiro = await getKuroshiro()
      return await kuroshiro.convert(text, { to: 'romaji', mode: 'spaced' })
    }
    if (script === 'chinese') {
      return pinyin(text, { style: 'normal' })
        .map((word) => word[0])
        .join(' ')
    }
    // korean, cyrillic, greek, arabic, etc
    return anyAscii(text)
  } catch (error) {
    logger.error({ error, text }, 'Transliteration failed')
    return null
  }
}
