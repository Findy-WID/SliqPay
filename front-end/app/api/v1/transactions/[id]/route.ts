import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id }
    })

    if (!transaction) {
      throw new NotFoundError('Transaction not found')
    }

    logger.info(
      { 
        transactionId: params.id,
        accountId: transaction.account_id,
        amount: transaction.amount,
        type: transaction.type
      },
      'Retrieved transaction'
    )

    return NextResponse.json({ transaction })
  } catch (error) {
    return handleError(error, `GET /api/v1/transactions/${params.id}`)
  }
}
