package service

import (
	"bytes"
	"fmt"
	"html/template"
	"io"
	"os"
	"path/filepath"
	"time"

	"email_campaign/internal/repository"
	"email_campaign/internal/types"
)

type TemplateService interface {
	CreateTemplate(req *types.CreateTemplateRequest) error
	GetTemplate(id uint64, userID uint64) (*types.TemplateDTO, error)
	ListTemplates(filter *types.TemplateFilter) ([]types.TemplateDTO, int, error)
	UpdateTemplate(id uint64, userID uint64, req *types.UpdateTemplateRequest) error
	DeleteTemplate(id uint64, userID uint64) error
	DuplicateTemplate(id uint64, userID uint64) error
	SetDefaultTemplate(id uint64, userID uint64) error
	PreviewTemplate(req *types.PreviewTemplateRequest) (string, error)
	UploadTemplateImage(file io.Reader, filename string) (string, error)
}

type templateService struct {
	repo repository.TemplateRepository
}

func NewTemplateService(repo repository.TemplateRepository) TemplateService {
	return &templateService{repo: repo}
}

func (s *templateService) CreateTemplate(req *types.CreateTemplateRequest) error {
	return s.repo.CreateTemplate(req)
}

func (s *templateService) GetTemplate(id uint64, userID uint64) (*types.TemplateDTO, error) {
	return s.repo.GetTemplate(id, userID)
}

func (s *templateService) ListTemplates(filter *types.TemplateFilter) ([]types.TemplateDTO, int, error) {
	return s.repo.ListTemplates(filter)
}

func (s *templateService) UpdateTemplate(id uint64, userID uint64, req *types.UpdateTemplateRequest) error {
	return s.repo.UpdateTemplate(id, userID, req)
}

func (s *templateService) DeleteTemplate(id uint64, userID uint64) error {
	return s.repo.DeleteTemplate(id, userID)
}

func (s *templateService) DuplicateTemplate(id uint64, userID uint64) error {
	return s.repo.DuplicateTemplate(id, userID)
}

func (s *templateService) SetDefaultTemplate(id uint64, userID uint64) error {
	return s.repo.SetDefaultTemplate(id, userID)
}

func (s *templateService) PreviewTemplate(req *types.PreviewTemplateRequest) (string, error) {
	tmpl, err := template.New("preview").Parse(req.HTMLContent)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, req.Variables); err != nil {
		return "", err
	}

	return buf.String(), nil
}

func (s *templateService) UploadTemplateImage(file io.Reader, filename string) (string, error) {
	// Ensure upload directory exists
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", err
	}

	// Create unique filename
	ext := filepath.Ext(filename)
	newFilename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	path := filepath.Join(uploadDir, newFilename)

	dst, err := os.Create(path)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", err
	}

	// Return relative URL
	return fmt.Sprintf("/uploads/%s", newFilename), nil
}
