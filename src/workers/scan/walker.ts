import os from 'node:os'
import { readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'
import pLimit from 'p-limit'
import { VMSet } from "#types/vm-set"
import config from '#config'

export const SUPPORTED_EXTENSIONS = new VMSet([
  '.aac',
  '.ape',
  '.aiff', '.aif', '.aifc',
  '.flac',
  '.mp3',
  '.mp4', '.m4a', '.m4b', '.m4p', '.m4r', '.m4v',
  '.mpc', '.mp+', '.mpp',
  '.opus',
  '.ogg', '.oga',
  '.spx',
  '.wav', '.wave',
  '.wv',
])

type ScanCounters = {
  foldersVisited: number
  filesSeen: number
  tracksMatched: number
}

export const walkLibrary = async (
  onTrack: (filePath: string) => Promise<void>,
  onProgress: (counters: ScanCounters) => void
) => {
  const limit = pLimit(os.cpus().length)
  const counters: ScanCounters = { foldersVisited: 0, filesSeen: 0, tracksMatched: 0 }

  let lastReport = Date.now()
  const reportMaybe = () => {
    if (Date.now() - lastReport > 500) {
      onProgress({ ...counters })
      lastReport = Date.now()
    }
  }

  const walkDir = async (dir: string): Promise<void> => {
    counters.foldersVisited++
    reportMaybe()

    const entries = await readdir(dir, { withFileTypes: true })

    const subdirs = entries.filter((e) => e.isDirectory())
    const files = entries.filter((e) => e.isFile())

    for (const file of files) {
      counters.filesSeen++
      if (SUPPORTED_EXTENSIONS.has(extname(file.name).toLowerCase())) {
        counters.tracksMatched++
        await onTrack(join(dir, file.name))
      }
    }
    reportMaybe()
    
    await Promise.all(subdirs.map((d) => limit(() => walkDir(join(dir, d.name)))))
  }
  const dirs = Object.entries(config.get('library.music'))
  for(const [_, rootDir] of dirs){
    await walkDir(rootDir)
  }
  onProgress({ ...counters })
  return counters
}
