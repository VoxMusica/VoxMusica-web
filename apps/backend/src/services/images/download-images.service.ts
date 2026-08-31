import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { USER_AGENT } from "#generated/userAgent"


export const fetchAndSave = async (url: string, destPath: string) => {
  const response = await fetch(cleanupUrl(url), { headers: { 'User-Agent': USER_AGENT } })

  if (response.status === 404) return null
  if (!response.ok) throw new Error(`unexpected status ${response.status} fetching ${url}`)

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.startsWith('image/')) {
    throw new Error(`Expected an image but got content-type: ${contentType}`)
  }


  const buffer = Buffer.from(await response.arrayBuffer())
  await mkdir(path.dirname(destPath), { recursive: true })
  await writeFile(destPath, buffer)
  return destPath
}

const cleanupUrl = (url: string) => {
  const parsed = new URL(url)
  /**
   * Replace the /web/<timestamp>/ part of the url with /web/<timestamp>id_/
   */
  if(parsed.hostname === 'web.archive.org' && /^\/web\/\d*[a-z_]*\//.test(parsed.pathname)){
    return url.replace(/\/web\/(\d*)\//, '/web/$1id_/')
  }
  return url
}