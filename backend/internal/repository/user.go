package repository

import (
	"database/sql"
	"email_campaign/internal/types"
)

type UserRepository interface {
	GetUserByID(id uint64) (*types.UserDTO, error)
	UpdateUser(id uint64, user *types.UpdateUserRequest) error
}

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) GetUserByID(id uint64) (*types.UserDTO, error) {
	// TODO: Implement
	return nil, nil
}

func (r *userRepository) UpdateUser(id uint64, user *types.UpdateUserRequest) error {
	// TODO: Implement
	return nil
}
