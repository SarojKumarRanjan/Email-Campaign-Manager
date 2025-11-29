package repository

import (
	"database/sql"
	"email_campaign/internal/types"
)

type SearchRepository interface {
	Search(query string) (*types.SearchResponse, error)
}

type searchRepository struct {
	db *sql.DB
}

func NewSearchRepository(db *sql.DB) SearchRepository {
	return &searchRepository{db: db}
}

func (r *searchRepository) Search(query string) (*types.SearchResponse, error) {
	// TODO: Implement
	return nil, nil
}
