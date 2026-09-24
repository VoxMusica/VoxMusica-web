import pino from 'pino'

import type { LogFn, Logger, LoggerOptions } from 'pino'

const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === 'development' || process.env.NODE_ENV === 'development';

const pinoConfig: LoggerOptions = {
  level: process.env.LOG_LEVEL || 'debug',
  // We recommend using pino-pretty in development environments only
  ...(isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss Z', sync: true },
        },
      }
    : {}),
  hooks: { logMethod },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
};

export const logger = (config: LoggerOptions) => pino({...pinoConfig, ...config});

// eslint-disable-next-line func-style
function logMethod(this: Logger, args: Parameters<LogFn>, method: LogFn) {
  // If two arguments: (message, payload) -> Format correctly
  if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'object' && !args[0].includes('%')) {
    const payload: Record<string, unknown> = { msg: args[0], ...(args[1] as Record<string, unknown>) };

    // If the object is an Error, serialize it properly
    if ((args[1] as unknown) instanceof Error) {
      payload.error = payload.error ?? args[1];
    }

    method.call(this, payload);
  } else {
    // any other amount of parameters, or order of parameters will be considered here
    method.apply(this, args);
  }
}

export default logger
