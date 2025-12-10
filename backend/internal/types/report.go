package types

import "time"

type ReportDTO struct {
	ID          string    `json:"id"`   // Using string for UUID or filename identifier, or uint64 if DB backed
	Type        string    `json:"type"` // e.g., "campaign", "monthly"
	GeneratedAt time.Time `json:"generated_at"`
	DownloadURL string    `json:"download_url"`
	Status      string    `json:"status"` // pending, processing, completed
}

type GenerateReportRequest struct {
	Type       string `json:"type" binding:"required"`
	CampaignID uint64 `json:"campaign_id,omitempty"`
	Month      int    `json:"month,omitempty"`
	Year       int    `json:"year,omitempty"`
}
