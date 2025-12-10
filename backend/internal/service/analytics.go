package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type AnalyticsService interface {
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

type analyticsService struct {
	repo repository.AnalyticsRepository
}

func NewAnalyticsService(repo repository.AnalyticsRepository) AnalyticsService {
	return &analyticsService{repo: repo}
}

func (s *analyticsService) GetDashboardStats() (*types.DashboardStatsDTO, error) {
	return s.repo.GetDashboardStats()
}

func (s *analyticsService) GetCampaignTimeline(campaignID uint64) ([]types.TimelinePoint, error) {
	return s.repo.GetCampaignTimeline(campaignID)
}
func (s *analyticsService) GetCampaignComparison(campaignIDs []uint64) ([]types.CampaignStatsDTO, error) {
	return s.repo.GetCampaignComparison(campaignIDs)
}
func (s *analyticsService) GetContactEngagement(contactID uint64) (*types.ContactEngagementDTO, error) {
	return s.repo.GetContactEngagement(contactID)
}
func (s *analyticsService) GetTagPerformance(tagID uint64) (*types.TagPerformanceDTO, error) {
	return s.repo.GetTagPerformance(tagID)
}
func (s *analyticsService) GetSendVolume(period string) ([]types.VolumePoint, error) {
	return s.repo.GetSendVolume(period)
}
func (s *analyticsService) GetEngagementTrends(period string) ([]types.TrendPoint, error) {
	return s.repo.GetEngagementTrends(period)
}
func (s *analyticsService) GetRecentCampaigns(limit int) ([]types.CampaignDTO, error) {
	return s.repo.GetRecentCampaigns(limit)
}
func (s *analyticsService) GetRecentActivity(limit int) ([]types.ActivityDTO, error) {
	return s.repo.GetRecentActivity(limit)
}
func (s *analyticsService) GetQuickStats() (*types.QuickStatsDTO, error) {
	return s.repo.GetQuickStats()
}
