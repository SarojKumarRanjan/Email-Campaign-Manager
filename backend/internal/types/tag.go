package types

import "time"

type Tag struct {
	ID            uint64    `json:"id"`
	UserID        uint64    `json:"user_id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Color         string    `json:"color"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	ContactCount  int       `json:"contact_count,omitempty"`
	CampaignCount int       `json:"campaign_count,omitempty"`
}

type CreateTagRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Color       string `json:"color"`
}

type UpdateTagRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Color       string `json:"color"`
}

type AddContactsToTagRequest struct {
	ContactIDs []uint64 `json:"contact_ids" binding:"required,min=1"`
}

type RemoveContactsFromTagRequest struct {
	ContactIDs []uint64 `json:"contact_ids" binding:"required,min=1"`
}
