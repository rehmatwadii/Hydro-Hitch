import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import * as v from '../validators/index.js';
import { authenticate, authorize } from '../services/security.js';
import { authControllers } from '../controllers/auth.js';
import { resources } from '../controllers/resources.js';
import {
  assignBooking,
  changeStatus,
  createBooking,
  getBookingDetail,
} from '../services/bookings.js';
import { calculatePrice, getPricing } from '../services/pricing.js';
import { ADMINS, OPERATORS, ROLES } from '../constants/booking.js';
import { locationProvider, paymentProviders } from '../services/providers.js';
import { ok } from '../utils/errors.js';

export function createApi(config, mail) {
  const router = Router();
  const paths = {};
  const auth = authControllers(config, mail);
  const authLimit = rateLimit({
    windowMs: 15 * 60000,
    limit: config.NODE_ENV === 'test' ? 200 : 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' },
    },
  });
  function route(method, path, roles, schema, handler, summary, limited = false) {
    const middleware = [];
    if (limited) middleware.push(authLimit);
    if (roles) middleware.push(authenticate, authorize(...roles));
    if (path.includes(':id'))
      middleware.push((req, _res, next) => {
        v.id.parse(req.params.id);
        next();
      });
    if (schema) middleware.push(v.validate(schema));
    router[method](path, ...middleware, handler);
    const docPath = `/api/v2${path.replace(':id', '{id}')}`;
    paths[docPath] ||= {};
    const parameters = path.includes(':id')
      ? [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
          },
        ]
      : [];
    if (method === 'get' && !path.includes(':id'))
      parameters.push(
        ...[
          'page',
          'limit',
          'search',
          'status',
          'role',
          'from',
          'to',
          'sort',
          'driver',
          'customer',
        ].map((name) => ({
          name,
          in: 'query',
          schema: { type: 'string' },
          description: 'Applicable list filters; page defaults to 1, limit to 12 (max 100).',
        })),
      );
    if (roles && method !== 'get')
      parameters.push({
        name: 'X-CSRF-Token',
        in: 'header',
        required: true,
        schema: { type: 'string' },
        description: 'Returned by login, registration and /auth/me.',
      });
    if (path === '/bookings' && method === 'post')
      parameters.push({
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: { type: 'string', minLength: 16, maxLength: 80 },
      });
    paths[docPath][method] = {
      summary,
      description: roles
        ? `Allowed roles: ${roles.join(', ')}. Ownership scope is enforced for customers and drivers.`
        : 'Public endpoint.',
      security: roles ? [{ sessionCookie: [] }] : [],
      parameters,
      ...(schema && {
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' }),
            },
          },
        },
      }),
      responses: {
        200: { description: 'Success envelope: {success:true,data:...}' },
        ...(method === 'post' && { 201: { description: 'Resource created' } }),
        400: { description: 'Invalid request' },
        401: { description: 'Session missing or expired' },
        403: { description: 'Role or CSRF forbidden' },
        404: { description: 'Resource unavailable or outside ownership scope' },
        409: { description: 'Duplicate or state/schedule conflict' },
        422: { description: 'Validation failed' },
        429: { description: 'Rate limited' },
        503: { description: 'Service unavailable' },
      },
    };
  }
  route('post', '/auth/register', null, v.registration, auth.register, 'Register a customer', true);
  route('post', '/auth/login', null, v.login, auth.login, 'Create a 7-day revocable session', true);
  route(
    'post',
    '/auth/forgot-password',
    null,
    v.registration.pick({ email: true }),
    auth.forgot,
    'Request a password reset',
    true,
  );
  route(
    'post',
    '/auth/reset-password',
    null,
    z.strictObject({ token: z.string().regex(/^[a-f\d]{64}$/), password: v.password }),
    auth.reset,
    'Reset password and revoke all sessions',
    true,
  );
  route('get', '/auth/me', ROLES, null, auth.me, 'Read current user and CSRF token');
  route('post', '/auth/logout', ROLES, null, auth.logout, 'Revoke current session');
  route(
    'patch',
    '/users/me',
    ROLES,
    v.userUpdate.pick({ name: true, phone: true }),
    resources.profile,
    'Update profile',
  );
  route(
    'get',
    '/catalog',
    null,
    null,
    resources.pricing,
    'Read capacities, service areas and quality report',
  );
  route(
    'get',
    '/providers',
    null,
    null,
    (_req, res) =>
      ok(res, { payments: paymentProviders, liveTracking: locationProvider.trackingAvailable }),
    'Read available integrations',
  );
  route('get', '/addresses', ['CUSTOMER'], null, resources.addresses, 'List saved addresses');
  route('post', '/addresses', ['CUSTOMER'], v.address, resources.saveAddress, 'Save address');
  route(
    'patch',
    '/addresses/:id',
    ['CUSTOMER'],
    v.address,
    resources.updateAddress,
    'Edit saved address',
  );
  route(
    'delete',
    '/addresses/:id',
    ['CUSTOMER'],
    null,
    resources.deleteAddress,
    'Remove saved address',
  );
  route(
    'post',
    '/pricing/quote',
    ['CUSTOMER'],
    v.quote,
    async (req, res) => ok(res, calculatePrice(req.body, await getPricing())),
    'Calculate a server-authoritative price',
  );
  route(
    'get',
    '/bookings',
    ROLES,
    null,
    resources.bookings,
    'List scoped bookings with pagination and filters',
  );
  route(
    'post',
    '/bookings',
    ['CUSTOMER'],
    v.booking,
    async (req, res) => {
      const result = await createBooking(req);
      ok(res, result.booking, result.replay ? 200 : 201);
    },
    'Create an idempotent booking',
  );
  route(
    'get',
    '/bookings/:id',
    ROLES,
    null,
    async (req, res) => ok(res, await getBookingDetail(req.user, req.params.id)),
    'Read booking and history',
  );
  route(
    'patch',
    '/bookings/:id/status',
    ROLES,
    v.transition,
    async (req, res) => ok(res, await changeStatus(req)),
    'Apply a controlled booking transition',
  );
  route(
    'post',
    '/bookings/:id/review',
    ['CUSTOMER'],
    v.review,
    resources.review,
    'Review a delivered booking',
  );
  route(
    'post',
    '/dispatch/:id',
    OPERATORS,
    v.assignment,
    async (req, res) => ok(res, await assignBooking(req)),
    'Assign or reassign a driver and tanker',
  );
  route('get', '/drivers', OPERATORS, null, resources.drivers, 'List drivers');
  route('get', '/tankers', OPERATORS, null, resources.tankers, 'List tankers');
  route('post', '/tankers', ADMINS, v.tanker, resources.createTanker, 'Register tanker');
  route('patch', '/tankers/:id', ADMINS, v.tanker, resources.updateTanker, 'Update tanker');
  route('get', '/users', ADMINS, null, resources.users, 'List accounts');
  route(
    'post',
    '/users',
    ADMINS,
    v.registration.extend({ role: z.enum(ROLES) }),
    resources.createUser,
    'Create a staff account',
  );
  route(
    'patch',
    '/users/:id',
    ADMINS,
    v.userUpdate,
    resources.updateUser,
    'Change account role, status or availability',
  );
  route(
    'get',
    '/admin/pricing',
    ADMINS,
    null,
    resources.pricing,
    'Read full pricing configuration',
  );
  route(
    'put',
    '/admin/pricing',
    ADMINS,
    v.pricing,
    resources.updatePricing,
    'Update pricing, areas, capacity options and quality report',
  );
  route('get', '/notifications', ROLES, null, resources.notifications, 'List in-app notifications');
  route(
    'patch',
    '/notifications/:id',
    ROLES,
    z.strictObject({}),
    resources.readNotification,
    'Mark notification read',
  );
  route('get', '/tickets', ROLES, null, resources.tickets, 'List support requests and questions');
  route(
    'post',
    '/tickets',
    ROLES,
    v.ticket,
    resources.createTicket,
    'Submit a complaint, question or delivery problem',
  );
  route(
    'patch',
    '/tickets/:id',
    OPERATORS,
    z.strictObject({ status: z.enum(['OPEN', 'RESOLVED']), response: v.text(3, 2000) }),
    resources.updateTicket,
    'Respond to support request',
  );
  route('get', '/reviews', ADMINS, null, resources.reviews, 'List customer ratings');
  route('get', '/payments', ADMINS, null, resources.payments, 'List payment ledger');
  route(
    'post',
    '/payments/:id',
    ADMINS,
    z.strictObject({ state: z.enum(['PAID', 'REFUNDED']), note: v.text(3, 500) }),
    resources.recordPayment,
    'Record verified cash collection or refund',
  );
  route(
    'get',
    '/reports/overview',
    ROLES,
    null,
    resources.stats,
    'Read real scoped operational metrics',
  );
  route(
    'get',
    '/reports/bookings.csv',
    ADMINS,
    null,
    resources.export,
    'Export filtered bookings (10,000 row maximum)',
  );
  route('get', '/admin/audit', ADMINS, null, resources.audit, 'Read administrative audit events');
  return {
    router,
    spec: {
      openapi: '3.1.0',
      info: {
        title: 'Hydro-Hitch v2 Retrofit API',
        version: '2.0.0',
        description:
          'All money is whole Pakistani rupees. Schedules use Asia/Karachi. Cookie sessions require CSRF headers on protected writes. Booking and dispatch transactions require a MongoDB replica set.',
      },
      servers: [{ url: '/' }],
      components: {
        securitySchemes: { sessionCookie: { type: 'apiKey', in: 'cookie', name: 'hh_session' } },
      },
      paths,
    },
  };
}
