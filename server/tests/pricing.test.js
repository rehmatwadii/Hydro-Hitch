import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePrice, defaultPricing } from '../src/services/pricing.js';
import { readConfig } from '../src/config/env.js';
import { password, booking } from '../src/validators/index.js';
const input = { capacity: 2000, waterType: 'Utility water', area: 'DHA', urgent: false };
test('pricing adds fees and rounds tax and discounts in whole PKR', () => {
  assert.equal(calculatePrice(input, defaultPricing).total, 3550);
  const price = calculatePrice(
    { ...input, urgent: true, promo: 'SAVE' },
    { ...defaultPricing, taxPercent: 5, promos: [{ code: 'SAVE', percent: 10 }] },
  );
  assert.equal(price.discount, 405);
  assert.equal(price.tax, 182);
  assert.equal(price.total, 3827);
});
test('pricing rejects unsupported capacities, areas, water and promo codes', () => {
  for (const invalid of [
    { capacity: 123 },
    { area: 'Outside' },
    { waterType: 'Unknown' },
    { promo: 'FREE' },
  ])
    assert.throws(() => calculatePrice({ ...input, ...invalid }, defaultPricing));
});
test('configuration fails clearly for missing database and insecure production URL', () => {
  assert.throws(() => readConfig({}), /MONGODB_URI/);
  assert.throws(
    () =>
      readConfig({
        MONGODB_URI: 'mongodb://localhost/db',
        NODE_ENV: 'production',
        CLIENT_URL: 'http://example.com',
      }),
    /HTTPS/,
  );
});
test('password validation enforces bcrypt UTF-8 byte limit', () => {
  assert.equal(password.safeParse('a'.repeat(12)).success, true);
  assert.equal(password.safeParse('😀'.repeat(20)).success, false);
  assert.equal(password.safeParse('short').success, false);
});
test('booking contract rejects invalid dates and unsupported payment gateways', () => {
  const body = {
    addressId: 'a'.repeat(24),
    capacity: 2000,
    waterType: 'Utility water',
    date: '2026-02-30',
    slot: '08:00-11:00',
  };
  assert.equal(booking.safeParse(body).success, false);
  assert.equal(
    booking.safeParse({ ...body, date: '2026-10-01', paymentMethod: 'DIGITAL' }).success,
    false,
  );
});
