package repository

import (
	"database/sql"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
	"time"
)

type TagRepository interface {
	CreateTag(tag *types.Tag) error
	GetTag(id uint64) (*types.Tag, error)
	ListTags(userID uint64, filter types.Filter) ([]types.Tag, int64, error)
	UpdateTag(tag *types.Tag) error
	DeleteTag(id uint64) error
	AddContactToTag(tagID, contactID uint64) error
	RemoveContactFromTag(tagID, contactID uint64) error
	GetTagContacts(tagID uint64) ([]types.ContactDTO, error)
	GetContactTags(contactID uint64) ([]types.Tag, error)
	AddTagToCampaign(campaignID, tagID uint64) error
	RemoveTagFromCampaign(campaignID, tagID uint64) error
	GetCampaignTags(campaignID uint64) ([]types.Tag, error)
}

type tagRepository struct {
	db *sql.DB
}

func NewTagRepository(db *sql.DB) TagRepository {
	return &tagRepository{db: db}
}

func (r *tagRepository) CreateTag(tag *types.Tag) error {
	query := `INSERT INTO tags (user_id, name, description, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
	res, err := r.db.Exec(query, tag.UserID, tag.Name, tag.Description, tag.Color, time.Now(), time.Now())
	if err != nil {
		return err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return err
	}
	tag.ID = uint64(id)
	return nil
}

func (r *tagRepository) GetTag(id uint64) (*types.Tag, error) {
	var tag types.Tag
	query := `SELECT id, user_id, name, COALESCE(description, '') as description, color, created_at, updated_at FROM tags WHERE id = ? AND is_deleted = 0`
	err := r.db.QueryRow(query, id).Scan(
		&tag.ID, &tag.UserID, &tag.Name, &tag.Description, &tag.Color, &tag.CreatedAt, &tag.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepository) ListTags(userID uint64, filter types.Filter) ([]types.Tag, int64, error) {
	baseQuery := `SELECT t.id, t.user_id, t.name, COALESCE(t.description, '') as description, t.color, t.created_at, t.updated_at, COUNT(ct.contact_id) as contact_count, COUNT(c.campaign_id) as campaign_count
	              FROM tags as t 
				  LEFT JOIN contact_tags AS ct
				  ON t.id = ct.tag_id
				  LEFT JOIN campaign_tags AS c
				  ON t.id = c.tag_id
	              WHERE t.user_id = ? AND t.is_deleted = 0 AND t.deleted_at IS NULL
				  GROUP BY t.id`
	args := []interface{}{userID}

	// Define allowed filter fields and their database column mappings
	allowedFields := map[string]string{
		"name":        "name",
		"description": "description",
		"color":       "color",
		"created_at":  "created_at",
		"updated_at":  "updated_at",
	}

	// Build dynamic filter conditions
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

	// Use paginator for search, sorting, and pagination
	paginator := utils.NewPaginator(filter.Page, filter.Limit, filter.SortBy, filter.SortOrder, filter.Search)
	allowedSortFields := []string{"created_at", "updated_at", "name", "color"}
	searchFields := []string{"name", "description", "color"}

	// Build count query
	countQuery, countArgs := paginator.BuildCountQuery(baseQuery, args, searchFields)
	var total int64
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

	var tags []types.Tag
	for rows.Next() {
		var tag types.Tag
		if err := rows.Scan(
			&tag.ID, &tag.UserID, &tag.Name, &tag.Description, &tag.Color, &tag.CreatedAt, &tag.UpdatedAt, &tag.ContactCount, &tag.CampaignCount,
		); err != nil {
			return nil, 0, err
		}
		tags = append(tags, tag)
	}
	return tags, total, nil
}

func (r *tagRepository) UpdateTag(tag *types.Tag) error {
	query := `UPDATE tags SET name = ?, description = ?, color = ?, updated_at = ? WHERE id = ?`
	_, err := r.db.Exec(query, tag.Name, tag.Description, tag.Color, time.Now(), tag.ID)
	return err
}

func (r *tagRepository) DeleteTag(id uint64) error {
	query := `UPDATE tags SET deleted_at = ?, is_deleted = ? WHERE id = ?`
	_, err := r.db.Exec(query, time.Now(), 1, id)
	return err
}

func (r *tagRepository) AddContactToTag(tagID, contactID uint64) error {
	_, err := r.db.Exec("INSERT INTO contact_tags (contact_id, tag_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at=created_at", contactID, tagID)
	return err
}

func (r *tagRepository) RemoveContactFromTag(tagID, contactID uint64) error {
	_, err := r.db.Exec("DELETE FROM contact_tags WHERE contact_id = ? AND tag_id = ?", contactID, tagID)
	return err
}

func (r *tagRepository) GetTagContacts(tagID uint64) ([]types.ContactDTO, error) {
	query := `SELECT c.id, c.email, c.first_name, c.last_name, c.is_subscribed 
              FROM contacts c JOIN contact_tags ct ON c.id = ct.contact_id 
              WHERE ct.tag_id = ?`
	rows, err := r.db.Query(query, tagID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []types.ContactDTO
	for rows.Next() {
		var c types.ContactDTO
		if err := rows.Scan(&c.ID, &c.Email, &c.FirstName, &c.LastName, &c.IsSubscribed); err != nil {
			return nil, err
		}
		contacts = append(contacts, c)
	}
	return contacts, nil
}

func (r *tagRepository) GetContactTags(contactID uint64) ([]types.Tag, error) {
	query := `SELECT t.id, t.name, t.color FROM tags t JOIN contact_tags ct ON t.id = ct.tag_id WHERE ct.contact_id = ?`
	rows, err := r.db.Query(query, contactID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []types.Tag
	for rows.Next() {
		var t types.Tag
		if err := rows.Scan(&t.ID, &t.Name, &t.Color); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, nil
}

func (r *tagRepository) AddTagToCampaign(campaignID, tagID uint64) error {
	_, err := r.db.Exec("INSERT INTO campaign_tags (campaign_id, tag_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at=created_at", campaignID, tagID)
	return err
}

func (r *tagRepository) RemoveTagFromCampaign(campaignID, tagID uint64) error {
	_, err := r.db.Exec("DELETE FROM campaign_tags WHERE campaign_id = ? AND tag_id = ?", campaignID, tagID)
	return err
}

func (r *tagRepository) GetCampaignTags(campaignID uint64) ([]types.Tag, error) {
	query := `SELECT t.id, t.name, t.color FROM tags t JOIN campaign_tags ct ON t.id = ct.tag_id WHERE ct.campaign_id = ?`
	rows, err := r.db.Query(query, campaignID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []types.Tag
	for rows.Next() {
		var t types.Tag
		if err := rows.Scan(&t.ID, &t.Name, &t.Color); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, nil
}
