package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
	"errors"

	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	GetUser(id uint64) (*types.UserDTO, error)
	UpdateUser(id uint64, req *types.UpdateUserRequest) error
	DeleteUser(id uint64) error
	ChangePassword(id uint64, req *types.ChangePasswordRequest) error
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) GetUser(id uint64) (*types.UserDTO, error) {
	user, err := s.repo.GetUserByID(id)
	if err != nil {
		return nil, err
	}
	return s.mapToDTO(user), nil
}

func (s *userService) UpdateUser(id uint64, req *types.UpdateUserRequest) error {
	user, err := s.repo.GetUserByID(id)
	if err != nil {
		return err
	}

	user.FirstName = req.FirstName
	user.LastName = req.LastName
	user.CompanyName = req.CompanyName

	return s.repo.UpdateUser(user)
}

func (s *userService) DeleteUser(id uint64) error {
	return s.repo.DeleteUser(id)
}

func (s *userService) ChangePassword(id uint64, req *types.ChangePasswordRequest) error {
	user, err := s.repo.GetUserByID(id)
	if err != nil {
		return err
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		return errors.New("invalid current password")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.repo.UpdatePassword(id, string(hashedPassword))
}

func (s *userService) mapToDTO(user *types.User) *types.UserDTO {
	return &types.UserDTO{
		ID:            user.ID,
		Email:         user.Email,
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		CompanyName:   user.CompanyName,
		IsActive:      user.IsActive,
		EmailVerified: user.EmailVerified,
		CreatedAt:     user.CreatedAt,
		UpdatedAt:     user.UpdatedAt,
		LastLoginAt:   user.LastLoginAt,
	}
}
