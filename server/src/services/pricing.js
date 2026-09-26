import { Pricing } from '../models/index.js';
import { assert } from '../utils/errors.js';
export const defaultPricing = {
  key: 'standard',
  base: 0,
  serviceFee: 350,
  urgentFee: 500,
  taxPercent: 0,
  capacities: [
    { litres: 1000, price: 1800 },
    { litres: 2000, price: 3200 },
    { litres: 5000, price: 7000 },
  ],
  waterTypes: [
    { name: 'Utility water', surcharge: 0 },
    { name: 'Filtered water', surcharge: 500 },
  ],
  areas: ['Gulshan-e-Iqbal', 'DHA', 'Clifton', 'North Nazimabad', 'PECHS'],
  promos: [],
  qualityReport:
    'Contact support for current source and laboratory documentation. Water is not represented as certified drinking water without a current laboratory report.',
  slotLimit: 20,
  revision: 1,
};
export async function getPricing(session) {
  const rules = await Pricing.findOne({ key: 'standard' })
    .session(session || null)
    .lean();
  assert(rules, 503, 'Service configuration is not ready. Please contact support.');
  return rules;
}
export function calculatePrice(input, rules) {
  assert(rules.areas.includes(input.area), 422, 'This delivery area is not currently served.');
  const capacity = rules.capacities.find((c) => c.litres === input.capacity);
  const water = rules.waterTypes.find((w) => w.name === input.waterType);
  assert(capacity && water, 422, 'Choose an available capacity and water type.');
  const promo = input.promo ? rules.promos.find((p) => p.code === input.promo.toUpperCase()) : null;
  assert(!input.promo || promo, 422, 'This promo code is not valid.');
  const subtotal =
    rules.base +
    capacity.price +
    water.surcharge +
    rules.serviceFee +
    (input.urgent ? rules.urgentFee : 0);
  const discount = Math.round((subtotal * (promo?.percent || 0)) / 100);
  const tax = Math.round(((subtotal - discount) * rules.taxPercent) / 100);
  return {
    base: rules.base,
    capacity: capacity.price,
    water: water.surcharge,
    serviceFee: rules.serviceFee,
    urgentFee: input.urgent ? rules.urgentFee : 0,
    discount,
    tax,
    total: subtotal - discount + tax,
    currency: 'PKR',
    revision: rules.revision,
  };
}
