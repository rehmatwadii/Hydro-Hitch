import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { readConfig } from '../config/env.js';
import { User, Booking, Ticket, initializeModels } from '../models/index.js';

// Dry-run by default. Source collections are read-only and never renamed or dropped.
export async function migrateLegacy({ apply = false } = {}) {
  const db = mongoose.connection.db;
  const report = {
    mode: apply ? 'apply' : 'dry-run',
    users: 0,
    bookings: 0,
    tickets: 0,
    skipped: [],
    retainedCollections: {},
  };
  for (const name of [
    'users',
    'venders',
    'products',
    'customerorders',
    'questions',
    'userreportvendors',
    'admins',
  ])
    report.retainedCollections[name] = await db.collection(name).countDocuments();
  const mapping = new Map();
  for await (const legacy of db.collection('users').find({})) {
    const legacyId = String(legacy._id);
    const email = String(legacy.email || '')
      .trim()
      .toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !legacy.name) {
      report.skipped.push({
        collection: 'users',
        id: legacyId,
        reason: 'Missing name or invalid email',
      });
      continue;
    }
    const exists = await User.findOne({ $or: [{ legacyId }, { email }] });
    if (exists) {
      if (exists.legacyId !== legacyId) {
        report.skipped.push({
          collection: 'users',
          id: legacyId,
          reason: 'Email conflict; review manually',
        });
        continue;
      }
      mapping.set(legacyId, exists._id);
      continue;
    }
    report.users++;
    if (!apply) {
      mapping.set(legacyId, legacy._id);
      continue;
    }
    // Previously exposed password hashes are not reused. Recovery is mandatory.
    const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);
    const user = await User.create({
      name: String(legacy.name).slice(0, 100),
      email,
      phone: String(legacy.phone || 'Not provided'),
      passwordHash,
      role: 'CUSTOMER',
      legacyId,
    });
    mapping.set(legacyId, user._id);
  }
  for await (const old of db.collection('customerorders').find({})) {
    const legacyId = String(old._id);
    if (await Booking.exists({ legacyId })) continue;
    const customer = mapping.get(String(old.userid));
    if (!customer || old.status !== 'completed' || !Number.isFinite(old.Price) || old.Price < 0) {
      report.skipped.push({
        collection: 'customerorders',
        id: legacyId,
        reason:
          'Only completed orders with mapped customer and valid price import automatically; open orders require schedule reconciliation',
      });
      continue;
    }
    const product = await db.collection('products').findOne({ _id: old.productId });
    if (!product || !Number.isFinite(Number(product.gallon)) || Number(product.gallon) <= 0) {
      report.skipped.push({
        collection: 'customerorders',
        id: legacyId,
        reason: 'Missing product quantity; reconcile manually',
      });
      continue;
    }
    report.bookings++;
    if (apply)
      await Booking.create({
        reference: `HH-LEGACY-${legacyId}`,
        legacyId,
        customer,
        address: {
          label: 'Legacy delivery',
          street: String(old.CustomerAddress || 'Address not recorded').slice(0, 240),
          area: 'Legacy — verify area',
          city: 'Not recorded',
        },
        capacity: Math.round(Number(product?.gallon || 0) * 3.78541),
        waterType: product?.name || 'Legacy water order',
        instructions:
          'Imported historical record. Original schedule and exact gallon standard were not recorded; displayed litres assume US gallons. Original data is retained.',
        price: {
          base: old.Price,
          capacity: 0,
          water: 0,
          serviceFee: 0,
          urgentFee: 0,
          discount: 0,
          tax: 0,
          total: old.Price,
          currency: 'PKR',
          revision: 0,
        },
        status: 'DELIVERED',
        paymentStatus: 'PENDING',
        history: [
          {
            status: 'DELIVERED',
            at: new Date(),
            note: 'Imported completed order; this is the import timestamp, not the delivery time.',
          },
        ],
      });
  }
  for (const [collection, kind] of [
    ['questions', 'QUESTION'],
    ['userreportvendors', 'COMPLAINT'],
  ]) {
    for await (const old of db.collection(collection).find({})) {
      const customer = mapping.get(String(old.userId || old.userid));
      if (!customer) continue;
      const marker = `Legacy ${collection}/${old._id}`;
      if (await Ticket.exists({ customer, subject: marker })) continue;
      report.tickets++;
      if (apply)
        await Ticket.create({
          customer,
          kind,
          subject: marker,
          message: String(
            old.question || old.description || old.title || 'No details in legacy record',
          ).slice(0, 2000),
          response: String(old.answer || '').slice(0, 2000),
          status: old.answer ? 'RESOLVED' : 'OPEN',
        });
    }
  }
  return report;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const config = readConfig();
  await mongoose.connect(config.MONGODB_URI, {
    autoCreate: process.argv.includes('--apply'),
    autoIndex: process.argv.includes('--apply'),
  });
  try {
    if (process.argv.includes('--apply')) await initializeModels();
    const report = await migrateLegacy({ apply: process.argv.includes('--apply') });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await mongoose.disconnect();
  }
}
