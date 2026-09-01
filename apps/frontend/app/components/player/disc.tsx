import { MORPH } from '@/style/transitions'

interface DiscParams {
  playing: boolean
  expanded: boolean
  hue: string
}

export const Disc = ({ playing, expanded, hue } : DiscParams) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    transition: MORPH,
    pointerEvents: 'none',
    background: `radial-gradient(circle, ${hue}66 0%, var(--muted) 70%)`,
    ...(expanded
      ? { top: '32%', left: '50%', width: 256, height: 256, transform: 'translate(-50%, -50%)' }
      : { top: 35, left: 14, width: 44, height: 44, transform: 'translateY(-50%)' })
  }

  return <div className="rounded-full flex items-center justify-center border border-border" style={style}>
    <div className={playing ? 'disc-spin' : 'disc-paused'}>
      <div className="rounded-full bg-background" style={{ transition: MORPH, width: expanded ? 64 : 8, height: expanded ? 64 : 8 }} />
    </div>
  </div>
}

export default Disc
