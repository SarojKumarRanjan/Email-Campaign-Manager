package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type ContactService interface {
	CreateContact(req *types.CreateContactRequest) error
	GetContact(id uint64) (*types.ContactDTO, error)
	ListContacts(filter *types.ContactFilter) ([]types.ContactDTO, error)
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

func (s *contactService) ListContacts(filter *types.ContactFilter) ([]types.ContactDTO, error) {
	return s.repo.ListContacts(filter)
}
