# Changelog

## 2.0.0 Retrofit — 2026-09-25

### Added

- Unified customer, driver, dispatcher, administrator and super-administrator workspaces.
- Saved addresses, staged booking, server quotes, price snapshots, idempotency and controlled delivery lifecycle.
- Transactional driver/tanker reservations, availability/capacity validation, reassignment and delivery completion records.
- Password recovery, revocable sessions, notifications, complaints/questions, ratings, cash ledger and refunds.
- Real-data reports, filtering/pagination/sorting, printable receipts and administrator CSV exports.
- OpenAPI 3.1 endpoint contracts, health/readiness endpoints and structured request logs.
- Safe explicit development seed, legacy migration preview/import and administrator bootstrap CLI.
- Integration, concurrency, migration, browser and automated accessibility tests.
- Dockerfile, local Compose stack and GitHub Actions quality gates.

### Changed

- Two overlapping React frontends became one role-aware Vite app.
- Unsafe v1 routes became a versioned modular Express API using new `v2_` collections.
- Vendor self-service became centralized fleet/service operations; source vendor/product data is retained for reviewed migration.
- Original media and academic artifacts moved to `docs/legacy`.

### Security

- Removed committed working-tree secrets, raw-token storage, permissive authentication and client-supplied ownership/prices.
- Added backend role/ownership checks, strict request validation, CSRF/origin protection, secure production cookies, Helmet, payload caps and rate limiting.
- Replaced rich HTML injection paths with plain text; removed unsafe upload endpoints.
- Added transactional audit records and safe errors without stack traces or password/token fields.
- Replaced vulnerable dependency trees with pinned packages and one audited lockfile. Historical exposed credentials still require external revocation.

### Performance

- Route-split React bundle, local font assets, abortable requests and debounced server-side search.
- Indexed ownership/status/reference/schedule queries, bounded list responses and database aggregations.
- Compression and recorded local timing/query-plan evidence; no fabricated before/after runtime benchmarks.

### Fixed

- Cross-account order access, unauthenticated vendor administration, broken logout semantics and arbitrary status updates.
- Double booking/dispatch/payment risks, invalid date handling and unsafe response serialization.
- Strict embedded-document version handling on transaction retries and mobile table overflow.
- Broken route/quality-report controls, fake notification content and placeholder CRA test.

### Removed

- Create React App, duplicated admin template, parallel npm/yarn locks, overlapping component frameworks, rich editor and unused bcrypt implementations.
- Committed environment files, uploaded sample files in executable server paths, mock notifications and fabricated marketing metrics.

### Developer experience

- Root workspace scripts, generated local environment, clear role/seed instructions, migration/rollback notes and release verification report.
