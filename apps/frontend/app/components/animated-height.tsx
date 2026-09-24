import { useRef, useState, useLayoutEffect } from 'react'

interface AnimatedHeightProps {
  children: React.ReactNode
  duration?: number
}

export const AnimatedHeight = ({ children, duration = 300 }: AnimatedHeightProps) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | null>(null)
  const [hasMounted, setHasMounted] = useState(false)

  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return

    setHeight(el.getBoundingClientRect().height)
    setHasMounted(true)

    const resizeObserver = new ResizeObserver((entries) => {
      setHeight(entries[0].contentRect.height)
    })

    resizeObserver.observe(el)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div
      className="overflow-hidden"
      style={{
        height: height ?? 'auto',
        transition: hasMounted ? `height ${duration}ms ease-in-out` : 'none'
      }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  )
}
