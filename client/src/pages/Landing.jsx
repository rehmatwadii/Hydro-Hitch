import { ArrowRight, CheckCircle2, Droplets, MapPin, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brand } from '../components/ui';
export default function Landing() {
  return (
    <div className="landing">
      <header>
        <Brand />
        <nav aria-label="Public navigation">
          <Link to="/login">Sign in</Link>
          <Link className="button" to="/register">
            Get started
            <ArrowRight size={16} />
          </Link>
        </nav>
      </header>
      <main>
        <section className="landing-hero">
          <div>
            <p className="eyebrow">
              <span className="live-dot" /> WATER DELIVERY, SIMPLIFIED
            </p>
            <h1>
              Water at your door.
              <br />
              <span>
                Peace of mind,
                <br />
                on tap.
              </span>
            </h1>
            <p>
              From your first booking to the final drop, Hydro-Hitch keeps your home and business
              moving. The right tanker. A clear price. Your chosen time.
            </p>
            <div className="actions">
              <Link className="button" to="/register">
                Book your first delivery
                <ArrowRight size={18} />
              </Link>
              <Link className="button secondary" to="/login">
                Open your workspace
              </Link>
            </div>
            <div className="hero-points">
              <span>
                <CheckCircle2 size={16} />
                Transparent pricing
              </span>
              <span>
                <CheckCircle2 size={16} />
                Delivery updates
              </span>
            </div>
          </div>
          <div className="landing-illustration" aria-label="Illustration of a water tanker">
            <div className="illustration-label">
              <Droplets size={20} />
              Every drop, thoughtfully delivered.
            </div>
            <svg viewBox="0 0 500 360" role="img" aria-label="Hydro-Hitch water delivery tanker">
              <path d="M40 290H465" stroke="#adc7b4" strokeWidth="2" />
              <rect x="74" y="150" width="250" height="108" rx="48" fill="#d1e6d3" />
              <path d="M100 157c30 55 97 49 216 16v48c-100 22-169 39-222-5Z" fill="#9fcbb7" />
              <path d="M320 181h71l54 55v35H320Z" fill="#0b6159" />
              <path d="M338 195h44l33 36h-77Z" fill="#cce8de" />
              <path d="M85 260h352v15H85Z" fill="#183e3b" />
              <circle cx="146" cy="275" r="29" fill="#234742" />
              <circle cx="146" cy="275" r="13" fill="#eaf0e7" />
              <circle cx="382" cy="275" r="29" fill="#234742" />
              <circle cx="382" cy="275" r="13" fill="#eaf0e7" />
              <text
                x="140"
                y="211"
                fontFamily="system-ui"
                fontSize="21"
                fontWeight="700"
                fill="#0b6159"
              >
                HydroHitch
              </text>
              <path
                d="M220 48c-9 15-23 27-23 42a23 23 0 0 0 46 0c0-15-14-27-23-42Z"
                fill="#0b6159"
              />
              <path
                d="M48 109h67m-85 14h70m267 19h68"
                stroke="#afc5b6"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="illustration-caption">
              <MapPin size={17} />
              <span>
                Built for local delivery.
                <br />
                <strong>Designed around you.</strong>
              </span>
            </div>
          </div>
        </section>
        <section className="landing-benefits">
          {[
            [
              MapPin,
              'Your place, your schedule',
              'Save the places you care about and choose a delivery window that fits.',
            ],
            [
              Droplets,
              'The right amount, clearly priced',
              'Pick a capacity and water category. Review the full cost before you book.',
            ],
            [
              Truck,
              'Stay in the loop',
              'Follow actual delivery milestones, from confirmation to completion.',
            ],
          ].map(([Icon, title, description]) => (
            <article key={title}>
              <Icon size={26} />
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </section>
      </main>
      <footer>
        <Brand />
        <p>Modern water delivery, dispatch & tanker management.</p>
        <span>Hydro-Hitch v2 Retrofit</span>
      </footer>
    </div>
  );
}
