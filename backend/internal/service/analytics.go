package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type AnalyticsService interface {
	GetDashboardStats() (*types.DashboardStatsDTO, error)
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
