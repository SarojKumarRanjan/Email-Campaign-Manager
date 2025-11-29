package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type UserService interface {
	GetUser(id uint64) (*types.UserDTO, error)
	UpdateUser(id uint64, req *types.UpdateUserRequest) error
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) GetUser(id uint64) (*types.UserDTO, error) {
	return s.repo.GetUserByID(id)
}

func (s *userService) UpdateUser(id uint64, req *types.UpdateUserRequest) error {
	return s.repo.UpdateUser(id, req)
}
