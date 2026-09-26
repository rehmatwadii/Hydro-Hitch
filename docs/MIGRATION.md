# Legacy data migration

No live database was accessed during the retrofit. Never reuse the URI or credentials in the original commit. Ask the database owner to rotate credentials and take a verified backup first.

## Procedure

1. Restore a backup into an isolated **replica-set** database. Configure `MONGODB_URI` to that restored copy.
2. Run `npm run migrate`. This defaults to a read-only preview and reports counts and source identifiers requiring review. It does not print passwords or email addresses.
3. Resolve duplicate emails, invalid profiles, unknown units and open operational orders with the owner. Record reconciliation decisions.
4. Run `npm run migrate -- --apply` against the restored copy, inspect the imported data, and rerun the command to confirm idempotency.
5. Test password recovery with a controlled recipient. Imported customers receive a newly generated unusable password hash and must reset their password; v1 sessions and compromised hashes are not reused.
6. Cut over only after a verified backup, an agreed maintenance window, reconciliation of in-flight orders and an approved production restore plan.

## Mapping

| v1 collection                   | v2 treatment                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`                         | Valid unique emails become CUSTOMER accounts in `v2_user`; source ID retained in `legacyId`. No role promotion.                                                                                         |
| `customerorders`                | Completed orders with a mapped customer and nonnegative numeric price become historical `v2_booking` records; legacy ID has a unique index. Open/invalid orders are reported for manual reconciliation. |
| `questions`                     | Mapped customers' questions/answers become support tickets; repeat imports recognize their source marker.                                                                                               |
| `userreportvendors`             | Mapped customer complaints become support tickets.                                                                                                                                                      |
| `venders`, `products`, `admins` | Remain intact for reviewed supplier/account mapping. Never automatically create privileged users.                                                                                                       |

Historical records explicitly state that schedules and the exact gallon standard were not recorded. Approximate litres use US gallons as a documented display assumption; original product quantities remain in the untouched source collection. No driver, schedule, payment settlement, delivery timestamp or certification is invented. The history timestamp records import time. Legacy prices are retained as historical totals; all new booking calculations use whole PKR.

The new schema prefix is `v2_`. No source collection is renamed, dropped or overwritten. Migration does not import old tokens, password hashes, uploaded files or rich HTML. Vendor quality reports remain in legacy storage, avoiding reintroducing stored XSS. Source backups still contain sensitive data and need controlled access and retention policies.

## Rollback

Take a backup before applying changes. Keep production writes closed during the cutover. If validation fails before launch, point the new application back to its last verified database snapshot; retain the failed import for investigation. Once new bookings or payments exist, reconcile those records before any rollback. Do not blindly delete `v2_` collections after production traffic begins, and do not redeploy the vulnerable original server.

The migration regression test proves dry-run behavior, repeated-apply behavior, original-record preservation and absence of automatic privilege/payment promotion. It cannot prove compatibility with unknown real-world data that was never supplied.
