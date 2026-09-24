import { z } from 'zod'

export const subsonicAuthParamsSchema = z.object({
  u: z.string().optional(),
  p: z.string().optional(),
  t: z.string().optional(),
  s: z.string().optional(),
  v: z.string(),
  c: z.string(),
  f: z.string().optional(),
  apiKey: z.string().optional(),
})
export type SubsonicQuerystring = z.infer<typeof subsonicAuthParamsSchema>

export interface OpenSubsonicRequest{
  Querystring: SubsonicQuerystring 
}
export interface OpensubsonicResponse{
  status: 'ok' | 'ko'
  version: string
  type: string
  serverVersion: string
  openSubsonic: boolean
}

export const itemGenreSchema = z.object({
  name: z.string(),
})
export type ItemGenre = z.infer<typeof itemGenreSchema>


export const itemDateSchema = z.object({
  year: z.number().int().optional(),
  month: z.number().int().optional(),
  day: z.number().int().optional(),
})

export type ItemDate = z.infer<typeof itemDateSchema>
