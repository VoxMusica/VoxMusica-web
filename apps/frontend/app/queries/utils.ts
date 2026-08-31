import { joinPaths } from '@/utils/path.utils'

export const postMutationFn = <T>(
  url: string,
  bodyFormater: (val: T | null) => string = payload => JSON.stringify(payload)
) => async (values: T) => {
  const requestBody = bodyFormater(values)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...(requestBody ? {body: requestBody} : {}),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Failed ')
  }

  return res.json()
}

export const deleteMutation = <T>(
  url: string,
  pathFormater: (values: T) => string
) => async (values: T) => {
  const res = await fetch(joinPaths(url, pathFormater(values)), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: '{}'
  })
  
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Failed ')
  }

  return res.json()
}

export const getQueryFn: <T> (url: string) => Promise<T>  = (url) => fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
 .then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.message ?? 'Failed ')
    }
    return res.json()
  })