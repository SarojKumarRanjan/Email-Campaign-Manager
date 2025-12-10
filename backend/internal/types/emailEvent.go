package types

import (
	"time"
)

type EmailEventDTO struct {
	CampaignID uint64    `json:"campaign_id"`
	ContactID  uint64    `json:"contact_id"`
	EventType  string    `json:"event_type"`
	EventAt    time.Time `json:"event_at"`
	UserAgent  string    `json:"user_agent"`
	IPAddress  string    `json:"ip_address"`
	Url        string    `json:"url,omitempty"`
}

type WebhookBounceRequest struct {
	MessageID    string    `json:"message_id"`
	Email        string    `json:"email"`
	BounceType   string    `json:"bounce_type"`
	BounceReason string    `json:"bounce_reason"`
	Timestamp    time.Time `json:"timestamp"`
}

type WebhookComplaintRequest struct {
	MessageID string    `json:"message_id"`
	Email     string    `json:"email"`
	Timestamp time.Time `json:"timestamp"`
}

type WebhookDeliveryRequest struct {
	MessageID string    `json:"message_id"`
	Email     string    `json:"email"`
	Timestamp time.Time `json:"timestamp"`
}
