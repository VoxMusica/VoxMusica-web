// pages/artists.tsx
import { useRef, useState, useEffect } from 'react'

import { ArtistCard } from '@/components/library/artist-card'
import Loading from '@/components/loading'
import { cn } from '@/lib/utils'
import { useAllArtists } from '@/queries/library/artists.queries'

const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export const ArtistsPage = () => {
  const [activeLetter, setActiveLetter] = useState<string>('A')
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: artists, isPending, error } = useAllArtists()

  const scrollToLetter = (letter: string) => {
    sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Highlight the letter currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveLetter(entry.target.getAttribute('data-letter') ?? 'A')
          }
        }
      },
      { rootMargin: '-10% 0px -80% 0px' }
    )

    for (const el of Object.values(sectionRefs.current)) {
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [artists])

  if(isPending){
    return <Loading />
  }
  if(artists == null || error){
    return <div>Error...</div>
  }

  return (
    <div className='flex gap-4'>
      <div ref={containerRef} className='flex-1 space-y-8 pr-2'>
        {artists.map(({name: letter, artist: letterArtists}) => (
          <div
            key={letter}
            ref={(el) => { sectionRefs.current[letter] = el }}
            data-letter={letter}
          >
            <h2 className='mb-3 text-sm font-semibold text-muted-foreground'>
              {letter}
            </h2>
            <div className='grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8'>
              {letterArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* A-Z quick scroll rail */}
      <nav
        aria-label='Jump to letter'
        className='sticky top-4 flex h-fit flex-col items-center gap-0.5 self-start'
      >
        {ALPHABET.map((letter) => {
          const hasArtists = artists.some(({name}) => name == letter)
          return (
            <button
              key={letter}
              type='button'
              disabled={!hasArtists}
              onClick={() => scrollToLetter(letter)}
              className={cn(
                'w-4 text-[10px] leading-tight transition-colors',
                hasArtists
                  ? 'cursor-pointer font-medium text-muted-foreground hover:text-primary'
                  : 'cursor-default text-muted-foreground/30',
                activeLetter === letter && hasArtists && 'text-primary font-bold'
              )}
            >
              {letter}
            </button>
          )
        })}
      </nav>
    </div>
  )
}


export default ArtistsPage