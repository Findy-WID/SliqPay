import pino from 'pino'

const pinoConfig = {
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'development' ? {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  } : {})
}

export const logger = pino(pinoConfig)

type ErrorWithStatus = Error & { status?: number }

export function logError(error: ErrorWithStatus, context?: string) {
  const status = error.status || 500
  const message = error.message || 'Internal server error'
  
  logger.error({
    error: {
      message,
      status,
      stack: error.stack,
    },
    context,
  })

  return { message, status }
}
