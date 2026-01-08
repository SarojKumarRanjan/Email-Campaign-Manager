package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
	"errors"
	"fmt"
)

type SettingsService interface {
	GetSettings(userID uint64) (*types.UserSettings, error)
	UpdateSettings(userID uint64, req *types.UpdateSettingsRequest) error
	UpdateSMTP(userID uint64, req *types.UpdateSMTPRequest) error
	TestSMTP(userID uint64, req *types.TestSMTPRequest) error
	UpdateFileSettings(userID uint64, req *types.UpdateFileSettingsRequest) error
	UpdatePrivacySettings(userID uint64, req *types.UpdatePrivacySettingsRequest) error
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

	settings.DefaultFromEmail = req.DefaultFromEmail
	settings.AdminNotificationEmails = req.AdminNotificationEmails
	settings.Concurrency = req.Concurrency
	settings.MessageRate = req.MessageRate
	settings.BatchSize = req.BatchSize
	settings.MaxErrorThreshold = req.MaxErrorThreshold

	if req.Timezone != "" {
		settings.Timezone = req.Timezone
	}

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
	if req.Password != "" {
		// TODO: Encrypt password
		settings.SMTPPasswordEncrypted = req.Password
	}
	settings.SMTPMaxConnections = req.MaxConnections
	settings.SMTPRetries = req.Retries

	return s.repo.UpdateSMTP(settings)
}

func (s *settingsService) TestSMTP(userID uint64, req *types.TestSMTPRequest) error {
	settings, err := s.repo.GetSettings(userID)
	if err != nil {
		return err
	}

	if settings.SMTPHost == "" {
		return errors.New("SMTP host is not configured")
	}

	smtpSettings := utils.SMTPSettings{
		Host:     settings.SMTPHost,
		Port:     settings.SMTPPort,
		Username: settings.SMTPUsername,
		Password: settings.SMTPPasswordEncrypted,
	}

	subject := "SMTP Connection Test"
	body := fmt.Sprintf("Hello,\n\nThis is a test email to verify your SMTP configuration in the Email Campaign Manager.\n\nIf you received this, your settings are correct!\n\nSent at: %v", settings.UpdatedAt)

	return utils.SendEmail(smtpSettings, req.Email, subject, body)
}

func (s *settingsService) UpdateFileSettings(userID uint64, req *types.UpdateFileSettingsRequest) error {
	settings, err := s.repo.GetSettings(userID)
	if err != nil {
		return err
	}

	settings.FileProvider = req.FileProvider
	settings.S3Bucket = req.S3Bucket
	settings.S3Region = req.S3Region
	settings.S3AccessKey = req.S3AccessKey
	settings.S3SecretKey = req.S3SecretKey
	settings.S3BucketPath = req.S3BucketPath
	settings.S3BucketType = req.S3BucketType
	settings.S3UploadExpiry = req.S3UploadExpiry
	settings.CloudinaryCloudName = req.CloudinaryCloudName
	settings.CloudinaryApiKey = req.CloudinaryApiKey
	settings.CloudinaryApiSecret = req.CloudinaryApiSecret
	settings.PermittedFileExtensions = req.PermittedFileExtensions

	return s.repo.UpdateFileSettings(settings)
}

func (s *settingsService) UpdatePrivacySettings(userID uint64, req *types.UpdatePrivacySettingsRequest) error {
	settings, err := s.repo.GetSettings(userID)
	if err != nil {
		return err
	}

	settings.TwoFactorEnabled = req.TwoFactorEnabled
	settings.DataRetentionDays = req.DataRetentionDays

	return s.repo.UpdatePrivacySettings(settings)
}
