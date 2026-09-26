import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin, Printer, RotateCcw, Truck } from 'lucide-react';
import { useAuth } from '../context/Auth';
import { useQuery } from '../hooks/useQuery';
import { api, dateTime, label, money } from '../api/client';
import {
  Badge,
  CopyButton,
  ErrorNotice,
  Field,
  Modal,
  PageHeader,
  QueryState,
  Submit,
} from '../components/ui';
const driverNext = {
  ASSIGNED: 'EN_ROUTE',
  EN_ROUTE: 'ARRIVED',
  ARRIVED: 'DELIVERING',
  DELIVERING: 'DELIVERED',
};
function AssignmentForm({ booking, onSaved }) {
  const drivers = useQuery('/drivers?limit=100');
  const tankers = useQuery('/tankers?status=AVAILABLE&limit=100');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/dispatch/${booking._id}`, {
        method: 'POST',
        body: Object.fromEntries(new FormData(e.currentTarget)),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <ErrorNotice message={error || drivers.error || tankers.error} />
      <p className="muted">
        Availability and schedule conflicts are checked again when you assign.
      </p>
      <Field label="Driver">
        {(id) => (
          <select id={id} name="driverId" required defaultValue={booking.driver?._id || ''}>
            <option value="">Choose a driver</option>
            {drivers.data?.items
              .filter((d) => d.active && d.availability)
              .map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
          </select>
        )}
      </Field>
      <Field label="Tanker">
        {(id) => (
          <select id={id} name="tankerId" required defaultValue={booking.tanker?._id || ''}>
            <option value="">Choose a tanker</option>
            {tankers.data?.items
              .filter((t) => t.capacity >= booking.capacity)
              .map((t) => (
                <option key={t._id} value={t._id}>
                  {t.registration} · {t.capacity.toLocaleString()} L
                </option>
              ))}
          </select>
        )}
      </Field>
      <Submit busy={busy}>Confirm assignment</Submit>
    </form>
  );
}
export default function BookingDetail() {
  const { id } = useParams();
  const query = useQuery(`/bookings/${id}`);
  const { user } = useAuth();
  const [action, setAction] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const customer = user.role === 'CUSTOMER';
  const admin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
  const ops = admin || user.role === 'DISPATCHER';
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const input = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (action === 'REVIEW') {
        await api(`/bookings/${id}/review`, {
          method: 'POST',
          body: { rating: Number(input.rating), comment: input.comment },
        });
      } else if (action === 'PAID' || action === 'REFUNDED') {
        await api(`/payments/${id}`, { method: 'POST', body: { state: action, note: input.note } });
      } else {
        await api(`/bookings/${id}/status`, {
          method: 'PATCH',
          body: { status: action, note: input.note || '', recipient: input.recipient || '' },
        });
      }
      setSuccess('Your update has been saved.');
      setAction(null);
      query.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  function open(next) {
    setError('');
    setAction(next);
  }
  return (
    <>
      <Link className="text-link no-print" to="/app/bookings">
        <ArrowLeft size={15} />
        Back to bookings
      </Link>
      <QueryState query={query}>
        {(b) => (
          <>
            <PageHeader
              eyebrow="DELIVERY DETAILS"
              title={b.reference}
              description={`${b.capacity.toLocaleString()} litres · ${b.waterType}`}
              action={
                <div className="actions no-print">
                  <CopyButton value={b.reference} />
                  <button className="button secondary" onClick={() => window.print()}>
                    <Printer size={16} />
                    Print receipt
                  </button>
                </div>
              }
            />
            {success && (
              <div className="notice success" role="status">
                {success}
              </div>
            )}
            <div className="detail-grid">
              <section>
                <div className="panel detail-card">
                  <div className="row between">
                    <h2>Delivery journey</h2>
                    <Badge status={b.status} />
                  </div>
                  <ol className="timeline">
                    {b.history.map((event, index) => (
                      <li key={index}>
                        <span className="timeline-dot" />
                        <div>
                          <strong>{label(event.status)}</strong>
                          <small>{dateTime(event.at)} PKT</small>
                          {event.note && <p>{event.note}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                  <div className="actions no-print">
                    {ops && b.status === 'PENDING' && (
                      <button className="button" onClick={() => open('CONFIRMED')}>
                        Confirm booking
                      </button>
                    )}
                    {ops && ['CONFIRMED', 'ASSIGNED'].includes(b.status) && (
                      <button className="button" onClick={() => open('ASSIGN')}>
                        <Truck size={16} />
                        {b.status === 'ASSIGNED' ? 'Reassign delivery' : 'Assign driver & tanker'}
                      </button>
                    )}
                    {(ops || user.role === 'DRIVER') && driverNext[b.status] && (
                      <button className="button" onClick={() => open(driverNext[b.status])}>
                        Mark {label(driverNext[b.status])}
                      </button>
                    )}
                    {((customer && ['PENDING', 'CONFIRMED'].includes(b.status)) ||
                      (ops && ['PENDING', 'CONFIRMED', 'ASSIGNED'].includes(b.status))) && (
                      <button className="button secondary" onClick={() => open('CANCELLED')}>
                        Cancel booking
                      </button>
                    )}
                    {(ops || user.role === 'DRIVER') &&
                      ['EN_ROUTE', 'ARRIVED', 'DELIVERING'].includes(b.status) && (
                        <button className="button secondary" onClick={() => open('FAILED')}>
                          Report failed delivery
                        </button>
                      )}
                    {customer && (
                      <Link
                        className="button secondary"
                        to="/app/book"
                        state={{
                          capacity: b.capacity,
                          waterType: b.waterType,
                          instructions: b.instructions,
                        }}
                      >
                        <RotateCcw size={16} />
                        Book again
                      </Link>
                    )}
                  </div>
                </div>
                <div className="panel detail-card">
                  <h2>Delivery location</h2>
                  <p className="row">
                    <MapPin size={18} />
                    <strong>{b.address.label}</strong>
                  </p>
                  <p>
                    {b.address.street}
                    <br />
                    {b.address.area}, {b.address.city}
                  </p>
                  <p className="muted">{b.address.instructions}</p>
                  {b.instructions && <div className="notice neutral">{b.instructions}</div>}
                  <div className="key-values">
                    <div>
                      <span>Scheduled delivery</span>
                      <strong>
                        {b.date} · {b.slot} PKT
                      </strong>
                    </div>
                    <div>
                      <span>Customer</span>
                      <strong>
                        {b.customer?.name || 'Account unavailable'} · {b.customer?.phone}
                      </strong>
                    </div>
                    <div>
                      <span>Driver</span>
                      <strong>
                        {b.driver ? `${b.driver.name} · ${b.driver.phone}` : 'Awaiting assignment'}
                      </strong>
                    </div>
                    <div>
                      <span>Tanker</span>
                      <strong>{b.tanker?.registration || 'Awaiting assignment'}</strong>
                    </div>
                  </div>
                  {!customer && (
                    <a
                      className="text-link no-print"
                      href={
                        b.address.latitude !== undefined
                          ? `https://www.google.com/maps/dir/?api=1&destination=${b.address.latitude},${b.address.longitude}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.address.street}, ${b.address.area}, ${b.address.city}`)}`
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open navigation
                      <ExternalLink size={15} />
                    </a>
                  )}
                  {b.completion?.recipient && (
                    <div className="notice success">
                      Received by {b.completion.recipient} · {dateTime(b.completion.at)}
                    </div>
                  )}
                </div>
              </section>
              <aside>
                <div className="panel detail-card">
                  <p className="eyebrow">BOOKING RECEIPT</p>
                  <h2>Clear from the start.</h2>
                  <div className="price-lines">
                    {[
                      ['Water & capacity', b.price.base + b.price.capacity + b.price.water],
                      ['Service fee', b.price.serviceFee],
                      ['Priority fee', b.price.urgentFee],
                      ['Discount', -b.price.discount],
                      ['Tax', b.price.tax],
                    ].map(([name, value]) => (
                      <div key={name}>
                        <span>{name}</span>
                        <span>{money(value)}</span>
                      </div>
                    ))}
                    <div className="price-total">
                      <strong>Total</strong>
                      <strong>{money(b.price.total)}</strong>
                    </div>
                  </div>
                  <div className="row between">
                    <span>Cash on delivery</span>
                    <Badge status={b.paymentStatus} />
                  </div>
                  <p className="fine-print">
                    This is a booking receipt. Payment is confirmed only when marked paid.
                  </p>
                  {admin && b.status === 'DELIVERED' && b.paymentStatus !== 'REFUNDED' && (
                    <button
                      className="button secondary no-print"
                      onClick={() => open(b.paymentStatus === 'PAID' ? 'REFUNDED' : 'PAID')}
                    >
                      {b.paymentStatus === 'PAID' ? 'Record cash refund' : 'Record cash received'}
                    </button>
                  )}
                </div>
                {b.status === 'DELIVERED' && (
                  <div className="panel detail-card">
                    <h2>How did we do?</h2>
                    {b.review ? (
                      <>
                        <strong>{b.review.rating} / 5</strong>
                        <p>{b.review.comment}</p>
                      </>
                    ) : customer ? (
                      <button className="button secondary" onClick={() => open('REVIEW')}>
                        Rate this delivery
                      </button>
                    ) : (
                      <p className="muted">No customer rating yet.</p>
                    )}
                  </div>
                )}
                <Link className="text-link no-print" to="/app/support" state={{ booking: id }}>
                  Need help with this delivery?
                </Link>
              </aside>
            </div>
            {action && (
              <Modal
                title={
                  action === 'ASSIGN'
                    ? 'Assign delivery'
                    : action === 'REVIEW'
                      ? 'Rate your delivery'
                      : `${label(action)} — ${b.reference}`
                }
                onClose={() => setAction(null)}
              >
                {action === 'ASSIGN' ? (
                  <AssignmentForm
                    booking={b}
                    onSaved={() => {
                      setAction(null);
                      query.reload();
                    }}
                  />
                ) : (
                  <form onSubmit={submit}>
                    <ErrorNotice message={error} />
                    {action === 'REVIEW' ? (
                      <>
                        <Field label="Rating">
                          {(fieldId) => (
                            <select id={fieldId} name="rating" defaultValue="5">
                              {[5, 4, 3, 2, 1].map((r) => (
                                <option key={r} value={r}>
                                  {r} out of 5
                                </option>
                              ))}
                            </select>
                          )}
                        </Field>
                        <Field label="Feedback (optional)">
                          {(fieldId) => (
                            <textarea id={fieldId} name="comment" maxLength={1000} rows={3} />
                          )}
                        </Field>
                      </>
                    ) : (
                      <>
                        {action === 'DELIVERED' && (
                          <Field
                            label="Recipient name"
                            name="recipient"
                            required
                            minLength={2}
                            maxLength={100}
                          />
                        )}
                        <Field
                          label={
                            ['CANCELLED', 'FAILED', 'PAID', 'REFUNDED'].includes(action)
                              ? 'Reason / verification note'
                              : 'Note (optional)'
                          }
                        >
                          {(fieldId) => (
                            <textarea
                              id={fieldId}
                              name="note"
                              rows={3}
                              required={['CANCELLED', 'FAILED', 'PAID', 'REFUNDED'].includes(
                                action,
                              )}
                              minLength={
                                ['CANCELLED', 'FAILED', 'PAID', 'REFUNDED'].includes(action) ? 3 : 0
                              }
                              maxLength={500}
                            />
                          )}
                        </Field>
                        {['PAID', 'REFUNDED'].includes(action) && (
                          <p className="muted">
                            Confirm only after physically verifying the cash{' '}
                            {action === 'PAID' ? 'collection' : 'refund'} of {money(b.price.total)}.
                          </p>
                        )}
                      </>
                    )}
                    <Submit busy={busy}>Confirm {action === 'REVIEW' ? 'review' : 'update'}</Submit>
                  </form>
                )}
              </Modal>
            )}
          </>
        )}
      </QueryState>
    </>
  );
}
