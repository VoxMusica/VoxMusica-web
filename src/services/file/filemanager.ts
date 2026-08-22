import { VMSet } from '#types/vm-set'
import { File, Tag } from 'node-taglib-sharp'

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


export const getFileMeta = async (path: string): Promise<Tag> => {
  const file = File.createFromPath(path)
  const tag = file.tag
  file.dispose()
  console.log(Object.getOwnPropertyDescriptors(tag))
  return tag
}
