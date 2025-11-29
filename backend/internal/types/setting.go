package types

import "time"

type UserSettingsDTO struct {
	ID               uint64    `json:"id"`
	UserID           uint64    `json:"user_id"`
	SMTPHost         string    `json:"smtp_host"`
	SMTPPort         int       `json:"smtp_port"`
	SMTPUsername     string    `json:"smtp_username"`
	DailySendLimit   int       `json:"daily_send_limit"`
	MonthlySendLimit int       `json:"monthly_send_limit"`
	Timezone         string    `json:"timezone"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type UpdateSettingsRequest struct {
	DailySendLimit   *int   `json:"daily_send_limit"`
	MonthlySendLimit *int   `json:"monthly_send_limit"`
	Timezone         string `json:"timezone"`
}

type UpdateSMTPRequest struct {
	SMTPHost     string `json:"smtp_host" binding:"required"`
	SMTPPort     int    `json:"smtp_port" binding:"required"`
	SMTPUsername string `json:"smtp_username" binding:"required"`
	SMTPPassword string `json:"smtp_password" binding:"required"`
}

type TestSMTPRequest struct {
	SMTPHost     string `json:"smtp_host" binding:"required"`
	SMTPPort     int    `json:"smtp_port" binding:"required"`
	SMTPUsername string `json:"smtp_username" binding:"required"`
	SMTPPassword string `json:"smtp_password" binding:"required"`
	TestEmail    string `json:"test_email" binding:"required,email"`
}
