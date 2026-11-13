import { readdir, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function contractErrors(text, prefix) {
  const errors = [];
  for (const section of ['Purpose And Scope', 'Ownership', 'Requirements', 'Dependencies', 'Acceptance Cases', 'Decisions', 'Verification']) {
    if (!text.includes(`## ${section}\n`)) errors.push(`missing ${section}`);
  }
  if (!/^\*\*Status:\*\* (Draft|Example|Approved)(?:\s|$)/m.test(text)) errors.push('missing explicit status');
  const identifiers = [...text.matchAll(/^### ([A-Z]+-\d{3})\b/gm)].map(match => match[1]);
  if (!identifiers.length || identifiers.some(identifier => !identifier.startsWith(`${prefix}-`))) errors.push('missing or incorrect stable requirement IDs');
  if (new Set(identifiers).size !== identifiers.length) errors.push('duplicate requirement ID');
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const directory = new URL('../docs/contracts/', import.meta.url);
  let count = 0;
  for (const name of await readdir(directory)) {
    if (!name.endsWith('.md') || name === 'README.md') continue;
    const text = await readFile(new URL(name, directory), 'utf8');
    const prefix = /^# ([A-Z]+):/m.exec(text)?.[1];
    const errors = contractErrors(text, prefix);
    if (errors.length) throw new Error(`${name}: ${errors.join(', ')}`);
    count += 1;
  }
  if (!count) throw new Error('No contracts found');
  console.log(`${count} contracts: structure and stable IDs checked; approval/behavior are not automatically verified`);
}