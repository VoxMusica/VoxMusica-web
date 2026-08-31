export const toXmlAttrs = (obj: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = toXmlAttrs(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      result[key] = value.map(v =>
        v !== null && typeof v === 'object' ? toXmlAttrs(v) : v
      )
    } else {
      result[`@${key}`] = value
    }
  }
  return result
}
