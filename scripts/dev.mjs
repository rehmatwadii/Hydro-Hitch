import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });
const local = process.argv.includes('--local-db');
let replica;
let uri = process.env.MONGODB_URI;
if (local) {
  const { MongoMemoryReplSet } = await import('mongodb-memory-server');
  await mkdir('.runtime/mongo-v2', { recursive: true });
  replica = await MongoMemoryReplSet.create({
    binary: { version: '8.2.6' },
    instanceOpts: [{ dbPath: '.runtime/mongo-v2', port: 27019 }],
    replSet: { name: 'rs0', count: 1, storageEngine: 'wiredTiger' },
    autoStart: true,
  });
  uri = replica.getUri('hydro_hitch_v2');
  await writeFile('.runtime/mongo-uri', uri);
  if (process.argv.includes('--seed')) {
    const mongoose = (await import('mongoose')).default;
    const { seedDatabase } = await import('../server/src/scripts/seed.js');
    await mongoose.connect(uri);
    await seedDatabase(process.env.SEED_PASSWORD);
    await mongoose.disconnect();
  }
}
const env = { ...process.env, MONGODB_URI: uri, NODE_ENV: 'development' };
const children = [
  spawn(process.execPath, ['--watch', 'server/src/index.js'], { stdio: 'inherit', env }),
  spawn(process.execPath, ['../node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], {
    cwd: 'client',
    stdio: 'inherit',
    env,
  }),
];
// Vite is hoisted to the workspace root.
children[1].on('error', (error) => process.stderr.write(`${error.message}\n`));
let closing = false;
async function shutdown() {
  if (closing) return;
  closing = true;
  for (const child of children) child.kill();
  await replica?.stop({ doCleanup: false, force: false });
  process.exit(0);
}
for (const child of children)
  child.on('exit', (code) => {
    if (!closing && code) shutdown();
  });
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
