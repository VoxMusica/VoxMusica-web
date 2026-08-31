import { type RouteConfig, layout, route } from '@react-router/dev/routes'

import { libraryRoutes } from './routes/library.routes'
import { setupRoutes } from './routes/setup.routes'
import { userSettingsRoutes } from './routes/user-settings.routes'

export default [
  layout('routes/_protected.tsx', [
    layout('pages/logged-in.layout.tsx', [
      libraryRoutes,
      ...userSettingsRoutes,
    ]),
  ]),
  route('login', 'pages/login.page.tsx'),
  route('setup', 'pages/setup/layout.tsx', setupRoutes) 
] satisfies RouteConfig
