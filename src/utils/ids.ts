import { v5 as uuidv5 } from 'uuid'

// generate these once with uuidv4() and hardcode them — they just need to be
// fixed and unique per entity type, not secret
const ARTIST_NAMESPACE = '279106ba-2bca-4526-bedb-35acb2cdd5e3'
const ALBUM_NAMESPACE = '7b96b1cb-d5cd-48cc-9251-104102f2f5af'
const TRACK_NAMESPACE = '88925e01-f459-4c9d-ac0f-cec2c14d86ea'

const normalize = (value: string) => value.trim().toLowerCase().normalize('NFC')

export const artistId = (artistName: string) =>
  uuidv5(normalize(artistName), ARTIST_NAMESPACE)

export const albumId = (artistName: string, albumTitle: string) =>
  uuidv5(`${normalize(artistName)}::${normalize(albumTitle)}`, ALBUM_NAMESPACE)

export const trackId = (artistName: string, albumTitle: string, trackTitle: string, trackNumber?: number) =>
  uuidv5(`${normalize(artistName)}::${normalize(albumTitle)}::${trackNumber ?? 'NA'}::${normalize(trackTitle)}`, TRACK_NAMESPACE)
