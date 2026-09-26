export class AppError extends Error {
  constructor(status, message, code = 'REQUEST_FAILED') {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export function assert(condition, status, message, code) {
  if (!condition) throw new AppError(status, message, code);
}
export const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
