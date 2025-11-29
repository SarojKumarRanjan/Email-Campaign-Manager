package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type SearchService interface {
	Search(req *types.SearchRequest) (*types.SearchResponse, error)
}

type searchService struct {
	repo repository.SearchRepository
}

func NewSearchService(repo repository.SearchRepository) SearchService {
	return &searchService{repo: repo}
}

func (s *searchService) Search(req *types.SearchRequest) (*types.SearchResponse, error) {
	return s.repo.Search(req.Query)
}
