package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type TemplateService interface {
	CreateTemplate(req *types.CreateTemplateRequest) error
	GetTemplate(id uint64) (*types.TemplateDTO, error)
	ListTemplates(filter *types.TemplateFilter) ([]types.TemplateDTO, error)
}

type templateService struct {
	repo repository.TemplateRepository
}

func NewTemplateService(repo repository.TemplateRepository) TemplateService {
	return &templateService{repo: repo}
}

func (s *templateService) CreateTemplate(req *types.CreateTemplateRequest) error {
	return s.repo.CreateTemplate(req)
}

func (s *templateService) GetTemplate(id uint64) (*types.TemplateDTO, error) {
	return s.repo.GetTemplate(id)
}

func (s *templateService) ListTemplates(filter *types.TemplateFilter) ([]types.TemplateDTO, error) {
	return s.repo.ListTemplates(filter)
}
