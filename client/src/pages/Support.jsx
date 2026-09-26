import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Check, Plus } from 'lucide-react';
import { useAuth } from '../context/Auth';
import { useQuery } from '../hooks/useQuery';
import { api, dateTime, label } from '../api/client';
import {
  Badge,
  Empty,
  ErrorNotice,
  Field,
  Modal,
  PageHeader,
  Pagination,
  QueryState,
  Submit,
} from '../components/ui';
export default function Support({ notifications = false }) {
  const location = useLocation();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const query = useQuery(`/${notifications ? 'notifications' : 'tickets'}?page=${page}`);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const ops = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(user.role);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    if (!body.booking) delete body.booking;
    try {
      await api(editing._id ? `/tickets/${editing._id}` : '/tickets', {
        method: editing._id ? 'PATCH' : 'POST',
        body,
      });
      setEditing(null);
      query.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow={notifications ? 'STAY IN THE LOOP' : 'WE’RE HERE TO HELP'}
        title={notifications ? 'Notifications' : 'Help & support'}
        description={
          notifications
            ? 'Real updates from your Hydro-Hitch workspace.'
            : 'Ask a question or report a delivery problem.'
        }
        action={
          !notifications && (
            <button
              className="button"
              onClick={() => {
                setError('');
                setEditing({});
              }}
            >
              <Plus size={17} />
              New support request
            </button>
          )
        }
      />
      <ErrorNotice message={!editing ? error : ''} />
      <QueryState query={query}>
        {(data) => (
          <section className="panel">
            {data.items.length ? (
              data.items.map((item) => (
                <article
                  className={`message-row ${!item.read && notifications ? 'unread' : ''}`}
                  key={item._id}
                >
                  {notifications ? (
                    <>
                      <span className="quick-icon">
                        <Bell size={19} />
                      </span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.body}</p>
                        <small>{dateTime(item.createdAt)}</small>
                        {item.booking && (
                          <Link to={`/app/bookings/${item.booking}`}>View booking</Link>
                        )}
                      </div>
                      {!item.read && (
                        <button
                          className="icon-button"
                          aria-label={`Mark ${item.title} read`}
                          onClick={async () => {
                            try {
                              await api(`/notifications/${item._id}`, {
                                method: 'PATCH',
                                body: {},
                              });
                              query.reload();
                            } catch (e) {
                              setError(e.message);
                            }
                          }}
                        >
                          <Check size={19} />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="row">
                          <Badge status={item.status} />
                          <small>
                            {label(item.kind)} · {dateTime(item.createdAt)}
                          </small>
                        </div>
                        <h3>{item.subject}</h3>
                        <p className="preserve-lines">{item.message}</p>
                        {item.response && (
                          <div className="notice neutral">
                            <strong>Support response: </strong>
                            {item.response}
                          </div>
                        )}
                        {ops && (
                          <button
                            className="button secondary small"
                            onClick={() => {
                              setError('');
                              setEditing(item);
                            }}
                          >
                            Respond
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </article>
              ))
            ) : (
              <Empty title={notifications ? 'You’re all caught up.' : 'No support requests yet.'}>
                {notifications
                  ? 'Delivery and account updates will appear here.'
                  : 'We’ll keep your questions and responses together here.'}
              </Empty>
            )}
            <Pagination data={data} page={page} setPage={setPage} />
          </section>
        )}
      </QueryState>
      {editing && (
        <Modal
          title={editing._id ? 'Respond to request' : 'How can we help?'}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={submit}>
            <ErrorNotice message={error} />
            {editing._id ? (
              <>
                <Field label="Response">
                  {(id) => (
                    <textarea
                      id={id}
                      name="response"
                      defaultValue={editing.response}
                      required
                      minLength={3}
                      maxLength={2000}
                      rows={5}
                    />
                  )}
                </Field>
                <Field label="Status">
                  {(id) => (
                    <select id={id} name="status" defaultValue={editing.status}>
                      <option value="OPEN">Open</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  )}
                </Field>
              </>
            ) : (
              <>
                <Field label="Request type">
                  {(id) => (
                    <select id={id} name="kind">
                      <option value="QUESTION">Question</option>
                      <option value="COMPLAINT">Delivery problem / complaint</option>
                    </select>
                  )}
                </Field>
                <Field label="Subject" name="subject" required minLength={3} maxLength={100} />
                <Field label="Message">
                  {(id) => (
                    <textarea
                      id={id}
                      name="message"
                      required
                      minLength={5}
                      maxLength={2000}
                      rows={5}
                    />
                  )}
                </Field>
                {location.state?.booking && (
                  <input type="hidden" name="booking" value={location.state.booking} />
                )}
              </>
            )}
            <Submit busy={busy}>{editing._id ? 'Send response' : 'Submit request'}</Submit>
          </form>
        </Modal>
      )}
    </>
  );
}
