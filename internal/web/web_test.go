package web

import (
	"mime"
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
		{"GET", "/?name=Alice", "Hello, Alice.", "text/html; charset=utf-8", http.StatusOK},
		{"GET", "/static/app.js", "htmx:responseError", "text/javascript; charset=utf-8", http.StatusOK},
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

func TestPartialAndEscaping(t *testing.T) {
	for _, restore := range []bool{false, true} {
		request := httptest.NewRequest("GET", "/?name=%3Cscript%3Ealert(1)%3C%2Fscript%3E", nil)
		request.Header.Set("HX-Request", "true")
		if restore {
			request.Header.Set("HX-History-Restore-Request", "true")
		}
		response := httptest.NewRecorder()
		Handler().ServeHTTP(response, request)
		body := response.Body.String()
		if response.Code != http.StatusOK || strings.Contains(body, "<script>alert(1)</script>") || !strings.Contains(body, "&lt;script&gt;") {
			t.Fatalf("unsafe or unsuccessful response: %d %q", response.Code, body)
		}
		if strings.Contains(body, "<!doctype html>") != restore {
			t.Fatalf("history restore=%v returned wrong representation: %q", restore, body)
		}
		if response.Header().Get("Vary") != "HX-Request, HX-History-Restore-Request" {
			t.Fatal("missing representation cache boundary")
		}
	}
}

func TestCrossOriginMutationRejected(t *testing.T) {
	request := httptest.NewRequest("POST", "http://example.com/", nil)
	request.Header.Set("Origin", "https://attacker.invalid")
	response := httptest.NewRecorder()
	Handler().ServeHTTP(response, request)
	if response.Code != http.StatusForbidden {
		t.Fatalf("cross-origin POST = %d", response.Code)
	}
}

func TestNameLimit(t *testing.T) {
	response := httptest.NewRecorder()
	Handler().ServeHTTP(response, httptest.NewRequest("GET", "/?name="+strings.Repeat("a", 101), nil))
	if response.Code != http.StatusBadRequest {
		t.Fatalf("oversized input = %d", response.Code)
	}
}

func TestScriptContentTypeIgnoresHostRegistry(t *testing.T) {
	original := mime.TypeByExtension(".js")
	t.Cleanup(func() { _ = mime.AddExtensionType(".js", original) })
	if err := mime.AddExtensionType(".js", "application/javascript"); err != nil {
		t.Fatal(err)
	}
	response := httptest.NewRecorder()
	Handler().ServeHTTP(response, httptest.NewRequest("GET", "/static/app.js", nil))
	if response.Code != http.StatusOK || response.Header().Get("Content-Type") != "text/javascript; charset=utf-8" {
		t.Fatalf("host MIME leaked into response: %d %v", response.Code, response.Header())
	}
}
