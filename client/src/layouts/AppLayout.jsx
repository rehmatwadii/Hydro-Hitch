import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MapPin,
  Menu,
  Settings2,
  ShieldCheck,
  Star,
  Truck,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../context/Auth';
import { Brand, ErrorNotice } from '../components/ui';
import { label } from '../api/client';
const common = [
  ['/app', 'Overview', LayoutDashboard],
  ['/app/bookings', 'Bookings', ClipboardList],
];
export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(window.matchMedia('(max-width: 760px)').matches);
  const [error, setError] = useState('');
  const location = useLocation();
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const resize = () => setCompact(media.matches);
    const escape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    media.addEventListener('change', resize);
    window.addEventListener('keydown', escape);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      media.removeEventListener('change', resize);
      window.removeEventListener('keydown', escape);
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  const admin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
  const ops = admin || user.role === 'DISPATCHER';
  const nav = [
    ...common,
    ...(user.role === 'CUSTOMER'
      ? [
          ['/app/book', 'Book a tanker', CalendarDays],
          ['/app/addresses', 'Saved addresses', MapPin],
        ]
      : []),
    ...(ops
      ? [
          ['/app/dispatch', 'Dispatch board', Truck],
          ['/app/fleet', 'Fleet & drivers', Users],
        ]
      : []),
    ...(admin
      ? [
          ['/app/users', 'People', Users],
          ['/app/payments', 'Payments', Wallet],
          ['/app/reports', 'Reports', ChartNoAxesCombined],
          ['/app/settings', 'Service settings', Settings2],
          ['/app/reviews', 'Ratings', Star],
          ['/app/audit', 'Audit trail', ShieldCheck],
        ]
      : []),
    ['/app/notifications', 'Notifications', Bell],
    ['/app/support', 'Help & support', LifeBuoy],
  ];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside
        id="workspace-navigation"
        className={`sidebar ${open ? 'is-open' : ''}`}
        inert={compact && !open}
      >
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-only"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <div className="workspace-label">
          <span className="live-dot" />
          {ops
            ? 'Operations workspace'
            : user.role === 'DRIVER'
              ? 'Driver workspace'
              : 'Customer workspace'}
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {nav.map(([to, title, Icon]) => (
            <NavLink key={to} to={to} end onClick={() => setOpen(false)}>
              <Icon size={19} />
              {title}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <DropletMark />
            <strong>Water, without the worry.</strong>
            <p>Your next delivery is a few clicks away.</p>
          </div>
          <NavLink to="/app/profile" className="user-panel">
            <span className="avatar">{user.name.slice(0, 1)}</span>
            <span>
              <strong>{user.name}</strong>
              <small>{label(user.role)}</small>
            </span>
          </NavLink>
          <button
            className="signout"
            onClick={async () => {
              try {
                await logout();
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      {open && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-only"
              aria-label="Open navigation"
              aria-expanded={open}
              aria-controls="workspace-navigation"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
            <span>Workspace</span>
            <span>/</span>
            <strong>{nav.find((n) => n[0] === location.pathname)?.[1] || 'Details'}</strong>
          </div>
          <div className="topbar-right">
            <span className="timezone">
              <MapPin size={14} />
              Karachi, PKT
            </span>
            <NavLink className="icon-button" to="/app/notifications" aria-label="Notifications">
              <Bell size={19} />
            </NavLink>
            <NavLink to="/app/profile" className="avatar small-avatar" aria-label="Your profile">
              {user.name[0]}
            </NavLink>
          </div>
        </header>
        <main id="main" className="main-content">
          {!online && (
            <ErrorNotice message="You are offline. Reconnect before submitting changes." />
          )}
          <ErrorNotice message={error} />
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>Hydro-Hitch v2 Retrofit</span>
          <span>Built around your next delivery.</span>
        </footer>
      </div>
    </div>
  );
}
function DropletMark() {
  return (
    <svg width="25" height="30" viewBox="0 0 25 30" aria-hidden="true">
      <path d="M12 1C8 8 2 13 2 19a10 10 0 0 0 20 0c0-6-6-11-10-18Z" fill="currentColor" />
    </svg>
  );
}
