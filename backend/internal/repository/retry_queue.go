package repository

import (
	"database/sql"
	"email_campaign/internal/types"
)

type RetryQueueRepository interface {
	ListRetryItems(page, limit int) ([]types.RetryItemDTO, error)
	GetRetryItem(id uint64) (*types.RetryItemDTO, error)
	ClearRetryQueue() error
}

type retryQueueRepository struct {
	db *sql.DB
}

func NewRetryQueueRepository(db *sql.DB) RetryQueueRepository {
	return &retryQueueRepository{db: db}
}

func (r *retryQueueRepository) ListRetryItems(page, limit int) ([]types.RetryItemDTO, error) {
	query := `SELECT id, campaign_id, contact_id, retry_count, next_retry_at, error_message, created_at 
              FROM retry_queue ORDER BY next_retry_at ASC`

	args := []interface{}{}
	if limit > 0 {
		query += " LIMIT ?"
		args = append(args, limit)
		if page > 0 {
			offset := (page - 1) * limit
			query += " OFFSET ?"
			args = append(args, offset)
		}
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []types.RetryItemDTO
	for rows.Next() {
		var i types.RetryItemDTO
		err := rows.Scan(&i.ID, &i.CampaignID, &i.ContactID, &i.RetryCount, &i.NextRetryAt, &i.ErrorMessage, &i.CreatedAt)
		if err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, nil
}

func (r *retryQueueRepository) GetRetryItem(id uint64) (*types.RetryItemDTO, error) {
	query := `SELECT id, campaign_id, contact_id, retry_count, next_retry_at, error_message, created_at 
              FROM retry_queue WHERE id = ?`

	var i types.RetryItemDTO
	err := r.db.QueryRow(query, id).Scan(&i.ID, &i.CampaignID, &i.ContactID, &i.RetryCount, &i.NextRetryAt, &i.ErrorMessage, &i.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &i, nil
}

func (r *retryQueueRepository) ClearRetryQueue() error {
	_, err := r.db.Exec("DELETE FROM retry_queue")
	return err
}
