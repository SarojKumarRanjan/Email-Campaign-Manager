package repository

import (
	"database/sql"
	"email_campaign/internal/types"
)

type AnalyticsRepository interface {
	GetDashboardStats() (*types.DashboardStatsDTO, error)
	GetCampaignTimeline(campaignID uint64) ([]types.TimelinePoint, error)
	GetCampaignComparison(campaignIDs []uint64) ([]types.CampaignStatsDTO, error)
	GetContactEngagement(contactID uint64) (*types.ContactEngagementDTO, error)
	GetTagPerformance(tagID uint64) (*types.TagPerformanceDTO, error)
	GetSendVolume(period string) ([]types.VolumePoint, error)
	GetEngagementTrends(period string) ([]types.TrendPoint, error)
	GetRecentCampaigns(limit int) ([]types.CampaignDTO, error)
	GetRecentActivity(limit int) ([]types.ActivityDTO, error)
	GetQuickStats() (*types.QuickStatsDTO, error)
}

type analyticsRepository struct {
	db *sql.DB
}

func NewAnalyticsRepository(db *sql.DB) AnalyticsRepository {
	return &analyticsRepository{db: db}
}

func (r *analyticsRepository) GetDashboardStats() (*types.DashboardStatsDTO, error) {
	stats := &types.DashboardStatsDTO{}

	// 1. Total Campaigns
	err := r.db.QueryRow("SELECT COUNT(*) FROM campaigns").Scan(&stats.TotalCampaigns)
	if err != nil {
		return nil, err
	}

	// 2. Total Contacts
	err = r.db.QueryRow("SELECT COUNT(*) FROM contacts").Scan(&stats.TotalContacts)
	if err != nil {
		return nil, err
	}

	// 3. Aggregate Emails Sent/Opened/Clicked from campaigns
	// Note: We sum the counters in campaigns table
	err = r.db.QueryRow(`
		SELECT 
			COALESCE(SUM(sent_count), 0),
			COALESCE(SUM(delivered_count), 0),
			COALESCE(SUM(opened_count), 0),
			COALESCE(SUM(clicked_count), 0)
		FROM campaigns
	`).Scan(&stats.TotalEmailsSent, &stats.TotalDelivered, &stats.TotalOpened, &stats.TotalClicked)
	if err != nil {
		return nil, err
	}

	// 4. Calculate Rates
	if stats.TotalEmailsSent > 0 {
		// No DeliveryRate in DTO, maybe calculate it but don't store? Or add to DTO?
		// DTO has TotalDelivered, so frontend can calc.
		// But let's check DTO again. It has AverageOpenRate.
	}
	if stats.TotalDelivered > 0 {
		stats.AverageOpenRate = float64(stats.TotalOpened) / float64(stats.TotalDelivered) * 100
		stats.AverageClickRate = float64(stats.TotalClicked) / float64(stats.TotalDelivered) * 100
	}

	// 5. Recent Activity (Mock or Query email_events)
	// For now, let's leave recent activity empty or implement a separate method.

	return stats, nil
}

func (r *analyticsRepository) GetCampaignTimeline(campaignID uint64) ([]types.TimelinePoint, error) {
	// Mock implementation
	return []types.TimelinePoint{}, nil
}
func (r *analyticsRepository) GetCampaignComparison(campaignIDs []uint64) ([]types.CampaignStatsDTO, error) {
	return []types.CampaignStatsDTO{}, nil
}
func (r *analyticsRepository) GetContactEngagement(contactID uint64) (*types.ContactEngagementDTO, error) {
	return &types.ContactEngagementDTO{}, nil
}
func (r *analyticsRepository) GetTagPerformance(tagID uint64) (*types.TagPerformanceDTO, error) {
	return &types.TagPerformanceDTO{}, nil
}
func (r *analyticsRepository) GetSendVolume(period string) ([]types.VolumePoint, error) {
	return []types.VolumePoint{}, nil
}
func (r *analyticsRepository) GetEngagementTrends(period string) ([]types.TrendPoint, error) {
	return []types.TrendPoint{}, nil
}
func (r *analyticsRepository) GetRecentCampaigns(limit int) ([]types.CampaignDTO, error) {
	// Simple query
	query := `SELECT id, name, status, sent_count, open_count, click_count, created_at FROM campaigns ORDER BY created_at DESC LIMIT ?`
	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var campaigns []types.CampaignDTO // Simplified struct filling
	// ...
	return campaigns, nil
}
func (r *analyticsRepository) GetRecentActivity(limit int) ([]types.ActivityDTO, error) {
	return []types.ActivityDTO{}, nil
}
func (r *analyticsRepository) GetQuickStats() (*types.QuickStatsDTO, error) {
	return &types.QuickStatsDTO{}, nil
}
