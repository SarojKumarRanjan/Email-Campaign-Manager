package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type CampaignService interface {
	CreateCampaign(req *types.CreateCampaignRequest) error
	GetCampaign(id uint64) (*types.CampaignDTO, error)
	ListCampaigns(filter *types.CampaignFilter) ([]types.CampaignDTO, error)
}

type campaignService struct {
	repo repository.CampaignRepository
}

func NewCampaignService(repo repository.CampaignRepository) CampaignService {
	return &campaignService{repo: repo}
}

func (s *campaignService) CreateCampaign(req *types.CreateCampaignRequest) error {
	return s.repo.CreateCampaign(req)
}

func (s *campaignService) GetCampaign(id uint64) (*types.CampaignDTO, error) {
	return s.repo.GetCampaign(id)
}

func (s *campaignService) ListCampaigns(filter *types.CampaignFilter) ([]types.CampaignDTO, error) {
	return s.repo.ListCampaigns(filter)
}
