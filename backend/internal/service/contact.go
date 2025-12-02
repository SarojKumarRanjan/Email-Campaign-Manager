package service

import (
	"context"
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type ContactService interface {
	CreateContact(req *types.CreateContactRequest) error
	GetContact(id uint64) (*types.ContactDTO, error)
	ListContacts(ctx context.Context, filter *types.ContactFilter) ([]types.ContactDTO, int64, error)
}

type contactService struct {
	repo repository.ContactRepository
}

func NewContactService(repo repository.ContactRepository) ContactService {
	return &contactService{repo: repo}
}

func (s *contactService) CreateContact(req *types.CreateContactRequest) error {
	return s.repo.CreateContact(req)
}

func (s *contactService) GetContact(id uint64) (*types.ContactDTO, error) {
	return s.repo.GetContact(id)
}

func (s *contactService) ListContacts(ctx context.Context, filter *types.ContactFilter) ([]types.ContactDTO, int64, error) {
	return s.repo.ListContacts(ctx, filter)
}
