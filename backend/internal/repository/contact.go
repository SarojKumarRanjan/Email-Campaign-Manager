package repository

import (
	"database/sql"
	"email_campaign/internal/types"
)

type ContactRepository interface {
	CreateContact(contact *types.CreateContactRequest) error
	GetContact(id uint64) (*types.ContactDTO, error)
	ListContacts(filter *types.ContactFilter) ([]types.ContactDTO, error)
}

type contactRepository struct {
	db *sql.DB
}

func NewContactRepository(db *sql.DB) ContactRepository {
	return &contactRepository{db: db}
}

func (r *contactRepository) CreateContact(contact *types.CreateContactRequest) error {
	// TODO: Implement
	return nil
}

func (r *contactRepository) GetContact(id uint64) (*types.ContactDTO, error) {
	// TODO: Implement
	return nil, nil
}

func (r *contactRepository) ListContacts(filter *types.ContactFilter) ([]types.ContactDTO, error) {
	// TODO: Implement
	return nil, nil
}
