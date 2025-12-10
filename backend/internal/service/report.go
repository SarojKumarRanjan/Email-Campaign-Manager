package service

import (
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
	"fmt"
	"time"
)

type ReportService interface {
	GenerateReport(req *types.GenerateReportRequest) (*types.ReportDTO, error)
	DownloadReport(id string) ([]byte, string, error) // Returns content, filename, error
}

type reportService struct {
	repo repository.ReportRepository
}

func NewReportService(repo repository.ReportRepository) ReportService {
	return &reportService{repo: repo}
}

func (s *reportService) GenerateReport(req *types.GenerateReportRequest) (*types.ReportDTO, error) {
	// Mock generation
	return &types.ReportDTO{
		ID:          fmt.Sprintf("report-%d", time.Now().Unix()),
		Type:        req.Type,
		GeneratedAt: time.Now(),
		Status:      "completed",
		DownloadURL: "/api/v1/reports/report-123/download",
	}, nil
}

func (s *reportService) DownloadReport(id string) ([]byte, string, error) {
	// Mock CSV content
	content := "campaign_id,sent,delivered,opened\n1,100,90,50"
	return []byte(content), "report.csv", nil
}
