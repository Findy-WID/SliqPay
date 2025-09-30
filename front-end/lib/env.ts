export const env = {
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@sliqpay.com',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  RESET_TOKEN_TTL_SECONDS: process.env.RESET_TOKEN_TTL_SECONDS || '900',
  
  // VTPass API settings
  VTPASS_API_KEY: process.env.VTPASS_API_KEY || '',
  VTPASS_PUBLIC_KEY: process.env.VTPASS_PUBLIC_KEY || '',
  VTPASS_SECRET_KEY: process.env.VTPASS_SECRET_KEY || '',
  VTPASS_BASE_URL: process.env.VTPASS_BASE_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://vtpass.com/api' 
      : 'https://sandbox.vtpass.com/api')
}
