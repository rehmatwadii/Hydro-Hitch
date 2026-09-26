import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Search } from 'lucide-react';
import { useAuth } from '../context/Auth';
import { useDebounce, useQuery } from '../hooks/useQuery';
import { Badge, Empty, PageHeader, Pagination, QueryState } from '../components/ui';
import { money, label } from '../api/client';
export default function Bookings({ dispatch = false }) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(dispatch ? 'CONFIRMED' : '');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState('newest');
  const debounced = useDebounce(search);
  const params = new URLSearchParams({
    page,
    search: debounced,
    sort,
    ...(status && { status }),
    ...(from && { from }),
    ...(to && { to }),
  });
  const query = useQuery(`/bookings?${params}`);
  function filter(setter, value) {
    setter(value);
    setPage(1);
  }
  return (
    <>
      <PageHeader
        eyebrow={dispatch ? 'COORDINATE EVERY DELIVERY' : 'YOUR DELIVERY HISTORY'}
        title={dispatch ? 'Dispatch board' : 'Bookings'}
        description={
          dispatch
            ? 'Confirm requests, assign the right resources, and keep deliveries on track.'
            : 'Every delivery, from the first request to the final drop.'
        }
        action={
          user.role === 'CUSTOMER' ? (
            <Link className="button" to="/app/book">
              <Plus size={18} />
              Book a tanker
            </Link>
          ) : null
        }
      />
      <section className="panel">
        <div className="filters">
          <label className="search-field">
            <Search size={17} />
            <input
              aria-label="Search booking reference"
              placeholder="Search booking reference…"
              value={search}
              onChange={(e) => filter(setSearch, e.target.value)}
            />
          </label>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => filter(setStatus, e.target.value)}
          >
            <option value="">All statuses</option>
            {[
              'PENDING',
              'CONFIRMED',
              'ASSIGNED',
              'EN_ROUTE',
              'ARRIVED',
              'DELIVERING',
              'DELIVERED',
              'CANCELLED',
              'FAILED',
            ].map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
          <input
            aria-label="Delivery from date"
            type="date"
            value={from}
            onChange={(e) => filter(setFrom, e.target.value)}
          />
          <input
            aria-label="Delivery to date"
            type="date"
            value={to}
            onChange={(e) => filter(setTo, e.target.value)}
          />
          <select
            aria-label="Sort bookings"
            value={sort}
            onChange={(e) => filter(setSort, e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="scheduled">Delivery time</option>
          </select>
        </div>
        <QueryState query={query}>
          {(data) => (
            <>
              {data.items.length ? (
                <div className="table-wrap" tabIndex={0} role="region" aria-label="Records">
                  <table>
                    <thead>
                      <tr>
                        <th>Booking</th>
                        <th>Delivery</th>
                        <th>Capacity</th>
                        <th>Driver</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>
                          <span className="sr-only">Details</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((b) => (
                        <tr key={b._id}>
                          <td>
                            <Link className="table-reference" to={`/app/bookings/${b._id}`}>
                              {b.reference}
                            </Link>
                            <small>{b.customer?.name || 'Customer unavailable'}</small>
                          </td>
                          <td>
                            {b.address.area}
                            <small>
                              {b.date} · {b.slot}
                            </small>
                          </td>
                          <td>
                            {b.capacity.toLocaleString()} L<small>{b.waterType}</small>
                          </td>
                          <td>
                            {b.driver?.name || 'Unassigned'}
                            <small>{b.tanker?.registration || 'Awaiting dispatch'}</small>
                          </td>
                          <td>{money(b.price.total)}</td>
                          <td>
                            <Badge status={b.status} />
                          </td>
                          <td>
                            <Link
                              className="icon-button"
                              aria-label={`Open ${b.reference}`}
                              to={`/app/bookings/${b._id}`}
                            >
                              <ArrowRight size={18} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty title="No bookings to show.">
                  Try a different filter or create your first delivery.
                </Empty>
              )}
              <Pagination data={data} page={page} setPage={setPage} />
            </>
          )}
        </QueryState>
      </section>
    </>
  );
}
