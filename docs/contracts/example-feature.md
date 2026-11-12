+++
title = 'Example Feature Contract'
weight = 3
+++
# EXAMPLE: Greeting Interaction

**Status:** Example only, not an approved application compatibility promise.

## Purpose And Scope

Show how to specify one small server-driven interaction without prescribing an
entire application architecture. Replace or remove this example in derived repos.

## Ownership

Go handler owns validation/rendering; templates own markup; htmx owns transport
and swapping; app.js owns browser-local request failure feedback.

## Requirements

### EXAMPLE-001: Greeting Result

An optional name produces a greeting. Empty names use world. Names exceeding
100 UTF-8 bytes are rejected; output stays escaped text.

### EXAMPLE-002: Progressive Rendering

Normal navigation returns a full page; an htmx request returns the greeting
partial. History restoration returns a full page. Failed requests preserve the
previous greeting and show a recoverable error. The form works without JS.

## Dependencies

Depends on REPO-008 for rendering/security/UI boundaries. REPO lists this example
as a consumer. This does not establish approval of REPO or any future feature.

## Acceptance Cases

- Given Ada, submit by keyboard and receive Hello, Ada without full navigation.
- Given HTML-like input, display literal text rather than executing markup.
- Given a network/server failure, retain the previous greeting and allow retry.
- Given JS disabled, submission still returns the complete page.

## Decisions

Demonstration implementation, 2026-11-12. No feature-level owner approval claimed.

## Verification

Go tests, JS/API tests, desktop browser projects, mobile Chromium and no-JS tests
cover the demonstration. See actual test-run results; document future gaps rather
than assuming these cases establish accessibility or browser support exhaustively.