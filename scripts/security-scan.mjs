import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const paths = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean);
const rules = [
  ['credentialed MongoDB URI', /mongodb(?:\+srv)?:\/\/[^\s/]+:[^\s/@]+@/],
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['provider API key', /\b(?:sk-[A-Za-z0-9_-]{30,}|AIza[A-Za-z0-9_-]{30,})\b/],
];
const findings = [];
let scanned = 0;
for (const path of paths) {
  if (/(^|\/)node_modules\//.test(path))
    findings.push({ path, rule: 'Tracked dependency directory' });
  if (/(^|\/)\.env(?:\.|$)/.test(path) && !path.endsWith('.example'))
    findings.push({ path, rule: 'Tracked environment file' });
  if (!/\.(?:js|jsx|mjs|json|md|yml|yaml|example)$/.test(path) || path.startsWith('docs/legacy/'))
    continue;
  let content;
  try {
    content = await readFile(path, 'utf8');
  } catch {
    continue;
  }
  scanned++;
  for (const [rule, pattern] of rules) if (pattern.test(content)) findings.push({ path, rule });
}
const report = {
  date: new Date().toISOString(),
  scannedTextFiles: scanned,
  findings,
  limitations:
    'Pattern-based working-tree scan only. Historical upstream credentials remain in Git history and require owner revocation. Test-only credentials and generated ignored local .env are intentional.',
};
await mkdir('docs/verification', { recursive: true });
await writeFile('docs/verification/security-scan.json', JSON.stringify(report, null, 2) + '\n');
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
if (findings.length) process.exitCode = 1;
