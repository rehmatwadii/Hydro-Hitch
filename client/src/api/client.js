let csrf = '';
export function setCsrf(value) {
  csrf = value;
}
export async function api(path, { body, method = 'GET', headers = {}, signal } = {}) {
  let response;
  try {
    response = await fetch(`/api/v2${path}`, {
      method,
      credentials: 'include',
      signal,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(method !== 'GET' && { 'X-CSRF-Token': csrf }),
        ...headers,
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Unable to connect. Check your connection and try again.');
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      window.dispatchEvent(new Event('hh:session-expired'));
    }
    const error = new Error(
      payload?.error?.details?.map((d) => `${d.field}: ${d.message}`).join(' · ') ||
        payload?.error?.message ||
        'Something went wrong. Please try again.',
    );
    error.status = response.status;
    throw error;
  }
  return payload.data;
}
export const money = (value) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value || 0);
export const dateTime = (value) =>
  !value || Number.isNaN(new Date(value).getTime())
    ? 'Not recorded'
    : new Intl.DateTimeFormat('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Asia/Karachi',
      }).format(new Date(value));
export const label = (value) =>
  value
    ?.replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
