package service

import (
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"

	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type CampaignService interface {
	CreateCampaign(req *types.CreateCampaignRequest) error
	GetCampaign(id uint64, userID uint64) (*types.CampaignDTO, error)
	ListCampaigns(filter *types.CampaignFilter) ([]types.CampaignDTO, int64, error)
	UpdateCampaign(id uint64, userID uint64, req *types.UpdateCampaignRequest) error
	DeleteCampaign(id uint64, userID uint64) error
	DuplicateCampaign(id uint64, userID uint64) error
	ScheduleCampaign(id uint64, userID uint64, req *types.ScheduleCampaignRequest) error
	SendCampaign(id uint64, userID uint64) error
	PauseCampaign(id uint64, userID uint64) error
	ResumeCampaign(id uint64, userID uint64) error
	CancelCampaign(id uint64, userID uint64) error
	GetCampaignRecipients(id uint64, userID uint64, page, limit int) ([]types.CampaignRecipientDTO, error)
	GetCampaignStats(id uint64, userID uint64) (*types.CampaignStatsDTO, error)
	TrackEvent(trackingID string, eventType string, userAgent string, ipAddress string, url string) error
	HandleWebhookBounce(req *types.WebhookBounceRequest) error
	HandleWebhookComplaint(req *types.WebhookComplaintRequest) error
	HandleWebhookDelivery(req *types.WebhookDeliveryRequest) error
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

func (s *campaignService) GetCampaign(id uint64, userID uint64) (*types.CampaignDTO, error) {
	return s.repo.GetCampaign(id, userID)
}

func (s *campaignService) ListCampaigns(filter *types.CampaignFilter) ([]types.CampaignDTO, int64, error) {
	return s.repo.ListCampaigns(filter)
}

func (s *campaignService) UpdateCampaign(id uint64, userID uint64, req *types.UpdateCampaignRequest) error {
	return s.repo.UpdateCampaign(id, userID, req)
}

func (s *campaignService) DeleteCampaign(id uint64, userID uint64) error {
	return s.repo.DeleteCampaign(id, userID)
}

func (s *campaignService) DuplicateCampaign(id uint64, userID uint64) error {
	return s.repo.DuplicateCampaign(id, userID)
}

func (s *campaignService) ScheduleCampaign(id uint64, userID uint64, req *types.ScheduleCampaignRequest) error {
	reqUpdate := &types.UpdateCampaignRequest{
		ScheduledAt: &req.ScheduledAt,
	}
	return s.repo.UpdateCampaign(id, userID, reqUpdate)
}

func (s *campaignService) SendCampaign(id uint64, userID uint64) error {
	// Verify it's ready to send (status draft or scheduled)
	c, err := s.repo.GetCampaign(id, userID)
	if err != nil {
		return err
	}
	if c.Status == types.CampaignStatusSending || c.Status == types.CampaignStatusCompleted {
		return nil // Already sending or done
	}

	// TODO: Trigger background worker to send logic

	return s.repo.UpdateStatus(id, userID, types.CampaignStatusSending)
}

func (s *campaignService) PauseCampaign(id uint64, userID uint64) error {
	return s.repo.UpdateStatus(id, userID, types.CampaignStatusPaused)
}

func (s *campaignService) ResumeCampaign(id uint64, userID uint64) error {
	return s.repo.UpdateStatus(id, userID, types.CampaignStatusSending)
}

func (s *campaignService) CancelCampaign(id uint64, userID uint64) error {
	return s.repo.UpdateStatus(id, userID, types.CampaignStatusCancelled)
}

func (s *campaignService) GetCampaignRecipients(id uint64, userID uint64, page, limit int) ([]types.CampaignRecipientDTO, error) {
	return s.repo.GetCampaignRecipients(id, userID, page, limit)
}

func (s *campaignService) GetCampaignStats(id uint64, userID uint64) (*types.CampaignStatsDTO, error) {
	c, err := s.repo.GetCampaign(id, userID)
	if err != nil {
		return nil, err
	}

	stats := &types.CampaignStatsDTO{
		CampaignID:        c.ID,
		TotalRecipients:   c.TotalRecipients,
		SentCount:         c.SentCount,
		DeliveredCount:    c.DeliveredCount,
		FailedCount:       c.FailedCount,
		OpenedCount:       c.OpenedCount,
		ClickedCount:      c.ClickedCount,
		BouncedCount:      c.BouncedCount,
		UnsubscribedCount: c.UnsubscribedCount,
		UpdatedAt:         c.UpdatedAt,
	}

	if c.SentCount > 0 {
		stats.DeliveryRate = float64(c.DeliveredCount) / float64(c.SentCount) * 100
		stats.BounceRate = float64(c.BouncedCount) / float64(c.SentCount) * 100
	}
	if c.DeliveredCount > 0 {
		stats.OpenRate = float64(c.OpenedCount) / float64(c.DeliveredCount) * 100
		stats.ClickRate = float64(c.ClickedCount) / float64(c.DeliveredCount) * 100
		stats.UnsubscribeRate = float64(c.UnsubscribedCount) / float64(c.DeliveredCount) * 100
	}

	return stats, nil
}

func (s *campaignService) TrackEvent(trackingID string, eventType string, userAgent string, ipAddress string, url string) error {
	// Decode trackingID (base64 of campaignID:contactID)
	data, err := base64.StdEncoding.DecodeString(trackingID)
	if err != nil {
		return fmt.Errorf("invalid tracking id: %v", err)
	}
	parts := strings.Split(string(data), ":")
	if len(parts) != 2 {
		return fmt.Errorf("invalid tracking id format")
	}

	campaignID, err := strconv.ParseUint(parts[0], 10, 64)
	if err != nil {
		return fmt.Errorf("invalid campaign id in tracking id")
	}
	contactID, err := strconv.ParseUint(parts[1], 10, 64)
	if err != nil {
		return fmt.Errorf("invalid contact id in tracking id")
	}

	event := &types.EmailEventDTO{
		CampaignID: campaignID,
		ContactID:  contactID,
		EventType:  eventType,
		UserAgent:  userAgent,
		IPAddress:  ipAddress,
		Url:        url,
	}

	return s.repo.RecordEvent(event)
}

func (s *campaignService) HandleWebhookBounce(req *types.WebhookBounceRequest) error {
	// In a real system, we would map req.MessageID to a campaign_recipient record.
	// For this implementation, we will log it and attempt to find the contact by email if possible.
	// 1. Find contact by email (This would require ContactRepo access or a join query in CampaignRepo)
	// 2. Update status
	// For now, we'll placeholder this.
	return nil
}

func (s *campaignService) HandleWebhookComplaint(req *types.WebhookComplaintRequest) error {
	return nil
}

func (s *campaignService) HandleWebhookDelivery(req *types.WebhookDeliveryRequest) error {
	return nil
}
