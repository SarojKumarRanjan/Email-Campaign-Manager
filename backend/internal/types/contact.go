package types

import (
	"encoding/json"
	"time"
)

type ContactDTO struct {
	ID              uint64          `json:"id"`
	UserID          uint64          `json:"user_id"`
	Email           string          `json:"email"`
	FirstName       string          `json:"first_name"`
	LastName        string          `json:"last_name"`
	Phone           string          `json:"phone"`
	Company         string          `json:"company"`
	IsSubscribed    bool            `json:"is_subscribed"`
	IsBounced       bool            `json:"is_bounced"`
	BounceCount     int             `json:"bounce_count"`
	CustomFields    json.RawMessage `json:"custom_fields"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	LastContactedAt *time.Time      `json:"last_contacted_at"`
	Tags            []TagDTO        `json:"tags,omitempty"`
}

type CreateContactRequest struct {
	Email        string          `json:"email" binding:"required,email"`
	FirstName    string          `json:"first_name"`
	LastName     string          `json:"last_name"`
	Phone        string          `json:"phone"`
	Company      string          `json:"company"`
	IsSubscribed bool            `json:"is_subscribed"`
	CustomFields json.RawMessage `json:"custom_fields"`
	TagIDs       []uint64        `json:"tag_ids"`
}

type UpdateContactRequest struct {
	Email        string          `json:"email" binding:"omitempty,email"`
	FirstName    string          `json:"first_name"`
	LastName     string          `json:"last_name"`
	Phone        string          `json:"phone"`
	Company      string          `json:"company"`
	IsSubscribed *bool           `json:"is_subscribed"`
	CustomFields json.RawMessage `json:"custom_fields"`
}

type BulkCreateContactsRequest struct {
	Contacts []CreateContactRequest `json:"contacts" binding:"required,min=1"`
}

type BulkUpdateContactsRequest struct {
	ContactIDs []uint64 `json:"contact_ids" binding:"required,min=1"`
	Updates    struct {
		IsSubscribed *bool    `json:"is_subscribed"`
		TagIDs       []uint64 `json:"tag_ids"`
	} `json:"updates" binding:"required"`
}

type BulkDeleteContactsRequest struct {
	ContactIDs []uint64 `json:"contact_ids" binding:"required,min=1"`
}

type ImportContactsRequest struct {
	FileData       []byte            `json:"file_data" binding:"required"`
	FieldMapping   map[string]string `json:"field_mapping"`
	SkipDuplicates bool              `json:"skip_duplicates"`
}

type ContactActivityDTO struct {
	CampaignID   uint64     `json:"campaign_id"`
	CampaignName string     `json:"campaign_name"`
	Status       string     `json:"status"`
	SentAt       *time.Time `json:"sent_at"`
	DeliveredAt  *time.Time `json:"delivered_at"`
	OpenedAt     *time.Time `json:"opened_at"`
	ClickedAt    *time.Time `json:"clicked_at"`
	OpenCount    int        `json:"open_count"`
	ClickCount   int        `json:"click_count"`
}
