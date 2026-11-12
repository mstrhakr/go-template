# syntax=docker/dockerfile:1
FROM --platform=$BUILDPLATFORM golang:1.27.4@sha256:5e8afd493a7124a8586e134d9b532731161d4b9becf9dee5a5956b107426f93d AS build
WORKDIR /src
COPY go.* ./
RUN go mod download
COPY . .
ARG TARGETOS
ARG TARGETARCH
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -trimpath -ldflags="-s -w" -o /server ./cmd/server

FROM scratch
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /server /server
USER 65532:65532
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD ["/server", "-healthcheck"]
ENTRYPOINT ["/server"]
