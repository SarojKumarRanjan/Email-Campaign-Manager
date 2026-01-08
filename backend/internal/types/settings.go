package types

import "time"

type UserSettings struct {
	ID                    uint64    `json:"id"`
	UserID                uint64    `json:"user_id"`
	SMTPHost              string    `json:"smtp_host"`
	SMTPPort              int       `json:"smtp_port"`
	SMTPUsername          string    `json:"smtp_username"`
	SMTPPasswordEncrypted string    `json:"-"`
	DailySendLimit        int       `json:"daily_send_limit"`
	MonthlySendLimit      int       `json:"monthly_send_limit"`
	Timezone              string    `json:"timezone"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`

	// File Settings
	FileProvider        string `json:"file_provider"`
	S3Bucket            string `json:"s3_bucket"`
	S3Region            string `json:"s3_region"`
	S3AccessKey         string `json:"s3_access_key"`
	S3SecretKey         string `json:"s3_secret_key"`
	CloudinaryCloudName string `json:"cloudinary_cloud_name"`
	CloudinaryApiKey    string `json:"cloudinary_api_key"`
	CloudinaryApiSecret string `json:"cloudinary_api_secret"`

	// Privacy Security
	TwoFactorEnabled  bool `json:"two_factor_enabled"`
	DataRetentionDays int  `json:"data_retention_days"`

	// Validated Settings
	DefaultFromEmail        string `json:"default_from_email"`
	AdminNotificationEmails string `json:"admin_notification_emails"`
	Concurrency             int    `json:"concurrency"`
	MessageRate             int    `json:"message_rate"`
	BatchSize               int    `json:"batch_size"`
	MaxErrorThreshold       int    `json:"max_error_threshold"`
	S3BucketPath            string `json:"s3_bucket_path"`
	S3BucketType            string `json:"s3_bucket_type"`
	S3UploadExpiry          int    `json:"s3_upload_expiry"`
	PermittedFileExtensions string `json:"permitted_file_extensions"`
	SMTPMaxConnections      int    `json:"smtp_max_connections"`
	SMTPRetries             int    `json:"smtp_retries"`
}

type UpdateSettingsRequest struct {
	Timezone                string `json:"timezone"`
	DefaultFromEmail        string `json:"default_from_email"`
	AdminNotificationEmails string `json:"admin_notification_emails"`
	Concurrency             int    `json:"concurrency"`
	MessageRate             int    `json:"message_rate"`
	BatchSize               int    `json:"batch_size"`
	MaxErrorThreshold       int    `json:"max_error_threshold"`
}

type UpdateSMTPRequest struct {
	Host           string `json:"host" binding:"required"`
	Port           int    `json:"port" binding:"required"`
	Username       string `json:"username" binding:"required"`
	Password       string `json:"password" binding:"required"`
	MaxConnections int    `json:"max_connections"`
	Retries        int    `json:"retries"`
}

type UpdateLimitsRequest struct {
	DailySendLimit   int `json:"daily_send_limit"`
	MonthlySendLimit int `json:"monthly_send_limit"`
}

type TestSMTPRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type UpdateFileSettingsRequest struct {
	FileProvider            string `json:"file_provider" binding:"required,oneof=filesystem s3 cloudinary"`
	S3Bucket                string `json:"s3_bucket"`
	S3Region                string `json:"s3_region"`
	S3AccessKey             string `json:"s3_access_key"`
	S3SecretKey             string `json:"s3_secret_key"`
	S3BucketPath            string `json:"s3_bucket_path"`
	S3BucketType            string `json:"s3_bucket_type"`
	S3UploadExpiry          int    `json:"s3_upload_expiry"`
	CloudinaryCloudName     string `json:"cloudinary_cloud_name"`
	CloudinaryApiKey        string `json:"cloudinary_api_key"`
	CloudinaryApiSecret     string `json:"cloudinary_api_secret"`
	PermittedFileExtensions string `json:"permitted_file_extensions"`
}

type UpdatePrivacySettingsRequest struct {
	TwoFactorEnabled  bool `json:"two_factor_enabled"`
	DataRetentionDays int  `json:"data_retention_days"`
}
