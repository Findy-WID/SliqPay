import nodemailer from 'nodemailer'
import { env } from './env'

interface MailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  },
  secure: Number(env.SMTP_PORT) === 465
})

export async function sendMail(options: MailOptions) {
  const mailOptions = {
    from: env.EMAIL_FROM,
    ...options
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new Error('Failed to send email')
  }
}
