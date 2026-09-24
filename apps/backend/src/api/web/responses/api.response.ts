import type { FastifyReply } from 'fastify'

export const apiOk = (reply: FastifyReply, payload: Record<string, unknown> = {}) => reply.send(payload)

export type ErrorParams = {
  reply: FastifyReply
  httpCode?: number
  errorCode?: string
  message: string
}
export const apiError = ({ reply, httpCode, errorCode, message } : ErrorParams) => reply.status(httpCode ?? 500).send({
  code: errorCode ?? 'UNKNOWN_ERROR',
  message
})
