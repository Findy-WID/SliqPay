import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setSession } from '@/lib/redis'
import { z } from 'zod'
import { sendMail } from '@/lib/email'
import { env } from '@/lib/env'
import crypto from 'crypto'

const forgotSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = forgotSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    // Don't reveal if user exists
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    // Generate reset token (32 bytes = 64 hex chars)
    const token = crypto.randomBytes(32).toString('hex')
    const resetTokenKey = `reset:${token}`

    // Store token -> userId mapping in Redis with TTL
    await setSession(resetTokenKey, {
      userId: user.id,
      used: false
    }, 900) // 15 minutes TTL

    // Construct reset URL
    const base = env.FRONTEND_URL || 'http://localhost:3000'
    const resetUrl = `${base}/auth/resetpassword?token=${token}`

    // Send email
    await sendMail({
      to: user.email,
      subject: 'Reset your SliqPay password',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 15 minutes.</p>`
    })

    return NextResponse.json({ ok: true })

  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error instanceof z.ZodError ? 400 : 500 }
    )
  }
}
