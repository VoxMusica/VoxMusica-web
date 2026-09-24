export type QualityInfo = {
  codec: string | null
  bitrate: number | null // kbps
  sampleRate: number | null
  fileSize: number
}

const LOSSLESS_CODECS = new Set(['flac', 'alac', 'ape', 'wav', 'wavpack', 'aiff', 'pcm'])

const isLossless = (codec: string | null): boolean =>
  codec != null && LOSSLESS_CODECS.has(codec.toLowerCase())

// true when `a` should be kept as the canonical copy over `b` for the same
// audio content: lossless beats lossy first, then higher bitrate, then
// higher sample rate, then just the larger file as a last-resort tiebreak
// (catches things like a truncated/corrupt rip of otherwise-equal specs)
export const isBetterQuality = (a: QualityInfo, b: QualityInfo): boolean => {
  const aLossless = isLossless(a.codec)
  const bLossless = isLossless(b.codec)
  if (aLossless !== bLossless) return aLossless

  const aBitrate = a.bitrate ?? 0
  const bBitrate = b.bitrate ?? 0
  if (aBitrate !== bBitrate) return aBitrate > bBitrate

  const aSampleRate = a.sampleRate ?? 0
  const bSampleRate = b.sampleRate ?? 0
  if (aSampleRate !== bSampleRate) return aSampleRate > bSampleRate

  return a.fileSize > b.fileSize
}
