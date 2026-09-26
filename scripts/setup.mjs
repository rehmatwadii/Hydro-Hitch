import { access, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
try {
  await access('.env');
  process.stdout.write('.env already exists; left unchanged.\n');
} catch {
  const password = randomBytes(15).toString('base64url');
  await writeFile(
    '.env',
    `NODE_ENV=development\nPORT=8001\nCLIENT_URL=http://localhost:5173\nMONGODB_URI=mongodb://127.0.0.1:27017/hydro_hitch_v2?replicaSet=rs0\nLOG_LEVEL=info\nTRUST_PROXY=0\nSEED_PASSWORD=${password}\n`,
    { mode: 0o600 },
  );
  process.stdout.write(
    'Created .env with a generated development seed password. Read SEED_PASSWORD locally to sign in after seeding.\n',
  );
}
