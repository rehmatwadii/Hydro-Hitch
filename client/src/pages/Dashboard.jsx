import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Droplets,
  MapPin,
  Plus,
  Truck,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/Auth';
import { useQuery } from '../hooks/useQuery';
import { Badge, Empty, PageHeader, QueryState, TextLink } from '../components/ui';
import { dateTime, money } from '../api/client';
export default function Dashboard() {
  const { user } = useAuth();
  const query = useQuery('/reports/overview');
  const customer = user.role === 'CUSTOMER';
  const driver = user.role === 'DRIVER';
  return (
    <>
      <PageHeader
        eyebrow={customer ? 'A LITTLE CLARITY FOR YOUR DAY' : 'YOUR OPERATIONS, AT A GLANCE'}
        title={
          customer
            ? `Hello, ${user.name.split(' ')[0]}.`
            : driver
              ? 'Ready for the road.'
              : 'Delivery overview.'
        }
        description={
          customer
            ? 'Your water deliveries, all in one place.'
            : 'Keep every booking and every delivery moving.'
        }
        action={
          customer ? (
            <Link className="button" to="/app/book">
              <Plus size={18} />
              Book a tanker
            </Link>
          ) : (
            <Link className="button" to={driver ? '/app/bookings' : '/app/dispatch'}>
              <Truck size={18} />
              {driver ? 'My deliveries' : 'Open dispatch'}
            </Link>
          )
        }
      />
      <QueryState query={query}>
        {(data) => {
          const active = data.upcoming;
          const cards = [
            [ClipboardList, 'Total bookings', data.totals.total, 'Across your delivery history'],
            [Truck, 'Active deliveries', data.totals.active, 'From booking to your doorstep'],
            [
              customer ? Wallet : CheckCircle2,
              customer ? 'Delivered value' : 'Completed deliveries',
              customer ? money(data.totals.spent) : data.totals.delivered,
              customer ? 'Value of completed deliveries' : 'Successfully fulfilled',
            ],
            [
              customer ? MapPin : Wallet,
              customer ? 'Saved addresses' : 'Cash collected',
              customer ? data.resourceCounts[0] || 0 : money(data.totals.collected),
              customer ? 'Ready for your next booking' : 'Verified payment records',
            ],
          ];
          return (
            <>
              <section className="welcome-banner">
                <div>
                  <span className="banner-kicker">
                    <span className="live-dot" />
                    {customer
                      ? 'EVERYDAY ESSENTIALS. MADE EASIER.'
                      : 'A CLEAR VIEW OF THE DAY AHEAD.'}
                  </span>
                  <h2>
                    {customer
                      ? 'Good days start with a full tank.'
                      : 'A smoother journey for every drop.'}
                  </h2>
                  <p>
                    {customer
                      ? 'Choose your capacity, pick a time, and leave the rest to us.'
                      : 'Review incoming requests, coordinate the fleet, and keep customers informed.'}
                  </p>
                  <Link to={customer ? '/app/book' : '/app/bookings'}>
                    {customer ? 'Plan your next delivery' : 'Review delivery queue'}
                    <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="banner-art" aria-hidden="true">
                  <Droplets size={90} strokeWidth={1} />
                  <span />
                  <span />
                </div>
              </section>
              <section className="stat-grid" aria-label="Booking statistics">
                {cards.map(([Icon, title, value, caption]) => (
                  <article className="stat-card" key={title}>
                    <div>
                      <span>{title}</span>
                      <Icon size={18} />
                    </div>
                    <strong>{value}</strong>
                    <small>{caption}</small>
                  </article>
                ))}
              </section>
              <div className="dashboard-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">WHAT’S NEXT</p>
                      <h2>{customer ? 'Your next delivery' : 'Recent active booking'}</h2>
                    </div>
                    <Truck size={20} className="muted" />
                  </div>
                  {active ? (
                    <div className="active-delivery">
                      <div className="row between">
                        <strong>{active.reference}</strong>
                        <Badge status={active.status} />
                      </div>
                      <h3>{active.capacity.toLocaleString()} litres of peace of mind.</h3>
                      <p>
                        <MapPin size={16} />
                        {active.address.street}, {active.address.area}
                      </p>
                      <p>
                        <CalendarDays size={16} />
                        {dateTime(active.scheduledAt)} PKT
                      </p>
                      <div className="delivery-progress">
                        <span className="done" />
                        <span
                          className={
                            ['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'DELIVERING'].includes(
                              active.status,
                            )
                              ? 'done'
                              : ''
                          }
                        />
                        <span
                          className={
                            ['EN_ROUTE', 'ARRIVED', 'DELIVERING'].includes(active.status)
                              ? 'done'
                              : ''
                          }
                        />
                        <span />
                      </div>
                      <TextLink to={`/app/bookings/${active._id}`}>View delivery details</TextLink>
                    </div>
                  ) : (
                    <Empty title="A little breathing room.">
                      No recent active deliveries.{' '}
                      {customer ? (
                        <Link to="/app/book">Schedule your next tanker.</Link>
                      ) : (
                        <Link to="/app/bookings">Check the complete booking queue.</Link>
                      )}
                    </Empty>
                  )}
                </section>
                <section className="panel quick-panel">
                  <p className="eyebrow">A SHORTCUT TO SORTED</p>
                  <h2>Make yourself at home.</h2>
                  <div className="quick-links">
                    {(customer
                      ? [
                          [
                            MapPin,
                            'Your saved places',
                            'Home, work, and everywhere else.',
                            '/app/addresses',
                          ],
                          [
                            ArrowDownToLine,
                            'Delivery history',
                            'Details and receipts, right here.',
                            '/app/bookings',
                          ],
                        ]
                      : [
                          [
                            Truck,
                            'Delivery queue',
                            'Follow each operational milestone.',
                            '/app/bookings',
                          ],
                          [
                            ClipboardList,
                            'Get assistance',
                            'Report a problem to the team.',
                            '/app/support',
                          ],
                        ]
                    ).map(([Icon, title, desc, to]) => (
                      <Link to={to} key={to}>
                        <span className="quick-icon">
                          <Icon size={20} />
                        </span>
                        <span>
                          <strong>{title}</strong>
                          <small>{desc}</small>
                        </span>
                        <ArrowRight size={16} />
                      </Link>
                    ))}
                  </div>
                  <div className="support-note">
                    <span className="live-dot" />
                    <p>
                      Need a hand? <Link to="/app/support">We’re here to help.</Link>
                    </p>
                  </div>
                </section>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">THE RECENT CHAPTER</p>
                    <h2>Recent bookings</h2>
                  </div>
                  <TextLink to="/app/bookings">View all bookings</TextLink>
                </div>
                {data.recent.length ? (
                  <div className="table-wrap" tabIndex={0} role="region" aria-label="Records">
                    <table>
                      <thead>
                        <tr>
                          <th>Booking</th>
                          <th>Delivery location</th>
                          <th>Capacity</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>
                            <span className="sr-only">Details</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recent.map((b) => (
                          <tr key={b._id}>
                            <td>
                              <Link className="table-reference" to={`/app/bookings/${b._id}`}>
                                {b.reference}
                              </Link>
                              <small>{dateTime(b.scheduledAt).split(',')[0]}</small>
                            </td>
                            <td>
                              {b.address.label}
                              <small>{b.address.area}</small>
                            </td>
                            <td>{b.capacity.toLocaleString()} L</td>
                            <td>{money(b.price.total)}</td>
                            <td>
                              <Badge status={b.status} />
                            </td>
                            <td>
                              <Link
                                className="icon-button"
                                to={`/app/bookings/${b._id}`}
                                aria-label={`View ${b.reference}`}
                              >
                                <ArrowRight size={17} />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty title="Your first delivery starts here.">
                    Bookings will appear as soon as you make one.
                  </Empty>
                )}
              </section>
            </>
          );
        }}
      </QueryState>
    </>
  );
}
