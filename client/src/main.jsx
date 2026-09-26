import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/Auth';
import { ErrorBoundary, ErrorNotice, Loading } from './components/ui';
import AppLayout from './layouts/AppLayout';
import './styles.css';
const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Bookings = lazy(() => import('./pages/Bookings'));
const BookingDetail = lazy(() => import('./pages/BookingDetail'));
const BookingWizard = lazy(() => import('./pages/BookingWizard'));
const Addresses = lazy(() => import('./pages/Addresses'));
const Operations = lazy(() => import('./pages/Operations'));
const Settings = lazy(() => import('./pages/Settings'));
const Support = lazy(() => import('./pages/Support'));
const Profile = lazy(() => import('./pages/Profile'));
function Protected({ roles, children }) {
  const { user, loading, error, refresh } = useAuth();
  if (loading) return <Loading />;
  if (error)
    return (
      <main className="standalone">
        <ErrorNotice message={error} />
        <button className="button" onClick={refresh}>
          Retry connection
        </button>
      </main>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return (
      <main className="standalone">
        <h1>Access restricted</h1>
        <Link to="/app">Return to your dashboard</Link>
      </main>
    );
  return children;
}
const admins = ['ADMIN', 'SUPER_ADMIN'];
const ops = [...admins, 'DISPATCHER'];
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              {['login', 'register', 'forgot-password', 'reset-password'].map((path) => (
                <Route key={path} path={`/${path}`} element={<Auth key={path} />} />
              ))}
              <Route
                path="/app"
                element={
                  <Protected>
                    <AppLayout />
                  </Protected>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="bookings/:id" element={<BookingDetail />} />
                <Route
                  path="book"
                  element={
                    <Protected roles={['CUSTOMER']}>
                      <BookingWizard />
                    </Protected>
                  }
                />
                <Route
                  path="addresses"
                  element={
                    <Protected roles={['CUSTOMER']}>
                      <Addresses />
                    </Protected>
                  }
                />
                <Route
                  path="dispatch"
                  element={
                    <Protected roles={ops}>
                      <Bookings dispatch />
                    </Protected>
                  }
                />
                <Route
                  path="fleet"
                  element={
                    <Protected roles={ops}>
                      <Operations kind="fleet" />
                    </Protected>
                  }
                />
                {['users', 'payments', 'reports', 'reviews', 'audit'].map((kind) => (
                  <Route
                    key={kind}
                    path={kind}
                    element={
                      <Protected roles={admins}>
                        <Operations key={kind} kind={kind} />
                      </Protected>
                    }
                  />
                ))}
                <Route
                  path="settings"
                  element={
                    <Protected roles={admins}>
                      <Settings />
                    </Protected>
                  }
                />
                <Route
                  path="notifications"
                  element={<Support key="notifications" notifications />}
                />
                <Route path="support" element={<Support key="support" />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route
                path="*"
                element={
                  <main className="standalone">
                    <h1>That page has drifted away.</h1>
                    <p>We couldn’t find the page you’re looking for.</p>
                    <Link className="button" to="/">
                      Back to Hydro-Hitch
                    </Link>
                  </main>
                }
              />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
createRoot(document.getElementById('root')).render(<App />);
