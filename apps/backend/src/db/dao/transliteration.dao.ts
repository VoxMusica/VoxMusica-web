// apps/backend/src/db/dao/transliteration.dao.ts
import { and, eq, not } from 'drizzle-orm'

import { db } from '#db/index'
import { transliterations } from '#db/schemas/scripts'

import type { Script } from '#services/transliteration/detect-title-script'

type ItemType = 'artist' | 'album' | 'track'
type Source = 'kuroshiro' | 'pinyin' | 'any-ascii' | 'manual'

export const upsertTransliteration = async (params: {
  itemType: ItemType
  itemId: string
  script: Script | 'cyrillic' | 'other'
  originalText: string
  romanizedText: string
  source: Source
}) => {
  await db
    .insert(transliterations)
    .values({
      id: crypto.randomUUID(),
      itemType: params.itemType,
      itemId: params.itemId,
      script: params.script,
      source: 'original',
      value: params.originalText,
    })
    .onConflictDoUpdate({
      target: [transliterations.itemType, transliterations.itemId, transliterations.script],
      set: { value: params.originalText, source: 'original' },
    })

  await db
    .insert(transliterations)
    .values({
      id: crypto.randomUUID(),
      itemType: params.itemType,
      itemId: params.itemId,
      script: 'latin',
      source: params.source,
      value: params.romanizedText,
    })
    .onConflictDoUpdate({
      target: [transliterations.itemType, transliterations.itemId, transliterations.script],
      set: { value: params.romanizedText, source: params.source },
    })
}

export const findByRomanized = async (searchTerm: string) =>
  db
    .select()
    .from(transliterations)
    .where(
      and(
        eq(transliterations.script, 'latin'),
        eq(transliterations.value, searchTerm)
      )
    )

export const findByOriginal = async (searchTerm: string) =>
  db
    .select()
    .from(transliterations)
    .where(
      and(
        not(eq(transliterations.script, 'latin')),
        eq(transliterations.value, searchTerm)
      )
    )

