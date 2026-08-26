export interface Scan{
  id: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  totalFiles?: number
  processedFiles: number

  startedAt: number
  completedAt: number

  error: string
}
