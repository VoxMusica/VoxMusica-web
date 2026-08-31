import { Play } from 'lucide-react'

import { formatDuration } from '@/lib/format-duration'

type Song = {
  id: string
  title: string
  albumTitle?: string
  duration: number
  playCount?: number
}

type SongRowProps = {
  song: Song
  index: number
  onPlay: (songId: string) => void
}

export const SongRow = ({ song, index, onPlay }: SongRowProps) => <div
    className='group grid grid-cols-[2rem_1fr_auto_auto] items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent'
  >
    <button
      type='button'
      onClick={() => onPlay(song.id)}
      className='flex size-6 cursor-pointer items-center justify-center text-muted-foreground'
      aria-label={`Play ${song.title}`}
    >
      <span className='group-hover:hidden'>{index + 1}</span>
      <Play className='hidden size-3.5 fill-current group-hover:block' />
    </button>
    <div className='min-w-0'>
      <p className='truncate font-medium'>{song.title}</p>
      {song.albumTitle && (
        <p className='truncate text-xs text-muted-foreground'>{song.albumTitle}</p>
      )}
    </div>
    {song.playCount !== undefined && (
      <span className='hidden text-xs text-muted-foreground sm:inline'>
        {song.playCount} plays
      </span>
    )}
    <span className='text-xs text-muted-foreground'>{formatDuration(song.duration)}</span>
  </div>
