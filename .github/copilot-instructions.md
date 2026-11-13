# Project Guidelines

- Read affected [contracts](../docs/contracts/README.md) before behavioral changes.
  Separate proposals, owner decisions and executed verification. Do not silently
  rewrite a contract to approve whatever code happens to do.
- Keep Go responsible for business rules and escaped HTML templates/partials.
  Use self-hosted htmx for server-driven updates and small JS modules for local
  browser behavior. Do not add a competing client framework without a decision.
- Run focused tests while editing, then `make check` for completed app work.
  Use `make docs`, `make check-workflows`, `make check-security` and container checks
  when their surfaces change. State checks not run; never invent verification.
- Use Conventional Commit messages for every authored commit and PR title.
  Preserve breaking intent in squash messages. Work through short-lived branches
  and PRs; do not push main, publish, or bypass protection without authorization.
- Keep PR validation read-only and secret-free. Never execute PR source in a
  privileged workflow. Scope writes/OIDC per job; review pins, executable downloads,
  dependencies and build/release tooling. Do not automatically merge updates.
- Follow the [development guide](../docs/content/development.html) and
  [delivery guide](../docs/content/deployment.html). Keep native-platform evidence
  separate from cross-compilation and simulation.