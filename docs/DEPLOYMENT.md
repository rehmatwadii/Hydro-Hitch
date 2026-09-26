# Deployment and operations

## Release gates

```sh
npm ci
npm run lint
npm run format:check
npm test
npm run build
npm audit --audit-level=moderate
npx playwright install chromium
npm run test:e2e
docker compose config
docker build -t hydro-hitch:v2 .
```

On the retrofit workstation the Node application and MongoDB workflows were executed. Docker Desktop was initially stopped; its engine subsequently returned HTTP 500 during startup verification. Compose syntax can be validated without the daemon, but image build and container runtime must be verified on a working engine. Do not interpret the Dockerfile's presence as an executed container test.

## Infrastructure

- Deploy a single API instance initially. Rate limiting uses an in-process store; shared limits are required before scaling horizontally.
- Use an authenticated MongoDB replica set/Atlas deployment with least-privilege credentials and encrypted transport. Store secrets outside the image and repository.
- Terminate TLS at a trusted reverse proxy. Set `CLIENT_URL` to the exact HTTPS frontend origin. Serve the React build and API on one origin.
- Set `TRUST_PROXY` to the actual trusted hop count only; an overbroad proxy setting can defeat IP rate limiting.
- Preserve `NODE_ENV=production`. Secure HttpOnly SameSite=Strict cookies then require HTTPS. Compose intentionally overrides this for a loopback development demonstration and is not production orchestration.
- Review SMTP delivery, bounce handling, provider limits and reset URLs. Reset delivery failures are logged without exposing recipient credentials or tokens.
- Build and retain release artifacts by commit; configure host resource limits, a restart policy and readiness/liveness probes.

## Production bootstrap

Build the image, configure secrets and start the service after MongoDB is ready. Run the first administrator CLI once with operator-supplied `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PHONE`, `ADMIN_PASSWORD`. Use a unique strong password; remove the temporary bootstrap variables afterward.

```sh
node server/src/scripts/bootstrap-admin.js
```

The runtime image contains that script. Use your deployment platform's secure environment injection rather than command-line literal credentials. The script creates default pricing only when it is absent and records an audit event. Inspect the defaults before opening customer registration. Seed scripts never run automatically and refuse `NODE_ENV=production`.

The default Node process expects port 8001; the Docker health check targets that port. Configure routing/firewalls accordingly. `GET /health` is liveness, while `GET /ready` reports database connection readiness without exposing configuration. Application logs are JSON with a generated request ID, method, safe path, status and elapsed milliseconds.

## Operations checklist

- Rotate **all v1 exposed credentials**, assess access history, and invalidate old sessions. Git history still contains the upstream exposure; remediation requires the account/repository owners.
- Test backup restoration and define retention, recovery-point and recovery-time objectives.
- Alert on readiness failures, elevated 5xx rates, reset-mail delivery failures and high latency. Forward structured logs to your existing log service.
- Verify dispatch on the service timezone boundary, real driver availability and approved pricing/quality statements.
- Train operators: cash is not paid until physically verified; completion requires recipient attestation; failed deliveries are terminal and rebooking requires a new order.
- Define privacy retention for addresses, complaints, bookings and audit logs. In-app notifications expire after 90 days; sessions and reset tokens have TTL indexes and application-side expiry checks.
- Keep a supported dependency update process. Evaluate ESLint 10 when the accessibility tooling's peer range supports it.

## Integration status

| Integration              | Status                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| MongoDB                  | Required, exercised locally with a real single-node replica set                              |
| In-app notifications     | Operational, transactionally written for delivery/payment events                             |
| Password recovery SMTP   | Adapter implemented; requires provider credentials and real delivery validation              |
| Development reset outbox | Operational, ignored local files, never used in production                                   |
| Cash on delivery         | Operational manual accounting; payment records are not gateway claims                        |
| Bank/digital payment     | Disabled capability entries; gateway adapter implementation and provider verification remain |
| Navigation               | Address/coordinate links; external map opens on user action                                  |
| GPS/SMS/push             | Not implemented; no live location or delivery claims are fabricated                          |

## Deployment rollback

Keep the previous secured artifact and a verified database snapshot. Prefer forward fixes compatible with the `v2_` schema. Do not roll back to the original credential-leaking, unauthenticated v1 API. Database rollback after accepting bookings/payments requires explicit reconciliation of all post-snapshot activity.
