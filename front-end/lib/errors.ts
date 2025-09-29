import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logger, logError } from './logger'

export type AppError = Error & {
  status?: number
  code?: string
}

export function handleError(error: unknown, context: string) {
  // Log all errors
  if (error instanceof Error) {
    const appError = error as AppError
    const { message, status } = logError(appError, context)
    
    return NextResponse.json(
      { error: { message, code: appError.code } },
      { status: status || 500 }
    )
  }

  // Unknown errors
  logger.error({ error, context })
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export function handleZodError(error: ZodError, context: string) {
  logger.warn({ error: error.format(), context })
  
  return NextResponse.json({
    error: {
      message: 'Validation failed',
      details: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    }
  }, { status: 400 })
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
    this.status = 400
  }
  status: number
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
    this.status = 404
  }
  status: number
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
    this.status = 401
  }
  status: number
}
