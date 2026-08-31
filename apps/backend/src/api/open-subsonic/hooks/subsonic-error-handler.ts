import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'


import { subsonicError } from '#api/open-subsonic/responses/subsonic.response'

import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'

export const subsonicErrorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    const message = error.validation
      .map((validationError) => {
        const issue = validationError.params?.issue as z.core.$ZodIssue | undefined
        const path = issue?.path?.join('.') ?? validationError.instancePath.replace(/^\//, '')
        return `${path}: ${validationError.message}`
      })
      .join(', ')

    return subsonicError(request.query as Record<string, string>, reply, 10, message)
  }
  request.log.error(error)
  return subsonicError(request.query as Record<string, string>, reply, 0, 'A generic error occurred')
}
