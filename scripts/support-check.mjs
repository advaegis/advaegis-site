// Fails when the toolchain is out of support; warns ahead of time. No dependencies.
//   Registry signatures (npm audit signatures): fail on a bad signature; a registry
//   outage only warns, after one retry (the lockfile's integrity hashes still apply).
//   Node (.nvmrc): fail if past end-of-life or within 90 days of it.
//   Direct dependencies: fail if deprecated, or 2+ major versions behind latest;
//   warn if 1 major behind (on 0.x, any newer minor line).
// Part of `npm run security`; run weekly in CI so drift is caught without a code change.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const ci = process.env.GITHUB_ACTIONS === 'true';
let failed = false;
const warn = (msg) => console.log(ci ? `::warning::${msg}` : `warn  ${msg}`);
const fail = (msg) => ((failed = true), console.log(ci ? `::error::${msg}` : `FAIL  ${msg}`));
const ok = (msg) => console.log(`ok    ${msg}`);

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

// Registry signatures
const outage = /FETCH_ERROR|invalid json response|E(TIMEDOUT|CONNRESET|AI_AGAIN|CONNREFUSED)|E5\d\d\b/;
for (let attempt = 1; ; attempt++) {
  const r = spawnSync('npm', ['audit', 'signatures'], { cwd: root, encoding: 'utf8' });
  const out = `${r.stdout}${r.stderr}`.trim();
  if (r.status === 0) {
    ok(out.match(/^\d+ packages have verified registry signatures/m)?.[0] ?? 'registry signatures verified');
  } else if (!outage.test(out)) {
    fail(`npm audit signatures:\n${out}`);
  } else if (attempt < 2) {
    continue;
  } else {
    warn(`npm audit signatures could not reach the registry; signatures not checked this run: ${out.split('\n').find((l) => outage.test(l))}`);
  }
  break;
}

// Node runtime
const nodeMajor = read('.nvmrc').trim().replace(/^v/, '').split('.')[0];
const schedule = await getJson('https://raw.githubusercontent.com/nodejs/Release/main/schedule.json');
const end = schedule[`v${nodeMajor}`]?.end;
if (!end) {
  fail(`Node ${nodeMajor} (.nvmrc) is not in the Node.js release schedule`);
} else {
  const daysLeft = Math.floor((Date.parse(end) - Date.now()) / 86_400_000);
  if (daysLeft < 90) fail(`Node ${nodeMajor} (.nvmrc) end-of-life is ${end}: move to a newer LTS`);
  else ok(`Node ${nodeMajor} supported until ${end}`);
}

// Direct dependencies
const pkg = JSON.parse(read('package.json'));
const direct = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
const parse = (v) => v.split('.').map(Number);

for (const name of direct) {
  const installed = JSON.parse(read(`node_modules/${name}/package.json`)).version;
  // Abbreviated metadata: dist-tags plus per-version deprecation, without full READMEs.
  const meta = await getJson(`https://registry.npmjs.org/${name.replace('/', '%2F')}`, {
    accept: 'application/vnd.npm.install-v1+json',
  });
  const latest = meta['dist-tags'].latest;
  const deprecated = meta.versions[installed]?.deprecated;
  const [iMajor, iMinor] = parse(installed);
  const [lMajor, lMinor] = parse(latest);
  const behind = lMajor - iMajor;

  if (deprecated) fail(`${name}@${installed} is deprecated: ${deprecated}`);
  else if (behind >= 2) fail(`${name}@${installed} is ${behind} majors behind ${latest}: likely out of support`);
  else if (behind === 1 || (iMajor === 0 && lMajor === 0 && lMinor > iMinor))
    warn(`${name}@${installed} is behind ${latest}: plan the upgrade`);
  else ok(`${name}@${installed} (latest ${latest})`);
}

process.exit(failed ? 1 : 0);
