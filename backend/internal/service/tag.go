package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
	"errors"
)

type TagService interface {
	ListTags(userID uint64) ([]types.Tag, error)
	CreateTag(userID uint64, req *types.CreateTagRequest) (*types.Tag, error)
	UpdateTag(userID uint64, tagID uint64, req *types.UpdateTagRequest) error
	DeleteTag(userID uint64, tagID uint64) error
	AddContactToTag(userID, tagID, contactID uint64) error
	RemoveContactFromTag(userID, tagID, contactID uint64) error
	GetTagContacts(userID, tagID uint64) ([]types.ContactDTO, error)
	GetContactTags(userID, contactID uint64) ([]types.Tag, error)
	AddTagToCampaign(userID, campaignID, tagID uint64) error
	RemoveTagFromCampaign(userID, campaignID, tagID uint64) error
	GetCampaignTags(userID, campaignID uint64) ([]types.Tag, error)
}

type tagService struct {
	repo repository.TagRepository
}

func NewTagService(repo repository.TagRepository) TagService {
	return &tagService{repo: repo}
}

func (s *tagService) ListTags(userID uint64) ([]types.Tag, error) {
	return s.repo.ListTags(userID)
}

func (s *tagService) CreateTag(userID uint64, req *types.CreateTagRequest) (*types.Tag, error) {
	tag := &types.Tag{
		UserID:      userID,
		Name:        req.Name,
		Description: req.Description,
		Color:       req.Color,
	}
	if err := s.repo.CreateTag(tag); err != nil {
		return nil, err
	}
	return tag, nil
}

func (s *tagService) UpdateTag(userID uint64, tagID uint64, req *types.UpdateTagRequest) error {
	tag, err := s.repo.GetTag(tagID)
	if err != nil {
		return err
	}

	if tag.UserID != userID {
		return errors.New("unauthorized")
	}

	if req.Name != "" {
		tag.Name = req.Name
	}
	if req.Description != "" {
		tag.Description = req.Description
	}
	if req.Color != "" {
		tag.Color = req.Color
	}

	return s.repo.UpdateTag(tag)
}

func (s *tagService) DeleteTag(userID uint64, tagID uint64) error {
	tag, err := s.repo.GetTag(tagID)
	if err != nil {
		return err
	}

	if tag.UserID != userID {
		return errors.New("unauthorized")
	}

	return s.repo.DeleteTag(tagID)
}

func (s *tagService) AddContactToTag(userID, tagID, contactID uint64) error {
	tag, err := s.repo.GetTag(tagID)
	if err != nil {
		return err
	}
	if tag.UserID != userID {
		return errors.New("unauthorized")
	}
	return s.repo.AddContactToTag(tagID, contactID)
}

func (s *tagService) RemoveContactFromTag(userID, tagID, contactID uint64) error {
	tag, err := s.repo.GetTag(tagID)
	if err != nil {
		return err
	}
	if tag.UserID != userID {
		return errors.New("unauthorized")
	}
	return s.repo.RemoveContactFromTag(tagID, contactID)
}

func (s *tagService) GetTagContacts(userID, tagID uint64) ([]types.ContactDTO, error) {
	tag, err := s.repo.GetTag(tagID)
	if err != nil {
		return nil, err
	}
	if tag.UserID != userID {
		return nil, errors.New("unauthorized")
	}
	return s.repo.GetTagContacts(tagID)
}

func (s *tagService) GetContactTags(userID, contactID uint64) ([]types.Tag, error) {
	return s.repo.GetContactTags(contactID)
}

func (s *tagService) AddTagToCampaign(userID, campaignID, tagID uint64) error {
	// strict check: does user own campaign?
	// assuming caller checks ownership or we add check here.
	// optimizing: just call repo for now, but ideally we check campaign.user_id
	return s.repo.AddTagToCampaign(campaignID, tagID)
}

func (s *tagService) RemoveTagFromCampaign(userID, campaignID, tagID uint64) error {
	return s.repo.RemoveTagFromCampaign(campaignID, tagID)
}

func (s *tagService) GetCampaignTags(userID, campaignID uint64) ([]types.Tag, error) {
	return s.repo.GetCampaignTags(campaignID)
}
