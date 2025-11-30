package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
	"errors"
)

type SettingsService interface {
	GetSettings(userID uint64) (*types.UserSettings, error)
	UpdateSettings(userID uint64, req *types.UpdateSettingsRequest) error
	UpdateSMTP(userID uint64, req *types.UpdateSMTPRequest) error
	TestSMTP(userID uint64, req *types.TestSMTPRequest) error
}

type settingsService struct {
	repo repository.SettingsRepository
}

func NewSettingsService(repo repository.SettingsRepository) SettingsService {
	return &settingsService{repo: repo}
}

func (s *settingsService) GetSettings(userID uint64) (*types.UserSettings, error) {
	return s.repo.GetSettings(userID)
}

func (s *settingsService) UpdateSettings(userID uint64, req *types.UpdateSettingsRequest) error {
	settings, err := s.repo.GetSettings(userID)
	if err != nil {
		return err
	}

	settings.Timezone = req.Timezone
	return s.repo.UpdateSettings(settings)
}

func (s *settingsService) UpdateSMTP(userID uint64, req *types.UpdateSMTPRequest) error {
	settings, err := s.repo.GetSettings(userID)
	if err != nil {
		return err
	}

	settings.SMTPHost = req.Host
	settings.SMTPPort = req.Port
	settings.SMTPUsername = req.Username
	// TODO: Encrypt password
	settings.SMTPPasswordEncrypted = req.Password

	return s.repo.UpdateSettings(settings)
}

func (s *settingsService) TestSMTP(userID uint64, req *types.TestSMTPRequest) error {
	// TODO: Implement actual SMTP test
	return errors.New("not implemented")
}
