package main

import (
	"context"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/mstrhakr/go-template/internal/config"
)

func TestCheckHealth(t *testing.T) {
	for _, status := range []int{http.StatusOK, http.StatusServiceUnavailable} {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path != "/healthz" {
				t.Errorf("unexpected health path: %s", r.URL.Path)
			}
			w.WriteHeader(status)
		}))
		err := checkHealth(server.Listener.Addr().String())
		server.Close()
		if (err == nil) != (status == http.StatusOK) {
			t.Errorf("status %d: error = %v", status, err)
		}
	}
	if err := checkHealth("invalid"); err == nil {
		t.Error("expected invalid address error")
	}
}

func TestRunShutdown(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	done := make(chan error, 1)
	go func() {
		done <- run(ctx, config.Config{Addr: "127.0.0.1:0"}, slog.New(slog.NewTextHandler(io.Discard, nil)))
	}()
	select {
	case err := <-done:
		if err != nil {
			t.Fatal(err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("shutdown timed out")
	}
}

func TestRunListenFailure(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer listener.Close()
	if err := run(context.Background(), config.Config{Addr: listener.Addr().String()}, slog.New(slog.NewTextHandler(io.Discard, nil))); err == nil {
		t.Fatal("expected listen error")
	}
}
