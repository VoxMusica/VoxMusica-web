// lib/format-duration.ts
import { Duration } from 'luxon'

export const formatDuration = (seconds: number) =>
  Duration.fromObject({ seconds }).shiftTo('minutes', 'seconds').toFormat('m:ss')
