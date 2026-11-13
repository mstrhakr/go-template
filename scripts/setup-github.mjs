import { execFileSync } from 'node:child_process';
import { repositorySettings } from './github-settings.mjs';
import { allowedActions } from './github-actions.mjs';

const args = process.argv.slice(2);
const repo = args.includes('--repo') ? args[args.indexOf('--repo') + 1] : execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'], { encoding: 'utf8' }).trim();
if (!/^[\w.-]+\/[\w.-]+$/.test(repo ?? '')) throw new Error('Expected --repo OWNER/REPO');
const api = `repos/${repo}`;
const get = path => JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8' }));
const request = (path, body, method = 'PUT') => {
  console.log(`${method} ${path}`);
  execFileSync('gh', ['api', '--method', method, path, '--silent', ...(body === undefined ? [] : ['--input', '-'])], {
    input: body === undefined ? undefined : JSON.stringify(body), stdio: ['pipe', 'inherit', 'inherit'],
  });
};
const repository = get(api);
if (!repository.permissions?.admin) throw new Error('Repository admin permission is required');
if (repository.default_branch !== 'main') throw new Error('Review workflow/default-branch assumptions before applying to a non-main repository');
if (repository.visibility !== 'public') throw new Error('This public-template baseline does not change visibility; review public-feature availability first');
if (!args.includes('--apply')) {
  console.log(`Dry run for ${repo}: Issues/security on; Wiki/Discussions off; squash-only main + CI gate; immutable version tags; scoped Actions allowlist; release approval. Add --apply. Publishing stays off unless --enable-publishing is also supplied.`);
  process.exit(0);
}

const viewer = get('user');
request(api, repositorySettings, 'PATCH');
for (const endpoint of ['vulnerability-alerts', 'automated-security-fixes', 'private-vulnerability-reporting']) request(`${api}/${endpoint}`);
request(`${api}/actions/permissions`, { enabled: true, allowed_actions: 'selected', sha_pinning_required: true });
request(`${api}/actions/permissions/selected-actions`, {
  github_owned_allowed: false, verified_allowed: false,
  patterns_allowed: allowedActions,
});
request(`${api}/actions/permissions/workflow`, { default_workflow_permissions: 'read', can_approve_pull_request_reviews: true });

const existing = get(`${api}/rulesets`);
for (const rule of [
  {
    name: 'Protected main', target: 'branch', enforcement: 'active', bypass_actors: [],
    conditions: { ref_name: { include: ['~DEFAULT_BRANCH'], exclude: [] } },
    rules: [
      { type: 'deletion' }, { type: 'non_fast_forward' }, { type: 'required_linear_history' },
      { type: 'pull_request', parameters: { required_approving_review_count: 0, dismiss_stale_reviews_on_push: true, require_code_owner_review: false, require_last_push_approval: false, required_review_thread_resolution: true } },
      { type: 'required_status_checks', parameters: { strict_required_status_checks_policy: true, required_status_checks: [{ context: 'CI gate', integration_id: 15368 }] } },
    ],
  },
  {
    name: 'Immutable version tags', target: 'tag', enforcement: 'active', bypass_actors: [],
    conditions: { ref_name: { include: ['refs/tags/v*'], exclude: [] } },
    rules: [{ type: 'deletion' }, { type: 'update' }],
  },
]) {
  const previous = existing.find(item => item.name === rule.name);
  request(`${api}/rulesets${previous ? `/${previous.id}` : ''}`, rule, previous ? 'PUT' : 'POST');
}

request(`${api}/environments/release`, {
  wait_timer: 0, prevent_self_review: false, can_admins_bypass: false,
  reviewers: [{ type: 'User', id: viewer.id }],
  deployment_branch_policy: { protected_branches: true, custom_branch_policies: false },
});
for (const environment of ['development', 'prerelease']) {
  request(`${api}/environments/${environment}`, { deployment_branch_policy: { protected_branches: true, custom_branch_policies: false } });
}

const enabled = args.includes('--enable-publishing') ? 'true' : 'false';
for (const [name, value] of Object.entries({ RELEASE_APPROVAL_CONFIGURED: 'true', RELEASES_ENABLED: enabled, PUBLISH_CONTAINER: enabled })) {
  execFileSync('gh', ['variable', 'set', name, '--repo', repo, '--body', value], { stdio: 'inherit' });
}
console.log(JSON.stringify({ repository: get(api).full_name, visibility: get(api).visibility, rulesets: get(`${api}/rulesets`).map(rule => ({ name: rule.name, enforcement: rule.enforcement })), actions: get(`${api}/actions/permissions`), publishing: enabled, releaseEnvironment: get(`${api}/environments/release`).protection_rules }, null, 2));