import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  Address,
  AuditLog,
  Booking,
  Notification,
  Payment,
  Pricing,
  Reservation,
  Review,
  Session,
  Tanker,
  Ticket,
  User,
} from '../models/index.js';
import { assert, ok } from '../utils/errors.js';
import { listQuery } from '../validators/index.js';
import { audit, publicUser } from '../services/security.js';
import { bookingFilter, visibleBooking, scopeFor } from '../services/bookings.js';
import { getPricing } from '../services/pricing.js';
import { ADMINS, TERMINAL } from '../constants/booking.js';
export async function paginate(model, filter, query, projection, populate) {
  const sort =
    query.sort === 'oldest'
      ? { createdAt: 1, _id: 1 }
      : query.sort === 'scheduled'
        ? { scheduledAt: 1, _id: 1 }
        : { createdAt: -1, _id: -1 };
  let cursor = model
    .find(filter)
    .select(projection || '')
    .sort(sort)
    .skip((query.page - 1) * query.limit)
    .limit(query.limit);
  if (populate) cursor = cursor.populate(populate);
  const [items, total] = await Promise.all([cursor.lean(), model.countDocuments(filter)]);
  return { items, total, page: query.page, pages: Math.max(1, Math.ceil(total / query.limit)) };
}
const searchFilter = (query, fields) =>
  query.search
    ? {
        $or: fields.map((field) => ({
          [field]: { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
        })),
      }
    : {};
export const resources = {
  async profile(req, res) {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true },
    );
    ok(res, publicUser(user));
  },
  async addresses(req, res) {
    ok(
      res,
      await Address.find({ customer: req.user._id }).sort({ createdAt: -1 }).limit(30).lean(),
    );
  },
  async saveAddress(req, res) {
    let result;
    await mongoose.connection.transaction(async (session) => {
      await User.updateOne({ _id: req.user._id }, { $inc: { lockVersion: 1 } }, { session });
      assert(
        (await Address.countDocuments({ customer: req.user._id }).session(session)) < 30,
        409,
        'You can save up to 30 addresses.',
      );
      [result] = await Address.create([{ ...req.body, customer: req.user._id }], { session });
    });
    ok(res, result, 201);
  },
  async updateAddress(req, res) {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, customer: req.user._id },
      { $set: req.body },
      { returnDocument: 'after', runValidators: true },
    );
    assert(address, 404, 'Address not found.');
    ok(res, address);
  },
  async deleteAddress(req, res) {
    const result = await Address.deleteOne({ _id: req.params.id, customer: req.user._id });
    assert(result.deletedCount, 404, 'Address not found.');
    ok(res, { message: 'Address removed' });
  },
  async bookings(req, res) {
    const query = listQuery.parse(req.query);
    ok(
      res,
      await paginate(
        Booking,
        bookingFilter(req.user, query),
        query,
        '-idempotencyKey -requestHash',
        [
          { path: 'customer', select: 'name' },
          { path: 'driver', select: 'name' },
          { path: 'tanker', select: 'registration' },
        ],
      ),
    );
  },
  async notifications(req, res) {
    ok(res, await paginate(Notification, { user: req.user._id }, listQuery.parse(req.query)));
  },
  async readNotification(req, res) {
    const result = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { read: true } },
      { returnDocument: 'after' },
    );
    assert(result, 404, 'Notification not found.');
    ok(res, result);
  },
  async users(req, res) {
    const query = listQuery.parse(req.query);
    ok(
      res,
      await paginate(
        User,
        { ...searchFilter(query, ['name', 'email']), ...(query.role && { role: query.role }) },
        query,
        'name email phone role active availability createdAt',
      ),
    );
  },
  async drivers(req, res) {
    const query = listQuery.parse(req.query);
    ok(
      res,
      await paginate(
        User,
        { role: 'DRIVER', ...searchFilter(query, ['name']) },
        query,
        'name phone active availability',
      ),
    );
  },
  async createUser(req, res) {
    const { password, ...input } = req.body;
    assert(
      input.role !== 'SUPER_ADMIN' &&
        (req.user.role === 'SUPER_ADMIN' || !ADMINS.includes(input.role)),
      403,
      'Only a super administrator can create administrators.',
    );
    const passwordHash = await bcrypt.hash(password, 12);
    let user;
    await mongoose.connection.transaction(async (session) => {
      [user] = await User.create([{ ...input, passwordHash }], { session });
      await audit(req, 'user.created', user._id, { role: user.role }, session);
    });
    ok(res, publicUser(user), 201);
  },
  async updateUser(req, res) {
    let result;
    await mongoose.connection.transaction(async (session) => {
      const user = await User.findById(req.params.id).session(session);
      assert(user, 404, 'User not found.');
      assert(
        String(user._id) !== String(req.user._id),
        409,
        'Use your profile to update your own account.',
      );
      assert(
        user.role !== 'SUPER_ADMIN' && req.body.role !== 'SUPER_ADMIN',
        403,
        'Super administrator access cannot be changed here.',
      );
      assert(
        req.user.role === 'SUPER_ADMIN' ||
          (!ADMINS.includes(user.role) && !ADMINS.includes(req.body.role)),
        403,
        'Only a super administrator can manage administrators.',
      );
      if (
        req.body.active === false ||
        req.body.availability === false ||
        (req.body.role && req.body.role !== user.role)
      ) {
        const assigned = await Reservation.exists({ resource: `driver:${user._id}` }).session(
          session,
        );
        assert(
          !assigned,
          409,
          'Reassign this driver’s deliveries before changing availability or role.',
        );
      }
      Object.assign(user, req.body);
      user.lockVersion += 1;
      await user.save({ session });
      if (req.body.role || req.body.active === false)
        await Session.deleteMany({ user: user._id }, { session });
      await audit(req, 'user.updated', user._id, req.body, session);
      result = publicUser(user);
    });
    ok(res, result);
  },
  async tankers(req, res) {
    const query = listQuery.parse(req.query);
    ok(
      res,
      await paginate(
        Tanker,
        { ...searchFilter(query, ['registration']), ...(query.status && { status: query.status }) },
        query,
      ),
    );
  },
  async createTanker(req, res) {
    let result;
    await mongoose.connection.transaction(async (session) => {
      [result] = await Tanker.create([req.body], { session });
      await audit(req, 'tanker.created', result._id, {}, session);
    });
    ok(res, result, 201);
  },
  async updateTanker(req, res) {
    let result;
    await mongoose.connection.transaction(async (session) => {
      const tanker = await Tanker.findById(req.params.id).session(session);
      assert(tanker, 404, 'Tanker not found.');
      assert(
        !(await Reservation.exists({ resource: `tanker:${tanker._id}` }).session(session)),
        409,
        'Reassign this tanker’s deliveries before editing it.',
      );
      Object.assign(tanker, req.body);
      tanker.lockVersion += 1;
      await tanker.save({ session });
      await audit(req, 'tanker.updated', tanker._id, req.body, session);
      result = tanker;
    });
    ok(res, result);
  },
  async pricing(req, res) {
    const rules = await getPricing();
    if (!ADMINS.includes(req.user?.role)) {
      const { promos: _promos, ...publicRules } = rules;
      return ok(res, publicRules);
    }
    ok(res, rules);
  },
  async updatePricing(req, res) {
    let result;
    await mongoose.connection.transaction(async (session) => {
      result = await Pricing.findOneAndUpdate(
        { key: 'standard' },
        { $set: req.body, $inc: { revision: 1 } },
        { returnDocument: 'after', session, runValidators: true },
      );
      assert(result, 404, 'Pricing not configured.');
      await audit(req, 'pricing.updated', result._id, { revision: result.revision }, session);
    });
    ok(res, result);
  },
  async tickets(req, res) {
    const query = listQuery.parse(req.query);
    ok(
      res,
      await paginate(
        Ticket,
        {
          ...(req.user.role === 'CUSTOMER' || req.user.role === 'DRIVER'
            ? { customer: req.user._id }
            : {}),
          ...(query.status && { status: query.status }),
        },
        query,
        '',
        { path: 'customer', select: 'name' },
      ),
    );
  },
  async createTicket(req, res) {
    if (req.body.booking) await visibleBooking(req.user, req.body.booking);
    ok(res, await Ticket.create({ ...req.body, customer: req.user._id }), 201);
  },
  async updateTicket(req, res) {
    let ticket;
    await mongoose.connection.transaction(async (session) => {
      ticket = await Ticket.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { returnDocument: 'after', session },
      );
      assert(ticket, 404, 'Support request not found.');
      await Notification.create(
        [
          {
            user: ticket.customer,
            title: 'Support request updated',
            body: `${ticket.subject}: ${req.body.response}`,
          },
        ],
        { session },
      );
      await audit(req, 'ticket.updated', ticket._id, { status: ticket.status }, session);
    });
    ok(res, ticket);
  },
  async review(req, res) {
    const booking = await visibleBooking(req.user, req.params.id);
    assert(booking.status === 'DELIVERED', 409, 'You can rate a delivery after it is completed.');
    ok(
      res,
      await Review.create({ ...req.body, booking: booking._id, customer: req.user._id }),
      201,
    );
  },
  async reviews(req, res) {
    ok(
      res,
      await paginate(Review, {}, listQuery.parse(req.query), '', {
        path: 'customer',
        select: 'name',
      }),
    );
  },
  async payments(req, res) {
    ok(
      res,
      await paginate(Payment, {}, listQuery.parse(req.query), '', {
        path: 'booking',
        select: 'reference',
      }),
    );
  },
  async recordPayment(req, res) {
    let result;
    await mongoose.connection.transaction(async (session) => {
      const booking = await Booking.findById(req.params.id).session(session);
      assert(booking, 404, 'Booking not found.');
      assert(booking.status === 'DELIVERED', 409, 'Cash can be recorded after delivery.');
      assert(
        req.body.state === 'PAID'
          ? booking.paymentStatus === 'PENDING'
          : booking.paymentStatus === 'PAID',
        409,
        'This payment was already recorded or cannot be refunded.',
      );
      [result] = await Payment.create(
        [
          {
            booking: booking._id,
            amount: booking.price.total,
            method: 'COD',
            actor: req.user._id,
            ...req.body,
          },
        ],
        { session },
      );
      booking.paymentStatus = req.body.state;
      await booking.save({ session });
      await audit(
        req,
        `payment.${req.body.state.toLowerCase()}`,
        booking.reference,
        { amount: booking.price.total },
        session,
      );
      await Notification.create(
        [
          {
            user: booking.customer,
            title: `Payment ${req.body.state.toLowerCase()}`,
            body: booking.reference,
            booking: booking._id,
          },
        ],
        { session },
      );
    });
    ok(res, result, 201);
  },
  async audit(req, res) {
    ok(
      res,
      await paginate(AuditLog, {}, listQuery.parse(req.query), '', {
        path: 'actor',
        select: 'name',
      }),
    );
  },
  async stats(req, res) {
    const scope = scopeFor(req.user);
    const [totals, byStatus, daily, recent, resourceCounts, upcoming] = await Promise.all([
      Booking.aggregate([
        { $match: scope },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            spent: { $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, '$price.total', 0] } },
            collected: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$price.total', 0] },
            },
            active: { $sum: { $cond: [{ $in: ['$status', TERMINAL] }, 0, 1] } },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] } },
          },
        },
      ]),
      Booking.aggregate([{ $match: scope }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Booking.aggregate([
        {
          $match: {
            ...scope,
            legacyId: { $exists: false },
            createdAt: { $gte: new Date(Date.now() - 30 * 86400000) },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Karachi' },
            },
            count: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$price.total', 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Booking.find(scope)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('reference status scheduledAt capacity price address')
        .lean(),
      req.user.role === 'CUSTOMER'
        ? Promise.all([Address.countDocuments({ customer: req.user._id })])
        : req.user.role === 'DRIVER'
          ? Promise.resolve([])
          : Promise.all([
              Tanker.countDocuments({ status: 'AVAILABLE' }),
              User.countDocuments({ role: 'DRIVER', active: true, availability: true }),
              User.countDocuments({ role: 'CUSTOMER', active: true }),
            ]),
      Booking.findOne({ ...scope, status: { $nin: TERMINAL } })
        .sort({ scheduledAt: 1 })
        .select('reference status scheduledAt capacity price address')
        .lean(),
    ]);
    ok(res, {
      totals: totals[0] || { total: 0, spent: 0, collected: 0, active: 0, delivered: 0 },
      byStatus,
      daily,
      recent,
      resourceCounts,
      upcoming,
    });
  },
  async export(req, res) {
    const query = listQuery.parse(req.query);
    const filter = bookingFilter(req.user, query);
    assert(
      (await Booking.countDocuments(filter)) <= 10000,
      422,
      'Narrow the date range to export at most 10,000 bookings.',
    );
    await audit(req, 'report.export', 'bookings', { from: query.from, to: query.to });
    const cell = (value) =>
      `"${String(value ?? '')
        .replace(/^[=+@\-\t\r]/, "'$&")
        .replaceAll('"', '""')}"`;
    res.type('text/csv').attachment('hydro-hitch-bookings.csv');
    res.write('Reference,Date,Slot,Status,Capacity litres,Area,Total PKR,Payment\r\n');
    for await (const b of Booking.find(filter).sort({ createdAt: -1 }).cursor())
      res.write(
        [
          b.reference,
          b.date,
          b.slot,
          b.status,
          b.capacity,
          b.address.area,
          b.price.total,
          b.paymentStatus,
        ]
          .map(cell)
          .join(',') + '\r\n',
      );
    res.end();
  },
};
