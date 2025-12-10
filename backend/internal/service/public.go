package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type PublicService interface {
	Unsubscribe(req *types.UnsubscribeRequest) error
	Resubscribe(token string) error
	UpdatePreferences(req *types.UpdatePreferencesRequest) error
}

type publicService struct {
	repo repository.PublicRepository
}

func NewPublicService(repo repository.PublicRepository) PublicService {
	return &publicService{repo: repo}
}

func (s *publicService) Unsubscribe(req *types.UnsubscribeRequest) error {
	return s.repo.Unsubscribe(req.Token)
}

func (s *publicService) Resubscribe(token string) error {
	return s.repo.Resubscribe(token)
}

func (s *publicService) UpdatePreferences(req *types.UpdatePreferencesRequest) error {
	return s.repo.UpdatePreferences(req.Token, req.IsSubscribed)
}
