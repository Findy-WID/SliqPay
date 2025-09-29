import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setSession } from '@/lib/redis'
import { compare } from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const valid = await compare(data.password, user.password_hash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session
    const session = {
      userId: user.id,
      email: user.email
    }

    await setSession(`session:${user.id}`, session, 60 * 60 * 24 * 7) // 1 week

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name
      }
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error instanceof z.ZodError ? 400 : 500 }
    )
  }
}
