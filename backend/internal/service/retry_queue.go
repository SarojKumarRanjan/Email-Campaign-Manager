package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type RetryQueueService interface {
	ListRetryItems(page, limit int) ([]types.RetryItemDTO, error)
	GetRetryItem(id uint64) (*types.RetryItemDTO, error)
	ClearRetryQueue() error
	ProcessRetryQueue() error
}

type retryQueueService struct {
	repo repository.RetryQueueRepository
}

func NewRetryQueueService(repo repository.RetryQueueRepository) RetryQueueService {
	return &retryQueueService{repo: repo}
}

func (s *retryQueueService) ListRetryItems(page, limit int) ([]types.RetryItemDTO, error) {
	return s.repo.ListRetryItems(page, limit)
}

func (s *retryQueueService) GetRetryItem(id uint64) (*types.RetryItemDTO, error) {
	return s.repo.GetRetryItem(id)
}

func (s *retryQueueService) ClearRetryQueue() error {
	return s.repo.ClearRetryQueue()
}

func (s *retryQueueService) ProcessRetryQueue() error {
	// In a real implementation, this would fetch items due for retry and attempt to resend them.
	// For now, we will just return nil as a placeholder for the logic trigger.
	return nil
}
