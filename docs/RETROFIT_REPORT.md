# Hydro-Hitch v2 Retrofit — delivery report

Date: 25 September 2026. Original baseline: `b93b561`. Local upgrade branch: `hydro-hitch-v2-retrofit`.

**Delivery status: working, tested local release candidate.** Customer, driver and operations workflows are implemented and exercised. Production rollout is not claimed: Docker runtime verification is blocked by this workstation's Docker engine, exposed legacy credentials require owner rotation, and external providers require configuration/implementation as detailed below. No remote push or deployment was performed.

## A. Original project audit

The original application combined a Create React App customer site, a second Vite admin/vendor frontend, and an Express 4/Mongoose backend. It supported customer/vendor registration and login, a vendor/product catalogue, client-calculated tanker orders, three order statuses, vendor approval, reviews, questions, complaint records and rich-text quality reports. Vendors also held super-administrator identity.

The audit inspected the repository inventory, application entrypoints, controllers, middleware, schemas, routes, client network/authentication flows, admin routes, shared components, styling/configuration and dependency locks. Original media/academic files are inventoried and retained in `docs/legacy`; they are not executable application code. See `docs/audit/original-inventory.json` for original paths, sizes and hashes.

| Aspect               | Hydro-Hitch v1                                                    | Hydro-Hitch v2                                                               |
| -------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Interfaces           | Two overlapping frontend apps                                     | One role-aware React application                                             |
| Auth                 | Inconsistent cookies, raw unbounded tokens, permissive middleware | Hashed revocable sessions, expiry, CSRF, live account/role checks            |
| Booking              | Caller supplies owner and price                                   | Ownership from session, server quote and immutable snapshot                  |
| Dispatch             | No driver/tanker scheduling model                                 | Transactional assignments and unique resource reservations                   |
| Order state          | Arbitrary pending/process/completed updates                       | Explicit validated lifecycle and terminal states                             |
| Data access          | Unbounded queries and cross-account ID access                     | Scoped queries, projections, pagination and indexes                          |
| Notifications        | Mock frontend notifications                                       | Actual persisted operational events                                          |
| Money                | Order value treated as sales                                      | Delivered value and verified cash collection distinguished                   |
| Validation/testing   | Minimal validation and placeholder tests                          | Strict contracts, real MongoDB integration, browser and accessibility checks |
| Developer experience | Three dependency trees, npm/yarn mix                              | Two workspaces, pinned dependencies and one npm lock                         |
| Deployment           | Hardcoded local URLs and embedded credentials                     | Validated environment, static production server, CI/Docker artifacts         |

## B. Significant problems discovered

- Committed `.env` files and inline database, SMTP and signing credentials. Authentication/password bodies, tokens and SMTP settings were logged.
- Vendor product mutation, vendor approval/status, quality reports and order-status operations were exposed without authentication/authorization.
- The user auth middleware called `next()` when tokens were absent or invalid. Customer order access trusted URL/body account IDs.
- Registration/login responses and unprojected populated documents could expose password hashes and raw tokens. Login null handling could dereference a missing vendor.
- Client-supplied price, user ID and delivery charges were accepted as authoritative. Orders lacked timestamps, schedule integrity, unique human references, idempotency and recorded price breakdowns.
- Status updates lacked transition constraints and operational ownership. Double assignment/payment protections did not exist.
- Rich quality-report HTML was rendered with `dangerouslySetInnerHTML`; the water-quality form called an absent backend route.
- Upload names incorporated original filenames, with incomplete type/size protections. New v2 workflows use no uploads.
- Unbounded arrays/queries, browser-side list filtering and repeated frameworks increased payload and maintenance costs.
- Fake notifications/testimonial/marketing content, empty components/controllers, hardcoded localhost endpoints and localStorage auth snapshots made the interface unreliable.
- Automatic startup seeding of privileged identity, missing production configuration, inconsistent response codes, raw exception responses, outdated build tooling and placeholder tests weakened operations.
- Baseline dependency audits reported 17 server findings (including 2 critical), 67 customer-client findings (3 critical), and 27 admin-client findings (1 critical). These are per-tree counts and are not necessarily distinct vulnerabilities.
- No tracked `node_modules` was found; mixed locks, sample uploads and large root artifacts still needed cleanup.

## C. Architectural changes

