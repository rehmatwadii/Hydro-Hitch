# Security

## Reporting an issue

Do not post passwords, database URLs, reset links, customer data or exploit details in a public issue. Use GitHub private vulnerability reporting if enabled, or contact the repository owner privately. Include affected code paths, impact and a minimal reproduction without real credentials.

## Credential handling

- Store local secrets in ignored `.env` files; `.env.example` contains placeholders only.
- Keep production credentials in your deployment secret store.
- Never reuse demo passwords in production.
- Never commit runtime databases, email outboxes, session cookies or tokens.
- Run `npm run security:scan` before publishing. It is a pattern-based check, not a complete secret detector.

## Historical exposure

Published branches were moved to clean v2 history to exclude the original exposed environment files and hardcoded credentials. Previously exposed database and SMTP credentials must still be revoked at their providers.

GitHub cached views, forks and existing clones may retain removed commits. Follow [GitHub's sensitive-data removal guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) and contact GitHub Support for hosted-reference cleanup where applicable.

See [publication details](docs/PUBLICATION.md) and [deployment requirements](docs/DEPLOYMENT.md).
