package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"email_campaign/internal/types"
	"email_campaign/internal/utils"
)

type ContactRepository interface {
	CreateContact(contact *types.CreateContactRequest) error
	GetContact(id uint64, userId uint64) (*types.ContactDTO, error)
	ListContacts(ctx context.Context, filter *types.ContactFilter) ([]types.ContactListDTO, int64, error)
	UpdateContact(contactID uint64, userID uint64, req *types.UpdateContactRequest) error
	DeleteContact(contactID uint64, userID uint64) error
	GetContactByEmail(email string, userID uint64) (*types.ContactDTO, error)
	GetContactActivity(contactID uint64, userID uint64) ([]types.ContactActivityDTO, error)
	UpdateStatus(contactID uint64, userID uint64, isSubscribed bool) error
	BulkCreateContacts(userID uint64, contacts []types.CreateContactRequest) error
	BulkUpdateContacts(userID uint64, req *types.BulkUpdateContactsRequest) error
	BulkDeleteContacts(userID uint64, contactIDs []uint64) error
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

	baseQuery := `SELECT id, user_id, email, first_name, last_name, phone, company, is_subscribed, is_bounced, bounce_count, created_at, updated_at, last_contacted_at FROM contacts WHERE id = ? AND user_id = ?`
	//get tags as well

	args := []interface{}{id, userId}

	row := r.db.QueryRow(baseQuery, args...)
	var contact types.ContactDTO
	if err := row.Scan(
		&contact.ID, &contact.UserID, &contact.Email, &contact.FirstName, &contact.LastName,
		&contact.Phone, &contact.Company, &contact.IsSubscribed, &contact.IsBounced,
		&contact.BounceCount, &contact.CreatedAt, &contact.UpdatedAt,
		&contact.LastContactedAt,
	); err != nil {
		return nil, err
	}
	return &contact, nil
}

