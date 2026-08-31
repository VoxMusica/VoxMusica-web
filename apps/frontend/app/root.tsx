import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router'

import { getThemeFromRequest } from './_bff/theme.server'
import App from '@/app'

import type { Route } from './+types/root'
import type { Theme } from './types/theme'

import './style/app.css'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1
    }
  }
})

const themeInitScript = (theme: Theme) => `
(function() {
  try {
    var theme = ${JSON.stringify(theme)};
    var resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  } catch (e) {}
})();
`

export const loader = async ({ request }: Route.LoaderArgs) => {
  const acceptLang = request.headers.get('accept-language') || ''
  const lang = acceptLang.startsWith('fr') ? 'fr' : 'en'
  const theme = getThemeFromRequest(request)
  return { lang, theme }
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const data = useLoaderData<typeof loader>()
  const theme = data?.theme ?? 'system'
  return (
    <html lang="en" className={theme === 'light' ? '' : 'dark'} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript(theme) }} />
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}


export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}

export default App
