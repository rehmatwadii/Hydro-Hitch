import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import { readConfig } from '../config/env.js';
import {
  Address,
  Booking,
  Notification,
  Pricing,
  Tanker,
  User,
  initializeModels,
} from '../models/index.js';
import { defaultPricing, calculatePrice } from '../services/pricing.js';
import { scheduleStart } from '../constants/booking.js';
import { password as passwordSchema } from '../validators/index.js';

export async function seedDatabase(password) {
  if (process.env.NODE_ENV === 'production')
    throw new Error('Demo seeding is forbidden in production.');
  passwordSchema.parse(password);
  await initializeModels();
  if (await User.exists({ email: 'customer@hydrohitch.test' })) return { seeded: false };
  const passwordHash = await bcrypt.hash(password, 12);
  await mongoose.connection.transaction(async (session) => {
    const users = await User.create(
      [
        {
          name: 'Ayesha Khan',
          email: 'customer@hydrohitch.test',
          phone: '+923001234567',
          role: 'CUSTOMER',
          passwordHash,
        },
        {
          name: 'Operations Admin',
          email: 'admin@hydrohitch.test',
          phone: '+923001234568',
          role: 'SUPER_ADMIN',
          passwordHash,
        },
        {
          name: 'Bilal Ahmed',
          email: 'driver@hydrohitch.test',
          phone: '+923001234569',
          role: 'DRIVER',
          passwordHash,
        },
        {
          name: 'Sana Ali',
          email: 'dispatch@hydrohitch.test',
          phone: '+923001234570',
          role: 'DISPATCHER',
          passwordHash,
        },
        {
          name: 'Usman Raza',
          email: 'driver2@hydrohitch.test',
          phone: '+923001234571',
          role: 'DRIVER',
          passwordHash,
        },
      ],
      { session, ordered: true },
    );
    await Pricing.updateOne(
      { key: 'standard' },
      { $setOnInsert: defaultPricing },
      { upsert: true, session },
    );
    await Tanker.create(
      [
        { registration: 'HH-1024', capacity: 2000 },
        { registration: 'HH-2048', capacity: 5000 },
        { registration: 'HH-3056', capacity: 1000, status: 'MAINTENANCE' },
      ],
      { session, ordered: true },
    );
    const [address] = await Address.create(
      [
        {
          customer: users[0]._id,
          label: 'Home',
          street: 'House 24, Block 7',
          area: 'Gulshan-e-Iqbal',
          city: 'Karachi',
          latitude: 24.926,
          longitude: 67.092,
          instructions: 'Call at the main gate.',
        },
        {
          customer: users[0]._id,
          label: 'Office',
          street: 'Suite 302, Main Khayaban-e-Ittehad',
          area: 'DHA',
          city: 'Karachi',
          instructions: 'Reception is on the ground floor.',
        },
      ],
      { session, ordered: true },
    );
    const snapshot = {
      label: address.label,
      street: address.street,
      area: address.area,
      city: address.city,
      latitude: address.latitude,
      longitude: address.longitude,
      instructions: address.instructions,
    };
    for (let i = 0; i < 4; i++) {
      const when = new Date(Date.now() - (i + 1) * 7 * 86400000);
      const date = when.toISOString().slice(0, 10);
      const status = i === 3 ? 'CANCELLED' : 'DELIVERED';
      await Booking.create(
        [
          {
            reference: `HH-DEMO-${String(i + 1).padStart(4, '0')}`,
            customer: users[0]._id,
            address: snapshot,
            capacity: 2000,
            waterType: 'Utility water',
            date,
            slot: '11:00-14:00',
            scheduledAt: scheduleStart(date, '11:00-14:00'),
            price: calculatePrice(
              { capacity: 2000, waterType: 'Utility water', area: address.area },
              defaultPricing,
            ),
            status,
            paymentStatus: 'PENDING',
            history: [
              {
                status: 'PENDING',
                at: when,
                actor: users[0]._id,
                note: 'Development sample booking',
              },
              {
                status,
                at: new Date(when.getTime() + 3600000),
                actor: users[1]._id,
                note: 'Explicit seed fixture',
              },
            ],
            createdAt: when,
            completion:
              status === 'DELIVERED'
                ? { recipient: 'Ayesha Khan', at: when, note: 'Development sample' }
                : undefined,
          },
        ],
        { session },
      );
    }
    await Notification.create(
      [
        {
          user: users[0]._id,
          title: 'Welcome to your delivery dashboard',
          body: 'This development workspace contains explicitly seeded sample orders. Create a new booking to try the full workflow.',
        },
      ],
      { session },
    );
  });
  return { seeded: true };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const config = readConfig();
  if (config.NODE_ENV === 'production') throw new Error('Demo seeding is forbidden in production.');
  await mongoose.connect(config.MONGODB_URI);
  try {
    const result = await seedDatabase(process.env.SEED_PASSWORD);
    process.stdout.write(
      `${result.seeded ? 'Development seed created' : 'Seed already exists; no changes made'}.\n`,
    );
  } finally {
    await mongoose.disconnect();
  }
}
