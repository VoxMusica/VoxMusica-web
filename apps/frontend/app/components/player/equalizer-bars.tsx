import { useEffect, useRef } from 'react'

interface EqualizerBarsProps {
  playing: boolean
  analyser: AnalyserNode | null
  className?: string
  barCount?: number
  baseScale?: number
}


const EqualizerBars = ({ playing, analyser, className = '', barCount = 3, baseScale = 0.3 }: EqualizerBarsProps) => {
  const barRefs = useRef<(HTMLSpanElement | null)[]>([])
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!playing || analyser == null) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current)
      }
      barRefs.current.forEach((bar) => {
        if (bar != null) {
          bar.style.transform = `scaleY(${baseScale})`
        }
      })
      return
    }

    const data = new Uint8Array(analyser.frequencyBinCount)
    const tick = () => {
      analyser.getByteFrequencyData(data)

      const step = Math.floor(data.length / barCount)
      barRefs.current.forEach((bar, i) => {
        if (bar == null) return

        if (bar == null) return
        const value = data[2 + i * step] ?? 0
        const scale = Math.max(baseScale, value / 255)
        bar.style.transform = `scaleY(${scale})`
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [playing, analyser, baseScale, barCount])

  return (
    <div className={`flex items-end gap-[2px] ${className}`} aria-hidden="true">
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          ref={(el) => { barRefs.current[i] = el }}
          className="flex-1 min-w-[1px] bg-primary rounded-full origin-bottom transition-transform duration-75"
          style={{ height: '100%', transform: `scaleY(${baseScale})` }}
        />
      ))}
    </div>
  )
}

export default EqualizerBars
