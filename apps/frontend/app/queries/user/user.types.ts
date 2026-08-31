export interface GetApiKeysResponse {
  apiKey: string
  id: string
  label: string
  createdAt: Date
  lastUsedAt?: Date
  expiresAt?: Date
}

export interface CreateApiKeyQuery {
  label: string
  expiresAt?: Date
}