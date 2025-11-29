package repository

import (
	"database/sql"
	"email_campaign/internal/types"
)

type AnalyticsRepository interface {
	GetDashboardStats() (*types.DashboardStatsDTO, error)
}

type analyticsRepository struct {
	db *sql.DB
}

func NewAnalyticsRepository(db *sql.DB) AnalyticsRepository {
	return &analyticsRepository{db: db}
}

func (r *analyticsRepository) GetDashboardStats() (*types.DashboardStatsDTO, error) {
	// TODO: Implement
	return nil, nil
}
