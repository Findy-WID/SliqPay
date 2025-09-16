import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}
