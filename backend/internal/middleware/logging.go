package middleware

import (
	"fmt"
	"net/http"
	"time"

	"email_campaign/internal/logger"
)

// ANSI Color Codes
const (
	ColorReset  = "\033[0m"
	ColorRed    = "\033[31m"
	ColorGreen  = "\033[32m"
	ColorYellow = "\033[33m"
	ColorBlue   = "\033[34m"
	ColorCyan   = "\033[36m"
)

type responseWriter struct {
	http.ResponseWriter
	status      int
	wroteHeader bool
}

func wrapResponseWriter(w http.ResponseWriter) *responseWriter {
	return &responseWriter{ResponseWriter: w}
}

func (rw *responseWriter) Status() int {
	return rw.status
}

func (rw *responseWriter) WriteHeader(code int) {
	if rw.wroteHeader {
		return
	}
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
	rw.wroteHeader = true
}

func RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrapped := wrapResponseWriter(w)
		next.ServeHTTP(wrapped, r)
		duration := time.Since(start)

		status := wrapped.Status()
		if status == 0 {
			status = 200
		}

		// Determine color based on status
		color := ColorGreen
		if status >= 500 {
			color = ColorRed
		} else if status >= 400 {
			color = ColorYellow
		} else if status >= 300 {
			color = ColorCyan
		}

		// Console Log (Django style)
		fmt.Printf("%s[%s] %s %s %d %v%s\n",
			color,
			time.Now().Format("02/Jan/2006 15:04:05"),
			r.Method,
			r.URL.Path,
			status,
			duration,
			ColorReset,
		)

		// File Log
		logger.Info("Request", map[string]interface{}{
			"method":   r.Method,
			"path":     r.URL.Path,
			"status":   status,
			"duration": duration.String(),
			"ip":       r.RemoteAddr,
		})
	})
}
