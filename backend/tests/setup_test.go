package tests

import (
	"database/sql"
	"net/http"
	"os"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"

	"email_campaign/internal/config"
	"email_campaign/internal/server"
)

// MockDatabase implements database.Service for testing
type MockDatabase struct {
	db *sql.DB
}

func (m *MockDatabase) Health() map[string]string {
	return map[string]string{"status": "up"}
}

func (m *MockDatabase) Close() error {
	return m.db.Close()
}

func (m *MockDatabase) DB() *sql.DB {
	return m.db
}

// SetupTestServer initializes the server with a mock database
func SetupTestServer(t *testing.T) (*http.Server, sqlmock.Sqlmock, func()) {
	os.Setenv("JWT_SECRET", "testsecret")
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}

	mockDB := &MockDatabase{db: db}

	cfg := &config.Config{
		Port: 8080,
		// Add other config fields if necessary
	}

	srv := server.NewServer(cfg, mockDB)

	teardown := func() {
		db.Close()
	}

	return srv, mock, teardown
}