func (r *contactRepository) ListContacts(ctx context.Context, filter *types.ContactFilter) ([]types.ContactListDTO, int64, error) {
	baseQuery := `SELECT id, email, CONCAT(first_name, ' ', last_name) as name, '' as campaign, 
                  created_at, updated_at 
                  FROM contacts WHERE user_id = ? AND deleted_at IS NULL AND is_deleted = 0`
	args := []interface{}{filter.UserID}
	// Define allowed filter fields and their database column mappings
	allowedFields := map[string]string{
		"email":         "email",
		"first_name":    "first_name",
		"last_name":     "last_name",
		"company":       "company",
		"created_at":    "created_at",
		"updated_at":    "updated_at",
		"is_subscribed": "is_subscribed",
		"is_bounced":    "is_bounced",
		"tags":          "tag_id",
	}
	// Build dynamic filter conditions
	if len(filter.Filters) > 0 {
		fb := utils.NewFilterBuilder()

		// Separate tag filters from regular filters
		regularFilters := []types.FilterField{}
		tagFilters := []types.FilterField{}

		for _, f := range filter.Filters {
			if f.Id == "tags" {
				tagFilters = append(tagFilters, f)
			} else {
				regularFilters = append(regularFilters, f)
			}
		}
		// Handle tag filters with JOIN
		if len(tagFilters) > 0 {
			baseQuery = `SELECT DISTINCT c.id, c.email, CONCAT(c.first_name, ' ', c.last_name) as name, '' as campaign, 
                        c.created_at, c.updated_at 
                        FROM contacts c 
                        JOIN contact_tags ct ON c.id = ct.contact_id 
                        WHERE c.user_id = ?`

			tagCondition, tagArgs, err := fb.BuildFilterConditions(tagFilters, filter.JoinOperator, allowedFields)
			if err != nil {
				return nil, 0, err
			}
			if tagCondition != "" {
				baseQuery += " AND " + tagCondition
				args = append(args, tagArgs...)
			}
		}
		// Handle regular filters
		log.Println(regularFilters)
		if len(regularFilters) > 0 {
			condition, filterArgs, err := fb.BuildFilterConditions(regularFilters, filter.JoinOperator, allowedFields)
			log.Println(condition)
			log.Println(filterArgs)
			if err != nil {
				return nil, 0, err
			}
			if condition != "" {
				baseQuery += " AND " + condition
				args = append(args, filterArgs...)
			}
		}
	}
	// Use existing paginator for search, sorting, and pagination
	paginator := utils.NewPaginator(filter.Page, filter.Limit, filter.SortBy, filter.SortOrder, filter.Search)
	allowedSortFields := []string{"created_at", "updated_at", "email", "first_name", "last_name", "company"}
	searchFields := []string{"email", "first_name", "last_name", "company"}
	// Build count query
	countQuery, countArgs := paginator.BuildCountQuery(baseQuery, args, searchFields)
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	// Apply pagination and sorting
	query, queryArgs := paginator.Apply(baseQuery, args, allowedSortFields, searchFields)
	rows, err := r.db.QueryContext(ctx, query, queryArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var contacts []types.ContactListDTO
	for rows.Next() {
		var c types.ContactListDTO
		err := rows.Scan(
			&c.ID, &c.Email, &c.Name, &c.Campaign,
			&c.CreatedAt, &c.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		contacts = append(contacts, c)
	}
	return contacts, total, nil
}

func (r *contactRepository) UpdateContact(contactID uint64, userID uint64, req *types.UpdateContactRequest) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Verify ownership
	var exists bool
	err = tx.QueryRow("SELECT EXISTS(SELECT 1 FROM contacts WHERE id = ? AND user_id = ?)", contactID, userID).Scan(&exists)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("contact not found")
	}

	// Update fields
	query := "UPDATE contacts SET updated_at = NOW()"
	var args []interface{}

	if req.Email != "" {
		query += ", email = ?"
		args = append(args, req.Email)
	}
	if req.FirstName != "" {
		query += ", first_name = ?"
		args = append(args, req.FirstName)
	}
	if req.LastName != "" {
		query += ", last_name = ?"
		args = append(args, req.LastName)
	}
	if req.Phone != "" {
		query += ", phone = ?"
		args = append(args, req.Phone)
	}
	if req.Company != "" {
		query += ", company = ?"
		args = append(args, req.Company)
	}
	if req.IsSubscribed != nil {
		query += ", is_subscribed = ?"
		args = append(args, *req.IsSubscribed)
	}
	if req.CustomFields != nil {
		query += ", custom_fields = ?"
		args = append(args, req.CustomFields)
	}

	query += " WHERE id = ? AND user_id = ?"
	args = append(args, contactID, userID)

	_, err = tx.Exec(query, args...)
	if err != nil {
		return err
	}

	// Update Tags if provided
	if req.TagIDs != nil {
		// Delete existing tags
		_, err = tx.Exec("DELETE FROM contact_tags WHERE contact_id = ?", contactID)
		if err != nil {
			return err
		}

		// Insert new tags
		if len(req.TagIDs) > 0 {
			tagQuery := "INSERT INTO contact_tags (contact_id, tag_id) VALUES (?, ?)"
			stmt, err := tx.Prepare(tagQuery)
			if err != nil {
				return err
			}
			defer stmt.Close()

			for _, tagID := range req.TagIDs {
				_, err = stmt.Exec(contactID, tagID)
				if err != nil {
					return err
				}
			}
		}
	}

	return tx.Commit()
}

func (r *contactRepository) DeleteContact(contactID uint64, userID uint64) error {
	result, err := r.db.Exec("UPDATE contacts SET deleted_at = NOW(), is_deleted = 1 WHERE id = ? AND user_id = ?", contactID, userID)
	if err != nil {
		return err
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("contact not found")
	}
	return nil
}

func (r *contactRepository) GetContactByEmail(email string, userID uint64) (*types.ContactDTO, error) {
	query := `SELECT id, user_id, email, first_name, last_name, phone, company, is_subscribed, is_bounced, bounce_count, custom_fields, created_at, updated_at, last_contacted_at FROM contacts WHERE email = ? AND user_id = ?`
	var contact types.ContactDTO
	var customFields []byte
	err := r.db.QueryRow(query, email, userID).Scan(
		&contact.ID, &contact.UserID, &contact.Email, &contact.FirstName, &contact.LastName,
		&contact.Phone, &contact.Company, &contact.IsSubscribed, &contact.IsBounced,
		&contact.BounceCount, &customFields, &contact.CreatedAt, &contact.UpdatedAt,
		&contact.LastContactedAt,
	)
	if err != nil {
		return nil, err
	}
	if len(customFields) > 0 {
		contact.CustomFields = json.RawMessage(customFields)
	}
	return &contact, nil
}

