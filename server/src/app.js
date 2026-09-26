import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import pino from 'pino';
import { ZodError } from 'zod';
import { createApi } from './routes/api.js';
import { createMailProvider } from './services/providers.js';
import { AppError } from './utils/errors.js';
export function createApp(config, overrides = {}) {
  const app = express();
  const log = pino({
    level: config.LOG_LEVEL,
    redact: ['password', 'token', 'req.headers.cookie', 'req.headers.authorization'],
  });
  app.disable('x-powered-by');
  app.set('trust proxy', config.TRUST_PROXY);
  app.use((req, res, next) => {
    req.id = randomUUID();
    req.log = log;
    res.setHeader('X-Request-ID', req.id);
    const start = performance.now();
    res.on('finish', () =>
      log.info(
        {
          requestId: req.id,
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Math.round(performance.now() - start),
        },
        'request',
      ),
    );
    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          upgradeInsecureRequests: config.NODE_ENV === 'production' ? [] : null,
        },
      },
    }),
  );
  app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
  app.use(compression(), cookieParser());
  app.use(
    '/api',
    rateLimit({
      windowMs: 60000,
      limit: config.NODE_ENV === 'test' ? 5000 : 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: {
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests. Please retry shortly.' },
      },
    }),
  );
  app.use((req, _res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.get('origin');
      if ((origin && origin !== config.CLIENT_URL) || req.get('sec-fetch-site') === 'cross-site')
        return next(new AppError(403, 'Request origin is not allowed.', 'ORIGIN_FORBIDDEN'));
      if (
        req.headers['content-length'] &&
        Number(req.headers['content-length']) > 0 &&
        !req.is('application/json')
      )
        return next(new AppError(415, 'Use application/json for request bodies.'));
    }
    next();
  });
  app.use(express.json({ limit: '32kb' }));
  app.get('/health', (_req, res) =>
    res.json({ success: true, data: { status: 'ok', version: '2.0.0' } }),
  );
  app.get('/ready', (_req, res) =>
    res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
      success: mongoose.connection.readyState === 1,
      data: { database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable' },
    }),
  );
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (mongoose.connection.readyState !== 1)
      return next(new AppError(503, 'The database is temporarily unavailable. Please try again.'));
    next();
  });
  const { router, spec } = createApi(config, overrides.mail || createMailProvider(config));
  app.get('/api/v2/openapi.json', (_req, res) => res.json(spec));
  app.get('/api/docs', (_req, res) =>
    res.type('html').send(
      `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Hydro-Hitch API</title><style>body{font:16px system-ui;max-width:1000px;margin:40px auto;padding:20px}td,th{padding:12px;text-align:left;border-bottom:1px solid #ddd}code{font-size:13px}</style><h1>Hydro-Hitch v2 API</h1><p>Cookie authentication. Protected writes require X-CSRF-Token. All money is PKR; schedules use Asia/Karachi.</p><p><a href="/api/v2/openapi.json">Download complete OpenAPI 3.1 specification</a></p><table><thead><tr><th>Method</th><th>Endpoint</th><th>Operation</th></tr></thead><tbody>${Object.entries(
        spec.paths,
      )
        .flatMap(([path, methods]) =>
          Object.entries(methods).map(
            ([method, operation]) =>
              `<tr><td>${method.toUpperCase()}</td><td><code>${path}</code></td><td>${operation.summary}</td></tr>`,
          ),
        )
        .join('')}</tbody></table></html>`,
    ),
  );
  app.use('/api/v2', router);
  app.use('/api', (_req, _res, next) => next(new AppError(404, 'API endpoint not found.')));
  if (config.NODE_ENV === 'production' || config.SERVE_STATIC) {
    const dist = fileURLToPath(new URL('../../client/dist', import.meta.url));
    app.use(express.static(dist, { maxAge: '1h', index: false }));
    app.get('/{*path}', (_req, res) => res.sendFile(`${dist}/index.html`));
  }
  app.use((_req, _res, next) => next(new AppError(404, 'Page not found.')));
  app.use((error, req, res, _next) => {
    let status = error.status || 500;
    let message = error.message;
    let code = error.code || 'INTERNAL_ERROR';
    let details;
    if (error instanceof ZodError) {
      status = 422;
      code = 'VALIDATION_ERROR';
      message = 'Please check the highlighted fields.';
      details = error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    }
    if (error.name === 'CastError') {
      status = 400;
      message = 'Invalid resource ID.';
      code = 'INVALID_ID';
    }
    if (error.code === 11000) {
      status = 409;
      message = 'This record already exists or the selected delivery resources are reserved.';
      code = 'CONFLICT';
    }
    if (error.name === 'VersionError') {
      status = 409;
      message = 'This record changed. Refresh and try again.';
      code = 'CONFLICT';
    }
    if (error.type === 'entity.parse.failed') {
      status = 400;
      message = 'Malformed JSON request.';
      code = 'INVALID_JSON';
    }
    if (error.type === 'entity.too.large') {
      status = 413;
      message = 'Request is too large.';
      code = 'PAYLOAD_TOO_LARGE';
    }
    if (status >= 500) {
      log.error(
        {
          requestId: req.id,
          errorType: error.name,
          code: typeof error.code === 'number' ? error.code : undefined,
        },
        'request failed',
      );
      message = 'Service temporarily unavailable. Please try again.';
    }
    if (res.headersSent) return res.end();
    res.status(status).json({
      success: false,
      error: { code: String(code), message, ...(details && { details }), requestId: req.id },
    });
  });
  return app;
}
