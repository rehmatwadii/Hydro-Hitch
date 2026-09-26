import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Plus, Search } from 'lucide-react';
import { useAuth } from '../context/Auth';
import { useDebounce, useQuery } from '../hooks/useQuery';
import { api, dateTime, label, money } from '../api/client';
import {
  Badge,
  Empty,
  ErrorNotice,
  Field,
  Modal,
  PageHeader,
  Pagination,
  QueryState,
  Submit,
} from '../components/ui';
const names = {
  fleet: 'Fleet & drivers',
  users: 'People',
  payments: 'Payment records',
  reports: 'Operational reports',
  reviews: 'Customer ratings',
  audit: 'Audit trail',
};
function Editor({ kind, item, onSaved }) {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fleet = kind === 'fleet';
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const input = Object.fromEntries(new FormData(e.currentTarget));
    if (fleet) input.capacity = Number(input.capacity);
    if (item._id && !fleet) {
      input.active = input.active === 'true';
      input.availability = input.availability === 'true';
    }
    try {
      await api(`/${fleet ? 'tankers' : 'users'}${item._id ? `/${item._id}` : ''}`, {
        method: item._id ? 'PATCH' : 'POST',
        body: input,
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
      <ErrorNotice message={error} />
      {fleet ? (
        <>
          <Field
            label="Registration number"
            name="registration"
            defaultValue={item.registration}
            required
            minLength={3}
            maxLength={30}
          />
          <Field
            label="Capacity (litres)"
            name="capacity"
            type="number"
            min={500}
            max={50000}
            defaultValue={item.capacity || 2000}
            required
          />
          <Field label="Service status">
            {(id) => (
              <select id={id} name="status" defaultValue={item.status || 'AVAILABLE'}>
                {['AVAILABLE', 'MAINTENANCE', 'INACTIVE'].map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </>
      ) : (
        <>
          <Field label="Full name" name="name" defaultValue={item.name} required maxLength={100} />
          <Field
            label="Phone number"
            name="phone"
            defaultValue={item.phone}
            required
            type="tel"
            maxLength={24}
          />
          {!item._id && (
            <>
              <Field label="Email address" name="email" type="email" required maxLength={254} />
              <Field
                label="Initial password (12–72 characters)"
                name="password"
                type="password"
                minLength={12}
                maxLength={72}
                required
                autoComplete="new-password"
              />
            </>
          )}
          <Field label="Role">
            {(id) => (
              <select id={id} name="role" defaultValue={item.role || 'DRIVER'}>
                {[
                  'CUSTOMER',
                  'DRIVER',
                  'DISPATCHER',
                  ...(user.role === 'SUPER_ADMIN' ? ['ADMIN'] : []),
                ].map((r) => (
                  <option key={r} value={r}>
                    {label(r)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          {item._id && (
            <>
              <Field label="Account access">
                {(id) => (
                  <select id={id} name="active" defaultValue={String(item.active)}>
                    <option value="true">Active</option>
                    <option value="false">Suspended</option>
                  </select>
                )}
              </Field>
              <Field label="Driver availability">
                {(id) => (
                  <select id={id} name="availability" defaultValue={String(item.availability)}>
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                )}
              </Field>
            </>
          )}
        </>
      )}
      <Submit busy={busy} />
    </form>
  );
}
function Reports() {
  const query = useQuery('/reports/overview');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    setError('');
    try {
      const params = new URLSearchParams({ ...(from && { from }), ...(to && { to }) });
      const response = await fetch(`/api/v2/reports/bookings.csv?${params}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error.message);
      }
      const url = URL.createObjectURL(await response.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hydro-hitch-bookings.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <QueryState query={query}>
        {(data) => (
          <>
            <div className="stat-grid">
              <article className="stat-card">
                <span>Total bookings</span>
                <strong>{data.totals.total}</strong>
              </article>
              <article className="stat-card">
                <span>Delivered booking value</span>
                <strong>{money(data.totals.spent)}</strong>
              </article>
              <article className="stat-card">
                <span>Verified cash collected</span>
                <strong>{money(data.totals.collected)}</strong>
              </article>
              <article className="stat-card">
                <span>Average delivered value</span>
                <strong>
                  {money(data.totals.delivered ? data.totals.spent / data.totals.delivered : 0)}
                </strong>
              </article>
            </div>
            <div className="dashboard-grid">
              <section className="panel chart-panel">
                <h2>Bookings by status</h2>
                {data.byStatus.length ? (
                  data.byStatus.map((s) => (
                    <div className="bar-row" key={s._id}>
                      <span>{label(s._id)}</span>
                      <meter
                        min="0"
                        max={data.totals.total}
                        value={s.count}
                        aria-label={`${label(s._id)} bookings`}
                      />
                      <strong>{s.count}</strong>
                    </div>
                  ))
                ) : (
                  <Empty>No bookings yet.</Empty>
                )}
              </section>
              <section className="panel chart-panel">
                <h2>Demand in the last 30 days</h2>
                {data.daily.length ? (
                  <div
                    className="daily-chart"
                    role="img"
                    aria-label="Daily booking volume, with dates and counts"
                  >
                    {data.daily.map((d) => (
                      <div key={d._id} title={`${d._id}: ${d.count} bookings`}>
                        <span>{d.count}</span>
                        <i
                          style={{
                            height: `${Math.max(5, (d.count / Math.max(...data.daily.map((x) => x.count))) * 110)}px`,
                          }}
                        />
                        <small>{d._id.slice(5)}</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty>No recent bookings.</Empty>
                )}
                <p className="fine-print">
                  Only dates with bookings are shown. All data comes from stored bookings.
                </p>
              </section>
            </div>
          </>
        )}
      </QueryState>
      <section className="panel detail-card">
        <h2>Export booking records</h2>
        <p className="muted">
          Date filters apply to the delivery date. Exports contain up to 10,000 matching records.
        </p>
        <div className="actions">
          <Field
            label="From date"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Field label="To date" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <button className="button secondary" disabled={busy} onClick={download}>
            <Download size={17} />
            {busy ? 'Preparing…' : 'Download CSV'}
          </button>
        </div>
        <ErrorNotice message={error} />
      </section>
    </>
  );
}
function ResourceTable({ kind }) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('tankers');
  const [editing, setEditing] = useState(null);
  const debounced = useDebounce(search);
  const admin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
  const path = kind === 'fleet' ? tab : kind === 'audit' ? 'admin/audit' : kind;
  const query = useQuery(`/${path}?page=${page}&search=${encodeURIComponent(debounced)}`);
  return (
    <>
      <section className="panel">
        <div className="filters">
          {kind === 'fleet' && (
            <div className="segmented">
              <button
                className={tab === 'tankers' ? 'active' : ''}
                onClick={() => {
                  setTab('tankers');
                  setPage(1);
                }}
              >
                Tankers
              </button>
              <button
                className={tab === 'drivers' ? 'active' : ''}
                onClick={() => {
                  setTab('drivers');
                  setPage(1);
                }}
              >
                Drivers
              </button>
            </div>
          )}
          {['fleet', 'users'].includes(kind) && (
            <label className="search-field">
              <Search size={17} />
              <input
                placeholder="Search…"
                aria-label="Search records"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </label>
          )}
          {admin && (kind === 'users' || (kind === 'fleet' && tab === 'tankers')) && (
            <button className="button" onClick={() => setEditing({})}>
              <Plus size={16} />
              {kind === 'users' ? 'Add account' : 'Add tanker'}
            </button>
          )}
        </div>
        <QueryState query={query}>
          {(data) => (
            <>
              {data.items.length ? (
                <div className="table-wrap" tabIndex={0} role="region" aria-label="Records">
                  <table>
                    <thead>
                      <tr>
                        {(kind === 'fleet'
                          ? tab === 'tankers'
                            ? ['Registration', 'Capacity', 'Status', 'Action']
                            : ['Driver', 'Phone', 'Account', 'Availability']
                          : kind === 'users'
                            ? ['Name', 'Contact', 'Role', 'Status', 'Action']
                            : kind === 'payments'
                              ? ['Booking', 'Amount', 'Method', 'State', 'Recorded']
                              : kind === 'reviews'
                                ? ['Customer', 'Rating', 'Feedback', 'Date']
                                : ['Action', 'Actor', 'Target', 'Date']
                        ).map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item) => (
                        <tr key={item._id}>
                          {kind === 'fleet' && tab === 'tankers' ? (
                            <>
                              <td>
                                <strong>{item.registration}</strong>
                              </td>
                              <td>{item.capacity.toLocaleString()} L</td>
                              <td>
                                <Badge status={item.status} />
                              </td>
                              <td>
                                {admin && (
                                  <button
                                    className="button secondary small"
                                    onClick={() => setEditing(item)}
                                  >
                                    Edit
                                  </button>
                                )}
                              </td>
                            </>
                          ) : kind === 'fleet' ? (
                            <>
                              <td>{item.name}</td>
                              <td>{item.phone}</td>
                              <td>
                                <Badge status={item.active ? 'ACTIVE' : 'INACTIVE'} />
                              </td>
                              <td>
                                <Badge status={item.availability ? 'AVAILABLE' : 'UNAVAILABLE'} />
                              </td>
                            </>
                          ) : kind === 'users' ? (
                            <>
                              <td>
                                <strong>{item.name}</strong>
                              </td>
                              <td>
                                {item.email}
                                <small>{item.phone}</small>
                              </td>
                              <td>{label(item.role)}</td>
                              <td>
                                <Badge status={item.active ? 'ACTIVE' : 'SUSPENDED'} />
                              </td>
                              <td>
                                {item.role !== 'SUPER_ADMIN' && item._id !== user._id && (
                                  <button
                                    className="button secondary small"
                                    onClick={() => setEditing(item)}
                                  >
                                    Manage
                                  </button>
                                )}
                              </td>
                            </>
                          ) : kind === 'payments' ? (
                            <>
                              <td>
                                {item.booking ? (
                                  <Link to={`/app/bookings/${item.booking._id}`}>
                                    {item.booking.reference}
                                  </Link>
                                ) : (
                                  'Booking unavailable'
                                )}
                              </td>
                              <td>{money(item.amount)}</td>
                              <td>{item.method}</td>
                              <td>
                                <Badge status={item.state} />
                              </td>
                              <td>{dateTime(item.createdAt)}</td>
                            </>
                          ) : kind === 'reviews' ? (
                            <>
                              <td>{item.customer?.name || 'Customer unavailable'}</td>
                              <td>{item.rating} / 5</td>
                              <td className="wrap-cell">{item.comment || 'No written feedback'}</td>
                              <td>{dateTime(item.createdAt)}</td>
                            </>
                          ) : (
                            <>
                              <td>{item.action}</td>
                              <td>{item.actor?.name || 'System / migrated account'}</td>
                              <td className="wrap-cell">{item.target}</td>
                              <td>{dateTime(item.createdAt)}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty title="No records yet.">
                  New records will appear here as you use the platform.
                </Empty>
              )}
              <Pagination data={data} page={page} setPage={setPage} />
            </>
          )}
        </QueryState>
      </section>
      {editing && (
        <Modal
          title={`${editing._id ? 'Manage' : 'Add'} ${kind === 'fleet' ? 'tanker' : 'account'}`}
          onClose={() => setEditing(null)}
        >
          <Editor
            kind={kind}
            item={editing}
            onSaved={() => {
              setEditing(null);
              query.reload();
            }}
          />
        </Modal>
      )}
    </>
  );
}
export default function Operations({ kind }) {
  return (
    <>
      <PageHeader
        eyebrow="OPERATIONS CONTROL CENTER"
        title={names[kind]}
        description={
          kind === 'audit'
            ? 'A traceable record of important administrative actions.'
            : 'Real records. Clear decisions.'
        }
      />
      {kind === 'reports' ? <Reports /> : <ResourceTable kind={kind} />}
    </>
  );
}
