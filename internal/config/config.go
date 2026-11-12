package config

import (
	"fmt"
	"log/slog"
	"net"
	"os"
	"strconv"
)

type Config struct {
	Addr     string
	LogLevel slog.Level
}

func Load() (Config, error) {
	cfg := Config{Addr: ":8080", LogLevel: slog.LevelInfo}
	if value := os.Getenv("APP_ADDR"); value != "" {
		cfg.Addr = value
	}
	_, port, err := net.SplitHostPort(cfg.Addr)
	if err != nil {
		return Config{}, fmt.Errorf("APP_ADDR must be host:port: %w", err)
	}
	number, err := strconv.Atoi(port)
	if err != nil || number < 1 || number > 65535 {
		return Config{}, fmt.Errorf("APP_ADDR port must be between 1 and 65535")
	}
	if value := os.Getenv("APP_LOG_LEVEL"); value != "" {
		if err := cfg.LogLevel.UnmarshalText([]byte(value)); err != nil {
			return Config{}, fmt.Errorf("invalid APP_LOG_LEVEL: %w", err)
		}
	}
	return cfg, nil
}
