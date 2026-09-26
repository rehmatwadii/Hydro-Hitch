import { Component, useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Check, Copy, Droplets, LoaderCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { label } from '../api/client';
export function Brand() {
  return (
    <Link className="brand" to="/">
      <span className="brand-mark">
        <Droplets size={23} />
      </span>
      <span>
        Hydro<span className="brand-light">Hitch</span>
        <small>V2 RETROFIT</small>
      </span>
    </Link>
  );
}
export function Badge({ status }) {
  return <span className={`badge badge-${status?.toLowerCase()}`}>{label(status)}</span>;
}
export function ErrorNotice({ message }) {
  return message ? (
    <div className="notice error" role="alert">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  ) : null;
}
export function Loading() {
  return (
    <div className="skeleton-wrap" role="status" aria-label="Loading">
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
export function QueryState({ query, children }) {
  if (query.loading && !query.data) return <Loading />;
  if (query.error)
    return (
      <div>
        <ErrorNotice message={query.error} />
        <button className="button secondary" onClick={query.reload}>
          Try again
        </button>
      </div>
    );
  return query.data ? children(query.data) : null;
}
export function Empty({ title = 'Nothing here yet', children, action }) {
  return (
    <div className="empty">
      <Droplets size={30} />
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Field({ label: title, error, children, ...props }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{title}</label>
      {children ? children(id) : <input id={id} {...props} aria-invalid={!!error} />}{' '}
      {error && <small className="text-error">{error}</small>}
    </div>
  );
}
export function Submit({ busy, children = 'Save changes' }) {
  return (
    <button type="submit" className="button" disabled={busy}>
      {busy ? (
        <>
          <LoaderCircle size={16} className="spin" />
          Saving…
        </>
      ) : (
        children
      )}
    </button>
  );
}
export function Pagination({ data, page, setPage }) {
  return (
    <div className="pagination">
      <span>
        {data.total} results · Page {page} of {data.pages}
      </span>
      <div>
        <button
          className="button secondary small"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <button
          className="button secondary small"
          disabled={page >= data.pages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
export function Modal({ title, onClose, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    const el = dialog.current;
    el.showModal();
    return () => el.close();
  }, []);
  return (
    <dialog ref={dialog} className="modal" onCancel={onClose} aria-labelledby="modal-title">
      <div className="modal-heading">
        <h2 id="modal-title">{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="Close dialog">
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function CopyButton({ value }) {
  const [state, setState] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState('Copied');
    } catch {
      setState('Select and copy the reference above.');
    }
  }
  return (
    <button className="button secondary small" onClick={copy}>
      {state === 'Copied' ? <Check size={14} /> : <Copy size={14} />} {state || 'Copy reference'}
    </button>
  );
}
export function TextLink({ to, children }) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <ArrowRight size={15} />
    </Link>
  );
}
export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="standalone">
          <h1>Something went wrong</h1>
          <p>Your saved bookings are safe. Reload to try again.</p>
          <button className="button" onClick={() => window.location.reload()}>
            Reload application
          </button>
        </main>
      );
    return this.props.children;
  }
}
