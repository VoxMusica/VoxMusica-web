import type { FastifyReply } from 'fastify'

const API_VERSION = '1.16.1'; // the OpenSubsonic/Subsonic version you're implementing

export function subsonicOk(reply: FastifyReply, payload: Record<string, unknown> = {}) {
  return reply.send({
    'subsonic-response': {
      status: 'ok',
      version: API_VERSION,
      type: 'voxmusica',
      serverVersion: '0.1.0',
      openSubsonic: true,
      ...payload,
    },
  });
}

export function subsonicError(reply: FastifyReply, code: number, message: string) {
  return reply.send({
    'subsonic-response': {
      status: 'failed',
      version: API_VERSION,
      error: { code, message },
    },
  });
}
