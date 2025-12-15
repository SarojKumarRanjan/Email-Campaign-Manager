package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCorsMiddleware(t *testing.T) {
	// Create a dummy handler to wrap
	dummyHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Wrap the handler with CorsMiddleware
	handler := CorsMiddleware(dummyHandler)

	t.Run("Preflight Request", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodOptions, "/", nil)
		rr := httptest.NewRecorder()

		handler.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v",
				status, http.StatusOK)
		}

		// Check headers
		expectedHeaders := map[string]string{
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
		}

		for k, v := range expectedHeaders {
			if val := rr.Header().Get(k); val != v {
				t.Errorf("handler returned wrong header %s: got %v want %v",
					k, val, v)
			}
		}
	})

	t.Run("Normal Request", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rr := httptest.NewRecorder()

		handler.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v",
				status, http.StatusOK)
		}

		if val := rr.Header().Get("Access-Control-Allow-Origin"); val != "*" {
			t.Errorf("handler returned wrong Access-Control-Allow-Origin: got %v want *", val)
		}
	})
}
