import { useState } from 'react';
import { useAuth } from '../context/Auth';
import { api, label } from '../api/client';
import { ErrorNotice, Field, PageHeader, Submit } from '../components/ui';
export default function Profile() {
  const { user, setUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      setUser(
        await api('/users/me', {
          method: 'PATCH',
          body: Object.fromEntries(new FormData(e.currentTarget)),
        }),
      );
      setMessage('Profile updated.');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="YOUR ACCOUNT"
        title="Make it yours."
        description="Keep your contact details up to date for smooth deliveries."
      />
      <section className="panel profile-panel">
        <div className="row">
          <span className="avatar large-avatar">{user.name[0]}</span>
          <div>
            <h2>{user.name}</h2>
            <p className="muted">
              {label(user.role)} · {user.email}
            </p>
          </div>
        </div>
        <ErrorNotice message={error} />
        {message && (
          <div className="notice success" role="status">
            {message}
          </div>
        )}
        <form onSubmit={submit}>
          <Field label="Full name" name="name" defaultValue={user.name} required maxLength={100} />
          <Field
            label="Phone number"
            name="phone"
            defaultValue={user.phone}
            required
            type="tel"
            maxLength={24}
          />
          <Submit busy={busy} />
        </form>
      </section>
    </>
  );
}
