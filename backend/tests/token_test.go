package tests

import (
	"testing"

	"email_campaign/internal/utils"
)

func TestTokenGeneration(t *testing.T) {
	token := generateTestToken(1)
	t.Logf("Generated token: %s", token)

	claims, err := utils.ValidateToken(token)
	if err != nil {
		t.Fatalf("Token validation failed: %v", err)
	}

	if claims.UserID != 1 {
		t.Fatalf("Expected UserID 1, got %d", claims.UserID)
	}

	t.Logf("Token validated successfully, UserID: %d", claims.UserID)
}
