package repository

import (
	"database/sql"
	"email_campaign/internal/types"
)

type TemplateRepository interface {
	CreateTemplate(template *types.CreateTemplateRequest) error
	GetTemplate(id uint64) (*types.TemplateDTO, error)
	ListTemplates(filter *types.TemplateFilter) ([]types.TemplateDTO, error)
}

type templateRepository struct {
	db *sql.DB
}

func NewTemplateRepository(db *sql.DB) TemplateRepository {
	return &templateRepository{db: db}
}

func (r *templateRepository) CreateTemplate(template *types.CreateTemplateRequest) error {
	// TODO: Implement
	return nil
}

func (r *templateRepository) GetTemplate(id uint64) (*types.TemplateDTO, error) {
	// TODO: Implement
	return nil, nil
}

func (r *templateRepository) ListTemplates(filter *types.TemplateFilter) ([]types.TemplateDTO, error) {
	// TODO: Implement
	return nil, nil
}
