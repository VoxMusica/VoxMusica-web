import { debounce } from 'lodash-es'
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Slider } from '@/components/ui/slider'

interface VolumePickerProps {
  volume: number // 0 to 1
  onVolumeChange: (volume: number) => void
  className?: string
}

const VolumeIcon = ({ volume }: { volume: number }) => {
  if (volume === 0) return <VolumeX className="h-4 w-4" />
  if (volume < 0.33) return <Volume className="h-4 w-4" />
  if (volume < 0.66) return <Volume1 className="h-4 w-4" />
  return <Volume2 className="h-4 w-4" />
}

const VolumePicker = ({ volume, onVolumeChange, className = '' }: VolumePickerProps) => {
  const [previousVolume, setPreviousVolume] = useState(volume)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  const expanded = hovered || focused

  const toggleMute = () => {
    if (volume === 0) {
      onVolumeChange(previousVolume > 0 ? previousVolume : 0.5)
    } else {
      setPreviousVolume(volume)
      onVolumeChange(0)
    }
  }

  const handleSliderChange = (values: number | readonly number[]) => {
    onVolumeChange((Array.isArray(values) ? values[0] : values) / 100)
  }

  const handleMouseLeave = useMemo(
    () => debounce(() => {
      console.log('mouse out')
      setHovered(false)
    }, 250), [])

  useEffect(() => {
    return () => {
      handleMouseLeave.cancel()
    }
  }, [handleMouseLeave])
  
  const sliderClasName = expanded
      ? 'w-300 opacity-100' 
      : 'w-0 h-0 opacity-0'

  return <div
    className={`flex gap-1 items-center w-full  ${className} `}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={handleMouseLeave}
  >
    <button
      type="button"
      onClick={toggleMute}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full shrink-0"
      aria-label={volume === 0 ? 'Unmute' : 'Mute'}
    >
      <VolumeIcon volume={volume} />
    </button>

    <div
      className={sliderClasName}
    >
      <Slider
        value={[volume * 100]}
        onValueChange={handleSliderChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        max={100}
        step={1}
        className="h-full w-90 cursor-pointer"
        aria-label="Volume"
      />
    </div>
  </div>
}

export default VolumePicker
