# Retrofit implementation record

Baseline: upstream commit `b93b561`. Upgrade branch: `hydro-hitch-v2-retrofit`.

## Audit and decisions

The repository contains a CRA customer React app, Vite admin React app, and CommonJS Express/Mongoose API. Original collections: users, venders (also super admins), products, customerorders, questions, userreportvendors, admins. Customer booking, vendor catalogue, reviews, questions, quality reports and order management are useful workflows to preserve and adapt.

Critical findings: committed environment files and inline database/SMTP/JWT credentials; permissive authentication middleware; unauthenticated vendor writes and administration; caller-supplied ownership and prices; unrestricted status changes; unsanitized quality-report HTML; password/token leakage from whole-document responses and logs; sessions without expiry/revocation; unbounded list endpoints, reviews and tokens; no assignment/schedule integrity; automatic super-admin seeding; no meaningful tests. Two component ecosystems are duplicated in both frontends. Notifications and marketing metrics are fabricated. Hardcoded localhost URLs, broken water-quality endpoint, empty controllers/components, missing root README, mixed npm/yarn locks, CRA tooling and old dependency trees impede deployment. No tracked node_modules was found.

## Implementation sequence

1. Record audit, dependency baseline and source inventory; retain original Git history.
2. Remove unsafe legacy executable paths and secrets from working tree; consolidate npm workspaces.
3. Modular v2 API: validated configuration, opaque revocable sessions, RBAC, pricing, booking, dispatch, operational resources and audit logs.
4. New v2-prefixed collections, explicit legacy migration, transaction-based integrity and indexes.
5. Unified React experience with customer, driver, dispatcher and administrator views; retain catalogue, questions, reviews and quality reporting as service/support workflows.
6. API integration and browser workflow tests, lint, formatting, build, audits and performance evidence.
7. Development seed/runtime, Docker, CI, API reference, migration/runbook and final evidence report.

## Backup / rollback strategy

Original code remains recoverable at `b93b561`; do not run it against live infrastructure. Do not rewrite published history as part of this retrofit. Treat historical credentials as compromised and rotate externally. Never connect to the committed database URI. New schemas use `v2_` collections. Migration must default to dry-run, never delete source documents, never promote vendor accounts to administrator automatically, and retain source identifiers. Take an operator-controlled database snapshot before importing live data. Rollback should restore a validated snapshot and a secured previous release; the vulnerable v1 server is not a safe production rollback.

## Integration boundaries

Cash on delivery is operational. Unconfigured digital payments, SMS, push and GPS must clearly report unavailable. Password reset uses configured SMTP or a development-only local outbox. No real messages are sent during development tests. Seed is explicit and forbidden in production.
