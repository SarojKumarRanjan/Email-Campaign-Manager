package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type SubscriptionService interface {
	GetSubscription(userID uint64) (*types.Subscription, error)
	CreateSubscription(userID uint64, req *types.CreateSubscriptionRequest) (*types.Subscription, error)
}

type subscriptionService struct {
	repo repository.SubscriptionRepository
}

func NewSubscriptionService(repo repository.SubscriptionRepository) SubscriptionService {
	return &subscriptionService{repo: repo}
}

func (s *subscriptionService) GetSubscription(userID uint64) (*types.Subscription, error) {
	return s.repo.GetSubscription(userID)
}

func (s *subscriptionService) CreateSubscription(userID uint64, req *types.CreateSubscriptionRequest) (*types.Subscription, error) {
	// TODO: Implement payment gateway integration
	// For now, just create a dummy subscription
	sub := &types.Subscription{
		UserID:       userID,
		PlanType:     req.PlanType,
		Status:       types.StatusActive,
		BillingCycle: req.BillingCycle,
		Amount:       0, // Calculate based on plan
		Currency:     "INR",
		AutoRenew:    true,
	}

	if err := s.repo.CreateSubscription(sub); err != nil {
		return nil, err
	}
	return sub, nil
}
