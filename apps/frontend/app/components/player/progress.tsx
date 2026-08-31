import { formatDuration } from '@/lib/format-duration'

interface PlayerProgressParams{
  elapsed: number
  duration: number
  showLabels: boolean
}

export const PlayerProgress = ({ elapsed, duration, showLabels}: PlayerProgressParams) => {
  const progress = (1.0 * elapsed) / duration
  const elapsedText = formatDuration(elapsed)
  const durationText = formatDuration(duration)

  return <div>
    <div className="w-full h-[3px] rounded-full bg-muted overflow-hidden pointer-events-none">
      <div className="h-full bg-primary" style={{ width: `${progress * 100}%` }} />
    </div>
    {showLabels && <div className="flex justify-between text-xs mt-2 text-muted-foreground font-mono">
      <span>{elapsedText}</span>
      <span>{durationText}</span>
    </div>}
  </div>
}

export default PlayerProgress
