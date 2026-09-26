import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Session, User, AuditLog } from '../models/index.js';
import { assert } from '../utils/errors.js';
export const digest = (value) => createHash('sha256').update(value).digest('hex');
export const randomToken = () => randomBytes(32).toString('hex');
export const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  active: user.active,
  availability: user.availability,
});
export function cookieOptions(config) {
  return {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 86400000,
  };
}
export async function issueSession(user, res, config) {
  const token = randomToken();
  const csrf = randomToken();
  await Session.create({
    user: user._id,
    tokenHash: digest(token),
    csrf,
    expiresAt: new Date(Date.now() + 7 * 86400000),
  });
  res.cookie('hh_session', token, cookieOptions(config));
  return { user: publicUser(user), csrf };
}
export async function authenticate(req, _res, next) {
  const token = req.cookies.hh_session;
  assert(
    typeof token === 'string' && /^[a-f\d]{64}$/.test(token),
    401,
    'Please sign in to continue.',
    'UNAUTHENTICATED',
  );
  const session = await Session.findOne({
    tokenHash: digest(token),
    expiresAt: { $gt: new Date() },
  });
  assert(session, 401, 'Your session has expired. Please sign in.', 'UNAUTHENTICATED');
  const user = await User.findById(session.user);
  assert(user?.active, 401, 'Your account is unavailable. Please sign in.', 'UNAUTHENTICATED');
  req.user = user;
  req.session = session;
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const csrf = req.get('x-csrf-token') || '';
    assert(
      /^[a-f\d]{64}$/.test(csrf) && timingSafeEqual(Buffer.from(csrf), Buffer.from(session.csrf)),
      403,
      'Refresh this page and try again.',
      'CSRF_INVALID',
    );
  }
  next();
}
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    assert(
      roles.includes(req.user.role),
      403,
      'You do not have access to this operation.',
      'FORBIDDEN',
    );
    next();
  };
export async function audit(req, action, target, metadata = {}, session) {
  await AuditLog.create(
    [{ actor: req.user?._id, action, target: String(target), requestId: req.id, metadata }],
    { session },
  );
}
