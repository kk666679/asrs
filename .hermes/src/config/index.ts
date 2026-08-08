import Redis from 'ioredis';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require('pg');
type PgPool = { query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>; on: (event: string, cb: (err: Error) => void) => void; end: () => Promise<void>; };
import pino from 'pino';

// Load .env if dotenv is available
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config();
} catch { /* dotenv optional */ }

// ── Secure URL validation (CWE-918 SSRF) ─────────────────────────────────────
const ALLOWED_HOSTS = (process.env.HERMES_ALLOWED_HOSTS || 'localhost,127.0.0.1,redis,postgres,db')
  .split(',').map(h => h.trim());

export function validateInternalUrl(rawUrl: string): string {
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch { throw new Error(`Invalid URL: ${rawUrl}`); }
  const host = parsed.hostname;
  if (!ALLOWED_HOSTS.some(h => host === h || host.endsWith(`.${h}`))) {
    throw new Error(`SSRF blocked: host "${host}" not in allowlist. Set HERMES_ALLOWED_HOSTS.`);
  }
  return rawUrl;
}

// ── Structured logger ─────────────────────────────────────────────────────────
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV !== 'production' && {
    transport: { target: 'pino-pretty', options: { colorize: true } },
  }),
  redact: ['req.headers.authorization', 'password', 'token', 'secret'],
  serializers: {
    err: pino.stdSerializers.err,
    // Sanitize user-supplied strings to prevent log injection (CWE-117)
    msg: (v: unknown) => typeof v === 'string' ? v.replace(/[\r\n\t]/g, ' ').slice(0, 2048) : v,
  },
});

// ── Redis ─────────────────────────────────────────────────────────────────────
const redisUrl = validateInternalUrl(process.env.REDIS_URL || 'redis://localhost:6379');

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

redisConnection.on('error', (err) => logger.warn({ err: err.message }, 'Redis connection error'));

// ── PostgreSQL ────────────────────────────────────────────────────────────────
export const pgPool: PgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pgPool.on('error', (err: Error) => logger.warn({ err: err.message }, 'PG pool error'));
