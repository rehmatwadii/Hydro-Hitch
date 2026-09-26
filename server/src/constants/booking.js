export const ROLES = ['CUSTOMER', 'DRIVER', 'DISPATCHER', 'ADMIN', 'SUPER_ADMIN'];
export const OPERATORS = ['DISPATCHER', 'ADMIN', 'SUPER_ADMIN'];
export const ADMINS = ['ADMIN', 'SUPER_ADMIN'];
export const TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['EN_ROUTE', 'CANCELLED'],
  EN_ROUTE: ['ARRIVED', 'FAILED'],
  ARRIVED: ['DELIVERING', 'FAILED'],
  DELIVERING: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  CANCELLED: [],
  FAILED: [],
};
export const TERMINAL = ['DELIVERED', 'CANCELLED', 'FAILED'];
export const SLOTS = ['08:00-11:00', '11:00-14:00', '14:00-17:00', '17:00-20:00'];
export function scheduleStart(date, slot) {
  return new Date(`${date}T${slot.slice(0, 5)}:00+05:00`);
}
