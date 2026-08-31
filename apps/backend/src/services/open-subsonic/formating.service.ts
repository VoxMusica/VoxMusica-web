import path from 'node:path'

import { DateTime } from 'luxon'

import config from '#config'

export const formatOpenSubsonicData = (date: Date | null | undefined) => date ? DateTime.fromJSDate(date).toISO() : null

const MUSIC_FOLDER_MARKER = '[/]'

const normalize = (rawPath: string): string => rawPath
  .replace(/^\.\//, '')
  .split(path.sep).join('/')

export const toRelativePath = (absolutePath: string): string => {
  const libraries = config.get('library.music')

  const normalizedLibraries = Object.entries(libraries).map(
    ([alias, libraryPath]) => [alias, normalize(libraryPath)] as const
  )

  const match = normalizedLibraries
    .filter(([, libraryPath]) => normalize(absolutePath).startsWith(normalize(libraryPath)))
    .toSorted((a, b) => b[1].length - a[1].length)[0]

  if (match == null) {
    return normalize(absolutePath)
  }

  const relative = normalize(absolutePath.slice(match[1].length).replace(/^\/+/, ''))
  return path.posix.join(match[0]+'[', ']'+relative)
}

export const replaceMusicFolderMarker = (filePath: string) => filePath.replace(MUSIC_FOLDER_MARKER, '')

export const toRealPath = (codedPath: string): string => {
  const markerIndex = codedPath.indexOf(MUSIC_FOLDER_MARKER)

  if (markerIndex === -1) {
    throw new Error(`Invalid coded path (missing library marker): ${codedPath}`)
  }

  const alias = codedPath.slice(0, markerIndex)
  const relative = codedPath.slice(markerIndex + MUSIC_FOLDER_MARKER.length)

  const libraries = config.get('library.music')
  const libraryPath = libraries[alias]

  console.log(alias, libraryPath)

  if (libraryPath == null) {
    throw new Error(`Unknown library alias: ${alias}`)
  }

  return path.join(libraryPath, relative)
}
  
