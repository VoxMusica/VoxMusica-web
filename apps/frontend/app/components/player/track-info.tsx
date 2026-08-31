import { MORPH } from '@/style/transitions'

interface TrackInfoParams{
  title: string
  artist?: string
  album?: string
  expanded: boolean
}

export const TrackInfo = ({ title, artist, album, expanded }: TrackInfoParams) => {
  let subtitle = ''
  if(expanded && artist && album){
    subtitle = `${artist} — ${album}`
  }
  else if (artist){
    subtitle = artist
  }
  else if(album){
    subtitle = album
  }
  return <div style={{
    position: 'absolute',
    transition: MORPH,
    pointerEvents: 'none',
    textAlign: expanded ? 'center' : 'left',
    ...(expanded
      ? { top: '62%', left: '50%', width: '85%', transform: 'translate(-50%, -50%)' }
      : { top: 35, left: 70, right: 120, transform: 'translateY(-50%)' })
  }}>
    <div className="truncate font-display font-semibold text-foreground" style={{ transition: MORPH, fontSize: expanded ? '1.25rem' : '0.875rem' }}>
      {title}
    </div>
    <div className="truncate text-muted-foreground" style={{ transition: MORPH, fontSize: expanded ? '0.875rem' : '0.75rem' }}>
      {subtitle}
    </div>
  </div>
}