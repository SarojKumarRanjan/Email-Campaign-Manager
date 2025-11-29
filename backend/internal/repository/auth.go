package repository

import (
	"database/sql"
	"errors"
	"time"

	"email_campaign/internal/types"
)

type AuthRepository interface {
	CreateUser(user *types.RegisterRequest) error
	GetUserByEmail(email string) (*types.UserDTO, string, error) // Returns user, password_hash, error
	StoreOTP(email, otp string) error
	GetOTP(email string) (string, error)
	VerifyUser(email string) error
	GetOrCreateGoogleUser(googleUser *types.GoogleUser) (*types.UserDTO, error)
}

type authRepository struct {
	db *sql.DB
}

func NewAuthRepository(db *sql.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) CreateUser(req *types.RegisterRequest) error {
	_, err := r.db.Exec(
		"INSERT INTO users (email, password_hash, first_name, last_name, email_verified) VALUES (?, ?, ?, ?, ?)",
		req.Email, req.Password, req.FirstName, req.LastName, false,
	)
	return err
}

func (r *authRepository) GetUserByEmail(email string) (*types.UserDTO, string, error) {
	var user types.UserDTO
	var passwordHash string
	err := r.db.QueryRow(
		"SELECT id, email, first_name, last_name, password_hash FROM users WHERE email = ?",
		email,
	).Scan(&user.ID, &user.Email, &user.FirstName, &user.LastName, &passwordHash)

	if err != nil {
		return nil, "", err
	}
	return &user, passwordHash, nil
}

func (r *authRepository) StoreOTP(email, otp string) error {
	// Expires in 15 minutes
	expiresAt := time.Now().Add(15 * time.Minute)
	_, err := r.db.Exec(
		"INSERT INTO email_verifications (email, otp, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?",
		email, otp, expiresAt, otp, expiresAt,
	)
	return err
}

func (r *authRepository) GetOTP(email string) (string, error) {
	var otp string
	var expiresAt time.Time
	err := r.db.QueryRow(
		"SELECT otp, expires_at FROM email_verifications WHERE email = ?",
		email,
	).Scan(&otp, &expiresAt)

	if err != nil {
		return "", err
	}

	if time.Now().After(expiresAt) {
		return "", errors.New("otp expired")
	}

	return otp, nil
}

func (r *authRepository) VerifyUser(email string) error {
	_, err := r.db.Exec("UPDATE users SET email_verified = TRUE WHERE email = ?", email)
	if err != nil {
		return err
	}
	// Clean up OTP
	_, _ = r.db.Exec("DELETE FROM email_verifications WHERE email = ?", email)
	return nil
}

func (r *authRepository) GetOrCreateGoogleUser(gUser *types.GoogleUser) (*types.UserDTO, error) {
	// Check if user exists
	user, _, err := r.GetUserByEmail(gUser.Email)
	if err == nil {
		return user, nil
	}

	if err != sql.ErrNoRows {
		return nil, err
	}

	// Create new user (verified by default since it's Google)
	res, err := r.db.Exec(
		"INSERT INTO users (email, password_hash, first_name, last_name, email_verified) VALUES (?, ?, ?, ?, ?)",
		gUser.Email, "", gUser.GivenName, gUser.FamilyName, true,
	)
	if err != nil {
		return nil, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &types.UserDTO{
		ID:        uint64(id),
		Email:     gUser.Email,
		FirstName: gUser.GivenName,
		LastName:  gUser.FamilyName,
	}, nil
}
