package repository

import (
	"database/sql"
	"email_campaign/internal/types"
	"time"
)

type UserRepository interface {
	CreateUser(user *types.User) error
	GetUserByID(id uint64) (*types.User, error)
	GetUserByEmail(email string) (*types.User, error)
	UpdateUser(user *types.User) error
	DeleteUser(id uint64) error
	UpdatePassword(id uint64, hash string) error
}

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) CreateUser(user *types.User) error {
	query := `INSERT INTO users (email, password_hash, first_name, last_name, company_name, is_active, created_at, updated_at)
			  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

	result, err := r.db.Exec(query, user.Email, user.PasswordHash, user.FirstName, user.LastName, user.CompanyName, user.IsActive, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	user.ID = uint64(id)
	return nil
}

func (r *userRepository) GetUserByID(id uint64) (*types.User, error) {
	var user types.User
	query := `SELECT id, email, password_hash, first_name, last_name,COALESCE(company_name, ''), is_active, created_at, updated_at 
			  FROM users WHERE id = ?`

	err := r.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FirstName, &user.LastName,
		&user.CompanyName, &user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetUserByEmail(email string) (*types.User, error) {
	var user types.User
	query := `SELECT id, email, password_hash, first_name, last_name,COALESCE(company_name, ''), is_active, created_at, updated_at 
			  FROM users WHERE email = ?`

	err := r.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FirstName, &user.LastName,
		&user.CompanyName, &user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) UpdateUser(user *types.User) error {
	query := `UPDATE users SET first_name = ?, last_name = ?, company_name = ?, updated_at = ? WHERE id = ?`
	_, err := r.db.Exec(query, user.FirstName, user.LastName, user.CompanyName, time.Now(), user.ID)
	return err
}

func (r *userRepository) DeleteUser(id uint64) error {
	query := `DELETE FROM users WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *userRepository) UpdatePassword(id uint64, hash string) error {
	query := `UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`
	_, err := r.db.Exec(query, hash, time.Now(), id)
	return err
}
