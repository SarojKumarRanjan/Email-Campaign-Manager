package middleware

import (
	"context"
	"net/http"

	"email_campaign/internal/types"
	"email_campaign/internal/utils"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("access_token")
		if err != nil {
			utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized: No token provided")
			return
		}

		tokenString := cookie.Value
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized: Invalid token")
			return
		}

		ctx := context.WithValue(r.Context(), types.UserIDKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
