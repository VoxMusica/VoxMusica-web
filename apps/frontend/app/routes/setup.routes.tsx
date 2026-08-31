import { index, route } from '@react-router/dev/routes'

export interface SetupOutletContext {
  setCanProceed: (canProceed: boolean) => void
  setOnNext: (handler: (() => boolean | Promise<boolean>) | null) => void
}

export const setupRoutes = [
  index('pages/setup/welcome.page.tsx'),
  route('admin-account', 'pages/setup/admin-account.page.tsx'),
  route('library-path', 'pages/setup/library-path.page.tsx'),
  route('done', 'pages/setup/done.page.tsx')
]
