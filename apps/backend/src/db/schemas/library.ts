import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const ScanStatus = ['queued', 'running', 'completed', 'failed']

export const scans = sqliteTable('scans', {
  id: text('id').primaryKey(),
  status: text('status', {
    enum: ['queued', 'running', 'completed', 'failed'],
  }).notNull(),

  totalFiles: integer('total_files'),
  processedFiles: integer('processed_files').notNull().default(0),

  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),

  error: text('error'),
})

export type Scan = typeof scans.$inferInsert

