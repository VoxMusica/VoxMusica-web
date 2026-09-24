import type { Theme } from '@/types/theme'

const THEME_COOKIE_RE = /(?:^|;\s*)theme=(light|dark|system)/

export const getThemeFromRequest = (request: Request): Theme => {
  const cookieHeader = request.headers.get('cookie')
  const match = cookieHeader?.match(THEME_COOKIE_RE)
  return (match?.[1] as Theme) ?? 'system'
}
