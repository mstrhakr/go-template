# Baseline Verification

Executed 2026-11-12 on Linux x64 in the development container, using the working
tree based on commit `87a8c94`. This records execution, not whole-contract approval.
GitHub settings were separately read back through the API. No release, image,
or documentation site was published during these checks.

## Executed Locally

- `make check`: passed Go vet/race tests/format/build, 10 Node unit tests,
  6 browserless API tests, 24 browser tests, asset verification, 2 contract checks.
- `make check-workflows`: workflow security policy and actionlint passed.
- `make check-security`: npm audit and govulncheck found no vulnerabilities.
- `make docs`: passed. Optional contracts-overlay build also passed; generated
  minified HTML had no unresolved Markdown source links.
- `goreleaser check`: passed.
- `goreleaser release --snapshot --clean --skip=publish`: packaged Linux/Windows
  x64 and macOS x64/ARM64 archives plus checksums. No real release tags created.
- `make check-container`: image built; isolated digest-pinned Trivy scan reported
  zero vulnerabilities. The image's actual hardened-container health probe passed.
- Desktop Chromium 1440x900 and Pixel 7 emulation 412x839 screenshots inspected
  after a real htmx greeting update. The automated suite also exercised Firefox,
  WebKit, keyboard navigation, error recovery, escaped input and no-JS fallback.
- `git diff --check`: passed.

Tools: Go 1.27.4, Node 24.18.0, Playwright 1.65.0, htmx 2.0.11, Hugo 0.169.0,
GoReleaser 2.20.2, actionlint 1.7.12, govulncheck 1.9.0, Trivy 0.76.2.
Browser concurrency is capped at two: the initial unbounded local run exhausted
resources; rerunning the same assertions with bounded concurrency passed.

## Live Repository Readback

For `mstrhakr/go-template`: public template, Issues/private vulnerability reporting
enabled, Wiki/Discussions disabled, secret scanning and push protection enabled,
Dependabot alerts and automated security fixes enabled. Protected main requires
the GitHub Actions `CI gate`, PRs and linear history; no bypass actors. Repository
merge settings allow squash only. Version tags block update/deletion.

Actions default to read-only, allowlisted Actions require full SHA pins. Release
environment requires maintainer approval, protected-branch deployment and no admin
bypass; solo-maintainer self-review remains deliberately allowed. Development and
prerelease environments accept protected-branch deployments. Publishing variables
are false; release-approval setup acknowledgement is true. Docs/contracts
publication has not been enabled.

## Not Yet Verified

Native hosted Windows/macOS/architecture CI, GitHub CodeQL execution, full hosted
PR/release dispatch flow, real environment approvals, registry uploads, signing
and consumer-side attestation verification require the workflows to reach GitHub
and actually run. Cross-compilation, Linux WebKit and mobile emulation are not
native Windows/macOS/Safari/physical-device evidence. No claim is made that an
authorized workflow or upstream dependency cannot be compromised.

Template-created-repository setup has not been exercised on a second repository.
Release recovery/rollback and future persisted-data migrations have not been
tested. This starter has no database, authenticated operations or desktop UI.

## v0.1.0 Release Verification

Executed 2026-11-13 for release commit `b735e0c06ef9b003bac5eaebf8b935b938d72546`.
Release Please proposed v0.1.0; its release PR passed all 14 required hosted
checks across Linux, Windows, macOS ARM64/x64, browser, docs, container and
security jobs. The full normal-release workflow repeated those checks and
completed GoReleaser packaging, provenance, source-revision receipts, and the
maintainer-approved release-environment publication. The release is published,
not prerelease, at `v0.1.0`. Container publication remained disabled.

Downloaded all four release archives and verified `checksums.txt`. GitHub CLI
attestation verification succeeded for build provenance and the custom
source-revision receipt on every archive, enforcing the expected repository and
publication workflow. The receipt identifies release commit
`b735e0c06ef9b003bac5eaebf8b935b938d72546`. This proves artifact origin under
GitHub's Actions/Sigstore trust chain; it does not prove the source or workflow
is free from malicious behavior. The template's general setup helper still
needed a follow-up allowlist addition for the provenance action's nested
predicate pin; that correction is proposed separately and does not change the
already published v0.1.0 artifacts.