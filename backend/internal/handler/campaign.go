package handler

import (
	"net/http"

	"email_campaign/internal/service"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
)

type CampaignHandler struct {
	svc service.CampaignService
}

func NewCampaignHandler(svc service.CampaignService) *CampaignHandler {
	return &CampaignHandler{svc: svc}
}

func (h *CampaignHandler) CreateCampaign(w http.ResponseWriter, r *http.Request) {
	var req types.CreateCampaignRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.svc.CreateCampaign(&req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Campaign created successfully", nil)
}

func (h *CampaignHandler) GetCampaign(w http.ResponseWriter, r *http.Request) {
	// TODO: Parse ID from URL
	id := uint64(1) // Placeholder

	campaign, err := h.svc.GetCampaign(id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Campaign retrieved successfully", campaign)
}

func (h *CampaignHandler) ListCampaigns(w http.ResponseWriter, r *http.Request) {
	var filter types.CampaignFilter
	// TODO: Parse query params

	campaigns, err := h.svc.ListCampaigns(&filter)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Campaigns retrieved successfully", campaigns)
}
