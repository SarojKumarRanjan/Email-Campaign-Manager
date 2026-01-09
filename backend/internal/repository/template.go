package repository

import (
	"database/sql"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
)

type TemplateRepository interface {
	CreateTemplate(template *types.CreateTemplateRequest) error
	GetTemplate(id uint64, userID uint64) (*types.TemplateDTO, error)
	ListTemplates(filter *types.TemplateFilter) ([]types.TemplateDTO, int, error)
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
	query := `INSERT INTO email_templates (user_id, name, subject, type, mjml_content, html_content, text_content, thumbnail_url, is_default, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`

	_, err := r.db.Exec(query, template.UserID, template.Name, template.Subject, template.Type, template.MJMLContent, template.HTMLContent, template.TextContent, template.ThumbnailURL, template.IsDefault)
	return err
}

func (r *templateRepository) GetTemplate(id uint64, userID uint64) (*types.TemplateDTO, error) {
	query := `SELECT id, user_id, name, subject, type, mjml_content, html_content, text_content, thumbnail_url, is_default, created_at, updated_at 
              FROM email_templates WHERE id = ? AND user_id = ?`

	var t types.TemplateDTO
	var thumbnailURL, textContent, mjmlContent sql.NullString // Handle nullable fields

	err := r.db.QueryRow(query, id, userID).Scan(
		&t.ID, &t.UserID, &t.Name, &t.Subject, &t.Type, &mjmlContent, &t.HTMLContent, &textContent, &thumbnailURL,
		&t.IsDefault, &t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	t.ThumbnailURL = thumbnailURL.String
	t.TextContent = textContent.String
	t.MJMLContent = mjmlContent.String
	return &t, nil
}

func (r *templateRepository) ListTemplates(filter *types.TemplateFilter) ([]types.TemplateDTO, int, error) {
	baseQuery := `SELECT id, user_id, name, subject, type, mjml_content, html_content, text_content, thumbnail_url, is_default, created_at, updated_at 
                   FROM email_templates WHERE user_id = ? AND deleted_at IS NULL AND is_deleted = 0`
	args := []interface{}{filter.UserID}

	allowedFields := map[string]string{
		"name":       "name",
		"subject":    "subject",
		"type":       "type",
		"is_default": "is_default",
		"created_at": "created_at",
		"updated_at": "updated_at",
	}

	if len(filter.Filters) > 0 {
		fb := utils.NewFilterBuilder()
		condition, filterArgs, err := fb.BuildFilterConditions(filter.Filters, filter.JoinOperator, allowedFields)
		if err != nil {
			return nil, 0, err
		}
		if condition != "" {
			baseQuery += " AND " + condition
			args = append(args, filterArgs...)
		}
	}

	if filter.IsDefault != nil {
		baseQuery += " AND is_default = ?"
		args = append(args, *filter.IsDefault)
	}

	paginator := utils.NewPaginator(filter.Page, filter.Limit, filter.SortBy, filter.SortOrder, filter.Search)
	allowedSortFields := []string{"name", "subject", "created_at", "updated_at"}
	searchFields := []string{"name", "subject"}

	// Build count query
	countQuery, countArgs := paginator.BuildCountQuery(baseQuery, args, searchFields)
	var total int
	err := r.db.QueryRow(countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Apply pagination and sorting
	query, queryArgs := paginator.Apply(baseQuery, args, allowedSortFields, searchFields)

	rows, err := r.db.Query(query, queryArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var templates []types.TemplateDTO
	for rows.Next() {
		var t types.TemplateDTO
		var thumbnailURL, textContent, mjmlContent sql.NullString
		err := rows.Scan(
			&t.ID, &t.UserID, &t.Name, &t.Subject, &t.Type, &mjmlContent, &t.HTMLContent, &textContent, &thumbnailURL,
			&t.IsDefault, &t.CreatedAt, &t.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		t.ThumbnailURL = thumbnailURL.String
		t.TextContent = textContent.String
		t.MJMLContent = mjmlContent.String
		templates = append(templates, t)
	}
	return templates, total, nil
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
	if req.Type != "" {
		query += ", type = ?"
		args = append(args, req.Type)
	}
	if req.MJMLContent != "" {
		query += ", mjml_content = ?"
		args = append(args, req.MJMLContent)
	}
	if req.HTMLContent != "" {
		query += ", html_content = ?"
		args = append(args, req.HTMLContent)
	}
	if req.TextContent != "" {
		query += ", text_content = ?"
		args = append(args, req.TextContent)
	}
	if req.ThumbnailURL != "" {
		query += ", thumbnail_url = ?"
		args = append(args, req.ThumbnailURL)
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

	query := `INSERT INTO email_templates (user_id, name, subject, type, mjml_content, html_content, text_content, thumbnail_url, is_default, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`
	_, err = r.db.Exec(query, userID, newName, t.Subject, t.Type, t.MJMLContent, t.HTMLContent, t.TextContent, t.ThumbnailURL, false) // Default to false
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
