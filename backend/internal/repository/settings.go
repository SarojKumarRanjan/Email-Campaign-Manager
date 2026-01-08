package repository

import (
	"database/sql"
	"email_campaign/internal/types"
)

type SettingsRepository interface {
	GetSettings(userID uint64) (*types.UserSettings, error)
	UpdateSettings(settings *types.UserSettings) error
	UpdateFileSettings(settings *types.UserSettings) error
	UpdatePrivacySettings(settings *types.UserSettings) error
	UpdateSMTP(settings *types.UserSettings) error
	CreateSettings(userID uint64) error
}

type settingsRepository struct {
	db *sql.DB
}

func NewSettingsRepository(db *sql.DB) SettingsRepository {
	return &settingsRepository{db: db}
}

func (r *settingsRepository) GetSettings(userID uint64) (*types.UserSettings, error) {
	var s types.UserSettings
	query := `SELECT id, user_id, 
			  COALESCE(smtp_host, ''), COALESCE(smtp_port, 587), COALESCE(smtp_username, ''), COALESCE(smtp_password_encrypted, ''), 
			  COALESCE(daily_send_limit, 1000), COALESCE(monthly_send_limit, 10000), COALESCE(timezone, 'UTC'), created_at, updated_at,
			  COALESCE(file_provider, 'filesystem'), COALESCE(s3_bucket, ''), COALESCE(s3_region, ''), COALESCE(s3_access_key, ''), COALESCE(s3_secret_key, ''),
			  COALESCE(cloudinary_cloud_name, ''), COALESCE(cloudinary_api_key, ''), COALESCE(cloudinary_api_secret, ''),
			  COALESCE(two_factor_enabled, 0), COALESCE(data_retention_days, 365),
			  COALESCE(default_from_email, ''), COALESCE(admin_notification_emails, ''), COALESCE(concurrency, 1), COALESCE(message_rate, 0),
			  COALESCE(batch_size, 100), COALESCE(max_error_threshold, 10), COALESCE(s3_bucket_path, ''), COALESCE(s3_bucket_type, 'public'),
			  COALESCE(s3_upload_expiry, 15), COALESCE(permitted_file_extensions, 'jpg,jpeg,png,gif,svg'), COALESCE(smtp_max_connections, 5), COALESCE(smtp_retries, 3)
			  FROM user_settings WHERE user_id = ?`

	err := r.db.QueryRow(query, userID).Scan(
		&s.ID, &s.UserID, &s.SMTPHost, &s.SMTPPort, &s.SMTPUsername, &s.SMTPPasswordEncrypted,
		&s.DailySendLimit, &s.MonthlySendLimit, &s.Timezone, &s.CreatedAt, &s.UpdatedAt,
		&s.FileProvider, &s.S3Bucket, &s.S3Region, &s.S3AccessKey, &s.S3SecretKey,
		&s.CloudinaryCloudName, &s.CloudinaryApiKey, &s.CloudinaryApiSecret,
		&s.TwoFactorEnabled, &s.DataRetentionDays,
		&s.DefaultFromEmail, &s.AdminNotificationEmails, &s.Concurrency, &s.MessageRate,
		&s.BatchSize, &s.MaxErrorThreshold, &s.S3BucketPath, &s.S3BucketType,
		&s.S3UploadExpiry, &s.PermittedFileExtensions, &s.SMTPMaxConnections, &s.SMTPRetries,
	)
	if err == sql.ErrNoRows {
		// Create default settings if not exists
		if err := r.CreateSettings(userID); err != nil {
			return nil, err
		}
		return r.GetSettings(userID)
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *settingsRepository) CreateSettings(userID uint64) error {
	query := `INSERT INTO user_settings (user_id) VALUES (?)`
	_, err := r.db.Exec(query, userID)
	return err
}

func (r *settingsRepository) UpdateSettings(s *types.UserSettings) error {
	query := `UPDATE user_settings SET 
			  smtp_host = ?, smtp_port = ?, smtp_username = ?, smtp_password_encrypted = ?,
			  daily_send_limit = ?, monthly_send_limit = ?, timezone = ?,
			  default_from_email = ?, admin_notification_emails = ?, concurrency = ?,
			  message_rate = ?, batch_size = ?, max_error_threshold = ?
			  WHERE user_id = ?`

	_, err := r.db.Exec(query,
		s.SMTPHost, s.SMTPPort, s.SMTPUsername, s.SMTPPasswordEncrypted,
		s.DailySendLimit, s.MonthlySendLimit, s.Timezone,
		s.DefaultFromEmail, s.AdminNotificationEmails, s.Concurrency,
		s.MessageRate, s.BatchSize, s.MaxErrorThreshold, s.UserID,
	)
	return err
}

func (r *settingsRepository) UpdateFileSettings(s *types.UserSettings) error {
	query := `UPDATE user_settings SET 
			  file_provider = ?, s3_bucket = ?, s3_region = ?, s3_access_key = ?, s3_secret_key = ?,
			  cloudinary_cloud_name = ?, cloudinary_api_key = ?, cloudinary_api_secret = ?,
			  s3_bucket_path = ?, s3_bucket_type = ?, s3_upload_expiry = ?, permitted_file_extensions = ?
			  WHERE user_id = ?`

	_, err := r.db.Exec(query,
		s.FileProvider, s.S3Bucket, s.S3Region, s.S3AccessKey, s.S3SecretKey,
		s.CloudinaryCloudName, s.CloudinaryApiKey, s.CloudinaryApiSecret,
		s.S3BucketPath, s.S3BucketType, s.S3UploadExpiry, s.PermittedFileExtensions, s.UserID,
	)
	return err
}

func (r *settingsRepository) UpdatePrivacySettings(s *types.UserSettings) error {
	query := `UPDATE user_settings SET 
			  two_factor_enabled = ?, data_retention_days = ?
			  WHERE user_id = ?`

	_, err := r.db.Exec(query,
		s.TwoFactorEnabled, s.DataRetentionDays, s.UserID,
	)
	return err
}

func (r *settingsRepository) UpdateSMTP(s *types.UserSettings) error {
	query := `UPDATE user_settings SET 
			  smtp_host = ?, smtp_port = ?, smtp_username = ?, smtp_password_encrypted = ?,
			  smtp_max_connections = ?, smtp_retries = ?
			  WHERE user_id = ?`

	_, err := r.db.Exec(query,
		s.SMTPHost, s.SMTPPort, s.SMTPUsername, s.SMTPPasswordEncrypted,
		s.SMTPMaxConnections, s.SMTPRetries, s.UserID,
	)
	return err
}
