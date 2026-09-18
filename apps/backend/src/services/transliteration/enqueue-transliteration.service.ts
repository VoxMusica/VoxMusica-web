import { mbLookupQueue } from "#workers/mb-lookup/queue"

export const enqueueTransliteration = async (artistId: string) => {
  await mbLookupQueue.add(
    'transliterate-artist',
    { artistId }
  )
}
