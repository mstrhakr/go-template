+++
title = 'Repository Contract'
weight = 2
+++
# REPO: Repository And Delivery Baseline

**Status:** Draft with individual owner decisions recorded; not blanket approval.

## Purpose And Scope

Provide a lightweight, portable Go application template with predictable human
and AI development, secure-by-default validation, and explicit release channels.
This owns repository/delivery guarantees, not future application business rules.

## Ownership

Maintainer: repository settings, compatibility decisions, security exceptions,
and release authorization. GitHub Actions: checks and narrowly scoped automation.
Go: runtime behavior and escaped HTML. htmx: server-driven browser updates.
Small local JS modules: browser-only behavior. Consumers: every feature and
every repository created from this template, after its own setup verification.

## Requirements

### REPO-001: Repository Setup

Enable Issues and private vulnerability reporting; disable Wiki and Discussions.
Use public-repository security features where available. Creating a repo from
this template does not inherit live settings, rulesets, environments, or opt-ins.
Setup preserves the repository's existing template status. Never change another
repository's visibility implicitly.

### REPO-002: Development Flow

Protect main: short-lived feature/fix branches, PRs, required CI gate, squash
merges, linear history, no force pushes/deletion, no routine admin/bot bypass.
No permanent dev branch or mandatory second reviewer. Security-sensitive changes
require deliberate maintainer review; a sole author's review is not independent
two-person control. Never automatically merge dependency updates.

### REPO-003: Commit Intent

Authored commits follow Conventional Commits. Validate PR titles before merge;
configure squash defaults from the title. VS Code authoring assistance is optional;
local hooks and linting every intermediate commit are not mandatory. Preserve
breaking intent in the squash title with `!` or a retained BREAKING CHANGE footer.
Message syntax does not prove semantic correctness.

### REPO-004: Testing Interface

`make test` runs Go race tests, JS/unit/API tests, and all baseline browser projects.
`make check` adds formatting, vet/build, contract and embedded-asset checks.
Use focused subtargets during development. Docs, workflows, scanners, and container
checks have explicit additional targets/gates; do not claim `make test` covers them.
Node is build/test tooling, not a production server requirement.

### REPO-005: Change-Scoped Validation

Run relevant checks before merge; do not postpone JS correctness until beta.
Contract-only changes skip app jobs; code-only changes do not validate unrelated
contracts; shared tooling and unknown paths fail safe to wider validation.
The final gate fails on detection errors, failed/cancelled jobs, or unknown states.
Beta/RC/normal publication validates the exact revision with the full readiness
suite; direct patch releases may skip prerelease publication, not release checks.

### REPO-006: Trust Boundaries

PR validation uses ephemeral hosted runners, read-only repository tokens, no
secrets/publishing access, no persisted checkout credentials, and no privileged
execution of PR source through pull_request_target. Direct third-party Action
references and container/tool versions are pinned. Review upstream executable
downloads and transitive action dependencies too; direct pins are not a complete
supply-chain guarantee. Never execute an artifact simply because CI uploaded it.
Validate source, run identity, revision and digest at trust-boundary crossings.
Grant writes per job; OIDC signing privileges belong only to attestation jobs.

### REPO-007: Dependencies And Findings

Weekly Dependabot covers Go, npm, Actions and Docker. Use locked installs with
npm lifecycle scripts disabled. Verify bundled htmx matches its locked package.
Run relevant Go/npm/container scans and scheduled checks; scanners failing to run
do not establish a clean result. Applicable vulnerabilities block delivery.
Any exception requires an explicit reviewed rationale, owner, scope, mitigation,
and expiry; do not blanket-ignore findings or silently downgrade failures.
Use private reporting for vulnerabilities, not public bug issues.

### REPO-008: Rendering And Browser Behavior

Use embedded Go html/template layouts/partials, server-driven htmx interactions,
and small JS modules for browser-local needs. No runtime CDN. Escape untrusted
values; disable htmx eval and script injection; keep same-origin CSP and requests.
GET/HEAD do not mutate application state. Cross-origin protection does not replace
authentication/authorization, nor protect against malicious same-origin code.
UI work considers keyboard, error recovery, no-JS fallback where applicable,
and narrow/mobile layouts, with actual browser evidence.

