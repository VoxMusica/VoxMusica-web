import { SCRIPTS } from "@voxmusica/types"
import { sql } from "drizzle-orm"
import { integer, sqliteTable, text, index, real, unique } from "drizzle-orm/sqlite-core"

export const artistScriptScores = sqliteTable('artist_script_scores', {
  artistId: text('artist_id').notNull().primaryKey(),
  scores: text('scores', { mode: 'json' }).$type<{ script: string; score: number }[]>().notNull(),
  computedAt: integer('computed_at', { mode: 'timestamp' }).notNull(),
})

export const artistScriptScoreDetails = sqliteTable('artist_script_score_details', {
  id: text('id').primaryKey(),
  artistId: text('artist_id').notNull(),
  itemType: text('item_type', { enum: ['track', 'album'] as const }).notNull(),
  itemId: text('item_id').notNull(),
  title: text('title').notNull(),
  japanese: real('japanese').notNull(),
  chinese: real('chinese').notNull(),
  korean: real('korean').notNull(),
}, (table) => [
  index('artist_script_score_details_artist_id_idx').on(table.artistId),
])
export type ArtistScriptScoreDetail = typeof artistScriptScoreDetails.$inferInsert


export const transliterations = sqliteTable('transliterations', {
  id: text('id').primaryKey(),
  itemType: text('item_type', { enum: ['artist', 'album', 'track'] as const }).notNull(),
  itemId: text('item_id').notNull(),
  script: text('script', { enum: SCRIPTS }).notNull(),
  value: text('original_text').notNull(),
  source: text('source', { enum: ['kuroshiro', 'pinyin', 'any-ascii', 'original', 'manual'] as const }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => [
  index('transliterations_item_idx').on(table.itemType, table.itemId),
  index('transliterations_item_script_and_value').on(table.script, table.value),
  unique('transliterations_item_script_unique').on(table.itemType, table.itemId, table.script),
])
export type Transliterations = typeof transliterations.$inferInsert

