import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

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
