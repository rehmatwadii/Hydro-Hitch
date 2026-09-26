import mongoose from 'mongoose';
import {
  Address,
  Booking,
  Counter,
  Notification,
  Reservation,
  SlotUsage,
  Tanker,
  User,
  Review,
} from '../models/index.js';
import { assert } from '../utils/errors.js';
import { TRANSITIONS, TERMINAL, OPERATORS, scheduleStart } from '../constants/booking.js';
import { calculatePrice, getPricing } from './pricing.js';
import { audit, digest } from './security.js';

export const scopeFor = (user) =>
  user.role === 'CUSTOMER'
    ? { customer: user._id }
    : user.role === 'DRIVER'
      ? { driver: user._id }
      : {};
export async function visibleBooking(user, id, session) {
  const booking = await Booking.findOne({ _id: id, ...scopeFor(user) }).session(session || null);
  assert(booking, 404, 'Booking not found.');
  return booking;
}
async function notify(booking, title, session) {
  await Notification.create(
    [
      {
        user: booking.customer,
        title,
        body: `${booking.reference} · ${booking.status.replaceAll('_', ' ')}`,
        booking: booking._id,
      },
    ],
    { session },
  );
}
export async function createBooking(req) {
  const key = req.get('idempotency-key');
  assert(
    typeof key === 'string' && /^[a-zA-Z0-9-]{16,80}$/.test(key),
    400,
    'Provide a valid Idempotency-Key header.',
  );
  const input = req.body;
  const requestHash = digest(JSON.stringify(input));
  const existing = await Booking.findOne({ customer: req.user._id, idempotencyKey: key });
  if (existing) {
    assert(
      existing.requestHash === requestHash,
      409,
      'This request key was already used for a different booking.',
    );
    return { booking: existing, replay: true };
  }
  let result;
  try {
    await mongoose.connection.transaction(async (session) => {
      const address = await Address.findOne({ _id: input.addressId, customer: req.user._id })
        .session(session)
        .lean();
      assert(address, 404, 'Delivery address not found.');
      const scheduledAt = scheduleStart(input.date, input.slot);
      assert(
        scheduledAt > new Date() && scheduledAt < new Date(Date.now() + 90 * 86400000),
        422,
        'Choose a future delivery slot within 90 days.',
      );
      const rules = await getPricing(session);
      assert(
        input.quoteRevision === rules.revision,
        409,
        'Prices have changed. Return to review to see the current price before confirming.',
      );
      const price = calculatePrice({ ...input, area: address.area }, rules);
      const slotKey = `${input.date}/${input.slot}`;
      const slot = await SlotUsage.findOneAndUpdate(
        { key: slotKey },
        { $setOnInsert: { count: 0 } },
        { upsert: true, returnDocument: 'after', session },
      );
      assert(slot.count < rules.slotLimit, 409, 'This delivery slot is full. Choose another slot.');
      await SlotUsage.updateOne({ _id: slot._id }, { $inc: { count: 1 } }, { session });
      const year = new Date().getUTCFullYear();
      const counter = await Counter.findOneAndUpdate(
        { key: `bookings-${year}` },
        { $inc: { value: 1 } },
        { upsert: true, returnDocument: 'after', session },
      );
      const {
        _id: _addressId,
        customer: _customer,
        createdAt: _created,
        updatedAt: _updated,
        __v: _v,
        ...snapshot
      } = address;
      const [booking] = await Booking.create(
        [
          {
            customer: req.user._id,
            address: snapshot,
            capacity: input.capacity,
            waterType: input.waterType,
            date: input.date,
            slot: input.slot,
            scheduledAt,
            instructions: input.instructions,
            urgent: input.urgent,
            price,
            paymentMethod: input.paymentMethod,
            reference: `HH-${year}-${String(counter.value).padStart(6, '0')}`,
            idempotencyKey: key,
            requestHash,
            history: [
              { status: 'PENDING', at: new Date(), actor: req.user._id, note: 'Booking submitted' },
            ],
          },
        ],
        { session },
      );
      await notify(booking, 'Your water delivery is booked', session);
      result = booking;
    });
  } catch (error) {
    if (error.code === 11000) {
      const replay = await Booking.findOne({ customer: req.user._id, idempotencyKey: key });
      if (replay) {
        assert(
          replay.requestHash === requestHash,
          409,
          'This request key was already used for a different booking.',
        );
        return { booking: replay, replay: true };
      }
    }
    throw error;
  }
  return { booking: result, replay: false };
}
export async function changeStatus(req) {
  let result;
  await mongoose.connection.transaction(async (session) => {
    const booking = await visibleBooking(req.user, req.params.id, session);
    const { status, note, recipient } = req.body;
    assert(
      TRANSITIONS[booking.status].includes(status) && status !== 'ASSIGNED',
      409,
      'This status transition is not allowed.',
    );
    if (req.user.role === 'CUSTOMER')
      assert(
        status === 'CANCELLED' && ['PENDING', 'CONFIRMED'].includes(booking.status),
        403,
        'This booking can no longer be cancelled online.',
      );
    if (req.user.role === 'DRIVER')
      assert(
        ['EN_ROUTE', 'ARRIVED', 'DELIVERING', 'DELIVERED', 'FAILED'].includes(status),
        403,
        'Drivers can only update assigned deliveries.',
      );
    if (['CANCELLED', 'FAILED'].includes(status))
      assert(note.length >= 3, 422, 'Please provide a reason.');
    if (status === 'EN_ROUTE') {
      assert(
        booking.date === new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }),
        409,
        'Dispatch is only available on the scheduled delivery date.',
      );
      await User.updateOne(
        { _id: booking.driver, active: true, availability: true },
        { $inc: { lockVersion: 1 } },
        { session },
      ).then((r) => assert(r.matchedCount, 409, 'Driver is unavailable.'));
      await Tanker.updateOne(
        { _id: booking.tanker, status: 'AVAILABLE' },
        { $inc: { lockVersion: 1 } },
        { session },
      ).then((r) => assert(r.matchedCount, 409, 'Tanker is unavailable.'));
      const active = await Booking.exists({
        _id: { $ne: booking._id },
        status: { $in: ['EN_ROUTE', 'ARRIVED', 'DELIVERING'] },
        $or: [{ driver: booking.driver }, { tanker: booking.tanker }],
      }).session(session);
      assert(!active, 409, 'This driver or tanker is still completing another delivery.');
    }
    if (status === 'DELIVERED') {
      assert(recipient.length >= 2, 422, 'Enter the recipient name as delivery confirmation.');
      booking.completion = { recipient, note, at: new Date() };
    }
    booking.status = status;
    booking.history.push({ status, at: new Date(), actor: req.user._id, note });
    await booking.save({ session });
    if (TERMINAL.includes(status)) {
      await Reservation.deleteMany({ booking: booking._id }, { session });
      if (status === 'CANCELLED')
        await SlotUsage.updateOne(
          { key: `${booking.date}/${booking.slot}`, count: { $gt: 0 } },
          { $inc: { count: -1 } },
          { session },
        );
    }
    await notify(booking, `Delivery ${status.toLowerCase().replaceAll('_', ' ')}`, session);
    await audit(req, `booking.${status.toLowerCase()}`, booking.reference, { note }, session);
    result = booking;
  });
  return result;
}
export async function assignBooking(req) {
  let result;
  await mongoose.connection.transaction(async (session) => {
    const booking = await visibleBooking(req.user, req.params.id, session);
    assert(
      ['CONFIRMED', 'ASSIGNED'].includes(booking.status),
      409,
      'Confirm the booking before assigning it.',
    );
    assert(
      scheduleStart(booking.date, booking.slot).getTime() + 3 * 3600000 > Date.now(),
      409,
      'The delivery window has passed.',
    );
    const driver = await User.findOneAndUpdate(
      { _id: req.body.driverId, role: 'DRIVER', active: true, availability: true },
      { $inc: { lockVersion: 1 } },
      { returnDocument: 'after', session },
    );
    const tanker = await Tanker.findOneAndUpdate(
      { _id: req.body.tankerId, status: 'AVAILABLE', capacity: { $gte: booking.capacity } },
      { $inc: { lockVersion: 1 } },
      { returnDocument: 'after', session },
    );
    assert(driver && tanker, 409, 'Select an available driver and a tanker with enough capacity.');
    const previousDriver = booking.driver;
    await Reservation.deleteMany({ booking: booking._id }, { session });
    await Reservation.create(
      [`driver:${driver._id}`, `tanker:${tanker._id}`].map((resource) => ({
        booking: booking._id,
        resource,
        date: booking.date,
        slot: booking.slot,
      })),
      { session, ordered: true },
    );
    booking.driver = driver._id;
    booking.tanker = tanker._id;
    booking.status = 'ASSIGNED';
    assert(booking.history.length < 100, 409, 'Reassignment limit reached. Contact support.');
    booking.history.push({
      status: 'ASSIGNED',
      at: new Date(),
      actor: req.user._id,
      note: `Assigned ${tanker.registration}`,
    });
    await booking.save({ session });
    await notify(booking, 'A driver has been assigned', session);
    await Notification.create(
      [
        {
          user: driver._id,
          title: 'New delivery assignment',
          body: booking.reference,
          booking: booking._id,
        },
      ],
      { session },
    );
    await audit(
      req,
      previousDriver ? 'booking.reassigned' : 'booking.assigned',
      booking.reference,
      { driver: String(driver._id), tanker: tanker.registration },
      session,
    );
    result = booking;
  });
  return result;
}
export function bookingFilter(user, query) {
  const filter = scopeFor(user);
  if (query.status) filter.status = query.status;
  if (query.search)
    filter.reference = {
      $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
  if (OPERATORS.includes(user.role)) {
    if (query.driver) filter.driver = query.driver;
    if (query.customer) filter.customer = query.customer;
  }
  if (query.from || query.to)
    filter.date = { ...(query.from && { $gte: query.from }), ...(query.to && { $lte: query.to }) };
  return filter;
}
export async function getBookingDetail(user, id) {
  const booking = await visibleBooking(user, id);
  await booking.populate([
    { path: 'customer', select: 'name phone' },
    { path: 'driver', select: 'name phone' },
    { path: 'tanker', select: 'registration capacity' },
  ]);
  const review = await Review.findOne({ booking: id }).lean();
  return { ...booking.toObject(), review };
}
