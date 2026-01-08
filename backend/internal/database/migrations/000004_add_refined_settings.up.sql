ALTER TABLE user_settings
ADD COLUMN default_from_email VARCHAR(255),
ADD COLUMN admin_notification_emails TEXT,
ADD COLUMN concurrency INT DEFAULT 1,
ADD COLUMN message_rate INT DEFAULT 0,
ADD COLUMN batch_size INT DEFAULT 100,
ADD COLUMN max_error_threshold INT DEFAULT 10,
ADD COLUMN s3_bucket_path VARCHAR(255),
ADD COLUMN s3_bucket_type VARCHAR(50),
ADD COLUMN s3_upload_expiry INT DEFAULT 15,
ADD COLUMN permitted_file_extensions TEXT,
ADD COLUMN smtp_max_connections INT DEFAULT 5,
ADD COLUMN smtp_retries INT DEFAULT 3;
-- Optional: DROP COLUMN timezone if strictly not needed, but keeping it usually harmless.
