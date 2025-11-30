package repository

import (
	"database/sql"
	"email_campaign/internal/types"
)

type TagRepository interface {
	CreateTag(tag *types.Tag) error
	GetTag(id uint64) (*types.Tag, error)
	ListTags(userID uint64) ([]types.Tag, error)
	UpdateTag(tag *types.Tag) error
	DeleteTag(id uint64) error
}

type tagRepository struct {
	db *sql.DB
}

func NewTagRepository(db *sql.DB) TagRepository {
	return &tagRepository{db: db}
}

func (r *tagRepository) CreateTag(tag *types.Tag) error {
	query := `INSERT INTO tags (user_id, name, description, color) VALUES (?, ?, ?, ?)`
	res, err := r.db.Exec(query, tag.UserID, tag.Name, tag.Description, tag.Color)
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
	query := `SELECT id, user_id, name, description, color, created_at, updated_at FROM tags WHERE id = ?`
	err := r.db.QueryRow(query, id).Scan(
		&tag.ID, &tag.UserID, &tag.Name, &tag.Description, &tag.Color, &tag.CreatedAt, &tag.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepository) ListTags(userID uint64) ([]types.Tag, error) {
	query := `SELECT id, user_id, name, description, color, created_at, updated_at FROM tags WHERE user_id = ?`
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []types.Tag
	for rows.Next() {
		var tag types.Tag
		if err := rows.Scan(
			&tag.ID, &tag.UserID, &tag.Name, &tag.Description, &tag.Color, &tag.CreatedAt, &tag.UpdatedAt,
		); err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}
	return tags, nil
}

func (r *tagRepository) UpdateTag(tag *types.Tag) error {
	query := `UPDATE tags SET name = ?, description = ?, color = ? WHERE id = ?`
	_, err := r.db.Exec(query, tag.Name, tag.Description, tag.Color, tag.ID)
	return err
}

func (r *tagRepository) DeleteTag(id uint64) error {
	query := `DELETE FROM tags WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}
