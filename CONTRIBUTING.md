# Contribution workflow

## Record the actual problem

For a bug, include the affected commit, environment, reproduction steps, expected result and observed result. Include a failing test or safe evidence when available. Mark unverified reports as unverified; do not manufacture a failure or imply a historical fix was tracked when it was not.

Use synthetic, purpose-built fixtures. Employer or internship documents, screenshots, templates and data must not be added, including anonymized copies. Never include credentials, customer records or private infrastructure details in issues, screenshots or commits.

## Make a focused change

Create a feature branch from the current clean main branch. Commit at genuine reviewable boundaries, with messages describing the actual change. Do not backdate commits or split completed work merely to simulate a longer development history. Do not merge the original credential-bearing ancestry back into the repository.

Open a pull request explaining the problem, changed behavior, trade-offs and validation. Link the issue; use a closing reference only when the acceptance criteria are met. Review the diff for sensitive information before pushing.

## Validate what changed

Run formatting and lint checks for code changes, and the relevant API/browser tests for behavior changes. Use the production build and smoke checks when changing deployment or asset delivery. Documentation changes need formatting, working-link checks and claim verification; they do not require inventing new tests.

Record failures honestly. Keep a dated changelog entry for meaningful delivered changes. Milestones describe planned work; dates and completion claims must reflect actual work.
