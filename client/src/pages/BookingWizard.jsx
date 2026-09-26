import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Droplets, MapPin, Plus } from 'lucide-react';
import { useQuery } from '../hooks/useQuery';
import { api, money } from '../api/client';
import { ErrorNotice, Field, Modal, PageHeader, QueryState, Submit } from '../components/ui';
import { AddressForm } from './Addresses';
const steps = ['Delivery location', 'Tanker & water', 'Schedule & details', 'Review & confirm'];
export default function BookingWizard() {
  const location = useLocation();
  const navigate = useNavigate();
  const addresses = useQuery('/addresses');
  const catalog = useQuery('/catalog');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    addressId: '',
    capacity: location.state?.capacity || 2000,
    waterType: location.state?.waterType || 'Utility water',
    date: '',
    slot: '08:00-11:00',
    instructions: location.state?.instructions || '',
    urgent: false,
    promo: '',
    paymentMethod: 'COD',
  });
  const [adding, setAdding] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  const key = useRef(crypto.randomUUID());
  const quoteSequence = useRef(0);
  const selectedAddress = addresses.data?.find((a) => a._id === form.addressId);
  useEffect(() => {
    if (step === 0) return;
    const onLeave = (e) => {
      if (!created) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [step, created]);
  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setQuote(null);
    setQuoteError('');
    key.current = crypto.randomUUID();
  }
  async function next(e) {
    e.preventDefault();
    setError('');
    if (step === 0 && !selectedAddress) {
      setError('Choose a saved delivery address.');
      return;
    }
    if (step === 2) {
      const sequence = ++quoteSequence.current;
      setBusy(true);
      try {
        const price = await api('/pricing/quote', {
          method: 'POST',
          body: {
            capacity: form.capacity,
            waterType: form.waterType,
            area: selectedAddress.area,
            urgent: form.urgent,
            promo: form.promo,
          },
        });
        if (sequence === quoteSequence.current) {
          setQuote(price);
          setStep(3);
        }
      } catch (err) {
        setQuoteError(err.message);
      } finally {
        setBusy(false);
      }
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    try {
      const booking = await api('/bookings', {
        method: 'POST',
        body: { ...form, quoteRevision: quote.revision },
        headers: { 'Idempotency-Key': key.current },
      });
      setCreated(booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  if (created)
    return (
      <div className="booking-success panel">
        <span className="success-icon">
          <CheckCircle2 size={44} />
        </span>
        <p className="eyebrow">YOU’RE ALL SET</p>
        <h1>A full tank is on the way.</h1>
        <p>
          Your booking <strong>{created.reference}</strong> has been received.
          <br />
          We’ll update you when your delivery is confirmed.
        </p>
        <div className="success-summary">
          <span>
            {created.date} · {created.slot} PKT
          </span>
          <strong>{money(created.price.total)} · Cash on delivery</strong>
        </div>
        <button
          className="button"
          onClick={() => navigate(`/app/bookings/${created._id}`, { replace: true })}
        >
          View your booking
          <ArrowRight size={18} />
        </button>
        <Link to="/app">Back to overview</Link>
      </div>
    );
  return (
    <>
      <PageHeader
        eyebrow="YOUR NEXT DELIVERY"
        title="Let’s fill that tank."
        description="A few simple details. One less thing on your list."
      />
      <QueryState query={catalog}>
        {(rules) => (
          <div className="booking-layout">
            <section>
              <ol className="stepper">
                {steps.map((title, index) => (
                  <li
                    key={title}
                    className={index === step ? 'current' : index < step ? 'complete' : ''}
                  >
                    <span>{index < step ? <Check size={15} /> : index + 1}</span>
                    <small>{title}</small>
                  </li>
                ))}
              </ol>
              <div className="panel booking-form">
                <p className="eyebrow">STEP {step + 1} OF 4</p>
                <h2>{steps[step]}</h2>
                <ErrorNotice message={error || quoteError} />
                <form onSubmit={next}>
                  {step === 0 && (
                    <>
                      <p className="muted">Choose where we should bring your water.</p>
                      <QueryState query={addresses}>
                        {(items) => (
                          <div className="address-options">
                            {items.map((a) => (
                              <label
                                key={a._id}
                                className={`choice-card ${form.addressId === a._id ? 'selected' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name="address"
                                  value={a._id}
                                  checked={form.addressId === a._id}
                                  onChange={() => update('addressId', a._id)}
                                />
                                <MapPin size={20} />
                                <span>
                                  <strong>{a.label}</strong>
                                  <small>
                                    {a.street}
                                    <br />
                                    {a.area}, {a.city}
                                  </small>
                                </span>
                              </label>
                            ))}
                            {!items.length && (
                              <p>No saved addresses yet. Add your delivery location below.</p>
                            )}
                          </div>
                        )}
                      </QueryState>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => setAdding(true)}
                      >
                        <Plus size={16} />
                        Add new address
                      </button>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <fieldset>
                        <legend>Tanker capacity</legend>
                        <div className="capacity-options">
                          {rules.capacities.map((c) => (
                            <label
                              key={c.litres}
                              className={`choice-card ${form.capacity === c.litres ? 'selected' : ''}`}
                            >
                              <input
                                type="radio"
                                name="capacity"
                                checked={form.capacity === c.litres}
                                onChange={() => update('capacity', c.litres)}
                              />
                              <Droplets size={23} />
                              <strong>{c.litres.toLocaleString()} L</strong>
                              <small>{money(c.price)} + fees</small>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <Field label="Water category">
                        {(id) => (
                          <select
                            id={id}
                            value={form.waterType}
                            onChange={(e) => update('waterType', e.target.value)}
                          >
                            {rules.waterTypes.map((w) => (
                              <option key={w.name}>{w.name}</option>
                            ))}
                          </select>
                        )}
                      </Field>
                      <div className="notice neutral">{rules.qualityReport}</div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <div className="form-grid">
                        <Field
                          label="Delivery date"
                          type="date"
                          required
                          min={new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' })}
                          value={form.date}
                          onChange={(e) => update('date', e.target.value)}
                        />
                        <Field label="Delivery window (PKT)">
                          {(id) => (
                            <select
                              id={id}
                              value={form.slot}
                              onChange={(e) => update('slot', e.target.value)}
                            >
                              {['08:00-11:00', '11:00-14:00', '14:00-17:00', '17:00-20:00'].map(
                                (s) => (
                                  <option key={s}>{s}</option>
                                ),
                              )}
                            </select>
                          )}
                        </Field>
                      </div>
                      <Field label="Delivery instructions (optional)">
                        {(id) => (
                          <textarea
                            id={id}
                            rows={4}
                            maxLength={500}
                            value={form.instructions}
                            onChange={(e) => update('instructions', e.target.value)}
                            placeholder="Gate access, tank location, or anything we should know."
                          />
                        )}
                      </Field>
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={form.urgent}
                          onChange={(e) => update('urgent', e.target.checked)}
                        />
                        Priority handling (+{money(rules.urgentFee)}). Selected window still
                        applies.
                      </label>
                      <Field
                        label="Promo code (optional)"
                        value={form.promo}
                        maxLength={30}
                        onChange={(e) => update('promo', e.target.value)}
                      />
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <div className="review-details">
                        <div>
                          <span>Deliver to</span>
                          <strong>{selectedAddress?.label}</strong>
                          <p>
                            {selectedAddress?.street}, {selectedAddress?.area}
                          </p>
                        </div>
                        <div>
                          <span>Your tanker</span>
                          <strong>
                            {form.capacity.toLocaleString()} litres · {form.waterType}
                          </strong>
                        </div>
                        <div>
                          <span>Delivery window</span>
                          <strong>
                            {form.date} · {form.slot} PKT
                          </strong>
                        </div>
                        <div>
                          <span>Payment method</span>
                          <strong>Cash on delivery</strong>
                          <p>Pay after your delivery. No online payment is collected.</p>
                        </div>
                      </div>
                      <div className="notice neutral">
                        The slot is reserved when you confirm. You can cancel online before driver
                        assignment.
                      </div>
                    </>
                  )}
                  <div className="wizard-actions">
                    {step > 0 && (
                      <button
                        type="button"
                        className="button secondary"
                        disabled={busy}
                        onClick={() => {
                          setStep(step - 1);
                          setError('');
                        }}
                      >
                        <ArrowLeft size={16} />
                        Back
                      </button>
                    )}
                    <Submit busy={busy}>
                      {step === 3 ? 'Confirm booking' : 'Continue'}
                      <ArrowRight size={16} />
                    </Submit>
                  </div>
                </form>
              </div>
            </section>
            <aside className="panel booking-summary">
              <span className="quick-icon">
                <Droplets size={25} />
              </span>
              <h2>Your delivery, at a glance.</h2>
              <dl>
                <dt>Delivery location</dt>
                <dd>
                  {selectedAddress
                    ? `${selectedAddress.label} · ${selectedAddress.area}`
                    : 'Choose your location'}
                </dd>
                <dt>Tanker capacity</dt>
                <dd>{form.capacity.toLocaleString()} litres</dd>
                <dt>Water category</dt>
                <dd>{form.waterType}</dd>
                <dt>Scheduled for</dt>
                <dd>{form.date ? `${form.date}, ${form.slot}` : 'Choose a delivery window'}</dd>
              </dl>
              {quote ? (
                <div className="price-lines">
                  {[
                    ['Water & capacity', quote.base + quote.capacity + quote.water],
                    ['Service fee', quote.serviceFee],
                    ['Priority fee', quote.urgentFee],
                    ['Discount', -quote.discount],
                    ['Tax', quote.tax],
                  ].map(([name, value]) => (
                    <div key={name}>
                      <span>{name}</span>
                      <span>{money(value)}</span>
                    </div>
                  ))}
                  <div className="price-total">
                    <strong>Total</strong>
                    <strong>{money(quote.total)}</strong>
                  </div>
                </div>
              ) : (
                <p className="muted">Your full price is calculated before confirmation.</p>
              )}
              <p className="fine-print">Clear prices. No surprises at your door.</p>
            </aside>
          </div>
        )}
      </QueryState>
      {adding && (
        <Modal title="Add delivery location" onClose={() => setAdding(false)}>
          <AddressForm
            onSaved={(a) => {
              setAdding(false);
              addresses.reload();
              update('addressId', a._id);
            }}
          />
        </Modal>
      )}
    </>
  );
}
