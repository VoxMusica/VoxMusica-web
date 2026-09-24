// components/artist-card.tsx
import { Link } from 'react-router' // swap for your router

import { cn } from '@/lib/utils'
import { getRandomSerieColor } from '@/utils/serie.utils'

type Artist = {
  id: string
  name: string
  artistImageUrl?: string
  albumCount?: number
}

type ArtistCardProps = {
  artist: Artist
  className?: string
}

export const ArtistCard = ({ artist, className }: ArtistCardProps) => {
  const colorClass = getRandomSerieColor(artist.name)
  const initials = artist.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Link
      to={`/artists/${artist.id}`}
      className={cn(
        'group flex flex-col items-center gap-2 rounded-lg p-2 text-center transition-colors hover:bg-accent',
        className
      )}
    >
      <div className='relative aspect-square w-full overflow-hidden rounded-full shadow-sm'>
        {artist.artistImageUrl ? (
          <img
            src={artist.artistImageUrl}
            alt={artist.name}
            className='size-full object-cover transition-transform group-hover:scale-105'
          />
        ) : (
          <div className={cn('flex size-full items-center justify-center text-lg font-semibold', colorClass)}>
            {initials}
          </div>
        )}
      </div>
      <div className='w-full min-w-0'>
        <p className='truncate text-sm font-medium'>{artist.name}</p>
        {artist.albumCount !== undefined && (
          <p className='text-xs text-muted-foreground'>
            {artist.albumCount} {artist.albumCount === 1 ? 'album' : 'albums'}
          </p>
        )}
      </div>
    </Link>
  )
}