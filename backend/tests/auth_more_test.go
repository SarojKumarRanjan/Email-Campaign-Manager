package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"

	"email_campaign/internal/types"
)

func TestAuth_GetProfile(t *testing.T) {
	server, mock, teardown := SetupTestServer(t)
	defer teardown()

	token := generateTestToken(1)

	// Expect GetUserByID query
	rows := sqlmock.NewRows([]string{"id", "email", "first_name", "last_name", "company_name", "is_active", "created_at", "updated_at"}).
		AddRow(1, "test@example.com", "John", "Doe", "Acme", true, time.Now(), time.Now())
	mock.ExpectQuery("SELECT id, email, password_hash, first_name, last_name, company_name, is_active, created_at, updated_at FROM users").
		WithArgs(1).
		WillReturnRows(rows)

	req, _ := http.NewRequest("GET", "/api/v1/auth/profile", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	server.Handler.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestAuth_UpdateProfile(t *testing.T) {
	server, mock, teardown := SetupTestServer(t)
	defer teardown()

	token := generateTestToken(1)

	reqBody := types.UpdateUserRequest{
		FirstName: "Jane",
		LastName:  "Doe",
	}
	body, _ := json.Marshal(reqBody)

	// Expect UpdateUser query
	mock.ExpectExec("UPDATE users SET").
		WithArgs(reqBody.FirstName, reqBody.LastName, sqlmock.AnyArg(), sqlmock.AnyArg(), 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	req, _ := http.NewRequest("PUT", "/api/v1/auth/profile", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	server.Handler.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.NoError(t, mock.ExpectationsWereMet())
}
