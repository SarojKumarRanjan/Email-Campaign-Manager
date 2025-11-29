package types

import (
	"encoding/json"
	"time"
)

type EmailEventDTO struct {
	ID                  uint64          `json:"id"`
	CampaignRecipientID uint64          `json:"campaign_recipient_id"`
	EventType           string          `json:"event_type"`
	EventData           json.RawMessage `json:"event_data"`
	IPAddress           string          `json:"ip_address"`
	UserAgent           string          `json:"user_agent"`
	ClickedURL          string          `json:"clicked_url"`
	CreatedAt           time.Time       `json:"created_at"`
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
