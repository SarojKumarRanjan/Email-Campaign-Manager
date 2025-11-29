package types

import "time"

type CampaignRecipientDTO struct {
	ID             uint64      `json:"id"`
	CampaignID     uint64      `json:"campaign_id"`
	ContactID      uint64      `json:"contact_id"`
	Status         string      `json:"status"`
	SentAt         *time.Time  `json:"sent_at"`
	DeliveredAt    *time.Time  `json:"delivered_at"`
	OpenedAt       *time.Time  `json:"opened_at"`
	ClickedAt      *time.Time  `json:"clicked_at"`
	BouncedAt      *time.Time  `json:"bounced_at"`
	UnsubscribedAt *time.Time  `json:"unsubscribed_at"`
	RetryCount     int         `json:"retry_count"`
	LastRetryAt    *time.Time  `json:"last_retry_at"`
	ErrorMessage   string      `json:"error_message"`
	BounceType     string      `json:"bounce_type"`
	OpenCount      int         `json:"open_count"`
	ClickCount     int         `json:"click_count"`
	UserAgent      string      `json:"user_agent"`
	IPAddress      string      `json:"ip_address"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`
	Contact        *ContactDTO `json:"contact,omitempty"`
}

type RetryFailedRecipientsRequest struct {
	RecipientIDs []uint64 `json:"recipient_ids"`
}
