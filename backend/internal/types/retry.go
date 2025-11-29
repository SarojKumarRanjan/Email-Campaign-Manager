package types

import "time"

type RetryQueueDTO struct {
	ID                  uint64                `json:"id"`
	CampaignRecipientID uint64                `json:"campaign_recipient_id"`
	RetryCount          int                   `json:"retry_count"`
	NextRetryAt         time.Time             `json:"next_retry_at"`
	Status              string                `json:"status"`
	ErrorMessage        string                `json:"error_message"`
	CreatedAt           time.Time             `json:"created_at"`
	UpdatedAt           time.Time             `json:"updated_at"`
	CampaignRecipient   *CampaignRecipientDTO `json:"campaign_recipient,omitempty"`
}
