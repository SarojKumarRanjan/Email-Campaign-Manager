package service

import (
	"context"
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
	"errors"
)

type ContactService interface {
	CreateContact(req *types.CreateContactRequest) error
	GetContact(id uint64, userId uint64) (*types.ContactDTO, error)
	ListContacts(ctx context.Context, filter *types.ContactFilter) ([]types.ContactDTO, int64, error)
	UpdateContact(contactID uint64, userID uint64, req *types.UpdateContactRequest) error
	DeleteContact(contactID uint64, userID uint64) error
	GetContactByEmail(email string, userID uint64) (*types.ContactDTO, error)
	GetContactActivity(contactID uint64, userID uint64) ([]types.ContactActivityDTO, error)
	SubscribeContact(contactID uint64, userID uint64) error
	UnsubscribeContact(contactID uint64, userID uint64) error
	BulkCreateContacts(userID uint64, req *types.BulkCreateContactsRequest) error
	BulkUpdateContacts(userID uint64, req *types.BulkUpdateContactsRequest) error
	BulkDeleteContacts(userID uint64, req *types.BulkDeleteContactsRequest) error
	ImportContacts(userID uint64, req *types.ImportContactsRequest, fileType string) error
	ExportContacts(userID uint64, filter *types.ContactFilter, format string) ([]byte, error)
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

func (s *contactService) GetContact(id uint64, userId uint64) (*types.ContactDTO, error) {
	return s.repo.GetContact(id, userId)
}

func (s *contactService) ListContacts(ctx context.Context, filter *types.ContactFilter) ([]types.ContactDTO, int64, error) {
	return s.repo.ListContacts(ctx, filter)
}

func (s *contactService) UpdateContact(contactID uint64, userID uint64, req *types.UpdateContactRequest) error {
	return s.repo.UpdateContact(contactID, userID, req)
}

func (s *contactService) DeleteContact(contactID uint64, userID uint64) error {
	return s.repo.DeleteContact(contactID, userID)
}

func (s *contactService) GetContactByEmail(email string, userID uint64) (*types.ContactDTO, error) {
	return s.repo.GetContactByEmail(email, userID)
}

func (s *contactService) GetContactActivity(contactID uint64, userID uint64) ([]types.ContactActivityDTO, error) {
	return s.repo.GetContactActivity(contactID, userID)
}

func (s *contactService) SubscribeContact(contactID uint64, userID uint64) error {
	return s.repo.UpdateStatus(contactID, userID, true)
}

func (s *contactService) UnsubscribeContact(contactID uint64, userID uint64) error {
	return s.repo.UpdateStatus(contactID, userID, false)
}

func (s *contactService) BulkCreateContacts(userID uint64, req *types.BulkCreateContactsRequest) error {
	return s.repo.BulkCreateContacts(userID, req.Contacts)
}

func (s *contactService) BulkUpdateContacts(userID uint64, req *types.BulkUpdateContactsRequest) error {
	return s.repo.BulkUpdateContacts(userID, req)
}

func (s *contactService) BulkDeleteContacts(userID uint64, req *types.BulkDeleteContactsRequest) error {
	return s.repo.BulkDeleteContacts(userID, req.ContactIDs)
}

func (s *contactService) ImportContacts(userID uint64, req *types.ImportContactsRequest, fileType string) error {
	var records []map[string]string
	var err error

	if fileType == "csv" {
		records, err = utils.ParseCSV(req.FileData)
	} else if fileType == "excel" {
		records, err = utils.ParseExcel(req.FileData)
	} else {
		return errors.New("unsupported file type")
	}

	if err != nil {
		return err
	}

	var contacts []types.CreateContactRequest
	for _, record := range records {
		contact := types.CreateContactRequest{}

		// Map fields based on user provided mapping or default
		if email, ok := record[req.FieldMapping["email"]]; ok && email != "" {
			contact.Email = email
		} else if email, ok := record["email"]; ok && email != "" {
			contact.Email = email
		} else {
			continue // Skip records without email
		}

		if name, ok := record[req.FieldMapping["first_name"]]; ok {
			contact.FirstName = name
		} else if name, ok := record["first_name"]; ok {
			contact.FirstName = name
		}

		if name, ok := record[req.FieldMapping["last_name"]]; ok {
			contact.LastName = name
		} else if name, ok := record["last_name"]; ok {
			contact.LastName = name
		}

		if phone, ok := record[req.FieldMapping["phone"]]; ok {
			contact.Phone = phone
		} else if phone, ok := record["phone"]; ok {
			contact.Phone = phone
		}

		if company, ok := record[req.FieldMapping["company"]]; ok {
			contact.Company = company
		} else if company, ok := record["company"]; ok {
			contact.Company = company
		}

		contact.IsSubscribed = true // Default to subscribed on import

		contacts = append(contacts, contact)
	}

	if len(contacts) == 0 {
		return errors.New("no valid contacts found in file")
	}

	// Process in batches of 100
	batchSize := 100
	for i := 0; i < len(contacts); i += batchSize {
		end := i + batchSize
		if end > len(contacts) {
			end = len(contacts)
		}

		batch := contacts[i:end]
		// In a real scenario, we might want to collect errors but continue
		// For now fail fast or we could return a report
		if err := s.repo.BulkCreateContacts(userID, batch); err != nil {
			return err
		}
	}

	return nil
}

func (s *contactService) ExportContacts(userID uint64, filter *types.ContactFilter, format string) ([]byte, error) {
	// For export, we likely want all contacts matching filter, so high limit
	filter.Limit = 100000 // reasonable max for now
	filter.Page = 1

	contacts, _, err := s.repo.ListContacts(context.Background(), filter)
	if err != nil {
		return nil, err
	}

	var data []map[string]interface{}
	for _, c := range contacts {
		row := map[string]interface{}{
			"email":      c.Email,
			"first_name": c.FirstName,
			"last_name":  c.LastName,
			"phone":      c.Phone,
			"company":    c.Company,
			"created_at": c.CreatedAt.Format("2006-01-02 15:04:05"),
		}
		data = append(data, row)
	}

	if format == "csv" {
		return utils.GenerateCSV(data)
	}
	// TODO: Excel generation if needed, reusing logic
	return nil, errors.New("unsupported format")
}
