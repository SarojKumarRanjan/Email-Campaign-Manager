package repository

import (
	"database/sql"
	"email_campaign/internal/types"
)

type CampaignRepository interface {
	CreateCampaign(campaign *types.CreateCampaignRequest) error
	GetCampaign(id uint64) (*types.CampaignDTO, error)
	ListCampaigns(filter *types.CampaignFilter) ([]types.CampaignDTO, error)
}

type campaignRepository struct {
	db *sql.DB
}

func NewCampaignRepository(db *sql.DB) CampaignRepository {
	return &campaignRepository{db: db}
}

func (r *campaignRepository) CreateCampaign(campaign *types.CreateCampaignRequest) error {
	// TODO: Implement
	return nil
}

func (r *campaignRepository) GetCampaign(id uint64) (*types.CampaignDTO, error) {
	// TODO: Implement
	return nil, nil
}

func (r *campaignRepository) ListCampaigns(filter *types.CampaignFilter) ([]types.CampaignDTO, error) {
	// TODO: Implement
	return nil, nil
}
