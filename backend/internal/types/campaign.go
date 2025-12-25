package types

import "time"

type CampaignDTO struct {
	ID                uint64       `json:"id"`
	UserID            uint64       `json:"user_id"`
	TemplateID        *uint64      `json:"template_id"`
	Name              string       `json:"name"`
	Subject           string       `json:"subject"`
	FromName          string       `json:"from_name"`
	FromEmail         string       `json:"from_email"`
	ReplyToEmail      string       `json:"reply_to_email"`
	Status            string       `json:"status"`
	ScheduledAt       *time.Time   `json:"scheduled_at"`
	StartedAt         *time.Time   `json:"started_at"`
	CompletedAt       *time.Time   `json:"completed_at"`
	TotalRecipients   int          `json:"total_recipients"`
	SentCount         int          `json:"sent_count"`
	DeliveredCount    int          `json:"delivered_count"`
	FailedCount       int          `json:"failed_count"`
	OpenedCount       int          `json:"opened_count"`
	ClickedCount      int          `json:"clicked_count"`
	BouncedCount      int          `json:"bounced_count"`
	UnsubscribedCount int          `json:"unsubscribed_count"`
	CreatedAt         time.Time    `json:"created_at"`
	UpdatedAt         time.Time    `json:"updated_at"`
	IsDeleted         bool         `json:"-"`
	DeletedAt         *time.Time   `json:"-"`
	Tags              []Tag        `json:"tags,omitempty"`
	Template          *TemplateDTO `json:"template,omitempty"`
}

const (
	CampaignStatusDraft     = "draft"
	CampaignStatusScheduled = "scheduled"
	CampaignStatusSending   = "sending"
	CampaignStatusPaused    = "paused"
	CampaignStatusCompleted = "completed"
	CampaignStatusCancelled = "cancelled"
)

type CreateCampaignRequest struct {
	UserID       uint64     `json:"-"`
	Name         string     `json:"name" binding:"required"`
	Subject      string     `json:"subject" binding:"required"`
	FromName     string     `json:"from_name" binding:"required"`
	FromEmail    string     `json:"from_email" binding:"required,email"`
	ReplyToEmail string     `json:"reply_to_email" binding:"omitempty,email"`
	TemplateID   *uint64    `json:"template_id"`
	HTMLContent  string     `json:"html_content"`
	TextContent  string     `json:"text_content"`
	TagIDs       []uint64   `json:"tag_ids" binding:"required,min=1"`
	ScheduledAt  *time.Time `json:"scheduled_at"`
}

type UpdateCampaignRequest struct {
	UserID       uint64
	Name         string     `json:"name"`
	Subject      string     `json:"subject"`
	FromName     string     `json:"from_name"`
	FromEmail    string     `json:"from_email" binding:"omitempty,email"`
	ReplyToEmail string     `json:"reply_to_email" binding:"omitempty,email"`
	TemplateID   *uint64    `json:"template_id"`
	HTMLContent  string     `json:"html_content"`
	TextContent  string     `json:"text_content"`
	ScheduledAt  *time.Time `json:"scheduled_at"`
}

type ScheduleCampaignRequest struct {
	ScheduledAt time.Time `json:"scheduled_at" binding:"required"`
}

type SendTestEmailRequest struct {
	TestEmails []string `json:"test_emails" binding:"required,min=1"`
}

type CampaignStatsDTO struct {
	CampaignID        uint64    `json:"campaign_id"`
	TotalRecipients   int       `json:"total_recipients"`
	SentCount         int       `json:"sent_count"`
	DeliveredCount    int       `json:"delivered_count"`
	FailedCount       int       `json:"failed_count"`
	OpenedCount       int       `json:"opened_count"`
	ClickedCount      int       `json:"clicked_count"`
	BouncedCount      int       `json:"bounced_count"`
	UnsubscribedCount int       `json:"unsubscribed_count"`
	UniqueOpens       int       `json:"unique_opens"`
	UniqueClicks      int       `json:"unique_clicks"`
	OpenRate          float64   `json:"open_rate"`
	ClickRate         float64   `json:"click_rate"`
	BounceRate        float64   `json:"bounce_rate"`
	DeliveryRate      float64   `json:"delivery_rate"`
	UnsubscribeRate   float64   `json:"unsubscribe_rate"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type UpdateCampaignTagsRequest struct {
	TagIDs []uint64 `json:"tag_ids" binding:"required"`
}
