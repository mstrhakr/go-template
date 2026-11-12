package web

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHandler(t *testing.T) {
	for _, tt := range []struct {
		method, path, body, contentType string
		status                          int
	}{
		{"GET", "/", "Your new project starts here.", "text/html; charset=utf-8", http.StatusOK},
		{"GET", "/healthz", "{\"status\":\"ok\"}\n", "application/json", http.StatusOK},
		{"HEAD", "/healthz", "", "application/json", http.StatusOK},
		{"GET", "/missing", "404 page not found", "text/plain; charset=utf-8", http.StatusNotFound},
		{"POST", "/healthz", "Method Not Allowed", "text/plain; charset=utf-8", http.StatusMethodNotAllowed},
	} {
		t.Run(tt.method+" "+tt.path, func(t *testing.T) {
			response := httptest.NewRecorder()
			Handler().ServeHTTP(response, httptest.NewRequest(tt.method, tt.path, nil))
			if response.Code != tt.status || !strings.Contains(response.Body.String(), tt.body) {
				t.Fatalf("response = %d %q", response.Code, response.Body.String())
			}
			if got := response.Header().Get("Content-Type"); got != tt.contentType {
				t.Errorf("Content-Type = %q", got)
			}
			for _, header := range []string{"X-Content-Type-Options", "Content-Security-Policy", "Referrer-Policy"} {
				if response.Header().Get(header) == "" {
					t.Errorf("missing %s", header)
				}
			}
		})
	}
}
