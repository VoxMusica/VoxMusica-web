import { Disc3 } from 'lucide-react'
import { Link } from 'react-router'

import { cn } from '@/lib/utils'
import { getRandomSerieColor } from '@/utils/serie.utils'

type Album = {
  id: string
  title: string
  year?: number
  coverUrl?: string
  trackCount?: number
}

export const AlbumCard = ({ album, className }: { album: Album; className?: string }) => {
  const colorClass = getRandomSerieColor(album.title)

  return (
    <Link
      to={`/albums/${album.id}`}
      className={cn(
        'group flex flex-col gap-2 rounded-lg p-2 transition-colors hover:bg-accent',
        className
      )}
    >
      <div className='relative aspect-square w-full overflow-hidden rounded-md shadow-sm'>
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            className='size-full object-cover transition-transform group-hover:scale-105'
          />
        ) : (
          <div className={cn('flex size-full items-center justify-center', colorClass)}>
            <Disc3 className='size-8 opacity-70' />
          </div>
        )}
      </div>
      <div className='min-w-0'>
        <p className='truncate text-sm font-medium'>{album.title}</p>
        <p className='text-xs text-muted-foreground'>
          {album.year ?? ''}
          {album.year && album.trackCount ? ' · ' : ''}
          {album.trackCount ? `${album.trackCount} tracks` : ''}
        </p>
      </div>
    </Link>
  )
}
