import { index, layout, route } from '@react-router/dev/routes'

export const libraryRoutes = layout('pages/library/layout.tsx', [
  index('pages/library/home.page.tsx'),
  route('artists', 'pages/library/artists.page.tsx'),
  route('artists/:artistId', 'pages/library/artist.page.tsx'),
])
