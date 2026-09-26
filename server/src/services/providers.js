import nodemailer from 'nodemailer';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { AppError } from '../utils/errors.js';
export function createMailProvider(config) {
  if (process.env.SMTP_HOST && process.env.SMTP_FROM) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === '465',
      requireTLS: true,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
      connectionTimeout: 10000,
    });
    return { send: (message) => transport.sendMail({ from: process.env.SMTP_FROM, ...message }) };
  }
  return {
    async send(message) {
      if (config.NODE_ENV === 'production')
        throw new AppError(503, 'Email delivery is not configured.');
      const path = fileURLToPath(new URL('../../../.runtime/outbox/', import.meta.url));
      await mkdir(path, { recursive: true });
      await writeFile(`${path}/${randomUUID()}.json`, JSON.stringify(message, null, 2), {
        mode: 0o600,
      });
    },
  };
}
export const paymentProviders = {
  COD: { name: 'Cash on delivery', enabled: true },
  BANK_TRANSFER: { name: 'Bank transfer', enabled: false },
  DIGITAL: { name: 'Digital payment', enabled: false },
};
export const locationProvider = {
  trackingAvailable: false,
  navigationUrl(address) {
    return address.latitude !== undefined
      ? `https://www.google.com/maps/dir/?api=1&destination=${address.latitude},${address.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address.street}, ${address.area}, ${address.city}`)}`;
  },
};
