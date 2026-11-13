# Security Policy

## Reporting

Use this repository's Security tab and **Report a vulnerability**. Do not put
credentials, exploit details, or sensitive logs in public issues. If private
reporting is unavailable, contact the maintainer privately before disclosing.
No response-time guarantee is implied by this template.

## Supported Versions

After the first normal release, only the latest normal release is supported
unless a maintenance line is explicitly announced. Dev, beta, and RC builds
are test channels. Before that first release, this is a development baseline.

## Delivery Controls And Limits

PR validation is read-only and secret-free. Hosted runners are ephemeral;
publication is isolated, opt-in and job-scoped. Normal publication requires
the release environment's approval. Source-revision receipts complement build
attestations; verify expected signer workflow, source and digest, not a signature
alone. See the delivery guide for exact commands and limitations.

Pinning and attestations do not prove upstream software is harmless. Review
dependency/build/workflow updates; do not auto-merge them. No scanner exceptions
are active by default. A future exception needs reviewed scope, rationale,
owner, expiry and mitigation, with explicit scanner-specific enforcement.
Do not silently turn a failed scan into an advisory pass.

GitHub combines bot-PR creation and approval in one Actions settings switch.
It is enabled so Release Please can create PRs, not to authorize bot approvals
or bypass required checks. A sole maintainer's release approval is not independent
two-person control. Account compromise remains a real boundary.

## Lightweight Recovery

Use account passkeys/2FA; keep recovery codes outside the repository. On an
incident: disable publication, revoke affected access, preserve evidence,
review trusted source/workflows, rebuild, and restore automation deliberately.
Fix published mistakes with a new version. Binary rollback is safe only when
configuration and persisted data remain compatible.