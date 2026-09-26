import mongoose from 'mongoose';
import { ROLES, TRANSITIONS } from '../constants/booking.js';
const { Schema } = mongoose;
const ref = (model, required = false) => ({ type: Schema.Types.ObjectId, ref: model, required });
function model(name, fields, indexes = []) {
  const schema = new Schema(fields, {
    timestamps: true,
    optimisticConcurrency: true,
    strict: 'throw',
  });
  // Embedded documents are versioned by their parent. A separate version key
  // breaks strict subdocument rollback when Mongoose retries a transaction.
  for (const child of schema.childSchemas) child.schema.set('versionKey', false);
  for (const [keys, options] of indexes) schema.index(keys, options);
  return mongoose.model(name, schema, `v2_${name.toLowerCase()}`);
}
export const addressFields = {
  label: { type: String, required: true, maxlength: 40 },
  street: { type: String, required: true, maxlength: 240 },
  area: { type: String, required: true, maxlength: 80 },
  city: { type: String, required: true, maxlength: 80 },
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },
  instructions: { type: String, maxlength: 500 },
};
export const User = model(
  'User',
  {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'CUSTOMER' },
    active: { type: Boolean, default: true },
    availability: { type: Boolean, default: true },
    lockVersion: { type: Number, default: 0 },
    legacyId: String,
  },
  [
    [{ email: 1 }, { unique: true }],
    [{ role: 1, active: 1 }, {}],
  ],
);
export const Session = model(
  'Session',
  {
    user: ref('User', true),
    tokenHash: { type: String, required: true },
    csrf: String,
    expiresAt: Date,
  },
  [
    [{ tokenHash: 1 }, { unique: true }],
    [{ expiresAt: 1 }, { expireAfterSeconds: 0 }],
    [{ user: 1 }, {}],
  ],
);
export const ResetToken = model(
  'ResetToken',
  { user: ref('User', true), tokenHash: String, expiresAt: Date },
  [
    [{ tokenHash: 1 }, { unique: true }],
    [{ expiresAt: 1 }, { expireAfterSeconds: 0 }],
  ],
);
export const Address = model('Address', { customer: ref('User', true), ...addressFields }, [
  [{ customer: 1 }, {}],
]);
export const Tanker = model(
  'Tanker',
  {
    registration: { type: String, required: true, uppercase: true },
    capacity: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['AVAILABLE', 'MAINTENANCE', 'INACTIVE'], default: 'AVAILABLE' },
    lockVersion: { type: Number, default: 0 },
  },
  [
    [{ registration: 1 }, { unique: true }],
    [{ status: 1, capacity: 1 }, {}],
  ],
);
export const Pricing = model(
  'Pricing',
  {
    key: { type: String, default: 'standard' },
    base: Number,
    serviceFee: Number,
    urgentFee: Number,
    taxPercent: Number,
    capacities: [{ _id: false, litres: Number, price: Number }],
    waterTypes: [{ _id: false, name: String, surcharge: Number }],
    areas: [String],
    promos: [{ _id: false, code: String, percent: Number }],
    qualityReport: { type: String, maxlength: 5000 },
    slotLimit: { type: Number, default: 20 },
    revision: { type: Number, default: 1 },
  },
  [[{ key: 1 }, { unique: true }]],
);
export const Booking = model(
  'Booking',
  {
    reference: { type: String, required: true },
    customer: ref('User', true),
    address: new Schema(addressFields, { _id: false }),
    capacity: Number,
    waterType: String,
    date: String,
    slot: String,
    scheduledAt: Date,
    instructions: { type: String, maxlength: 500 },
    urgent: Boolean,
    price: {
      base: Number,
      capacity: Number,
      water: Number,
      serviceFee: Number,
      urgentFee: Number,
      discount: Number,
      tax: Number,
      total: Number,
      currency: String,
      revision: Number,
    },
    status: { type: String, enum: Object.keys(TRANSITIONS), default: 'PENDING' },
    driver: ref('User'),
    tanker: ref('Tanker'),
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'REFUNDED'], default: 'PENDING' },
    paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
    idempotencyKey: String,
    requestHash: String,
    history: [{ _id: false, status: String, at: Date, actor: ref('User'), note: String }],
    completion: { recipient: String, note: String, at: Date },
    legacyId: String,
  },
  [
    [{ reference: 1 }, { unique: true }],
    [{ createdAt: -1, _id: -1 }, {}],
    [
      { customer: 1, idempotencyKey: 1 },
      { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } },
    ],
    [{ customer: 1, createdAt: -1 }, {}],
    [{ status: 1, scheduledAt: 1 }, {}],
    [{ driver: 1, scheduledAt: 1 }, {}],
    [{ legacyId: 1 }, { unique: true, sparse: true }],
  ],
);
export const Reservation = model(
  'Reservation',
  { booking: ref('Booking', true), resource: String, date: String, slot: String },
  [
    [{ resource: 1, date: 1, slot: 1 }, { unique: true }],
    [{ booking: 1 }, {}],
  ],
);
export const SlotUsage = model('SlotUsage', { key: String, count: { type: Number, default: 0 } }, [
  [{ key: 1 }, { unique: true }],
]);
export const Counter = model('Counter', { key: String, value: Number }, [
  [{ key: 1 }, { unique: true }],
]);
export const Notification = model(
  'Notification',
  {
    user: ref('User', true),
    title: String,
    body: String,
    booking: ref('Booking'),
    read: { type: Boolean, default: false },
  },
  [
    [{ user: 1, createdAt: -1 }, {}],
    [{ createdAt: 1 }, { expireAfterSeconds: 7776000 }],
  ],
);
export const AuditLog = model(
  'AuditLog',
  {
    actor: ref('User'),
    action: String,
    target: String,
    requestId: String,
    metadata: Schema.Types.Mixed,
  },
  [[{ createdAt: -1 }, {}]],
);
export const Ticket = model(
  'Ticket',
  {
    customer: ref('User', true),
    booking: ref('Booking'),
    kind: { type: String, enum: ['COMPLAINT', 'QUESTION'] },
    subject: String,
    message: String,
    status: { type: String, enum: ['OPEN', 'RESOLVED'], default: 'OPEN' },
    response: String,
  },
  [
    [{ customer: 1, createdAt: -1 }, {}],
    [{ status: 1, createdAt: -1 }, {}],
  ],
);
export const Review = model(
  'Review',
  {
    customer: ref('User', true),
    booking: ref('Booking', true),
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
  },
  [
    [{ booking: 1 }, { unique: true }],
    [{ createdAt: -1 }, {}],
  ],
);
export const Payment = model(
  'Payment',
  {
    booking: ref('Booking', true),
    amount: Number,
    method: String,
    state: { type: String, enum: ['PAID', 'REFUNDED'] },
    actor: ref('User'),
    note: String,
  },
  [[{ booking: 1, state: 1 }, { unique: true }]],
);
export async function initializeModels() {
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
}
