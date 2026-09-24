export const joinPaths = (...segments: string[]) =>
  segments
    .map((s, i) => i === 0
        ? s.replace(/\/+$/, '') // keep the leading / for root calls
        : s.replace(/^\/+|\/+$/g, '')
    )
    .filter(Boolean)
    .join('/')