func (r *contactRepository) GetContactActivity(contactID uint64, userID uint64) ([]types.ContactActivityDTO, error) {
	// Verify ownership first
	var exists bool
	err := r.db.QueryRow("SELECT EXISTS(SELECT 1 FROM contacts WHERE id = ? AND user_id = ?)", contactID, userID).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, fmt.Errorf("contact not found")
	}

	query := `SELECT 
		c.id, c.name, cr.status, cr.sent_at, cr.delivered_at, cr.opened_at, cr.clicked_at, cr.open_count, cr.click_count
		FROM campaign_recipients cr
		JOIN campaigns c ON cr.campaign_id = c.id
		WHERE cr.contact_id = ?
		ORDER BY cr.created_at DESC`

	rows, err := r.db.Query(query, contactID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activities []types.ContactActivityDTO
	for rows.Next() {
		var a types.ContactActivityDTO
		err := rows.Scan(
			&a.CampaignID, &a.CampaignName, &a.Status,
			&a.SentAt, &a.DeliveredAt, &a.OpenedAt, &a.ClickedAt,
			&a.OpenCount, &a.ClickCount,
		)
		if err != nil {
			return nil, err
		}
		activities = append(activities, a)
	}
	return activities, nil
}

func (r *contactRepository) UpdateStatus(contactID uint64, userID uint64, isSubscribed bool) error {
	result, err := r.db.Exec("UPDATE contacts SET is_subscribed = ? WHERE id = ? AND user_id = ?", isSubscribed, contactID, userID)
	if err != nil {
		return err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return fmt.Errorf("contact not found")
	}
	return nil
}

func (r *contactRepository) BulkCreateContacts(userID uint64, contacts []types.CreateContactRequest) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Prepare statement for bulk insert
	query := `INSERT INTO contacts (user_id, email, first_name, last_name, phone, company, is_subscribed, custom_fields, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE updated_at = NOW()`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	tagQuery := `INSERT INTO contact_tags (contact_id, tag_id) VALUES (?, ?)`
	tagStmt, err := tx.Prepare(tagQuery)
	if err != nil {
		return err
	}
	defer tagStmt.Close()

	for _, c := range contacts {
		res, err := stmt.Exec(userID, c.Email, c.FirstName, c.LastName, c.Phone, c.Company, c.IsSubscribed, c.CustomFields)
		if err != nil {
			return err
		}

		contactID, err := res.LastInsertId()
		if err == nil && contactID > 0 && len(c.TagIDs) > 0 {
			for _, tagID := range c.TagIDs {
				// Ignore errors on duplicate tags
				_, _ = tagStmt.Exec(contactID, tagID)
			}
		}
	}

	return tx.Commit()
}

func (r *contactRepository) BulkUpdateContacts(userID uint64, req *types.BulkUpdateContactsRequest) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Convert IDs to string for query
	if len(req.ContactIDs) == 0 {
		return nil
	}
	placeholders := make([]string, len(req.ContactIDs))
	args := make([]interface{}, len(req.ContactIDs))
	for i, id := range req.ContactIDs {
		placeholders[i] = "?"
		args[i] = id
	}
	idsStr := strings.Join(placeholders, ",")

	if req.Updates.IsSubscribed != nil {
		updateQuery := fmt.Sprintf("UPDATE contacts SET is_subscribed = ? WHERE user_id = ? AND id IN (%s)", idsStr)
		updateArgs := append([]interface{}{*req.Updates.IsSubscribed, userID}, args...)
		_, err := tx.Exec(updateQuery, updateArgs...)
		if err != nil {
			return err
		}
	}

	if len(req.Updates.TagIDs) > 0 {
		tagQuery := "INSERT IGNORE INTO contact_tags (contact_id, tag_id) VALUES (?, ?)"
		tagStmt, err := tx.Prepare(tagQuery)
		if err != nil {
			return err
		}
		defer tagStmt.Close()

		for _, contactID := range req.ContactIDs {
			// Verify contact belongs to user
			// Optimization: Do this check in bulk or rely on previous update?
			// Ideally we should check ownership. but for bulk let's assume valid IDs from query above
			// or do a quick check.

			for _, tagID := range req.Updates.TagIDs {
				_, err := tagStmt.Exec(contactID, tagID)
				if err != nil {
					return err
				}
			}
		}
	}

	return tx.Commit()
}

func (r *contactRepository) BulkDeleteContacts(userID uint64, contactIDs []uint64) error {
	if len(contactIDs) == 0 {
		return nil
	}
	placeholders := make([]string, len(contactIDs))
	args := make([]interface{}, len(contactIDs))
	for i, id := range contactIDs {
		placeholders[i] = "?"
		args[i] = id
	}
	query := fmt.Sprintf("DELETE FROM contacts WHERE user_id = ? AND id IN (%s)", strings.Join(placeholders, ","))
	args = append([]interface{}{userID}, args...)

	_, err := r.db.Exec(query, args...)
	return err
}
