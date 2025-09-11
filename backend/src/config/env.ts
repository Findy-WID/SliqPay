import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development','production','test']).default('development'),
  PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be set and at least 16 characters')
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Environment validation failed:', parsed.error.format());
  process.exit(1);
}
export const env = schema.parse(process.env);
