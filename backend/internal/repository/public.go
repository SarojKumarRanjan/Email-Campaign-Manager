package repository

import (
	"database/sql"
)

type PublicRepository interface {
	Unsubscribe(token string) error
	Resubscribe(token string) error
	UpdatePreferences(token string, isSubscribed bool) error
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

func (r *publicRepository) Resubscribe(token string) error {
	// TODO: Implement
	return nil
}

func (r *publicRepository) UpdatePreferences(token string, isSubscribed bool) error {
	// TODO: Implement
	return nil
}
