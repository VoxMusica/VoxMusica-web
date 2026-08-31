import { index, layout, prefix, route } from '@react-router/dev/routes'

export const userSettingsRoutes = prefix('/user-settings', [
  layout('pages/user-settings/layout.tsx', [
    index('pages/user-settings/general.page.tsx'),
    route('security', 'pages/user-settings/security.page.tsx'),
  ])
])