The MERN identity remains intact. The backend is a modular monolith with separate configuration, constants, validators, models, routes, controllers, business services and scripts. Express 5 handles rejected async operations centrally. Authentication uses standard random opaque session tokens rather than adding unnecessary JWT refresh infrastructure. Database session expiry/revocation is checked on every protected request.

The customer and admin interfaces were consolidated to share authentication, navigation, visual primitives and API behavior. Lazy pages keep role-specific screens out of the initial route payload. The fetch client applies credentials/CSRF consistently and handles expired sessions and network errors.

Data isolation uses new `v2_` collections. The retrofit intentionally operates as a centralized delivery service: independent vendor self-service and legacy product pricing are not silently remapped into driver privileges. Original supplier records remain available for a reviewed follow-up migration.

## D. Features implemented

**Customer:** registration/login/logout/recovery; profile/phone editing; up to 30 saved addresses and optional coordinates; four-stage location/capacity/water/schedule/review booking; promo/priority options; current server-calculated quote; reference confirmation; active delivery/recent history; cancellation before assignment; reorder with fresh confirmation; printable receipt; status timeline; in-app notifications; one rating/feedback per delivered booking; questions and complaints.

**Driver:** assigned-only booking visibility, delivery queue/history, tanker/customer/instruction details, address-based navigation, en-route/arrival/delivery/completion updates, recipient attestation, failure reasons and support requests. Navigation links are not live GPS tracking.

**Dispatch:** pending/confirmed booking queue, paginated filters/search/sorting, confirmation, available driver/tanker selection, capacity validation, reassignment, schedule collision prevention, active-delivery collision prevention and audited transitions.

**Administration:** accounts and suspension/roles; driver availability; tankers and maintenance status; pricing/capacity/water/promo/service-area rules; plain-text quality information; complaints/questions and responses; reviews; actual notification events; verified cash collection/refunds; audit trail; booking/status/daily reports and filtered CSV exports. The first super administrator has a separate explicit bootstrap CLI.

## E. Security improvements

- HttpOnly SameSite=Strict cookies, Secure in production; random session identifiers stored only as hashes; seven-day expiry; logout revocation; 30-minute one-time reset links; reset revokes all sessions.
- Independent role and ownership checks for every protected endpoint. Public registration cannot set roles. Customers cannot read/change other customers' bookings; drivers cannot read arbitrary assignments.
- Strict Zod request allowlists, safe ObjectId/date checks, bcrypt UTF-8 byte limits, bounded payloads and input lengths, escaped searches and no accepted rich HTML/upload content.
- Helmet/CSP, exact-origin CORS, origin checks, CSRF tokens, authentication/request rate limits, safe JSON errors, correlation IDs and logs without secrets.
- Audited administrative changes and manual payment verification, unique payment records, CSV formula escaping, no card storage and no fake payment success.
- Exposed secrets are removed from the current working tree; legacy Git history remains unchanged. Rotation/revocation and access review require the owners.

