package database

import (
	"database/sql"
)

type Service interface {
	Health() map[string]string
	Close() error
	DB() *sql.DB
}
