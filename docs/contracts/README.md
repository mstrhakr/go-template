+++
title = 'Contract Guide'
weight = 1
+++
# Behavioral Contracts

Contracts describe intended observable behavior, ownership, acceptance cases,
and evidence. They help humans and AI keep changes aligned. They are not a
description of every implementation detail or a substitute for tests.

| Contract | Purpose | Status |
| --- | --- | --- |
| [REPO](repo.md) | Repository, security, testing, compatibility, and releases | Draft with owner decisions recorded |
| [EXAMPLE](example-feature.md) | Small example showing the format | Example, not an approved product promise |

## Shared Format

Use the sections shown in the example: Purpose And Scope, Ownership,
Requirements, Dependencies, Acceptance Cases, Decisions, Verification.
Give independently decidable requirements stable IDs such as REPO-001.
Do not silently reuse, remove, or change the meaning of an existing ID.

Distinguish observed behavior, documented intent, proposals, explicit owner
approvals, and executed verification. Approval and verification are separate.
A merged implementation or passing test does not approve the whole contract.
Record dates, exact scope, executed commands, environment, and verification gaps.
Use only as many documents and requirements as the behavior needs; full versus
partial approval is a review decision, not a document-count target.

## Change Workflow

Before a behavior change, identify affected requirements and consumers.
Discuss unsettled intent rather than silently making the contract match code.
Update behavior, acceptance cases, and tests together. Shared guarantees have
one owner; consumers link to its IDs and owners link back to consumers.
Record Depends on and Consumed by in both directions when real dependencies exist.
Examples do not impose new application features on projects using this template.

Run `make check-contracts` for document structure and stable-ID checks.
This check does not prove truth, approval, dependency completeness, or fulfillment.
Contract-only changes skip app jobs; shared tooling changes run affected checks.

## Publication

This folder is the canonical source and is excluded from Hugo by default.
Preview its inclusion with `make docs-contracts`. Set `PUBLISH_CONTRACTS=true`
only after reviewing the content for public publication. Do not copy contracts
into a second content folder. GitHub repository visibility is separate from
documentation-site publication.