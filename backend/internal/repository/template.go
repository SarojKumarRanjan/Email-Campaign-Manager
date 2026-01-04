package repository

import (
	"database/sql"
	"email_campaign/internal/types"
)

type TemplateRepository interface {
	CreateTemplate(template *types.CreateTemplateRequest) error
	GetTemplate(id uint64, userID uint64) (*types.TemplateDTO, error)
	ListTemplates(filter *types.TemplateFilter) ([]types.TemplateDTO, error)
	UpdateTemplate(id uint64, userID uint64, req *types.UpdateTemplateRequest) error
	DeleteTemplate(id uint64, userID uint64) error
	DuplicateTemplate(id uint64, userID uint64) error
	SetDefaultTemplate(id uint64, userID uint64) error
}

type templateRepository struct {
	db *sql.DB
}

func NewTemplateRepository(db *sql.DB) TemplateRepository {
	return &templateRepository{db: db}
}

func (r *templateRepository) CreateTemplate(template *types.CreateTemplateRequest) error {
	query := `INSERT INTO email_templates (user_id, name, subject, html_content, text_content, is_default, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`

	_, err := r.db.Exec(query, template.UserID, template.Name, template.Subject, template.HTMLContent, template.TextContent, template.IsDefault)
	return err
}

func (r *templateRepository) GetTemplate(id uint64, userID uint64) (*types.TemplateDTO, error) {
	query := `SELECT id, user_id, name, subject, html_content, text_content, thumbnail_url, is_default, created_at, updated_at 
              FROM email_templates WHERE id = ? AND user_id = ?`

	var t types.TemplateDTO
	var thumbnailURL, textContent sql.NullString // Handle nullable fields

	err := r.db.QueryRow(query, id, userID).Scan(
		&t.ID, &t.UserID, &t.Name, &t.Subject, &t.HTMLContent, &textContent, &thumbnailURL,
		&t.IsDefault, &t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	t.ThumbnailURL = thumbnailURL.String
	t.TextContent = textContent.String
	return &t, nil
}

func (r *templateRepository) ListTemplates(filter *types.TemplateFilter) ([]types.TemplateDTO, error) {
	query := `SELECT id, user_id, name, subject, html_content, text_content, thumbnail_url, is_default, created_at, updated_at 
              FROM email_templates WHERE user_id = ? AND deleted_at IS NULL AND is_deleted = 0`
	args := []interface{}{filter.UserID}

	if filter.Search != "" {
		query += " AND name LIKE ?"
		args = append(args, "%"+filter.Search+"%")
	}

	query += " ORDER BY created_at DESC"
	// Simple pagination if needed, for now just list all or limit
	if filter.Limit > 0 {
		query += " LIMIT ?"
		args = append(args, filter.Limit)
		if filter.Page > 0 {
			offset := (filter.Page - 1) * filter.Limit
			query += " OFFSET ?"
			args = append(args, offset)
		}
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var templates []types.TemplateDTO
	for rows.Next() {
		var t types.TemplateDTO
		var thumbnailURL, textContent sql.NullString
		err := rows.Scan(
			&t.ID, &t.UserID, &t.Name, &t.Subject, &t.HTMLContent, &textContent, &thumbnailURL,
			&t.IsDefault, &t.CreatedAt, &t.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		t.ThumbnailURL = thumbnailURL.String
		t.TextContent = textContent.String
		templates = append(templates, t)
	}
	return templates, nil
}

func (r *templateRepository) UpdateTemplate(id uint64, userID uint64, req *types.UpdateTemplateRequest) error {
	query := "UPDATE email_templates SET updated_at = NOW()"
	var args []interface{}

	if req.Name != "" {
		query += ", name = ?"
		args = append(args, req.Name)
	}
	if req.Subject != "" {
		query += ", subject = ?"
		args = append(args, req.Subject)
	}
	if req.HTMLContent != "" {
		query += ", html_content = ?"
		args = append(args, req.HTMLContent)
	}
	if req.TextContent != "" {
		query += ", text_content = ?"
		args = append(args, req.TextContent)
	}
	if req.IsDefault != nil {
		query += ", is_default = ?"
		args = append(args, *req.IsDefault)
	}

	query += " WHERE id = ? AND user_id = ?"
	args = append(args, id, userID)

	_, err := r.db.Exec(query, args...)
	return err
}

func (r *templateRepository) DeleteTemplate(id uint64, userID uint64) error {
	res, err := r.db.Exec("UPDATE email_templates SET deleted_at = NOW(), is_deleted = 1 WHERE id = ? AND user_id = ?", id, userID)
	if err != nil {
		return err
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *templateRepository) DuplicateTemplate(id uint64, userID uint64) error {
	// Fetch source
	t, err := r.GetTemplate(id, userID)
	if err != nil {
		return err
	}

	newName := "Copy of " + t.Name
	// Basic implementation, doesn't handle "Copy of Copy of..." collision logic perfectly but good enough

	query := `INSERT INTO email_templates (user_id, name, subject, html_content, text_content, is_default, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`
	_, err = r.db.Exec(query, userID, newName, t.Subject, t.HTMLContent, t.TextContent, false) // Default to false
	return err
}

func (r *templateRepository) SetDefaultTemplate(id uint64, userID uint64) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Unset all
	_, err = tx.Exec("UPDATE email_templates SET is_default = FALSE WHERE user_id = ?", userID)
	if err != nil {
		return err
	}

	// Set target
	res, err := tx.Exec("UPDATE email_templates SET is_default = TRUE WHERE id = ? AND user_id = ?", id, userID)
	if err != nil {
		return err
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		return sql.ErrNoRows
	}

	return tx.Commit()
}
