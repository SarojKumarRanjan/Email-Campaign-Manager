package types

import "time"

type ActivityDTO struct {
	ID   string
	Type string
}
type TimelinePoint struct {
	Date  string
	Count int
}

type VolumePoint struct{}
type TrendPoint struct{}
type QuickStatsDTO struct{}

type DashboardStatsDTO struct {
	TotalCampaigns      int     `json:"total_campaigns"`
	ActiveCampaigns     int     `json:"active_campaigns"`
	TotalContacts       int     `json:"total_contacts"`
	SubscribedContacts  int     `json:"subscribed_contacts"`
	TotalEmailsSent     int     `json:"total_emails_sent"`
	EmailsSentToday     int     `json:"emails_sent_today"`
	EmailsSentThisMonth int     `json:"emails_sent_this_month"`
	TotalDelivered      int     `json:"total_delivered"`
	TotalOpened         int     `json:"total_opened"`
	TotalClicked        int     `json:"total_clicked"`
	AverageOpenRate     float64 `json:"average_open_rate"`
	AverageClickRate    float64 `json:"average_click_rate"`
	AverageBounceRate   float64 `json:"average_bounce_rate"`
}

type CampaignTimelineDTO struct {
	Date           time.Time `json:"date"`
	SentCount      int       `json:"sent_count"`
	DeliveredCount int       `json:"delivered_count"`
	OpenedCount    int       `json:"opened_count"`
	ClickedCount   int       `json:"clicked_count"`
	BouncedCount   int       `json:"bounced_count"`
}

type CampaignComparisonRequest struct {
	CampaignIDs []uint64 `json:"campaign_ids" binding:"required,min=2"`
}

type CampaignComparisonDTO struct {
	CampaignID   uint64  `json:"campaign_id"`
	CampaignName string  `json:"campaign_name"`
	SentCount    int     `json:"sent_count"`
	OpenRate     float64 `json:"open_rate"`
	ClickRate    float64 `json:"click_rate"`
	BounceRate   float64 `json:"bounce_rate"`
}

type ContactEngagementDTO struct {
	TotalEmailsReceived int                   `json:"total_emails_received"`
	TotalOpens          int                   `json:"total_opens"`
	TotalClicks         int                   `json:"total_clicks"`
	LastOpened          *time.Time            `json:"last_opened"`
	LastClicked         *time.Time            `json:"last_clicked"`
	EngagementScore     float64               `json:"engagement_score"`
	RecentCampaigns     []CampaignActivityDTO `json:"recent_campaigns"`
}

type CampaignActivityDTO struct {
	CampaignID   uint64     `json:"campaign_id"`
	CampaignName string     `json:"campaign_name"`
	SentAt       time.Time  `json:"sent_at"`
	OpenedAt     *time.Time `json:"opened_at"`
	ClickedAt    *time.Time `json:"clicked_at"`
}

type TagPerformanceDTO struct {
	TagID             uint64  `json:"tag_id"`
	TagName           string  `json:"tag_name"`
	TotalContacts     int     `json:"total_contacts"`
	EmailsSent        int     `json:"emails_sent"`
	AverageOpenRate   float64 `json:"average_open_rate"`
	AverageClickRate  float64 `json:"average_click_rate"`
	AverageBounceRate float64 `json:"average_bounce_rate"`
}

type EmailPerformanceDTO struct {
	Date         time.Time `json:"date"`
	SentCount    int       `json:"sent_count"`
	OpenRate     float64   `json:"open_rate"`
	ClickRate    float64   `json:"click_rate"`
	BounceRate   float64   `json:"bounce_rate"`
	DeliveryRate float64   `json:"delivery_rate"`
}

type SendVolumeDTO struct {
	Date      time.Time `json:"date"`
	SentCount int       `json:"sent_count"`
}

type EngagementTrendsDTO struct {
	Period     string  `json:"period"`
	OpenRate   float64 `json:"open_rate"`
	ClickRate  float64 `json:"click_rate"`
	BounceRate float64 `json:"bounce_rate"`
}

type ExportAnalyticsRequest struct {
	StartDate time.Time `json:"start_date" binding:"required"`
	EndDate   time.Time `json:"end_date" binding:"required"`
	Format    string    `json:"format" binding:"required,oneof=csv xlsx pdf"`
}
