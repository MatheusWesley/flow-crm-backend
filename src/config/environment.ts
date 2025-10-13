import { z } from 'zod';
import 'dotenv/config';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number).pipe(z.number().min(1).max(65535)),
  DATABASE_URL: z.string().url('Invalid DATABASE_URL format'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  FRONTEND_URL: z.string().url('Invalid FRONTEND_URL format').optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

function validateEnvironment(): Environment {
  try {
    return environmentSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (err: any) => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `Environment validation failed:\n${errorMessages.join('\n')}`
      );
    }
    throw error;
  }
}

export const env = validateEnvironment();