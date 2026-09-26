import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
dotenv.config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)), quiet: true });
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(8001),
  CLIENT_URL: z.url().default('http://localhost:5173'),
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\//),
  LOG_LEVEL: z.enum(['silent', 'fatal', 'error', 'warn', 'info', 'debug']).default('info'),
  TRUST_PROXY: z.coerce.number().int().min(0).max(3).default(0),
  SERVE_STATIC: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});
export function readConfig(input = process.env) {
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    throw new Error(
      `Invalid configuration: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}. See .env.example.`,
    );
  if (parsed.data.NODE_ENV === 'production' && !parsed.data.CLIENT_URL.startsWith('https://'))
    throw new Error('Production CLIENT_URL must use HTTPS');
  return parsed.data;
}
