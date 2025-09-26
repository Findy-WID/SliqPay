import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { handleError, handleZodError, NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger'

const updateBalanceSchema = z.object({
  balance: z.number()
})

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const account = await prisma.account.findUnique({
      where: { id: params.id }
    })

    if (!account) {
      throw new NotFoundError('Account not found')
    }

    logger.info({ accountId: params.id }, 'Retrieved account')
    return NextResponse.json({ account })
  } catch (error) {
    return handleError(error, `GET /api/v1/accounts/${params.id}`)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const result = updateBalanceSchema.safeParse(body)

    if (!result.success) {
      return handleZodError(result.error, `PATCH /api/v1/accounts/${params.id}`)
    }

    const account = await prisma.account.update({
      where: { id: params.id },
      data: { balance: result.data.balance }
    })

    logger.info(
      { accountId: params.id, newBalance: result.data.balance },
      'Updated account balance'
    )
    
    return NextResponse.json({ account })
  } catch (error) {
    return handleError(error, `PATCH /api/v1/accounts/${params.id}`)
  }
}
