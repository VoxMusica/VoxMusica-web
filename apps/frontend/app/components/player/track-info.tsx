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
  return <div 
    className={`
      pointer-events-none text-foreground
      ${expanded ? 'text-center' : 'text-left'}
    `}
  style={{
    transition: MORPH
  }}
  >
    <div className="truncate font-display font-semibold text-foreground" style={{ transition: MORPH, fontSize: expanded ? '1.25rem' : '0.875rem' }}>
      {title}
    </div>
    <div className="truncate text-muted-foreground" style={{ transition: MORPH, fontSize: expanded ? '0.875rem' : '0.75rem' }}>
      {subtitle}
    </div>
  </div>
}