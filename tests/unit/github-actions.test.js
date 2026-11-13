import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedActions } from '../../scripts/github-actions.mjs';

test('GitHub setup permits the pinned nested provenance predicate action', () => {
  assert.ok(allowedActions.includes('actions/attest-build-provenance/predicate@864457a58d4733d7f1574bd8821fa24e02cf7538'));
  assert.ok(allowedActions.includes('actions/attest-build-provenance@*'));
  assert.ok(allowedActions.includes('actions/attest@*'));
});