import 'dotenv/config';
import { z } from 'zod';
const schema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(4000),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be set and at least 16 characters'),
    // Redis configuration
    REDIS_HOST: z.string().min(1, 'REDIS_HOST is required').optional(),
    REDIS_PORT: z.coerce.number().optional(),
    REDIS_USERNAME: z.string().default('default').optional(),
    REDIS_PASSWORD: z.string().optional()
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
    console.error('Environment validation failed:', parsed.error.format());
    process.exit(1);
}
export const env = schema.parse(process.env);
