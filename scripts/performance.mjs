import { performance } from 'node:perf_hooks';
import { writeFile, mkdir } from 'node:fs/promises';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { seedDatabase } from '../server/src/scripts/seed.js';
import { createApp } from '../server/src/app.js';
import { Booking } from '../server/src/models/index.js';
process.env.NODE_ENV = 'test';
const replica = await MongoMemoryReplSet.create({
  binary: { version: '8.2.6' },
  replSet: { count: 1, storageEngine: 'wiredTiger' },
});
try {
  await mongoose.connect(replica.getUri('performance_test'));
  await seedDatabase('Performance-test-password');
  const agent = request.agent(
    createApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      CLIENT_URL: 'http://localhost:5173',
      TRUST_PROXY: 0,
    }),
  );
  const login = await agent
    .post('/api/v2/auth/login')
    .send({ email: 'customer@hydrohitch.test', password: 'Performance-test-password' });
  const user = login.body.data.user;
  const results = {
    date: new Date().toISOString(),
    environment: {
      node: process.version,
      database: 'MongoDB 8.2.6 local single-node replica set',
      fixtures: '4 seeded historical orders, warm process; no production SLA inferred',
    },
    endpoints: {},
  };
  for (const path of ['/api/v2/catalog', '/api/v2/bookings?limit=12', '/api/v2/reports/overview']) {
    await agent.get(path);
    const times = [];
    let bytes = 0;
    for (let i = 0; i < 30; i++) {
      const start = performance.now();
      const response = await agent.get(path);
      if (response.status !== 200) throw new Error(`Unexpected ${response.status}`);
      times.push(performance.now() - start);
      bytes = Buffer.byteLength(response.text);
    }
    times.sort((a, b) => a - b);
    results.endpoints[path] = {
      p50Ms: Number(times[15].toFixed(2)),
      p95Ms: Number(times[28].toFixed(2)),
      responseBytes: bytes,
    };
  }
  const plan = await Booking.find({ customer: new mongoose.Types.ObjectId(user._id) })
    .sort({ createdAt: -1 })
    .limit(12)
    .explain('executionStats');
  results.customerBookingQuery = {
    documentsExamined: plan.executionStats.totalDocsExamined,
    keysExamined: plan.executionStats.totalKeysExamined,
    returned: plan.executionStats.nReturned,
  };
  await mkdir('docs/verification', { recursive: true });
  await writeFile('docs/verification/performance.json', JSON.stringify(results, null, 2) + '\n');
  process.stdout.write(JSON.stringify(results, null, 2) + '\n');
} finally {
  await mongoose.disconnect();
  await replica.stop();
}
