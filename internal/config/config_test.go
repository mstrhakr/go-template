package config

import (
	"log/slog"
	"testing"
)

func TestLoad(t *testing.T) {
	for _, tt := range []struct {
		name, addr, level string
		wantAddr          string
		wantLevel         slog.Level
		wantErr           bool
	}{
		{name: "defaults", wantAddr: ":8080", wantLevel: slog.LevelInfo},
		{name: "overrides", addr: "127.0.0.1:9000", level: "debug", wantAddr: "127.0.0.1:9000", wantLevel: slog.LevelDebug},
		{name: "IPv6", addr: "[::1]:8080", wantAddr: "[::1]:8080", wantLevel: slog.LevelInfo},
		{name: "missing port", addr: "localhost", wantErr: true},
		{name: "invalid port", addr: ":http", wantErr: true},
		{name: "zero port", addr: ":0", wantErr: true},
		{name: "large port", addr: ":65536", wantErr: true},
		{name: "negative port", addr: ":-1", wantErr: true},
		{name: "invalid level", level: "verbose", wantErr: true},
	} {
		t.Run(tt.name, func(t *testing.T) {
			t.Setenv("APP_ADDR", tt.addr)
			t.Setenv("APP_LOG_LEVEL", tt.level)
			got, err := Load()
			if (err != nil) != tt.wantErr {
				t.Fatalf("Load() error = %v, wantErr %v", err, tt.wantErr)
			}
			if !tt.wantErr && (got.Addr != tt.wantAddr || got.LogLevel != tt.wantLevel) {
				t.Fatalf("Load() = %+v", got)
			}
		})
	}
}
