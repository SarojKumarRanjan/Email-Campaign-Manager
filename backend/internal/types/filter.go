package types

import "time"

type Filter struct {
	FilterId string   `json:"filterId" form:"filterId"`
	Operator string   `json:"operator" form:"operator"`
	Id       string   `json:"id" form:"id"`
	Value    []string `json:"value" form:"value"`
	Variant  string   `json:"variant" form:"variant"`
}

type ContactFilter struct {
	UserID       uint64   `json:"-"`
	Search       string   `json:"search" form:"search"`
	Page         int      `json:"page" form:"page"`
	Limit        int      `json:"limit" form:"limit"`
	SortBy       string   `json:"sort_by" form:"sort_by"`
	SortOrder    string   `json:"sort_order" form:"sort_order"`
	JoinOperator string   `json:"join_operator" form:"join_operator"`
	Filters      []Filter `json:"filters" form:"filters"`
}

type CampaignFilter struct {
	UserID    uint64     `json:"-"`
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
