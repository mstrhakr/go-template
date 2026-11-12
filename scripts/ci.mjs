import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const keys = ['go', 'js', 'browser', 'docs', 'contracts', 'container', 'security', 'workflows'];

export function classify(paths) {
  const result = Object.fromEntries(keys.map(key => [key, false]));
  const enable = (...names) => names.forEach(name => { result[name] = true; });
  for (const path of paths) {
    if (path.startsWith('docs/contracts/')) enable('contracts');
    else if (path.startsWith('docs/')) enable('docs');
    else if (/^(cmd\/|internal\/|go\.(mod|sum)$)/.test(path)) enable('go', 'js', 'browser', 'container', 'security');
    else if (/^(tests\/e2e\/|playwright\.config\.js$)/.test(path)) enable('js', 'browser');
    else if (path.startsWith('tests/')) enable('js');
    else if (/^(package(-lock)?\.json$)/.test(path)) enable('js', 'browser', 'security');
    else if (/^(Dockerfile|\.dockerignore|compose\.yaml|\.env\.example)$/.test(path)) enable('container', 'security');
    else if (/^(\.github\/(workflows|actions)\/|scripts\/|Makefile$|\.goreleaser\.yaml$|release-please-config\.json$|\.release-please-manifest\.json$)/.test(path)) keys.forEach(key => { result[key] = true; });
    else if (/^(AGENTS\.md|\.github\/copilot-instructions\.md)$/.test(path)) enable('contracts');
    else if (/^(README\.md|LICENSE|SECURITY\.md|CHANGELOG\.md|\.gitignore|\.github\/(ISSUE_TEMPLATE\/|PULL_REQUEST_TEMPLATE\.md)|\.vscode\/)/.test(path)) continue;
    else keys.forEach(key => { result[key] = true; });
  }
  return result;
}

export function validTitle(title) {
  return /^(feat|fix|perf|revert|docs|style|refactor|test|build|ci|chore)(\([a-zA-Z0-9._/-]+\))?!?: \S[^\r\n]*$/.test(title);
}

export function gatePassed(results) {
  return Object.values(results).every(result => result === 'success' || result === 'skipped');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode = process.argv[2];
  if (mode === 'gate') {
    const jobs = JSON.parse(process.env.JOB_RESULTS);
    const results = Object.fromEntries(Object.entries(jobs).map(([name, job]) => [name, job.result]));
    if (results.changes !== 'success' || !gatePassed(results)) throw new Error(`CI gate failed: ${JSON.stringify(results)}`);
  } else if (mode === 'detect') {
    const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
    if (process.env.GITHUB_EVENT_NAME === 'pull_request' && !validTitle(event.pull_request.title)) {
      throw new Error('PR title must use Conventional Commits, e.g. feat(web): add search');
    }
    let result;
    if (process.env.GITHUB_EVENT_NAME === 'schedule') {
      result = classify([]);
      result.security = true;
    } else if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' || /^0+$/.test(event.before ?? '')) {
      result = classify(['unknown']);
    } else {
      const base = event.pull_request?.base.sha ?? event.before;
      const head = event.pull_request?.head.sha ?? event.after;
      if (!/^[a-f0-9]{40}$/.test(base ?? '') || !/^[a-f0-9]{40}$/.test(head ?? '')) throw new Error('Missing trustworthy diff revisions');
      const paths = execFileSync('git', ['diff', '--no-renames', '--name-only', '-z', base, head], { encoding: 'utf8' }).split('\0').filter(Boolean);
      result = classify(paths);
    }
    if (result.contracts && process.env.PUBLISH_CONTRACTS === 'true') result.docs = true;
    for (const [key, value] of Object.entries(result)) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
    console.log(result);
  } else {
    throw new Error('Expected detect or gate');
  }
}