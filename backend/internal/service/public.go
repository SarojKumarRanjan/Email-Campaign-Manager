package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type PublicService interface {
	Unsubscribe(req *types.UnsubscribeRequest) error
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
