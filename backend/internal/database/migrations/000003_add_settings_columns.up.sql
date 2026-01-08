ALTER TABLE user_settings
ADD COLUMN file_provider ENUM('filesystem', 's3', 'cloudinary') DEFAULT 'filesystem',
ADD COLUMN s3_bucket VARCHAR(255),
ADD COLUMN s3_region VARCHAR(50),
ADD COLUMN s3_access_key VARCHAR(255),
ADD COLUMN s3_secret_key VARCHAR(255),
ADD COLUMN cloudinary_cloud_name VARCHAR(255),
ADD COLUMN cloudinary_api_key VARCHAR(255),
ADD COLUMN cloudinary_api_secret VARCHAR(255),
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN data_retention_days INT DEFAULT 365;
