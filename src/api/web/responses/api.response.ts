import type { FastifyReply } from 'fastify'

export function apiOk(reply: FastifyReply, payload: Record<string, unknown> = {}) {
  return reply.send(payload);
}

export type ErrorParams = {
  reply: FastifyReply
  httpCode?: number
  errorCode?: string
  message: string
}
export function apiError({ reply, httpCode, errorCode, message } : ErrorParams) {
  return reply.status(httpCode ?? 500).send({
    code: errorCode ?? 'UNKNOWN_ERROR',
    message
  });
}
