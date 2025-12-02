package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"email_campaign/internal/types"
)

type ContactRepository interface {
	CreateContact(contact *types.CreateContactRequest) error
	GetContact(id uint64) (*types.ContactDTO, error)
	ListContacts(ctx context.Context, filter *types.ContactFilter) ([]types.ContactDTO, int64, error)
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

func (r *contactRepository) ListContacts(ctx context.Context, filter *types.ContactFilter) ([]types.ContactDTO, int64, error) {
	query := `SELECT id, user_id, email, first_name, last_name, phone, company, is_subscribed, is_bounced, bounce_count, custom_fields, created_at, updated_at, last_contacted_at FROM contacts WHERE user_id = ?`
	args := []interface{}{filter.UserID}

	if len(filter.TagIDs) > 0 {

		query = `SELECT DISTINCT c.id, c.user_id, c.email, c.first_name, c.last_name, c.phone, c.company, c.is_subscribed, c.is_bounced, c.bounce_count, c.custom_fields, c.created_at, c.updated_at, c.last_contacted_at 
                 FROM contacts c 
                 JOIN contact_tags ct ON c.id = ct.contact_id 
                 WHERE c.user_id = ?`

		placeholders := make([]string, len(filter.TagIDs))
		for i, id := range filter.TagIDs {
			placeholders[i] = "?"
			args = append(args, id)
		}
		query += fmt.Sprintf(" AND ct.tag_id IN (%s)", strings.Join(placeholders, ","))
	}

	if filter.IsSubscribed != nil {
		query += " AND is_subscribed = ?"
		args = append(args, *filter.IsSubscribed)
	}

	if filter.IsBounced != nil {
		query += " AND is_bounced = ?"
		args = append(args, *filter.IsBounced)
	}

	if filter.Search != "" {
		search := "%" + filter.Search + "%"
		query += " AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR company LIKE ?)"
		args = append(args, search, search, search, search)
	}

	// Count query
	countQuery := "SELECT COUNT(*) FROM (" + query + ") as count_table"
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Pagination
	query += " ORDER BY created_at DESC"
	if filter.Limit > 0 {
		query += " LIMIT ?"
		args = append(args, filter.Limit)
	}
	if filter.Page > 0 && filter.Limit > 0 {
		offset := (filter.Page - 1) * filter.Limit
		query += " OFFSET ?"
		args = append(args, offset)
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var contacts []types.ContactDTO
	for rows.Next() {
		var c types.ContactDTO
		var customFields []byte
		err := rows.Scan(
			&c.ID, &c.UserID, &c.Email, &c.FirstName, &c.LastName,
			&c.Phone, &c.Company, &c.IsSubscribed, &c.IsBounced,
			&c.BounceCount, &customFields, &c.CreatedAt, &c.UpdatedAt,
			&c.LastContactedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		if len(customFields) > 0 {
			c.CustomFields = json.RawMessage(customFields)
		}
		contacts = append(contacts, c)
	}

	return contacts, total, nil
}
