# Clean publication snapshot

This branch publishes the Hydro-Hitch v2 implementation as a new root commit. It does not include the original credential-bearing commit ancestry.

Local .env files, demo passwords, database files, runtime output and dependency directories are excluded. Original academic documents, spreadsheets, media and video under docs/legacy are omitted to avoid republishing personal material. References to those files in the historical audit describe the local development archive, not files distributed in this branch.

The existing upstream main branch and other original refs were not rewritten. Their exposed credentials must still be revoked by their owners; this snapshot does not erase already published history.

To create your own demo credentials, run npm run setup and follow README.md.
