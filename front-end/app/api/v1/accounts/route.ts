import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { handleError, handleZodError, ValidationError } from '@/lib/errors'
import { logger } from '@/lib/logger'

const createAccountSchema = z.object({
  userId: z.string(),
  balance: z.number().optional(),
  currency: z.string().optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = createAccountSchema.safeParse(body)

    if (!result.success) {
      return handleZodError(result.error, 'POST /api/v1/accounts')
    }

    const account = await prisma.account.create({
      data: {
        user_id: result.data.userId,
        balance: result.data.balance ?? 0,
        currency: result.data.currency ?? 'NGN'
      }
    })

    logger.info({ accountId: account.id }, 'Account created')
    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    return handleError(error, 'POST /api/v1/accounts')
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      throw new ValidationError('userId is required')
    }

    const accounts = await prisma.account.findMany({
      where: { user_id: userId }
    })

    logger.info({ userId, count: accounts.length }, 'Retrieved user accounts')
    return NextResponse.json({ accounts })
  } catch (error) {
    return handleError(error, 'GET /api/v1/accounts')
  }
}
