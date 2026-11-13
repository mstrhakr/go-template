import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('node_modules/htmx.org/package.json', root), 'utf8'));
const script = await readFile(new URL('node_modules/htmx.org/dist/htmx.min.js', root));
const license = await readFile(new URL('node_modules/htmx.org/LICENSE', root));
const metadata = Buffer.from(`${JSON.stringify({
  package: 'htmx.org',
  version: manifest.version,
  source: `https://www.npmjs.com/package/htmx.org/v/${manifest.version}`,
  sha256: createHash('sha256').update(script).digest('hex'),
}, null, 2)}\n`);

for (const [name, expected] of [['htmx.min.js', script], ['LICENSE.htmx', license], ['htmx.json', metadata]]) {
  const destination = new URL(`internal/web/static/${name}`, root);
  if (process.argv.includes('--check')) {
    const actual = await readFile(destination);
    if (!actual.equals(expected)) {
      throw new Error(`${fileURLToPath(destination)} differs from locked dependency; run npm run assets and review`);
    }
  } else {
    await writeFile(destination, expected);
  }
}
console.log(`htmx ${manifest.version}: embedded assets ${process.argv.includes('--check') ? 'verified' : 'updated'}`);