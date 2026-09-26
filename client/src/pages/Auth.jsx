import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, ShieldCheck, Truck, Waves } from 'lucide-react';
import { useAuth } from '../context/Auth';
import { api } from '../api/client';
import { Brand, ErrorNotice, Field, Submit } from '../components/ui';
export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, accept } = useAuth();
  const mode = location.pathname;
  const register = mode === '/register';
  const forgot = mode === '/forgot-password';
  const reset = mode === '/reset-password';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  if (user && !reset) return <Navigate to="/app" replace />;
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const input = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (forgot) {
        const result = await api('/auth/forgot-password', { method: 'POST', body: input });
        setMessage(result.message);
      } else if (reset) {
        await api('/auth/reset-password', {
          method: 'POST',
          body: { ...input, token: location.hash.slice(1) },
        });
        navigate('/login', { replace: true });
      } else {
        const result = await api(register ? '/auth/register' : '/auth/login', {
          method: 'POST',
          body: input,
        });
        accept(result);
        navigate('/app');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <section className="auth-story">
        <Brand />
        <div>
          <p className="eyebrow">A BETTER WAY TO WATER</p>
          <h1>
            One less thing
            <br />
            to worry about.
          </h1>
          <p>
            Reliable water delivery for your home and business. Book it. Follow it. Get on with your
            day.
          </p>
          <div className="water-art">
            <Waves size={150} strokeWidth={0.8} />
            <span className="water-orbit" />
            <Truck size={66} strokeWidth={1.2} />
          </div>
        </div>
        <p className="auth-note">
          <ShieldCheck size={18} />
          Thoughtfully built for everyday essentials.
        </p>
      </section>
      <main className="auth-form-panel">
        <Link to="/" className="text-link">
          <ArrowLeft size={16} />
          Back to home
        </Link>
        <div className="auth-form">
          <p className="eyebrow">HYDRO-HITCH V2 RETROFIT</p>
          <h1>
            {register
              ? 'Make room for easier days.'
              : forgot
                ? 'Forgot your password?'
                : reset
                  ? 'Choose a new password.'
                  : 'Welcome back.'}
          </h1>
          <p className="muted">
            {register
              ? 'Create an account to start your first delivery.'
              : forgot
                ? 'We’ll send you a link to reset it.'
                : reset
                  ? 'Use at least 12 characters.'
                  : 'Sign in to keep your water flowing.'}
          </p>
          <ErrorNotice message={error} />
          {message && (
            <div className="notice success" role="status">
              {message}
            </div>
          )}
          <form onSubmit={submit} key={mode}>
            {register && (
              <>
                <Field label="Full name" name="name" autoComplete="name" required maxLength={100} />
                <Field
                  label="Phone number"
                  name="phone"
                  autoComplete="tel"
                  type="tel"
                  required
                  maxLength={24}
                />
              </>
            )}
            {!reset && (
              <Field
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            )}{' '}
            {!forgot && (
              <div className="password-field">
                <Field
                  label="Password"
                  name="password"
                  type={show ? 'text' : 'password'}
                  autoComplete={register || reset ? 'new-password' : 'current-password'}
                  required
                  minLength={register || reset ? 12 : 1}
                  maxLength={72}
                />
                <button
                  type="button"
                  className="icon-button password-toggle"
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}
            {!register && !forgot && !reset && (
              <Link className="forgot-link" to="/forgot-password">
                Forgot password?
              </Link>
            )}
            <Submit busy={busy}>
              {register
                ? 'Create account'
                : forgot
                  ? 'Send reset link'
                  : reset
                    ? 'Update password'
                    : 'Sign in'}
            </Submit>
          </form>
          <p className="auth-switch">
            {register ? 'Already have an account?' : 'New to Hydro-Hitch?'}{' '}
            <Link to={register ? '/login' : '/register'}>
              {register ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
          <p className="fine-print">
            Your session stays private and can be securely signed out on this device.
          </p>
        </div>
      </main>
    </div>
  );
}
