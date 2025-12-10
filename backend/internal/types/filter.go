package types

import "time"

type ContactFilter struct {
	UserID       uint64   `json:"-"`
	TagIDs       []uint64 `json:"tag_ids" form:"tag_ids"`
	IsSubscribed *bool    `json:"is_subscribed" form:"is_subscribed"`
	IsBounced    *bool    `json:"is_bounced" form:"is_bounced"`
	Search       string   `json:"search" form:"search"`
	Page         int      `json:"page" form:"page"`
	Limit        int      `json:"limit" form:"limit"`
	SortBy       string   `json:"sort_by" form:"sort_by"`
	SortOrder    string   `json:"sort_order" form:"sort_order"`
}

type CampaignFilter struct {
	Status    []string   `json:"status" form:"status"`
	TagIDs    []uint64   `json:"tag_ids" form:"tag_ids"`
	StartDate *time.Time `json:"start_date" form:"start_date"`
	EndDate   *time.Time `json:"end_date" form:"end_date"`
	Search    string     `json:"search" form:"search"`
	Page      int        `json:"page" form:"page"`
	Limit     int        `json:"limit" form:"limit"`
}

type TemplateFilter struct {
	UserID    uint64 `json:"-"`
	IsDefault *bool  `json:"is_default" form:"is_default"`
	Search    string `json:"search" form:"search"`
	Page      int    `json:"page" form:"page"`
	Limit     int    `json:"limit" form:"limit"`
}
