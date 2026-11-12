package web

import (
	"bytes"
	"embed"
	"html/template"
	"io/fs"
	"net/http"
	"strings"
)

//go:embed templates static
var content embed.FS

type pageData struct {
	Name string
}

func Handler() http.Handler {
	pages := template.Must(template.ParseFS(content, "templates/*.html", "templates/partials/*.html"))
	assets, err := fs.Sub(content, "static")
	if err != nil {
		panic(err)
	}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /{$}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Vary", "HX-Request, HX-History-Restore-Request")
		name := strings.TrimSpace(r.URL.Query().Get("name"))
		if len(name) > 100 {
			http.Error(w, "Name must be at most 100 bytes", http.StatusBadRequest)
			return
		}
		view := "page"
		if r.Header.Get("HX-Request") == "true" && r.Header.Get("HX-History-Restore-Request") != "true" {
			view = "greeting"
		}
		var result bytes.Buffer
		if err := pages.ExecuteTemplate(&result, view, pageData{Name: name}); err != nil {
			http.Error(w, "Unable to render page", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = result.WriteTo(w)
	})
	mux.Handle("GET /static/", http.StripPrefix("/static/", http.FileServerFS(assets)))
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte("{\"status\":\"ok\"}\n"))
	})
	protected := http.NewCrossOriginProtection().Handler(mux)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Content-Security-Policy", "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
		w.Header().Set("Referrer-Policy", "no-referrer")
		protected.ServeHTTP(w, r)
	})
}
