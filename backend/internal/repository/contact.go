package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"email_campaign/internal/types"
	"email_campaign/internal/utils"
)

type ContactRepository interface {
	CreateContact(contact *types.CreateContactRequest) error
	GetContact(id uint64, userId uint64) (*types.ContactDTO, error)
	ListContacts(ctx context.Context, filter *types.ContactFilter) ([]types.ContactDTO, int64, error)
}

type contactRepository struct {
	db *sql.DB
}

func NewContactRepository(db *sql.DB) ContactRepository {
	return &contactRepository{db: db}
}

func (r *contactRepository) CreateContact(contact *types.CreateContactRequest) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Check if contact already exists
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM contacts WHERE user_id = ? AND email = ?)`
	err = tx.QueryRow(checkQuery, contact.UserID, contact.Email).Scan(&exists)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("contact already exists")
	}

	// Insert contact
	query := `INSERT INTO contacts (user_id, email, first_name, last_name, phone, company, is_subscribed, custom_fields, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`

	res, err := tx.Exec(query, contact.UserID, contact.Email, contact.FirstName, contact.LastName, contact.Phone, contact.Company, contact.IsSubscribed, contact.CustomFields)
	if err != nil {
		return err
	}

	contactID, err := res.LastInsertId()
	if err != nil {
		return err
	}

	// Insert tags
	if len(contact.TagIDs) > 0 {
		tagQuery := `INSERT INTO contact_tags (contact_id, tag_id) VALUES (?, ?)`
		stmt, err := tx.Prepare(tagQuery)
		if err != nil {
			return err
		}
		defer stmt.Close()

		for _, tagID := range contact.TagIDs {
			_, err = stmt.Exec(contactID, tagID)
			if err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}

func (r *contactRepository) GetContact(id uint64, userId uint64) (*types.ContactDTO, error) {

	baseQuery := `SELECT id, user_id, email, first_name, last_name, phone, company, is_subscribed, is_bounced, bounce_count, custom_fields, created_at, updated_at, last_contacted_at FROM contacts WHERE id = ? AND user_id = ?`
	//get tags as well

	args := []interface{}{id, userId, id}

	row := r.db.QueryRow(baseQuery, args...)
	var contact types.ContactDTO
	if err := row.Scan(
		&contact.ID, &contact.UserID, &contact.Email, &contact.FirstName, &contact.LastName,
		&contact.Phone, &contact.Company, &contact.IsSubscribed, &contact.IsBounced,
		&contact.BounceCount, &contact.CustomFields, &contact.CreatedAt, &contact.UpdatedAt,
		&contact.LastContactedAt,
	); err != nil {
		return nil, err
	}
	return &contact, nil
}

func (r *contactRepository) ListContacts(ctx context.Context, filter *types.ContactFilter) ([]types.ContactDTO, int64, error) {
	baseQuery := `SELECT id, user_id, email, first_name, last_name, phone, company, is_subscribed, is_bounced, bounce_count, custom_fields, created_at, updated_at, last_contacted_at FROM contacts WHERE user_id = ?`
	args := []interface{}{filter.UserID}

	if len(filter.TagIDs) > 0 {
		baseQuery = `SELECT DISTINCT c.id, c.user_id, c.email, c.first_name, c.last_name, c.phone, c.company, c.is_subscribed, c.is_bounced, c.bounce_count, c.custom_fields, c.created_at, c.updated_at, c.last_contacted_at 
                 FROM contacts c 
                 JOIN contact_tags ct ON c.id = ct.contact_id 
                 WHERE c.user_id = ?`

		placeholders := make([]string, len(filter.TagIDs))
		for i, id := range filter.TagIDs {
			placeholders[i] = "?"
			args = append(args, id)
		}
		baseQuery += fmt.Sprintf(" AND ct.tag_id IN (%s)", strings.Join(placeholders, ","))
	}

	if filter.IsSubscribed != nil {
		baseQuery += " AND is_subscribed = ?"
		args = append(args, *filter.IsSubscribed)
	}

	if filter.IsBounced != nil {
		baseQuery += " AND is_bounced = ?"
		args = append(args, *filter.IsBounced)
	}

	// Initialize Paginator
	paginator := utils.NewPaginator(filter.Page, filter.Limit, filter.SortBy, filter.SortOrder, filter.Search)

	// Define allowed sort fields and search fields
	allowedSortFields := []string{"created_at", "updated_at", "email", "first_name", "last_name", "company"}
	searchFields := []string{"email", "first_name", "last_name", "company"}

	// Build Count Query
	countQuery, countArgs := paginator.BuildCountQuery(baseQuery, args, searchFields)
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Apply Pagination, Sorting, and Search to the main query
	query, queryArgs := paginator.Apply(baseQuery, args, allowedSortFields, searchFields)

	rows, err := r.db.QueryContext(ctx, query, queryArgs...)
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
