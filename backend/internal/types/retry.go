package types

import "time"

type RetryItemDTO struct {
	ID           uint64    `json:"id"`
	CampaignID   uint64    `json:"campaign_id"`
	ContactID    uint64    `json:"contact_id"`
	RetryCount   int       `json:"retry_count"`
	NextRetryAt  time.Time `json:"next_retry_at"`
	ErrorMessage string    `json:"error_message"`
	CreatedAt    time.Time `json:"created_at"`
}
