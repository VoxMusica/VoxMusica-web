import { existsSync } from 'node:fs'
import { watch } from 'node:fs/promises'
import { join } from 'node:path'


import { debounce, type DebouncedFunc } from 'lodash-es'

import config from '#config'

import type { FileChangeInfo } from 'node:fs/promises'


type WatchEvent = {
  type: "watch";
  path: string;
  result: IteratorResult<FileChangeInfo<string>>;
};

export class Engine{
  async start() {
    for await (const path of this.mergeWatchers()) {
      this.processFile(path);
    }
  }

  #createIterators() {
    return config.get('library.music').map((path: string) => ({
      path,
      it: watch(path, { recursive: true })[Symbol.asyncIterator](),
    }));
  }

  #nextFor(
    path: string,
    it: AsyncIterator<FileChangeInfo<string>>
  ): Promise<WatchEvent> {
    return it.next().then((result) => ({ type: "watch" as const, path, result }));
  }

  #createPendingMap(
    iterators: { path: string; it: AsyncIterator<FileChangeInfo<string>> }[]
  ) {
    return new Map<string, Promise<WatchEvent>>(
      iterators.map(({ path, it }) => [path, this.#nextFor(path, it)])
    );
  }

  /**
   * Wraps a debounced "ready" queue behind a scheduler + waiter interface,
   * so the caller can race it alongside watcher promises.
   */
  #createDebouncedQueue(debounceMs: number) {
    const debouncers = new Map<string, DebouncedFunc<() => void>>();
    const activeDebounces = new Set<string>();
    const readyPaths: string[] = [];
    let notifyReady: (() => void) | null = null;

    const schedule = (filePath: string) => {
      activeDebounces.add(filePath);
      let fn = debouncers.get(filePath);
      if (!fn) {
        fn = debounce(() => {
          activeDebounces.delete(filePath);
          readyPaths.push(filePath);
          notifyReady?.();
          notifyReady = null;
        }, debounceMs);
        debouncers.set(filePath, fn);
      }
      fn();
    };

    const waitForReady = (): Promise<{ type: "ready" }> =>
      new Promise((resolve) => {
        notifyReady = () => resolve({ type: "ready" });
      });

    const cancelAll = () => {
      for (const fn of debouncers.values()) fn.cancel();
    };

    const hasPending = () => activeDebounces.size > 0;

    return { schedule, waitForReady, cancelAll, hasPending, readyPaths };
  }

  private async *mergeWatchers(debounceMs = 300) {
    const iterators = this.#createIterators();
    const pending = this.#createPendingMap(iterators);
    const queue = this.#createDebouncedQueue(debounceMs);

    try {
      while (pending.size > 0 || queue.readyPaths.length > 0 || queue.hasPending()) {
        if (queue.readyPaths.length > 0) {
          yield queue.readyPaths.shift()!;
          continue;
        }

        const winner = await Promise.race<
          WatchEvent | { type: "ready" }
        >([...pending.values(), queue.waitForReady()]);

        if (winner.type === "ready") continue;

        const { path, result } = winner;

        if (result.done) {
          pending.delete(path);
          continue;
        }

        const entry = iterators.find((i) => i.path === path)!;
        pending.set(path, this.#nextFor(path, entry.it));

        const filePath = result.value.filename ? join(path, result.value.filename) : null;
        if (filePath && existsSync(filePath)) {
          queue.schedule(filePath);
        }
      }
    } finally {
      queue.cancelAll();
    }
  }

  private async processFile(path: string){
    console.log(path)
  }
}