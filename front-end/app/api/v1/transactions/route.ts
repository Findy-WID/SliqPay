import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { handleError, handleZodError, ValidationError } from '@/lib/errors'
import { logger } from '@/lib/logger'

const createTransactionSchema = z.object({
  accountId: z.string(),
  amount: z.number(),
  type: z.string(),
  description: z.string().optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = createTransactionSchema.safeParse(body)

    if (!result.success) {
      return handleZodError(result.error, 'POST /api/v1/transactions')
    }

    const { accountId, amount, type, description } = result.data
    const transaction = await prisma.transaction.create({
      data: {
        account_id: accountId,
        amount,
        type,
        description
      }
    })

    logger.info(
      { 
        transactionId: transaction.id,
        accountId,
        amount,
        type
      },
      'Transaction created'
    )

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    return handleError(error, 'POST /api/v1/transactions')
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      throw new ValidationError('accountId is required')
    }

    const results = await prisma.transaction.findMany({
      where: { account_id: accountId },
      orderBy: { created_at: 'desc' }
    })

    logger.info(
      { accountId, count: results.length },
      'Retrieved account transactions'
    )

    return NextResponse.json({ transactions: results })
  } catch (error) {
    return handleError(error, 'GET /api/v1/transactions')
  }
}
