import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import {
  Address,
  Booking,
  Pricing,
  Session,
  SlotUsage,
  Tanker,
  User,
  initializeModels,
} from '../src/models/index.js';
import { defaultPricing } from '../src/services/pricing.js';
import { SLOTS, scheduleStart } from '../src/constants/booking.js';
let replica,
  app,
  customer,
  other,
  admin,
  dispatcher,
  driver,
  driver2,
  address,
  tanker,
  smallTanker,
  bookingId;
const emails = [];
const testPassword = 'Test-only-password-2026';
const config = {
  NODE_ENV: 'test',
  PORT: 8001,
  CLIENT_URL: 'http://localhost:5173',
  LOG_LEVEL: 'silent',
  TRUST_PROXY: 0,
};
const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-CA', {
  timeZone: 'Asia/Karachi',
});
async function login(email) {
  const agent = request.agent(app);
  const response = await agent.post('/api/v2/auth/login').send({ email, password: testPassword });
  assert.equal(response.status, 200, JSON.stringify(response.body));
  return { agent, csrf: response.body.data.csrf, user: response.body.data.user };
}
const write = (actor, method, path, body = {}) =>
  actor.agent[method](`/api/v2${path}`).set('X-CSRF-Token', actor.csrf).send(body);
const makeBody = (overrides) => ({
  quoteRevision: 1,
  addressId: String(address._id),
  capacity: 2000,
  waterType: 'Utility water',
  date: tomorrow,
  slot: '08:00-11:00',
  ...overrides,
});
async function book(overrides = {}, key = randomUUID()) {
  return customer.agent
    .post('/api/v2/bookings')
    .set('X-CSRF-Token', customer.csrf)
    .set('Idempotency-Key', key)
    .send(makeBody(overrides));
}
before(
  async () => {
    process.env.NODE_ENV = 'test';
    replica = await MongoMemoryReplSet.create({
      binary: { version: '8.2.6' },
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    await mongoose.connect(replica.getUri('hydro_test'));
    await initializeModels();
    app = createApp(config, { mail: { send: async (message) => emails.push(message) } });
    await Pricing.create(defaultPricing);
    const hash = await bcrypt.hash(testPassword, 4);
    for (const [name, role] of [
      ['customer', 'CUSTOMER'],
      ['other', 'CUSTOMER'],
      ['admin', 'SUPER_ADMIN'],
      ['dispatch', 'DISPATCHER'],
      ['driver', 'DRIVER'],
      ['driver2', 'DRIVER'],
    ])
      await User.create({
        name,
        email: `${name}@example.test`,
        phone: '+923001234567',
        passwordHash: hash,
        role,
      });
    customer = await login('customer@example.test');
    other = await login('other@example.test');
    admin = await login('admin@example.test');
    dispatcher = await login('dispatch@example.test');
    driver = await login('driver@example.test');
    driver2 = await login('driver2@example.test');
    address = await Address.create({
      customer: customer.user._id,
      label: 'Home',
      street: 'House 1 Block 2',
      area: 'DHA',
      city: 'Karachi',
    });
    tanker = await Tanker.create({ registration: 'TEST-2000', capacity: 2000 });
    smallTanker = await Tanker.create({ registration: 'TEST-1000', capacity: 1000 });
  },
  { timeout: 120000 },
);
after(async () => {
  await mongoose.disconnect();
  await replica?.stop();
});
test('health readiness security headers and OpenAPI load', async () => {
  const health = await request(app).get('/health');
  assert.equal(health.status, 200);
  assert.ok(health.headers['x-content-type-options']);
  assert.ok(health.headers['x-request-id']);
  assert.equal((await request(app).get('/ready')).status, 200);
  const spec = await request(app).get('/api/v2/openapi.json');
  assert.equal(spec.body.openapi, '3.1.0');
  assert.ok(Object.keys(spec.body.paths).length > 25);
  assert.equal((await request(app).get('/api/docs')).status, 200);
});
test('registration creates a customer and never leaks secrets or accepts a role', async () => {
  const body = {
    name: 'New Customer',
    email: 'new@example.test',
    phone: '+923001234568',
    password: testPassword,
  };
  assert.equal(
    (
      await request(app)
        .post('/api/v2/auth/register')
        .send({ ...body, role: 'ADMIN' })
    ).status,
    422,
  );
  const result = await request(app).post('/api/v2/auth/register').send(body);
  assert.equal(result.status, 201);
  assert.equal(result.body.data.user.role, 'CUSTOMER');
  assert.equal(result.body.data.user.passwordHash, undefined);
  assert.match(result.headers['set-cookie'][0], /HttpOnly/);
  assert.match(result.headers['set-cookie'][0], /SameSite=Strict/);
  assert.equal((await request(app).post('/api/v2/auth/register').send(body)).status, 409);
});
test('authentication rejects absent, invalid, expired, disabled and deleted accounts', async () => {
  assert.equal((await request(app).get('/api/v2/bookings')).status, 401);
  assert.equal(
    (
      await request(app)
        .post('/api/v2/auth/login')
        .send({ email: 'none@example.test', password: 'bad' })
    ).status,
    401,
  );
  const tmp = await login('other@example.test');
  await Session.updateMany({ user: tmp.user._id }, { $set: { expiresAt: new Date(0) } });
  assert.equal((await tmp.agent.get('/api/v2/auth/me')).status, 401);
  other = await login('other@example.test');
  await User.updateOne({ _id: other.user._id }, { $set: { active: false } });
  assert.equal((await other.agent.get('/api/v2/auth/me')).status, 401);
  await User.updateOne({ _id: other.user._id }, { $set: { active: true } });
  const newUser = await User.create({
    name: 'Removed',
    email: 'removed@example.test',
    phone: '03001234567',
    passwordHash: await bcrypt.hash(testPassword, 4),
  });
  const removed = await login(newUser.email);
  await newUser.deleteOne();
  assert.equal((await removed.agent.get('/api/v2/auth/me')).status, 401);
});
test('CSRF, origin checks, malformed JSON, payload limits and injection are enforced', async () => {
  assert.equal(
    (await customer.agent.patch('/api/v2/users/me').send({ name: 'Attacker' })).status,
    403,
  );
  assert.equal(
    (
      await write(customer, 'patch', '/users/me', { name: 'Attacker' }).set(
        'Origin',
        'https://evil.test',
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await request(app)
        .post('/api/v2/auth/login')
        .set('Content-Type', 'application/json')
        .send('{broken')
    ).status,
    400,
  );
  assert.equal(
    (
      await request(app)
        .post('/api/v2/auth/login')
        .send({ email: { $ne: null }, password: 'x' })
    ).status,
    422,
  );
  assert.equal(
    (await write(customer, 'patch', '/users/me', { name: 'x'.repeat(40000) })).status,
    413,
  );
  assert.equal((await customer.agent.get('/api/v2/bookings/not-an-id')).status, 422);
});
test('privileged APIs are protected for every customer and driver', async () => {
  for (const actor of [customer, driver])
    for (const path of [
      '/users',
      '/drivers',
      '/tankers',
      '/payments',
      '/admin/pricing',
      '/admin/audit',
      '/reports/bookings.csv',
      '/reviews',
    ])
      assert.equal((await actor.agent.get(`/api/v2${path}`)).status, 403, path);
  assert.equal((await dispatcher.agent.get('/api/v2/admin/pricing')).status, 403);
  assert.equal(
    (await write(customer, 'post', '/tankers', { registration: 'BAD-1', capacity: 2000 })).status,
    403,
  );
});
test('server owns prices, user identity and address access', async () => {
  assert.equal((await book({ price: { total: 1 } })).status, 422);
  const foreignAddress = await Address.create({
    customer: other.user._id,
    label: 'Private',
    street: 'House 7',
    area: 'DHA',
    city: 'Karachi',
  });
  assert.equal((await book({ addressId: String(foreignAddress._id) })).status, 404);
  const result = await book();
  assert.equal(result.status, 201, JSON.stringify(result.body));
  bookingId = result.body.data._id;
  assert.equal(result.body.data.price.total, 3550);
  assert.match(result.body.data.reference, /^HH-\d{4}-\d{6}$/);
});
test('IDOR is blocked on reads, changes, addresses, reviews and complaints', async () => {
  assert.equal((await other.agent.get(`/api/v2/bookings/${bookingId}`)).status, 404);
  assert.equal(
    (
      await write(other, 'patch', `/bookings/${bookingId}/status`, {
        status: 'CANCELLED',
        note: 'Not mine',
      })
    ).status,
    404,
  );
  assert.equal((await write(other, 'delete', `/addresses/${address._id}`)).status, 404);
  assert.equal(
    (await write(other, 'post', `/bookings/${bookingId}/review`, { rating: 5, comment: 'Spoof' }))
      .status,
    404,
  );
  assert.equal(
    (
      await write(other, 'post', '/tickets', {
        booking: bookingId,
        kind: 'COMPLAINT',
        subject: 'Test complaint',
        message: 'Attempt to link another order',
      })
    ).status,
    404,
  );
});
test('duplicate and concurrent idempotent bookings produce exactly one record', async () => {
  const key = randomUUID();
  const responses = await Promise.all([
    book({ slot: SLOTS[1] }, key),
    book({ slot: SLOTS[1] }, key),
  ]);
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 201]);
  assert.equal(responses[0].body.data._id, responses[1].body.data._id);
  assert.equal(await Booking.countDocuments({ idempotencyKey: key }), 1);
  assert.equal((await book({ slot: SLOTS[2] }, key)).status, 409);
});
test('invalid dates, past slots, excessive horizon and missing idempotency are rejected', async () => {
  assert.equal((await book({ quoteRevision: 999 })).status, 409);
  assert.equal((await book({ date: '2026-02-30' })).status, 422);
  assert.equal((await book({ date: '2000-01-01' })).status, 422);
  assert.equal((await book({ date: '2099-01-01' })).status, 422);
  assert.equal((await write(customer, 'post', '/bookings', makeBody())).status, 400);
});
test('independent concurrent bookings retain unique references and do not lose slot counts', async () => {
  const date = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
  const responses = await Promise.all(
    Array.from({ length: 6 }, () => book({ date, slot: SLOTS[2] })),
  );
  assert.deepEqual(
    responses.map((r) => r.status),
    Array(6).fill(201),
  );
  assert.equal(new Set(responses.map((r) => r.body.data.reference)).size, 6);
  assert.equal((await SlotUsage.findOne({ key: `${date}/${SLOTS[2]}` })).count, 6);
});
test('state machine rejects skips and customer confirmation', async () => {
  assert.equal(
    (
      await write(admin, 'patch', `/bookings/${bookingId}/status`, {
        status: 'DELIVERED',
        recipient: 'Test',
      })
    ).status,
    409,
  );
  assert.equal(
    (await write(customer, 'patch', `/bookings/${bookingId}/status`, { status: 'CONFIRMED' }))
      .status,
    403,
  );
  assert.equal(
    (await write(admin, 'patch', `/bookings/${bookingId}/status`, { status: 'CONFIRMED' })).status,
    200,
  );
});
test('assignment enforces role, driver availability and tanker capacity', async () => {
  const assign = (body) => write(admin, 'post', `/dispatch/${bookingId}`, body);
  assert.equal(
    (await assign({ driverId: driver.user._id, tankerId: String(smallTanker._id) })).status,
    409,
  );
  await User.updateOne({ _id: driver.user._id }, { $set: { active: false } });
  assert.equal(
    (await assign({ driverId: driver.user._id, tankerId: String(tanker._id) })).status,
    409,
  );
  await User.updateOne({ _id: driver.user._id }, { $set: { active: true } });
  await Tanker.updateOne({ _id: tanker._id }, { $set: { status: 'MAINTENANCE' } });
  assert.equal(
    (await assign({ driverId: driver.user._id, tankerId: String(tanker._id) })).status,
    409,
  );
  await Tanker.updateOne({ _id: tanker._id }, { $set: { status: 'AVAILABLE' } });
  assert.equal(
    (await assign({ driverId: driver.user._id, tankerId: String(tanker._id) })).status,
    200,
  );
  assert.equal((await driver2.agent.get(`/api/v2/bookings/${bookingId}`)).status, 404);
});
test('resource schedule conflicts, invalid suspension and cancellation after assignment are blocked', async () => {
  const second = await book();
  const id = second.body.data._id;
  await write(admin, 'patch', `/bookings/${id}/status`, { status: 'CONFIRMED' });
  assert.equal(
    (
      await write(admin, 'post', `/dispatch/${id}`, {
        driverId: driver.user._id,
        tankerId: String(tanker._id),
      })
    ).status,
    409,
  );
  assert.equal(
    (await write(admin, 'patch', `/users/${driver.user._id}`, { active: false })).status,
    409,
  );
  assert.equal(
    (
      await write(customer, 'patch', `/bookings/${bookingId}/status`, {
        status: 'CANCELLED',
        note: 'Change of plan',
      })
    ).status,
    403,
  );
});
test('driver completes lifecycle with recipient proof; cash recording is explicit and idempotent', async () => {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
  await Booking.updateOne(
    { _id: bookingId },
    { $set: { date: today, scheduledAt: scheduleStart(today, SLOTS[0]) } },
  );
  for (const status of ['EN_ROUTE', 'ARRIVED', 'DELIVERING']) {
    const result = await write(driver, 'patch', `/bookings/${bookingId}/status`, { status });
    assert.equal(result.status, 200, JSON.stringify(result.body));
  }
  assert.equal(
    (await write(driver, 'patch', `/bookings/${bookingId}/status`, { status: 'DELIVERED' })).status,
    422,
  );
  const result = await write(driver, 'patch', `/bookings/${bookingId}/status`, {
    status: 'DELIVERED',
    recipient: 'Test Customer',
    note: 'Tank filled',
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.paymentStatus, 'PENDING');
  assert.equal(
    (
      await write(customer, 'post', `/payments/${bookingId}`, {
        state: 'PAID',
        note: 'Pretend payment',
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await write(admin, 'post', `/payments/${bookingId}`, {
        state: 'PAID',
        note: 'Cash counted by admin',
      })
    ).status,
    201,
  );
  assert.equal(
    (
      await write(admin, 'post', `/payments/${bookingId}`, {
        state: 'PAID',
        note: 'Repeated click',
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await write(customer, 'post', `/bookings/${bookingId}/review`, {
        rating: 4,
        comment: 'Good delivery',
      })
    ).status,
    201,
  );
  assert.equal(
    (
      await write(customer, 'post', `/bookings/${bookingId}/review`, {
        rating: 5,
        comment: 'Second rating',
      })
    ).status,
    409,
  );
});
test('booking pricing snapshots survive configuration changes', async () => {
  const previous = await Booking.findById(bookingId);
  await Pricing.updateOne({ key: 'standard' }, { $set: { serviceFee: 999 } });
  assert.equal((await Booking.findById(bookingId)).price.total, previous.price.total);
  await Pricing.updateOne({ key: 'standard' }, { $set: { serviceFee: 350 } });
});
test('slot capacity is enforced and cancellation releases capacity', async () => {
  await Pricing.updateOne({ key: 'standard' }, { $set: { slotLimit: 1 } });
  const date = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  const result = await book({ date, slot: SLOTS[3] });
  assert.equal(result.status, 201);
  assert.equal((await book({ date, slot: SLOTS[3] })).status, 409);
  assert.equal(
    (
      await write(customer, 'patch', `/bookings/${result.body.data._id}/status`, {
        status: 'CANCELLED',
        note: 'Plans changed',
      })
    ).status,
    200,
  );
  assert.equal((await book({ date, slot: SLOTS[3] })).status, 201);
  await Pricing.updateOne({ key: 'standard' }, { $set: { slotLimit: 20 } });
});
test('pagination, exports and scoped analytics use stored records', async () => {
  const list = await customer.agent.get('/api/v2/bookings?limit=2&page=1');
  assert.equal(list.status, 200);
  assert.equal(list.body.data.items.length, 2);
  assert.ok(list.body.data.total > 2);
  const report = await customer.agent.get('/api/v2/reports/overview');
  assert.equal(report.body.data.totals.delivered, 1);
  assert.equal(report.body.data.totals.collected, 3550);
  const empty = await other.agent.get('/api/v2/reports/overview');
  assert.equal(empty.body.data.totals.total, 0);
  const csv = await admin.agent.get('/api/v2/reports/bookings.csv');
  assert.equal(csv.status, 200);
  assert.match(csv.text, /Reference,Date/);
});
test('password recovery is generic, one-time, expiring and revokes sessions', async () => {
  const unknown = await request(app)
    .post('/api/v2/auth/forgot-password')
    .send({ email: 'unknown@example.test' });
  const known = await request(app)
    .post('/api/v2/auth/forgot-password')
    .send({ email: 'other@example.test' });
  assert.deepEqual(known.body, unknown.body);
  const token = emails.at(-1).text.match(/#([a-f\d]{64})/)[1];
  assert.equal(
    (
      await request(app)
        .post('/api/v2/auth/reset-password')
        .send({ token, password: 'New-test-password-2026' })
    ).status,
    200,
  );
  assert.equal((await other.agent.get('/api/v2/auth/me')).status, 401);
  assert.equal(
    (await request(app).post('/api/v2/auth/reset-password').send({ token, password: testPassword }))
      .status,
    400,
  );
});
test('logout revokes the server-side session', async () => {
  const actor = await login('customer@example.test');
  assert.equal((await write(actor, 'post', '/auth/logout')).status, 200);
  assert.equal((await actor.agent.get('/api/v2/auth/me')).status, 401);
});
test('database failure returns a safe 503 with correlation ID', async () => {
  await mongoose.disconnect();
  const response = await request(app).get('/api/v2/catalog');
  assert.equal(response.status, 503);
  assert.ok(response.body.error.requestId);
  assert.equal(response.body.error.stack, undefined);
});
