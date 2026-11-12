.DEFAULT_GOAL := help
.PHONY: help run build setup test test-go test-unit test-js test-e2e test-smoke vet fmt check check-go check-assets check-contracts docs docs-serve docs-contracts check-workflows check-security check-container

help:
	@echo "make setup       Install locked JS tools and Playwright browsers"
	@echo "make test        Run all Go, JS/unit, API, and browser tests"
	@echo "make check       Full tests, static checks, contracts, asset verification, build"
	@echo "make test-go     Race-enabled Go tests (requires a C compiler)"
	@echo "make test-js     JS/unit and browserless API tests"
	@echo "make test-e2e    Desktop browsers and mobile Chromium"
	@echo "make run         Start the application"
	@echo "make docs        Build documentation (requires Hugo)"

setup:
	npm ci --ignore-scripts
	npm run test:setup

run:
	go run ./cmd/server

build:
	go build -trimpath -o bin/server ./cmd/server

test: test-go test-js test-e2e

test-go:
	CGO_ENABLED=1 go test -race -count=1 ./...

test-unit:
	npm run test:unit

test-js: test-unit
	npm run test:js

test-e2e:
	npm run test:e2e

test-smoke:
	npm run test:smoke

vet:
	go vet ./...

fmt:
	gofmt -w cmd internal

check-go: vet test-go
	@test -z "$$(gofmt -l cmd internal)" || (echo "Run make fmt"; exit 1)
	go build ./...

check-assets:
	npm run assets:check

check-contracts:
	npm run contracts:check

check: check-go test-js test-e2e check-assets check-contracts

docs:
	hugo --source docs --minify --panicOnWarning

docs-serve:
	hugo server --source docs --bind 127.0.0.1

docs-contracts:
	hugo server --source docs --config hugo.toml,hugo.contracts.toml --bind 127.0.0.1

check-workflows:
	node scripts/workflows.mjs
	go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.12 -shellcheck=

check-security:
	npm audit --audit-level=low
	go run golang.org/x/vuln/cmd/govulncheck@v1.9.0 ./...

check-container:
	docker build -t go-template:ci .
	node scripts/scan-image.mjs go-template:ci
