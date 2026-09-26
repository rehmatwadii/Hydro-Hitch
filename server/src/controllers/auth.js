import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, Session, ResetToken, Notification } from '../models/index.js';
import { assert, ok } from '../utils/errors.js';
import {
  issueSession,
  publicUser,
  digest,
  randomToken,
  cookieOptions,
  audit,
} from '../services/security.js';
import { ADMINS } from '../constants/booking.js';
export function authControllers(config, mail) {
  return {
    async register(req, res) {
      const { password, ...fields } = req.body;
      const passwordHash = await bcrypt.hash(password, 12);
      let user;
      await mongoose.connection.transaction(async (session) => {
        [user] = await User.create([{ ...fields, passwordHash, role: 'CUSTOMER' }], { session });
        await Notification.create(
          [
            {
              user: user._id,
              title: 'Welcome to Hydro-Hitch',
              body: 'Save a delivery address to book your first tanker.',
            },
          ],
          { session },
        );
      });
      ok(res, await issueSession(user, res, config), 201);
    },
    async login(req, res) {
      const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
      // Always perform a password comparison, including for unknown accounts.
      const dummy = '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';
      const valid = await bcrypt.compare(req.body.password, user?.passwordHash || dummy);
      assert(valid && user?.active, 401, 'Email or password is incorrect.');
      req.user = user;
      if (ADMINS.includes(user.role)) await audit(req, 'admin.login', user._id);
      ok(res, await issueSession(user, res, config));
    },
    async me(req, res) {
      ok(res, { user: publicUser(req.user), csrf: req.session.csrf });
    },
    async logout(req, res) {
      await Session.deleteOne({ _id: req.session._id });
      res.clearCookie('hh_session', { ...cookieOptions(config), maxAge: undefined });
      ok(res, { message: 'Signed out' });
    },
    async forgot(req, res) {
      const user = await User.findOne({ email: req.body.email });
      if (user?.active) {
        const token = randomToken();
        await ResetToken.create({
          user: user._id,
          tokenHash: digest(token),
          expiresAt: new Date(Date.now() + 30 * 60000),
        });
        try {
          await mail.send({
            to: user.email,
            subject: 'Reset your Hydro-Hitch password',
            text: `Reset your password within 30 minutes: ${config.CLIENT_URL}/reset-password#${token}\nIf you did not request this, ignore this email.`,
          });
        } catch {
          req.log.warn({ requestId: req.id }, 'Password reset delivery failed');
        }
      }
      ok(res, { message: 'If this account exists, password reset instructions will be sent.' });
    },
    async reset(req, res) {
      const passwordHash = await bcrypt.hash(req.body.password, 12);
      await mongoose.connection.transaction(async (session) => {
        const reset = await ResetToken.findOneAndDelete(
          { tokenHash: digest(req.body.token), expiresAt: { $gt: new Date() } },
          { session },
        );
        assert(reset, 400, 'This reset link is invalid or expired.');
        const user = await User.findOneAndUpdate(
          { _id: reset.user, active: true },
          { $set: { passwordHash } },
          { session },
        );
        assert(user, 400, 'This reset link is invalid or expired.');
        await ResetToken.deleteMany({ user: reset.user }, { session });
        await Session.deleteMany({ user: reset.user }, { session });
      });
      ok(res, { message: 'Password updated. Please sign in.' });
    },
  };
}
