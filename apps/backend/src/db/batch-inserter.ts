export class BatchInserter<T> {
  private buffer: T[] = []
  private readonly flushSize: number
  private readonly flush: (rows: T[]) => Promise<void>

  constructor(flushSize: number, flush: (rows: T[]) => Promise<void>) {
    this.flushSize = flushSize
    this.flush = flush
  }

  async add(row: T) {
    this.buffer.push(row)
    if (this.buffer.length >= this.flushSize) {
      await this.drain()
    }
  }

  async drain() {
    if (this.buffer.length === 0) return
    const rows = this.buffer
    this.buffer = []
    await this.flush(rows)
  }
}