Design references: [Express production security guidance](https://expressjs.com/en/advanced/best-practice-security/) and [MongoDB atomicity/transactions guidance](https://www.mongodb.com/docs/v8.0/core/write-operations-atomicity/). The implementation uses established middleware and database constraints; it does not invent cryptography.

## F. Performance improvements and evidence

- One UI dependency stack replaces two overlapping framework-heavy frontends. Unused chart/editor/animation frameworks and CRA are removed.
- Main production JavaScript is approximately **283 kB / 91 kB gzip**, with pages split into separate chunks. CSS is approximately **30 kB / 7 kB gzip**; fonts are self-hosted, avoiding external font requests and CSP exceptions.
- List endpoints are paginated with a 100-item maximum. Exports are capped at 10,000 matching rows. Related records use bounded population rather than one request per rendered row.
- Indexes support reference/ownership/status/driver/schedule queries; dashboard totals and date/status summaries use MongoDB aggregations. The dashboard queries upcoming work independently of its five recent bookings.
- `docs/verification/performance.json` records reproducible warm local endpoint timings and an indexed customer-booking query. The initial sample returned four rows after examining four index keys and four documents. Results use a small local fixture and do not imply production throughput.
- No trustworthy v1 runtime benchmark was possible without running its unsafe hardcoded configuration; no fabricated speedup percentage or Core Web Vitals claim is made.

## G. UI/UX and accessibility

The redesign uses restrained green surfaces, local DM Sans/Manrope fonts, Lucide icons, reusable cards/badges/fields, responsive navigation and consistent spacing. Screens include real empty/loading/error states, retries, disabled submissions, modal confirmations, visible focus, copy-reference controls, password visibility, receipt printing and offline feedback.

The booking form preserves state between steps and warns before leaving the browser with an in-progress booking. A pricing revision mismatch forces review instead of silently charging a changed amount. Tables scroll within their own named keyboard-focusable region. Mobile navigation is inert while closed and supports Escape. The 320px overflow bug found during testing was fixed by containing visually hidden table labels correctly.

Automated axe checks found no WCAG A/AA violations on the tested landing, login and customer-dashboard screens after contrast/link fixes. This is bounded test evidence, not a complete accessibility certification or manual assistive-technology audit.

## H. Database and migration

Entities: User, Session, ResetToken, Address, Tanker, Pricing, Booking, Reservation, SlotUsage, Counter, Notification, AuditLog, Ticket, Review and Payment. Indexes include unique email/reference/idempotency/resource-slot/payment/review constraints plus TTL indexes for sessions/reset tokens/notifications. Embedded booking history is bounded by the lifecycle and reassignment limit.

Booking creation atomically reserves slot capacity, increments references, stores immutable address/price snapshots and writes a notification. Dispatch atomically checks resource status and updates reservations/booking/audit/notifications. Terminal states release resource reservations. Parent-document versioning and retry-safe embedded schemas handle competing requests.

Migration defaults to dry-run, does not create target collections/indexes in CLI dry-run mode, preserves source records, prevents email-collision privilege mistakes and does not reuse compromised passwords. Completed historical bookings and mapped questions/complaints import idempotently. Unknown schedules/settlement remain unknown. Open legacy orders, vendor/product accounts and exact gallon-standard mapping require manual review. See [MIGRATION.md](MIGRATION.md).

## I. Testing results

| Check                                       | Result                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| API/unit/concurrency/migration suite        | 26 passing tests                                                          |
| Browser workflows and automated WCAG checks | 5 passing tests                                                           |
| Lint                                        | Pass                                                                      |
| Production React build                      | Pass                                                                      |
| Production configuration smoke              | Pass; built assets/deep links, CSP, Secure/HttpOnly cookie flags          |
| Dependency audit                            | Zero findings in the replacement dependency tree                          |
| Frontend/backend/database runtime           | Started; frontend HTTP 200 and database readiness confirmed               |
| OpenAPI and endpoint reference              | Load successfully                                                         |
| 320px layout                                | No document-level horizontal overflow in tested dashboard/address screens |
| Compose configuration                       | Parses successfully                                                       |
| Docker image build/container execution      | Unverified: workstation engine returns HTTP 500                           |

API tests cover registration and duplicate registration, auth expiry/suspension/deletion, CSRF/origin/JSON/payload validation, role restrictions, client-price rejection, ownership/IDOR, duplicate and six-way concurrent bookings, stale quotes, dates, transitions, unavailable/undersized resources, schedule conflicts, completed delivery/recipient proof, duplicate cash records, ratings, frozen prices, full slots/cancellation capacity release, pagination, real totals, exports, password reset/replay, logout and safe database-failure responses. Migration tests cover preview/apply/repeat safety.

Browser tests cover registration, login/logout, booking review/confirmation/receipt/cancellation/reorder, account editing, network failure/retry, support, notifications, fleet creation, report viewing, driver role restrictions and mobile navigation. They run against an isolated actual MongoDB replica set. No real email/SMS/payment provider is contacted.

## J. DevOps

Root scripts, environment validation/examples, one lockfile, ignored local runtime/output, multi-stage nonroot Docker runtime, local replica-set Compose configuration, health checks and GitHub Actions gates are provided. CI includes formatting, lint, API/migration tests, frontend build, production smoke, audit, browser tests and image build. There is no automatic deploy or remote push.

## K. Dependencies

React/React DOM/Router, Vite, Node/Express and Mongoose were updated while retaining JavaScript/MERN. Lucide supplies icons; local font packages supply reproducible typography. bcryptjs replaces three overlapping/misspelled bcrypt packages. Zod provides request/OpenAPI schemas; Helmet, express-rate-limit, cookie-parser and CORS enforce boundaries; compression reduces responses; Pino provides structured logs; Nodemailer supports configurable recovery mail.

Node's test runner, Supertest and mongodb-memory-server test the actual API/database. Playwright and axe test user workflows/accessibility. ESLint/React hooks/JSX accessibility plugins and Prettier enforce consistency. ESLint 9 is pinned for the accessibility plugin's supported peer range; its support warning is recorded as maintenance debt. Package versions are pinned to the installed lockfile.

Removed: CRA/react-scripts, duplicated MUI/Ant/Emotion/styled-components stacks, ApexCharts/faker mock notifications, Quill HTML editing, Multer upload surface, duplicate bcrypt/native packages, JWT/raw-token handling, Leaflet's unrelated default-map behavior, animation/marketing helpers and mixed yarn locks.

## L. Important file changes

- `server/src/app.js`, `index.js`: secure middleware, errors, observability, startup and production serving.
- `server/src/services/`: sessions, price calculation, transactional booking/dispatch and integration boundaries.
- `server/src/models/index.js`, `validators/index.js`, `routes/api.js`: persistence, strict contracts and generated API reference.
- `server/src/scripts/`: explicit seed, migration and administrator bootstrap.
- `client/src/`: unified app, layouts, features, API client, local fonts and responsive design system.
- `server/tests`, `tests/e2e`, `scripts/smoke-production.mjs`, `scripts/performance.mjs`: executable verification.
- Root package/workspace/format/lint files, `Dockerfile`, `compose.yaml`, `.github/workflows/ci.yml`, `.env.example`, `.gitignore`.
- README, changelog, audit inventory/baselines, migration/deployment guides, screenshots and verification evidence.
- Old executable customer/admin/server files are replaced; source history is retained. Original presentation/video/academic artifacts are moved to `docs/legacy`.

## M. Remaining limitations

1. Original exposed credentials remain compromised until their owners rotate them. History rewriting was not performed.
2. Docker build/runtime still needs a working engine. Actual TLS/proxy hosting, production database authorization, SMTP delivery, backups, restore drills and monitoring need operator validation.
3. Bank/digital gateways, live GPS, SMS and push are not implemented. Their availability is honestly disabled; no placeholder control claims success. Only the mail/navigation/COD boundaries are implemented.
4. Vendor self-service/catalogue migration is a deliberate centralized-operations change, not full backwards API compatibility. Original records are retained; supplier/product reconciliation remains.
5. Advanced demand/retention/fulfillment/utilization reporting and distance-aware dispatch are future work. Current reports use actual stored data.
6. No PWA/offline data cache, image uploads, photo/signature proof, multi-instance shared rate limiter or formal penetration test is included.
7. Bootstrap pricing/coverage is illustrative and must be reviewed. Water quality is plain-text information, not a certification guarantee. The service assumes named areas and operator-reviewed addresses rather than polygon geofencing.
8. A full manual WCAG/device-browser audit, large-load benchmark and live-data migration rehearsal remain outside local verification.

## N. Exact run instructions

From the `Hydro-Hitch` directory:

```sh
npm ci
npm run setup
npm run dev -- --local-db --seed
```

Open http://localhost:5173. API/reference: http://localhost:8001/api/docs. `setup` preserves an existing `.env`; on a clean machine it generates a local demo password. Use the same hostname consistently for cookie/origin checks.

## O. Exact test instructions

```sh
npm test
npm run lint
npm run format:check
npm run build
npm run test:production
npx playwright install chromium
npm run test:e2e
npm audit --audit-level=moderate
npm run perf
docker compose config --quiet
```

## P. Demo accounts

`customer@hydrohitch.test`, `admin@hydrohitch.test`, `dispatch@hydrohitch.test`, `driver@hydrohitch.test`, `driver2@hydrohitch.test`. All use the generated local `SEED_PASSWORD` in ignored `.env`. There is no committed reusable production password. Isolated test fixtures use explicit test-only credentials and are not installed in the development database.

## Q. Deployment instructions

Follow [DEPLOYMENT.md](DEPLOYMENT.md). Build the Docker image or build/start Node directly. Configure authenticated replica-set MongoDB, exact HTTPS `CLIENT_URL`, `NODE_ENV=production`, the correct trusted proxy count, SMTP and host limits/health checks. Bootstrap the first administrator using injected temporary environment values, review coverage/pricing and complete the unresolved runtime/security/provider gates before accepting real orders.

This report separates demonstrated behavior from production/external-service work still required. It does not label unconfigured providers, historical data guesses or an unexecuted Docker build as finished functionality.
