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
}

type UpdateSettingsRequest struct {
	Timezone string `json:"timezone"`
}

type UpdateSMTPRequest struct {
	Host     string `json:"host" binding:"required"`
	Port     int    `json:"port" binding:"required"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UpdateLimitsRequest struct {
	DailySendLimit   int `json:"daily_send_limit"`
	MonthlySendLimit int `json:"monthly_send_limit"`
}

type TestSMTPRequest struct {
	Email string `json:"email" binding:"required,email"`
}
