import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, delSession } from '@/lib/redis'
import { z } from 'zod'
import { hash } from 'bcryptjs'

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = resetPasswordSchema.parse(body)
    const resetTokenKey = `reset:${data.token}`

    // Get and validate token
    const session = await getSession(resetTokenKey)
    if (!session || !session.userId || session.used) {
      return NextResponse.json(
        { error: { code: 'INVALID_OR_EXPIRED', message: 'Invalid or expired reset token.' } },
        { status: 400 }
      )
    }

    // Hash new password
    const passwordHash = await hash(data.password, 10)

    // Update user password
    await prisma.user.update({
      where: { id: session.userId },
      data: { password_hash: passwordHash }
    })

    // Invalidate token
    await delSession(resetTokenKey)

    return NextResponse.json({ ok: true })

  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error instanceof z.ZodError ? 400 : 500 }
    )
  }
}
