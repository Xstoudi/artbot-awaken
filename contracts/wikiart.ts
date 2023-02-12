type ListWithPagination<T> = {
  data: T[]
  hasMore: boolean
  paginationToken: string | null
}

type PaintingShort = {
  id: string
  title: string
  url: string
  artistUrl: string
  artistName: string
  artistId: string
  completitionYear: number | null
  image: string
  width: number
  height: number
}

type ArtistDictionary = {
  id: string
  title: string
}

type Painting = PaintingShort & {
  dictionaries: []
  location: string
  period: ArtistDictionary | null
  serie: ArtistDictionary | null
  genres: string[]
  styles: string[]
  media: string[]
  galleries: string[]
  tags: string[]
  sizeX: number | null
  sizeY: number | null
  diameter: number | null
  description: string
}
