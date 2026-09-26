import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readConfig } from '../config/env.js';
import { registration } from '../validators/index.js';
import { User, AuditLog, Counter, initializeModels, Pricing } from '../models/index.js';
import { defaultPricing } from '../services/pricing.js';
const config = readConfig();
const input = registration.parse({
  name: process.env.ADMIN_NAME,
  email: process.env.ADMIN_EMAIL,
  phone: process.env.ADMIN_PHONE,
  password: process.env.ADMIN_PASSWORD,
});
await mongoose.connect(config.MONGODB_URI);
await initializeModels();
try {
  // A unique email and one bootstrap lock in a transaction make retries safe.
  await mongoose.connection.transaction(async (session) => {
    await Counter.create([{ key: 'admin-bootstrap', value: 1 }], { session });
    if (await User.exists({ role: 'SUPER_ADMIN' }).session(session))
      throw new Error('A super administrator already exists. Use account management.');
    const { password, ...fields } = input;
    const [user] = await User.create(
      [{ ...fields, role: 'SUPER_ADMIN', passwordHash: await bcrypt.hash(password, 12) }],
      { session },
    );
    await Pricing.updateOne(
      { key: 'standard' },
      { $setOnInsert: defaultPricing },
      { upsert: true, session },
    );
    await AuditLog.create(
      [
        {
          actor: user._id,
          action: 'admin.bootstrap',
          target: String(user._id),
          metadata: { source: 'operator CLI' },
        },
      ],
      { session },
    );
  });
  process.stdout.write(
    'Administrator created. Review service areas and pricing before opening bookings.\n',
  );
} finally {
  await mongoose.disconnect();
}
