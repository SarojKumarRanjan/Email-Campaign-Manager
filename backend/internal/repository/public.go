package repository

import (
	"database/sql"
)

type PublicRepository interface {
	Unsubscribe(token string) error
}

type publicRepository struct {
	db *sql.DB
}

func NewPublicRepository(db *sql.DB) PublicRepository {
	return &publicRepository{db: db}
}

func (r *publicRepository) Unsubscribe(token string) error {
	// TODO: Implement
	return nil
}
