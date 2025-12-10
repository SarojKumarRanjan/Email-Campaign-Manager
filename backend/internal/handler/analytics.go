package handler

import (
	"net/http"
	"strconv"

	"email_campaign/internal/service"
	"email_campaign/internal/utils"
)

type AnalyticsHandler struct {
	svc service.AnalyticsService
}

func NewAnalyticsHandler(svc service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{svc: svc}
}

func (h *AnalyticsHandler) GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.svc.GetDashboardStats()
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Dashboard stats retrieved successfully", stats)
}

func (h *AnalyticsHandler) GetCampaignTimeline(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, _ := strconv.ParseUint(idStr, 10, 64)
	res, err := h.svc.GetCampaignTimeline(id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Success", res)
}
func (h *AnalyticsHandler) GetCampaignComparison(w http.ResponseWriter, r *http.Request) {
	// Parse IDs from query params or body
	// Simplified:
	res, err := h.svc.GetCampaignComparison([]uint64{})
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Success", res)
}
func (h *AnalyticsHandler) GetContactEngagement(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, _ := strconv.ParseUint(idStr, 10, 64)
	res, err := h.svc.GetContactEngagement(id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Success", res)
}
func (h *AnalyticsHandler) GetTagPerformance(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, _ := strconv.ParseUint(idStr, 10, 64)
	res, err := h.svc.GetTagPerformance(id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Success", res)
}
func (h *AnalyticsHandler) GetSendVolume(w http.ResponseWriter, r *http.Request) {
	res, err := h.svc.GetSendVolume("daily")
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Success", res)
}
func (h *AnalyticsHandler) GetEngagementTrends(w http.ResponseWriter, r *http.Request) {
	res, err := h.svc.GetEngagementTrends("daily")
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Success", res)
}
func (h *AnalyticsHandler) ExportAnalytics(w http.ResponseWriter, r *http.Request) {
	utils.SuccessResponse(w, http.StatusOK, "Export initiated", nil)
}

// Dashboard Widgets
func (h *AnalyticsHandler) GetRecentCampaigns(w http.ResponseWriter, r *http.Request) {
	res, err := h.svc.GetRecentCampaigns(5)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Success", res)
}
func (h *AnalyticsHandler) GetRecentActivity(w http.ResponseWriter, r *http.Request) {
	res, err := h.svc.GetRecentActivity(10)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Success", res)
}
func (h *AnalyticsHandler) GetQuickStats(w http.ResponseWriter, r *http.Request) {
	res, err := h.svc.GetQuickStats()
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Success", res)
}
