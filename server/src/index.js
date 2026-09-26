import mongoose from 'mongoose';
import pino from 'pino';
import { readConfig } from './config/env.js';
import { createApp } from './app.js';
import { initializeModels } from './models/index.js';
const config = readConfig();
const log = pino({ level: config.LOG_LEVEL });
mongoose.set('bufferCommands', false);
try {
  await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!hello.setName && hello.msg !== 'isdbgrid')
    throw new Error('MongoDB must be a replica set for booking transactions.');
  await initializeModels();
  const server = createApp(config).listen(config.PORT, '0.0.0.0', () =>
    log.info({ port: config.PORT }, 'Hydro-Hitch v2 ready'),
  );
  const shutdown = () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} catch (error) {
  log.fatal(
    { errorType: error.name },
    'Startup failed. Check MongoDB connectivity and replica-set configuration.',
  );
  process.exitCode = 1;
}