### REPO-009: Versioning And Compatibility

Start at v0.1.0. Before v1, features/fixes increment patch; breaking changes
increment minor. Highest-impact change wins. Entering v1 requires an explicit
policy decision. Breaking means incompatible documented HTTP/config/data/CLI/
deployment/template-setup guarantees, not every internal refactor.
Docs/test/chore-only changes ordinarily do not create an app release.
Release Please owns version/changelog PRs; GoReleaser packages binaries.

### REPO-010: Channels And Publication

Dev images follow relevant passing protected-main CI, with `dev` and SHA tags.
Beta and RC use explicit actions, exact main-history revisions, versioned
prerelease tags, and separate `beta`/`rc` aliases. RC means intended final scope;
new features return to beta. Normal releases require merging the release PR
and approval on the release environment. Keep GitHub releases as drafts until
validated artifacts and approved publication succeed. Only normal moves `latest`.
Do not overwrite published version/SHA tags or blindly promote a moving alias.
New template-created repos keep release/container/docs publication disabled
until explicitly configured. Use built-in tokens, with explicit dispatch for
bot-PR checks and same-workflow release handoff; no custom App is required.

### REPO-011: Platforms And Integrity

Initially package Linux x64, Windows x64, macOS x64/ARM64 binaries and Linux x64
images. Run native OS/architecture checks on the declared runner matrix; do not
claim local cross-compilation is native runtime verification. ARM Linux/Windows
and desktop UI examples are future scope. Publish binary checksums, attestations,
source revisions, and image digests with verification instructions. Attestations
prove provenance under their trust assumptions, not absence of malicious code.
Changes after a tested candidate require affected checks on final source/artifacts.

### REPO-012: Support And Recovery

Initially support the latest normal release; dev/beta/RC are test channels.
Older maintenance lines require an explicit decision. Fix forward without replacing
published artifacts. Preserve normal/beta/RC versions; bound dev history with
cautious manual registry cleanup initially, never deleting referenced digests.
CI reports expire after seven days; target roughly 30 days of dev registry history.
Rollback requires compatible config/data; future destructive migrations need
backup/recovery plans. Keep account security guidance lightweight: passkeys/2FA,
recovery material outside the repo, and stop publication/revoke/review/rebuild
steps for incidents. No automated policy can neutralize a compromised sole owner.

## Dependencies

Depends on GitHub's token, environment, artifact, ruleset and hosted-runner
services; npm/Go registries and approved upstream tools; GHCR when enabled.
Consumed by future feature contracts: link specific REPO IDs rather than copying
these workflows. EXAMPLE references REPO-008; it does not approve this contract.

## Acceptance Cases

- Given contract-only edits, app/browser/container jobs skip and contract checks run.
- Given a failed detector or required check, the final CI gate fails.
- Given an untrusted PR, it cannot obtain publication credentials from validation.
- Given an HTML-like name, both page and fragment display text, not executable HTML.
- Given JavaScript disabled, the greeting form still returns a usable full page.
- Given beta/RC inputs with a branch name or malformed version, publication fails.
- Given normal publication, approval and full revision-specific readiness are required.
- Given a fresh template-created repo, no images or site publish without opt-in.

## Decisions

Owner decisions on 2026-11-12 established protected-main/squash workflow, v0
versioning, public-repo features, isolated/scoped CI, explicit prereleases,
normal-release approval, provenance, initial platforms, and lightweight recovery.
Subsequent implementation is authorized. This assembled document remains a draft;
wording, individual requirement approval, and fulfillment remain separately reviewable.

## Verification

Implementation links: Makefile; scripts/ci.mjs; scripts/release.mjs; workflows;
internal/web; docs/content/deployment.html. Local executed checks are recorded in
the source-only docs/verification.md evidence record, not inferred here. Live GitHub settings require API
readback. Native Windows/macOS CI, CodeQL, hosted approvals, real publication,
attestation verification and template-created-repo setup remain unverified until
actually exercised. Structure checks do not certify behavioral fulfillment.