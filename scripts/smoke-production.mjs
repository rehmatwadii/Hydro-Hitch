import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { createApp } from '../server/src/app.js';
import { initializeModels, Pricing } from '../server/src/models/index.js';
import { defaultPricing } from '../server/src/services/pricing.js';
const replica = await MongoMemoryReplSet.create({
  binary: { version: '8.2.6' },
  replSet: { count: 1, storageEngine: 'wiredTiger' },
});
try {
  await mongoose.connect(replica.getUri('production_smoke'));
  await initializeModels();
  await Pricing.create(defaultPricing);
  const app = createApp({
    NODE_ENV: 'production',
    CLIENT_URL: 'https://hydro.example.test',
    LOG_LEVEL: 'silent',
    TRUST_PROXY: 0,
  });
  const index = await request(app).get('/');
  assert.equal(index.status, 200);
  assert.match(index.text, /assets\/index/);
  assert.match(index.text, /Hydro-Hitch/);
  assert.equal((await request(app).get('/app/bookings')).status, 200);
  const asset = index.text.match(/src="([^"]+\.js)"/)[1];
  assert.equal((await request(app).get(asset)).status, 200);
  assert.equal((await request(app).get('/api/v2/does-not-exist')).status, 404);
  const registered = await request(app)
    .post('/api/v2/auth/register')
    .set('Origin', 'https://hydro.example.test')
    .send({
      name: 'Production smoke',
      email: 'smoke@example.test',
      phone: '+923001234567',
      password: 'Smoke-test-only-password',
    });
  assert.equal(registered.status, 201);
  assert.match(registered.headers['set-cookie'][0], /; Secure/);
  assert.match(registered.headers['set-cookie'][0], /HttpOnly/);
  assert.match(index.headers['content-security-policy'], /script-src 'self'/);
  const report = {
    date: new Date().toISOString(),
    status: 'passed',
    checks: [
      'Production Express serves built HTML and JavaScript',
      'Deep links serve React entrypoint',
      'Unknown API endpoint stays 404',
      'Production registration sets Secure HttpOnly cookies',
      'Production CSP restricts scripts to self',
    ],
    limitations:
      'Local HTTP test harness; actual TLS termination, Docker runtime and external SMTP are not exercised.',
  };
  await mkdir('docs/verification', { recursive: true });
  await writeFile(
    'docs/verification/production-smoke.json',
    JSON.stringify(report, null, 2) + '\n',
  );
  process.stdout.write('Production configuration smoke checks passed.\n');
} finally {
  await mongoose.disconnect();
  await replica.stop();
}
