import { spawn } from 'node:child_process';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
process.env.NODE_ENV = 'test';
const replica = await MongoMemoryReplSet.create({
  binary: { version: '8.2.6' },
  replSet: { count: 1, storageEngine: 'wiredTiger' },
});
const uri = replica.getUri('hydro_e2e');
const { seedDatabase } = await import('../server/src/scripts/seed.js');
await mongoose.connect(uri);
await seedDatabase('E2e-only-password-2026');
await mongoose.disconnect();
const env = {
  ...process.env,
  NODE_ENV: 'test',
  PORT: '8002',
  API_PORT: '8002',
  CLIENT_URL: 'http://localhost:5174',
  MONGODB_URI: uri,
  LOG_LEVEL: 'error',
};
const children = [
  spawn(process.execPath, ['server/src/index.js'], { env, stdio: 'inherit' }),
  spawn(
    process.execPath,
    ['../node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5174'],
    { env, stdio: 'inherit', cwd: 'client' },
  ),
];
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  for (const child of children) child.kill();
  await replica.stop();
  process.exit(0);
}
process.on('SIGINT', close);
process.on('SIGTERM', close);
for (const child of children)
  child.on('exit', (code) => {
    if (code && !closing) close();
  });
