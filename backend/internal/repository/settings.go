package repository

import (
	"database/sql"
	"email_campaign/internal/types"
)

type SettingsRepository interface {
	GetSettings(userID uint64) (*types.UserSettings, error)
	UpdateSettings(settings *types.UserSettings) error
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
	query := `SELECT id, user_id, smtp_host, smtp_port, smtp_username, smtp_password_encrypted, 
			  daily_send_limit, monthly_send_limit, timezone, created_at, updated_at
			  FROM user_settings WHERE user_id = ?`

	err := r.db.QueryRow(query, userID).Scan(
		&s.ID, &s.UserID, &s.SMTPHost, &s.SMTPPort, &s.SMTPUsername, &s.SMTPPasswordEncrypted,
		&s.DailySendLimit, &s.MonthlySendLimit, &s.Timezone, &s.CreatedAt, &s.UpdatedAt,
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
			  daily_send_limit = ?, monthly_send_limit = ?, timezone = ?
			  WHERE user_id = ?`

	_, err := r.db.Exec(query,
		s.SMTPHost, s.SMTPPort, s.SMTPUsername, s.SMTPPasswordEncrypted,
		s.DailySendLimit, s.MonthlySendLimit, s.Timezone, s.UserID,
	)
	return err
}
