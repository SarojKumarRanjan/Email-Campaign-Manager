package middleware

import (
	"context"
	"net/http"
	"strings"

	"email_campaign/internal/types"
	"email_campaign/internal/utils"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
			return
		}

		headerParts := strings.Split(authHeader, " ")

		if len(headerParts) != 2 || headerParts[0] != "Bearer" {
			utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
			return
		}

		tokenString := headerParts[1]

		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
			return
		}

		ctx := context.WithValue(r.Context(), types.UserIDKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
