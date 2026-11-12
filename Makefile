.PHONY: run build test vet fmt check docs docs-serve

run:
	go run ./cmd/server

build:
	go build -trimpath -o bin/server ./cmd/server

test:
	go test -race -count=1 ./...

vet:
	go vet ./...

fmt:
	gofmt -w cmd internal

check: vet test
	@test -z "$$(gofmt -l cmd internal)" || (echo "Run make fmt"; exit 1)
	go build ./...

docs:
	hugo --source docs --minify --panicOnWarning

docs-serve:
	hugo server --source docs --bind 127.0.0.1
