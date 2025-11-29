package utils

import (
	"fmt"
	"net/smtp"

	"email_campaign/internal/config"
)

func SendOTP(to string, otp string) error {
	cfg := config.Load()

	// If SMTP creds are empty, just log it (for demo/dev)
	if cfg.SMTPUser == "" || cfg.SMTPPass == "" {
		fmt.Printf("Mock Email to %s: Your OTP is %s\n", to, otp)
		return nil
	}

	auth := smtp.PlainAuth("", cfg.SMTPUser, cfg.SMTPPass, cfg.SMTPHost)

	msg := []byte("To: " + to + "\r\n" +
		"Subject: Email Verification OTP\r\n" +
		"\r\n" +
		"Your OTP is: " + otp + "\r\n")

	addr := fmt.Sprintf("%s:%d", cfg.SMTPHost, cfg.SMTPPort)
	err := smtp.SendMail(addr, auth, cfg.SMTPUser, []string{to}, msg)
	if err != nil {
		return err
	}

	return nil
}
