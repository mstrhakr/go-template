# go-template

A small, maintainable Go web application foundation. One executable, standard
library only, with room to grow—not a preselected application framework.

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

```sh
make check      # vet, race-enabled tests, formatting check, build
make build      # bin/server
make fmt        # format source
```

Make is optional; see the Makefile for equivalent Go commands.

```text
cmd/server/       process wiring, lifecycle, health probe
internal/config/  validated environment configuration
internal/web/     HTTP handlers and embedded assets
docs/             self-contained Hugo documentation site
.github/          CI, dependency updates, opt-in publishing
```

Keep application logic in focused `internal` packages as requirements emerge.
No database, authentication, scheduler, or frontend framework is imposed.
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

- CI checks Go, builds and smoke-tests Docker, and builds Hugo on pushes/PRs.
- Dependabot checks Go modules, Docker, and GitHub Actions weekly.
- Workflow actions and the Go build image are pinned; Hugo is checksum-verified.
- **Nothing publishes automatically.** GHCR publishing requires the repository
  variable `PUBLISH_CONTAINER=true` and a manual default-branch workflow run.
- Pages requires `PUBLISH_DOCS=true`, Pages configured for GitHub Actions, and
  a manual default-branch run with explicit publication confirmation.
- **A private repository can still have a public Pages site.** Review content
  and access controls before enabling publishing. Repository/package visibility
  is never changed by these workflows.

## Use as a template

Create your new repository, change the module path with `go mod edit
-module=github.com/OWNER/PROJECT`, update imports under `cmd/server/`, and
rename the landing page and docs titles. Review the license, repository
settings, and publishing opt-ins before sharing. Run `make check`, `make docs`,
and the Compose deployment before adding application features.
