import { useState } from 'react'

import { Slider } from '@/components/ui/slider'
import { formatDuration } from '@/lib/format-duration'

interface PlayerProgressProps {
  elapsed: number
  duration: number
  showLabels: boolean
  onSeek: (time: number) => void
}

export const PlayerProgress = ({ elapsed, duration, showLabels, onSeek }: PlayerProgressProps) => {
  const [dragValue, setDragValue] = useState<number | null>(null)
  const [prevDuration, setPrevDuration] = useState(duration)

  if (duration !== prevDuration) {
    setPrevDuration(duration)
    setDragValue(null)
  }

  const displayedElapsed = dragValue ?? elapsed
  const elapsedText = formatDuration(displayedElapsed)
  const durationText = formatDuration(duration)

  const handleValueChange = (value: number | readonly number[]) => {
    const next = Array.isArray(value) ? value[0] : value
    setDragValue(next)
  }

  const handleValueCommitted = (value: number | readonly number[]) => {
    const next = Array.isArray(value) ? value[0] : value
    onSeek(next)
    setDragValue(null)
  }

  return (
    <div>
      <Slider
        value={[displayedElapsed]}
        max={duration || 0}
        step={1}
        onValueChange={handleValueChange}
        onValueCommitted={handleValueCommitted}
        className="w-full cursor-pointer"
        aria-label="Seek"
      />
      {showLabels && (
        <div className="flex justify-between text-xs mt-2 text-muted-foreground font-mono">
          <span>{elapsedText}</span>
          <span>{durationText}</span>
        </div>
      )}
    </div>
  )
}

export default PlayerProgress
