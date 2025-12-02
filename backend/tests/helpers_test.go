package tests

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type testClaims struct {
	UserID uint64 `json:"user_id"`
	jwt.RegisteredClaims
}

func generateTestToken(userID uint64) string {
	claims := testClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// Must match the secret set in SetupTestServer
	signedToken, _ := token.SignedString([]byte("testsecret"))
	return signedToken
}
