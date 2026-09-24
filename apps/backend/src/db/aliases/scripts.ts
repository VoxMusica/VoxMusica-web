import { aliasedTable } from "drizzle-orm"

import { transliterations } from "#db/schema"

export const trackTransliterations = aliasedTable(transliterations, 'track_transliterations')
export const albumTransliterations = aliasedTable(transliterations, 'album_transliterations')
export const artistTransliterations = aliasedTable(transliterations, 'artist_transliterations')
