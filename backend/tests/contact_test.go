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

func TestContact_ListContacts(t *testing.T) {
	server, mock, teardown := SetupTestServer(t)
	defer teardown()

	token := generateTestToken(1)

	// Expect Count Query
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(2))

	// Expect List Query with pagination (userID, limit, offset)
	rows := sqlmock.NewRows([]string{
		"id", "user_id", "email", "first_name", "last_name", "phone", "company",
		"is_subscribed", "is_bounced", "bounce_count", "custom_fields",
		"created_at", "updated_at", "last_contacted_at",
	}).
		AddRow(1, 1, "c1@example.com", "C1", "L1", "", "", true, false, 0, nil, time.Now(), time.Now(), nil).
		AddRow(2, 1, "c2@example.com", "C2", "L2", "", "", true, false, 0, nil, time.Now(), time.Now(), nil)

	mock.ExpectQuery("SELECT id, user_id, email").
		WithArgs(1, 10, 0). // userID=1, limit=10, offset=0
		WillReturnRows(rows)

	reqBody := types.ContactFilter{
		Page:  1,
		Limit: 10,
	}
	body, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("GET", "/api/v1/contacts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	server.Handler.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "c1@example.com")
	assert.Contains(t, w.Body.String(), "c2@example.com")
	assert.NoError(t, mock.ExpectationsWereMet())
}
