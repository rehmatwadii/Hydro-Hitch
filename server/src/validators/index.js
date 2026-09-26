import { z } from 'zod';
import { ROLES, SLOTS, TRANSITIONS } from '../constants/booking.js';
export const id = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource ID');
export const text = (min = 1, max = 100) => z.string().trim().min(min).max(max);
export const password = z
  .string()
  .min(12)
  .refine((v) => Buffer.byteLength(v, 'utf8') <= 72, 'Password must be at most 72 UTF-8 bytes');
export const phone = z
  .string()
  .trim()
  .regex(/^\+?[\d ()-]{7,24}$/, 'Enter a valid phone number');
export const registration = z.strictObject({
  name: text(),
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  phone,
  password,
});
export const login = registration
  .pick({ email: true })
  .extend({ password: z.string().min(1).max(200) });
export const address = z
  .strictObject({
    label: text(1, 40),
    street: text(3, 240),
    area: text(1, 80),
    city: text(1, 80),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    instructions: text(0, 500).default(''),
  })
  .refine(
    (v) => (v.latitude === undefined) === (v.longitude === undefined),
    'Provide both coordinates',
  );
export const quote = z.strictObject({
  capacity: z.number().int().positive(),
  waterType: text(),
  area: text(1, 80),
  urgent: z.boolean().default(false),
  promo: text(0, 30).default(''),
});
export const booking = z.strictObject({
  quoteRevision: z.number().int().positive(),
  addressId: id,
  capacity: z.number().int().positive(),
  waterType: text(),
  date: z.iso.date(),
  slot: z.enum(SLOTS),
  instructions: text(0, 500).default(''),
  urgent: z.boolean().default(false),
  promo: text(0, 30).default(''),
  paymentMethod: z.literal('COD').default('COD'),
});
export const transition = z.strictObject({
  status: z.enum(Object.keys(TRANSITIONS)),
  note: text(0, 500).default(''),
  recipient: text(0, 100).default(''),
});
export const assignment = z.strictObject({ driverId: id, tankerId: id });
export const tanker = z.strictObject({
  registration: text(3, 30).transform((v) => v.toUpperCase()),
  capacity: z.number().int().min(500).max(50000),
  status: z.enum(['AVAILABLE', 'MAINTENANCE', 'INACTIVE']).default('AVAILABLE'),
});
export const userUpdate = z.strictObject({
  name: text().optional(),
  phone: phone.optional(),
  role: z.enum(ROLES).optional(),
  active: z.boolean().optional(),
  availability: z.boolean().optional(),
});
const money = z.number().int().min(0).max(10000000);
export const pricing = z
  .strictObject({
    base: money,
    serviceFee: money,
    urgentFee: money,
    taxPercent: z.number().min(0).max(100),
    capacities: z
      .array(z.strictObject({ litres: z.number().int().min(500).max(50000), price: money }))
      .min(1)
      .max(12),
    waterTypes: z
      .array(z.strictObject({ name: text(1, 40), surcharge: money }))
      .min(1)
      .max(8),
    areas: z.array(text(1, 80)).min(1).max(100),
    promos: z
      .array(
        z.strictObject({
          code: text(1, 30).transform((v) => v.toUpperCase()),
          percent: z.number().min(0).max(100),
        }),
      )
      .max(20),
    qualityReport: text(0, 5000),
    slotLimit: z.number().int().min(1).max(1000),
  })
  .refine(
    (v) => new Set(v.capacities.map((c) => c.litres)).size === v.capacities.length,
    'Capacity options must be unique',
  );
export const listQuery = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  search: text(0, 80).default(''),
  status: text(0, 30).optional(),
  role: z.enum(ROLES).optional(),
  driver: id.optional(),
  customer: id.optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  sort: z.enum(['newest', 'oldest', 'scheduled']).default('newest'),
});
export const ticket = z.strictObject({
  booking: id.optional(),
  kind: z.enum(['COMPLAINT', 'QUESTION']),
  subject: text(3, 100),
  message: text(5, 2000),
});
export const review = z.strictObject({
  rating: z.number().int().min(1).max(5),
  comment: text(0, 1000),
});
export function validate(schema) {
  return (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
}
