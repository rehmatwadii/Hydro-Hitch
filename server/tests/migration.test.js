import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { migrateLegacy } from '../src/scripts/migrate.js';
import { User, Booking, Ticket, initializeModels } from '../src/models/index.js';
let replica;
before(async () => {
  replica = await MongoMemoryReplSet.create({
    binary: { version: '8.2.6' },
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  await mongoose.connect(replica.getUri('migration_test'));
  await initializeModels();
});
after(async () => {
  await mongoose.disconnect();
  await replica.stop();
});
test('migration dry-run is read-only; apply is repeatable and retains original records', async () => {
  const db = mongoose.connection.db;
  const id = new mongoose.Types.ObjectId();
  const product = new mongoose.Types.ObjectId();
  await db.collection('users').insertOne({
    _id: id,
    name: 'Legacy Customer',
    email: 'legacy@example.test',
    phone: 3001234567,
    password: 'legacy-secret-value',
  });
  await db.collection('products').insertOne({ _id: product, name: 'Legacy water', gallon: 500 });
  await db.collection('customerorders').insertMany([
    {
      userid: id,
      productId: product,
      status: 'completed',
      Price: 1234,
      CustomerAddress: 'Historic house',
    },
    { userid: id, productId: product, status: 'pending', Price: 1234 },
  ]);
  await db
    .collection('questions')
    .insertOne({ userId: id, question: 'Legacy question', answer: 'Legacy answer' });
  const dry = await migrateLegacy();
  assert.equal(dry.users, 1);
  assert.equal(dry.bookings, 1);
  assert.equal(await User.countDocuments(), 0);
  const applied = await migrateLegacy({ apply: true });
  assert.equal(applied.users, 1);
  assert.equal(applied.skipped.length, 1);
  assert.equal(await Booking.countDocuments(), 1);
  assert.equal(await Ticket.countDocuments(), 1);
  const user = await User.findOne().select('+passwordHash');
  assert.equal(user.role, 'CUSTOMER');
  assert.notEqual(user.passwordHash, 'legacy-secret-value');
  const imported = await Booking.findOne();
  assert.equal(imported.price.total, 1234);
  assert.equal(imported.scheduledAt, undefined);
  assert.equal(imported.paymentStatus, 'PENDING');
  const repeat = await migrateLegacy({ apply: true });
  assert.equal(repeat.users, 0);
  assert.equal(repeat.bookings, 0);
  assert.equal(repeat.tickets, 0);
  assert.equal(await db.collection('customerorders').countDocuments(), 2);
  assert.equal((await db.collection('users').findOne()).password, 'legacy-secret-value');
});
