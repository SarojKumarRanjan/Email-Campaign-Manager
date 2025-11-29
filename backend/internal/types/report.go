package types

import "time"

type ReportDTO struct {
	ID          uint64    `json:"id"`
	UserID      uint64    `json:"user_id"`
	ReportType  string    `json:"report_type"`
	Title       string    `json:"title"`
	GeneratedAt time.Time `json:"generated_at"`
	FileURL     string    `json:"file_url"`
	Status      string    `json:"status"`
}

type GenerateCampaignReportRequest struct {
	CampaignID uint64 `json:"campaign_id" binding:"required"`
	Format     string `json:"format" binding:"required,oneof=pdf csv xlsx"`
}

type GenerateMonthlyReportRequest struct {
	Year   int    `json:"year" binding:"required"`
	Month  int    `json:"month" binding:"required,min=1,max=12"`
	Format string `json:"format" binding:"required,oneof=pdf csv xlsx"`
}

type GenerateYearlyReportRequest struct {
	Year   int    `json:"year" binding:"required"`
	Format string `json:"format" binding:"required,oneof=pdf csv xlsx"`
}
