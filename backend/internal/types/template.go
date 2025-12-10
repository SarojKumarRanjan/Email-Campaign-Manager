package types

import "time"

type TemplateDTO struct {
	ID           uint64    `json:"id"`
	UserID       uint64    `json:"user_id"`
	Name         string    `json:"name"`
	Subject      string    `json:"subject"`
	HTMLContent  string    `json:"html_content"`
	TextContent  string    `json:"text_content"`
	ThumbnailURL string    `json:"thumbnail_url"`
	IsDefault    bool      `json:"is_default"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type CreateTemplateRequest struct {
	UserID      uint64 `json:"-"`
	Name        string `json:"name" binding:"required"`
	Subject     string `json:"subject" binding:"required"`
	HTMLContent string `json:"html_content" binding:"required"`
	TextContent string `json:"text_content"`
	IsDefault   bool   `json:"is_default"`
}

type UpdateTemplateRequest struct {
	UserID      uint64
	Name        string `json:"name"`
	Subject     string `json:"subject"`
	HTMLContent string `json:"html_content"`
	TextContent string `json:"text_content"`
	IsDefault   *bool  `json:"is_default"`
}

type PreviewTemplateRequest struct {
	HTMLContent string                 `json:"html_content" binding:"required"`
	Variables   map[string]interface{} `json:"variables"`
}

type UploadTemplateImageResponse struct {
	URL string `json:"url"`
}
