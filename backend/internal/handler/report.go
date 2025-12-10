package handler

import (
	"email_campaign/internal/service"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
	"net/http"
)

type ReportHandler struct {
	svc service.ReportService
}

func NewReportHandler(svc service.ReportService) *ReportHandler {
	return &ReportHandler{svc: svc}
}

func (h *ReportHandler) GenerateReport(w http.ResponseWriter, r *http.Request) {
	var req types.GenerateReportRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	report, err := h.svc.GenerateReport(&req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Report generating", report)
}

func (h *ReportHandler) DownloadReport(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	content, filename, err := h.svc.DownloadReport(id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Disposition", "attachment; filename="+filename)
	w.Header().Set("Content-Type", "text/csv")
	w.Write(content)
}

func (h *ReportHandler) ListReports(w http.ResponseWriter, r *http.Request) {
	utils.SuccessResponse(w, http.StatusOK, "Reports listed", []string{})
}
