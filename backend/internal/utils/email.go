package utils

import (
	"fmt"
	"net/smtp"

	"email_campaign/internal/config"
)

type SMTPSettings struct {
	Host     string
	Port     int
	Username string
	Password string
}

func SendEmail(settings SMTPSettings, to string, subject string, body string) error {
	// If Host is empty, mock it
	if settings.Host == "" {
		fmt.Printf("Mock Email to %s: %s\n", to, body)
		return nil
	}

	auth := smtp.PlainAuth("", settings.Username, settings.Password, settings.Host)

	msg := []byte("To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"\r\n" +
		body + "\r\n")

	addr := fmt.Sprintf("%s:%d", settings.Host, settings.Port)
	return smtp.SendMail(addr, auth, settings.Username, []string{to}, msg)
}

func SendOTP(to string, otp string) error {
	cfg := config.Load()

	settings := SMTPSettings{
		Host:     cfg.SMTPHost,
		Port:     cfg.SMTPPort,
		Username: cfg.SMTPUser,
		Password: cfg.SMTPPass,
	}

	return SendEmail(settings, to, "Email Verification OTP", "Your OTP is: "+otp)
}
