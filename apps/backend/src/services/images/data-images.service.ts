import constants from 'node:constants'
import { access } from 'node:fs/promises'
import path from 'node:path'

import config from '#config'

export const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
export const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

export const findArtistImage = async (artistId: string) => {
  for (const ext of SUPPORTED_EXTENSIONS) {
    const filePath = path.join(config.get('data.dir'), 'artists', `${artistId}.${ext}`)
    try {
      await access(filePath, constants.F_OK)
      return { filePath, extension: ext }
    } catch {
      // doesn't exist with this extension, try next
    }
  }
  return null
}

export const findAlbumImage = async (albumId: string) => {
  for (const ext of SUPPORTED_EXTENSIONS) {
    const filePath = path.join(config.get('data.dir'), 'albums', `${albumId}.${ext}`)
    try {
      await access(filePath, constants.F_OK)
      return { filePath, extension: ext }
    } catch {
      // doesn't exist with this extension, try next
    }
  }
  return null
}
