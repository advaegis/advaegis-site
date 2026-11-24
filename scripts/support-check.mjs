// Fails when the toolchain is out of support; warns ahead of time. No dependencies.
//   Node (.nvmrc): fail if past end-of-life or within 90 days of it.
//   Direct dependencies: fail if deprecated, or 2+ major versions behind latest;
//   warn if 1 major behind (on 0.x, any newer minor line).
// Part of `npm run security`; run weekly in CI so drift is caught without a code change.
import { readFileSync } from 'node:fs';

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
