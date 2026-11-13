import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, validTitle, gatePassed } from '../../scripts/ci.mjs';
import { releaseInput, assertNewRelease } from '../../scripts/release.mjs';
import { contractErrors } from '../../scripts/contracts.mjs';
import { workflowErrors } from '../../scripts/workflows.mjs';
import { repositorySettings } from '../../scripts/github-settings.mjs';

test('contract-only changes skip app and browser jobs', () => {
  const result = classify(['docs/contracts/repo.md']);
  assert.equal(result.contracts, true);
  for (const name of ['go', 'js', 'browser', 'container', 'docs', 'security']) assert.equal(result[name], false);
});

test('app changes run app validation but not contract checks', () => {
  const result = classify(['internal/web/web.go']);
  assert.equal(result.go, true);
  assert.equal(result.browser, true);
  assert.equal(result.container, true);
  assert.equal(result.security, true);
  assert.equal(result.contracts, false);
});

test('shared tooling and unknown paths fail safe to all checks', () => {
  for (const path of ['scripts/ci.mjs', '.github/workflows/ci.yml', 'Makefile', 'new-surface/file']) {
    assert.ok(Object.values(classify([path])).every(Boolean));
  }
});

test('docs and mixed changes preserve all affected checks', () => {
  assert.equal(classify(['docs/content/development.html']).go, false);
  assert.equal(classify(['docs/content/development.html']).docs, true);
  const result = classify(['internal/web/web.go', 'docs/contracts/repo.md']);
  assert.equal(result.go, true);
  assert.equal(result.contracts, true);
});

test('Conventional PR titles allow breaking scope and reject malformed input', () => {
  for (const title of ['feat(web): add search', 'fix: startup', 'feat(config)!: rename setting', 'chore(main): release 0.1.0']) assert.equal(validTitle(title), true);
  for (const title of ['update things', 'feat:', 'fix: \nmalicious', 'fix: ']) assert.equal(validTitle(title), false);
});

test('CI gate rejects failures, cancellation, and unexpected states', () => {
  assert.equal(gatePassed({ go: 'success', browser: 'skipped' }), true);
  for (const state of ['failure', 'cancelled', 'pending', undefined]) assert.equal(gatePassed({ go: state }), false);
});

test('release inputs require exact trusted revision and correct v0 channel', () => {
  const sha = 'a'.repeat(40);
  assert.equal(releaseInput('normal', 'v0.1.0', sha).version, '0.1.0');
  assert.equal(releaseInput('beta', 'v0.2.0-beta.1', sha).channel, 'beta');
  assert.equal(releaseInput('rc', 'v0.2.0-rc.2', sha).channel, 'rc');
  for (const args of [['beta', 'v0.2.0', sha], ['normal', 'v1.0.0', sha], ['rc', 'v0.2.0-rc.0', sha], ['normal', 'v0.1.0', 'main'], ['normal', 'v0.01.0', sha]]) assert.throws(() => releaseInput(...args));
});

test('contract checker rejects incomplete documents and duplicate IDs', () => {
  assert.ok(contractErrors('# REPO: test', 'REPO').length);
  assert.ok(contractErrors('### REPO-001\n### REPO-001\n', 'REPO').includes('duplicate requirement ID'));
});

test('release aliases cannot move backwards or overwrite published versions', () => {
  const published = [{ tag_name: 'v0.1.0', draft: false }, { tag_name: 'v0.2.0-beta.2', draft: false }];
  assert.throws(() => assertNewRelease('normal', 'v0.1.0', published));
  assert.throws(() => assertNewRelease('beta', 'v0.2.0-beta.1', published));
  assert.doesNotThrow(() => assertNewRelease('rc', 'v0.2.0-rc.1', published));
  assert.doesNotThrow(() => assertNewRelease('normal', 'v0.2.0', published));
  assert.doesNotThrow(() => assertNewRelease('normal', 'v0.2.0', [{ tag_name: 'v0.2.0', draft: true }]));
});

test('workflow policy rejects dangerous scopes, mutable actions, and shell interpolation', () => {
  const unsafe = {
    on: { pull_request_target: {} },
    permissions: { contents: 'write' },
    jobs: { build: { permissions: { 'id-token': 'write' }, steps: [
      { uses: 'actions/checkout@main' },
      { run: 'echo ${{ github.event.pull_request.title }}' },
      { run: 'npm ci' },
    ] } },
  };
  assert.ok(workflowErrors(unsafe, 'validate.yml').length >= 6);
  assert.deepEqual(workflowErrors({ permissions: { contents: 'read' }, jobs: { build: { steps: [
    { uses: `actions/checkout@${'a'.repeat(40)}`, with: { 'persist-credentials': false } },
    { run: 'npm ci --ignore-scripts' },
  ] } } }, 'validate.yml'), []);
});

test('repository setup preserves existing template status', () => {
  assert.equal(Object.hasOwn(repositorySettings, 'is_template'), false);
  assert.equal(repositorySettings.has_issues, true);
});

test('custom attestations require the generic attest action', () => {
  const step = { uses: `actions/attest-build-provenance@${'a'.repeat(40)}`, with: { 'predicate-type': 'https://example.test/predicate', predicate: '{}' } };
  assert.ok(workflowErrors({ jobs: { attest: { steps: [step] } } }).some(error => error.includes('custom predicate requires')));
  step.uses = `actions/attest@${'a'.repeat(40)}`;
  assert.deepEqual(workflowErrors({ jobs: { attest: { steps: [step] } } }), []);
});