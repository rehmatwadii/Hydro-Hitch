import { useState } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useQuery } from '../hooks/useQuery';
import { api } from '../api/client';
import { Empty, ErrorNotice, Field, Modal, PageHeader, QueryState, Submit } from '../components/ui';
export function AddressForm({ initial = {}, onSaved, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const catalog = useQuery('/catalog');
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const input = Object.fromEntries(new FormData(e.currentTarget));
    for (const key of ['latitude', 'longitude']) {
      if (input[key] === '') delete input[key];
      else input[key] = Number(input[key]);
    }
    try {
      const result = await api(initial._id ? `/addresses/${initial._id}` : '/addresses', {
        method: initial._id ? 'PATCH' : 'POST',
        body: input,
      });
      onSaved(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <ErrorNotice message={error} />
      <Field
        label="Address label"
        name="label"
        placeholder="Home, office…"
        defaultValue={initial.label}
        required
        maxLength={40}
      />
      <Field
        label="Street address"
        name="street"
        defaultValue={initial.street}
        placeholder="House, street and block"
        required
        minLength={3}
        maxLength={240}
      />
      <div className="form-grid">
        <Field label="Service area">
          {(id) => (
            <select id={id} name="area" defaultValue={initial.area || ''} required>
              <option value="">Choose an area</option>
              {catalog.data?.areas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          )}
        </Field>
        <Field
          label="City"
          name="city"
          defaultValue={initial.city || 'Karachi'}
          required
          maxLength={80}
        />
      </div>
      <Field label="Delivery instructions (optional)">
        {(id) => (
          <textarea
            id={id}
            name="instructions"
            defaultValue={initial.instructions}
            maxLength={500}
            rows={3}
          />
        )}
      </Field>
      <details>
        <summary>Coordinates (optional, for navigation)</summary>
        <div className="form-grid">
          <Field
            label="Latitude"
            name="latitude"
            type="number"
            step="any"
            min={-90}
            max={90}
            defaultValue={initial.latitude}
          />
          <Field
            label="Longitude"
            name="longitude"
            type="number"
            step="any"
            min={-180}
            max={180}
            defaultValue={initial.longitude}
          />
        </div>
      </details>
      <div className="actions">
        <Submit busy={busy}>Save address</Submit>
        {onCancel && (
          <button type="button" className="button secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
      <ErrorNotice message={catalog.error} />
    </form>
  );
}
export default function Addresses() {
  const query = useQuery('/addresses');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function remove() {
    setBusy(true);
    try {
      await api(`/addresses/${deleting._id}`, { method: 'DELETE' });
      setDeleting(null);
      query.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="PLACES THAT MATTER"
        title="Saved addresses"
        description="A familiar place. A faster booking."
        action={
          <button className="button" onClick={() => setEditing({})}>
            <Plus size={18} />
            Add address
          </button>
        }
      />
      <ErrorNotice message={error} />
      <QueryState query={query}>
        {(data) =>
          data.length ? (
            <div className="address-grid">
              {data.map((a) => (
                <article className="panel address-card" key={a._id}>
                  <div className="row between">
                    <span className="quick-icon">
                      <MapPin size={22} />
                    </span>
                    <div className="row">
                      <button
                        className="icon-button"
                        aria-label={`Edit ${a.label}`}
                        onClick={() => setEditing(a)}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Remove ${a.label}`}
                        onClick={() => setDeleting(a)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                  <h2>{a.label}</h2>
                  <p>
                    {a.street}
                    <br />
                    {a.area}, {a.city}
                  </p>
                  <small className="muted">{a.instructions || 'No additional instructions'}</small>
                </article>
              ))}
            </div>
          ) : (
            <Empty title="Where should we deliver?">Add your first address to get started.</Empty>
          )
        }
      </QueryState>
      {editing && (
        <Modal
          title={editing._id ? 'Edit address' : 'Add an address'}
          onClose={() => setEditing(null)}
        >
          <AddressForm
            initial={editing}
            onSaved={() => {
              setEditing(null);
              query.reload();
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
      {deleting && (
        <Modal title={`Remove ${deleting.label}?`} onClose={() => setDeleting(null)}>
          <p>Existing bookings will keep their original delivery details.</p>
          <div className="actions">
            <button className="button danger" onClick={remove} disabled={busy}>
              Remove address
            </button>
            <button className="button secondary" onClick={() => setDeleting(null)}>
              Keep address
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
