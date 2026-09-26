# Clean publication snapshot

The published main and hydro-hitch-v2-clean branches start from a clean v2 root snapshot. Original credential-bearing ancestry is excluded instead of retaining unsafe historical source revisions.

Local .env files, demo passwords, database files, runtime output and dependency directories are excluded. Original academic documents, spreadsheets, media and video under docs/legacy are omitted to avoid republishing personal material. References to those files in the historical audit describe the local development archive, not files distributed in this branch.

Previously exposed credentials must still be revoked at their providers. Replacing published branch history does not erase third-party clones, forks or GitHub cached commit views. Follow GitHub's sensitive-data removal process for any remaining hosted references.

Existing collaborators should clone the clean repository again and copy only reviewed uncommitted changes. Do not merge or push the original history back into the cleaned repository. The original local development checkout is retained privately for recovery and must not be pushed.

To create your own demo credentials, run npm run setup and follow README.md.
