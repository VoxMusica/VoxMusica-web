export interface IndexArtist {
  id: string
  name: string
  coverArt?: string
  artistImageUrl?: string
}
export interface ArtistID3 extends IndexArtist{
  albumCount?: number,
  starred?: string, // Date the artist was starred. [ISO 8601]
  musicBrainzId?: string,
  sortName?: string,
  disambiguation?: string,
  roles?: string[],
}

export interface ArtistWithAlbumsID3 extends ArtistID3{
  album: AlbumID3[]
}

export interface AlbumID3{
  id:string
  name: string
  version: string // Optional
  artist: string // Optional
  artistId: string // Optional
  coverArt: string // Optional coverArt id
  songCount: number
  duration: number // Total duration of the album in seconds
  playCount: number // Optional Number of play of the album
  created: string // Date the album was added. [ISO 8601]
  starred: string // Optional Date the album was added. [ISO 8601]
  year: number // Optional
  genre: string // Optional
  played: string // Optional Date the album was last played. [ISO 8601]
  userRating: number // Optional The user rating of the album. [1-5]
  recordLabels: RecordLabel[] // Optional
  musicBrainzId: string // Optional
  genres: ItemGenre[] // Optional The list of all genres of the album.
  artists: ArtistID3[] // Optional The list of all album artists of the album. (Note: Only the required ArtistID3 fields should be returned by default)
  displayArtist: string // The single value display artist.
  releaseTypes: string[] // Optional The types of this album release. (Album, Compilation, EP, Remix, …).
  moods: string[] // Optional The list of all moods of the album.
  sortName: string // Optional
  originalReleaseDate: ItemDate // Optional Date the album was originally released.
  releaseDate: ItemDate // Optional Date the specific edition of the album was released. Note: for files using ID3 tags, releaseDate should generally be read from the TDRL tag. Servers that use a different source for this field should document the behavior.
  isCompilation: boolean | '' // Optional True if the album is a compilation.
  explicitStatus: 'explicit' | 'clean' // Optional Returns “explicit” if at least one song is explicit, “clean” if no song is explicit and at least one is “clean” else “”.
  discTitles: DiscTitle[] // Optional The list of all disc titles of the album.
}

export interface RecordLabel{
  name: string
}

export interface ItemGenre{
  name: string
}

export interface ItemDate{
  year?: number
  month?: number
  day?: number
}

export interface DiscTitle {
  disc: number // The disc number.
  title: string // The name of the disc.
  coverArt?: string // The cover art ID of the disc.
}