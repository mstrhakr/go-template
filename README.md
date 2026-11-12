# go-template

A small Go web application foundation: one executable, standard-library Go,
escaped HTML templates, local htmx, and small browser JS modules. Node is used
for development/testing only; no Node production server or frontend bundler.

## Start here

Install Go **1.27.4** (see `go.mod`), then:

```sh
go run ./cmd/server
curl http://localhost:8080/healthz
```

Open <http://localhost:8080/>. Set `APP_ADDR=127.0.0.1:9000` to change the
listener and `APP_LOG_LEVEL=debug` to adjust JSON logging. The default listener
binds all interfaces; use loopback for local-only development.
The service validates configuration and shuts down gracefully on SIGINT/SIGTERM.

## Develop

Install Node **24**, GNU Make, and a C compiler for Go's race detector. Then:

```sh
make setup      # locked npm install, browser binaries (once)
make test       # ALL Go, JS/unit, API, and browser tests
make check      # tests + vet/format/build + contracts + embedded assets
make build      # bin/server
```

On Linux, Playwright may also need system libraries:

```sh
npm exec -- playwright install --with-deps chromium firefox webkit
```

Use `make` for a command list; VS Code's default Test task runs `make test`.
Focused targets: `make test-go`, `make test-js`, `make test-e2e`.
A separate test.sh is unnecessary: Make owns the orchestration. `make check`
does not silently include Docker, Hugo, or vulnerability scans; run their explicit
checks when those surfaces change, as described in the development guide.

Make is optional; see the Makefile for equivalent Go commands.

```text
cmd/server/       process wiring, lifecycle, health probe
internal/config/  validated environment configuration
internal/web/     HTTP handlers, HTML layouts/partials, embedded assets
tests/            JS/unit, API, desktop/mobile browser regressions
scripts/          test, security, CI/release and repository setup helpers
docs/contracts/   canonical behavior definitions (not published by default)
docs/             self-contained Hugo documentation site
.github/          CI, dependency updates, opt-in publishing
```

Keep application logic in focused `internal` packages as requirements emerge.
No database, authentication, scheduler, or client-rendering framework is imposed.
Go owns business rules and escaped HTML; htmx owns server-driven updates; small
JS modules own browser-local behavior. The greeting form demonstrates this and
still works with JS disabled. See the [contract guide](docs/contracts/README.md).
The structure draws on network-list-sync, audplexus, and PrintMaster patterns;
no application code was copied.

## Deploy locally

```sh
cp .env.example .env
docker compose up --build -d
docker compose logs -f
docker compose down
```

Compose binds `127.0.0.1:8080` by default. Change `APP_PORT` in `.env` for its
host port; native Go execution reads exported variables, not `.env`.
The image is multistage, non-root, and includes a built-in health probe. Compose
uses a read-only filesystem and drops Linux capabilities. Put a TLS reverse
proxy in front of any remotely accessible deployment.

## Documentation

Install Hugo **0.169.0** from its [official releases](https://github.com/gohugoio/hugo/releases),
verifying the release checksum, then:

```sh
make docs-serve  # http://localhost:1313/
make docs       # docs/public/
```

Start with [getting started](docs/content/getting-started.html),
[architecture](docs/content/architecture.html),
[development](docs/content/development.html), and
[deployment](docs/content/deployment.html). Content, layouts, and styles live
together under `docs/`, with no third-party theme.

## Automation and privacy

- CI runs change-scoped checks with a stable required `CI gate`; PR validation
  is read-only and secret-free. Contract-only changes skip app jobs.
- Dependabot covers Go, npm, Docker, and GitHub Actions weekly; no auto-merges.
- Actions/base images/tools are pinned; npm installs skip lifecycle scripts.
- **Publishing is opt-in.** After setup, `PUBLISH_CONTAINER=true` enables dev
  images from relevant passing main CI. Beta/RC are explicit actions; normal
  releases use Release Please PRs, full validation and environment approval.
- Initial downloads: Linux/Windows x64, macOS x64/ARM64. Images: Linux x64.
- Downloads include checksums/provenance; image tags separate dev/beta/RC/normal.
- Pages requires `PUBLISH_DOCS=true`, Pages configured for GitHub Actions, and
  a manual default-branch run with explicit publication confirmation.
- **A private repository can still have a public Pages site.** Review content
  and access controls before enabling publishing. Repository/package visibility
  is never changed by these workflows.

See [delivery and setup](docs/content/deployment.html) and
[security policy](SECURITY.md). GitHub settings do not automatically transfer
to repositories created from a template.

## Use as a template

Create your new repository, change the module path with `go mod edit
-module=github.com/OWNER/PROJECT`, update imports under `cmd/server/`, and
rename template/docs/release project titles. Review the license, contracts,
repository settings, and publishing opt-ins before sharing. Preview setup:

```sh
node scripts/setup-github.mjs --repo OWNER/PROJECT
```

The public-repo baseline requires explicit `--apply`; add `--enable-publishing`
only when ready to authorize publication. It never changes visibility.
Run `make check`, `make docs`, and the Compose deployment before adding features.
