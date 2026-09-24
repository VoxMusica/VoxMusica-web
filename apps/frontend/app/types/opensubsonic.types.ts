export interface OpensubsonicResponse{
  status: 'ok' | 'ko'
  version: string
  type: string
  serverVersion: string
  openSubsonic: boolean
}