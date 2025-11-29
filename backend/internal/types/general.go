package types

type SearchRequest struct {
	Query string `json:"query" binding:"required"`
	Type  string `json:"type" binding:"omitempty,oneof=contacts campaigns templates"`
	Limit int    `json:"limit"`
}

type SearchResponse struct {
	Contacts  []ContactDTO  `json:"contacts,omitempty"`
	Campaigns []CampaignDTO `json:"campaigns,omitempty"`
	Templates []TemplateDTO `json:"templates,omitempty"`
	Total     int           `json:"total"`
}

type UnsubscribeRequest struct {
	Token  string `json:"token" binding:"required"`
	Reason string `json:"reason"`
}

type UpdatePreferencesRequest struct {
	Token        string   `json:"token" binding:"required"`
	IsSubscribed bool     `json:"is_subscribed"`
	TagIDs       []uint64 `json:"tag_ids"`
}

type PaginationRequest struct {
	Page      int    `json:"page" form:"page"`
	PageSize  int    `json:"page_size" form:"page_size"`
	SortBy    string `json:"sort_by" form:"sort_by"`
	SortOrder string `json:"sort_order" form:"sort_order"`
}

type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	Total      int64       `json:"total"`
	TotalPages int         `json:"total_pages"`
}

type SuccessResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
}
