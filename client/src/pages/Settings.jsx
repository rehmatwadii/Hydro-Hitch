import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useQuery } from '../hooks/useQuery';
import { api } from '../api/client';
import { ErrorNotice, Field, PageHeader, QueryState, Submit } from '../components/ui';
function SettingsForm({ initial }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function updateRow(key, index, field, value) {
    update(
      key,
      form[key].map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const {
      _id: _id,
      __v: _v,
      createdAt: _created,
      updatedAt: _updated,
      key: _key,
      revision: _revision,
      ...body
    } = form;
    try {
      const result = await api('/admin/pricing', { method: 'PUT', body });
      setForm(result);
      setMessage('Service configuration saved. Existing booking prices are unchanged.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="settings-form">
      <ErrorNotice message={error} />
      {message && (
        <div className="notice success" role="status">
          {message}
        </div>
      )}
      <section className="panel detail-card">
        <h2>Pricing rules</h2>
        <p className="muted">All monetary amounts are whole Pakistani rupees (PKR).</p>
        <div className="form-grid">
          {[
            ['base', 'Base price'],
            ['serviceFee', 'Service fee'],
            ['urgentFee', 'Priority handling fee'],
            ['taxPercent', 'Tax percentage'],
            ['slotLimit', 'Maximum bookings per slot'],
          ].map(([key, title]) => (
            <Field
              key={key}
              label={title}
              type="number"
              min={key === 'slotLimit' ? 1 : 0}
              max={key === 'taxPercent' ? 100 : key === 'slotLimit' ? 1000 : 10000000}
              value={form[key]}
              required
              onChange={(e) => update(key, Number(e.target.value))}
            />
          ))}
        </div>
      </section>
      {[
        [
          'capacities',
          'Tanker capacities',
          [
            ['litres', 'Capacity (litres)', 'number'],
            ['price', 'Price (PKR)', 'number'],
          ],
          { litres: 3000, price: 4500 },
        ],
        [
          'waterTypes',
          'Water categories',
          [
            ['name', 'Category name', 'text'],
            ['surcharge', 'Surcharge (PKR)', 'number'],
          ],
          { name: 'New category', surcharge: 0 },
        ],
        [
          'promos',
          'Promo codes',
          [
            ['code', 'Code', 'text'],
            ['percent', 'Discount percentage', 'number'],
          ],
          { code: 'NEWCODE', percent: 5 },
        ],
      ].map(([key, title, fields, blank]) => (
        <section className="panel detail-card" key={key}>
          <h2>{title}</h2>
          {form[key].map((row, index) => (
            <div className="settings-row" key={index}>
              {fields.map(([field, fieldLabel, type]) => (
                <Field
                  key={field}
                  label={fieldLabel}
                  type={type}
                  required
                  value={row[field]}
                  min={0}
                  maxLength={40}
                  onChange={(e) =>
                    updateRow(
                      key,
                      index,
                      field,
                      type === 'number' ? Number(e.target.value) : e.target.value,
                    )
                  }
                />
              ))}
              <button
                className="icon-button"
                type="button"
                aria-label={`Remove ${title} row ${index + 1}`}
                onClick={() =>
                  update(
                    key,
                    form[key].filter((_, i) => i !== index),
                  )
                }
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            className="button secondary small"
            type="button"
            onClick={() => update(key, [...form[key], blank])}
          >
            <Plus size={15} />
            Add option
          </button>
        </section>
      ))}
      <section className="panel detail-card">
        <h2>Service areas & water quality</h2>
        <Field label="Service areas (one per line)">
          {(id) => (
            <textarea
              id={id}
              rows={5}
              value={form.areas.join('\n')}
              onChange={(e) => update('areas', e.target.value.split('\n'))}
              required
            />
          )}
        </Field>
        <Field label="Quality report / source information (plain text)">
          {(id) => (
            <textarea
              id={id}
              rows={5}
              maxLength={5000}
              value={form.qualityReport}
              onChange={(e) => update('qualityReport', e.target.value)}
            />
          )}
        </Field>
        <p className="fine-print">
          Only publish water-quality claims supported by current source documentation. Formatting is
          plain text.
        </p>
      </section>
      <Submit busy={busy}>Save service configuration</Submit>
    </form>
  );
}
export default function Settings() {
  const query = useQuery('/admin/pricing');
  return (
    <>
      <PageHeader
        eyebrow="SERVICE CONFIGURATION"
        title="The details behind every delivery."
        description="Manage prices, capacity options, coverage and quality information."
      />
      <QueryState query={query}>{(data) => <SettingsForm initial={data} />}</QueryState>
    </>
  );
}
