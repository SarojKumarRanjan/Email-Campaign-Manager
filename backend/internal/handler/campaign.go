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
		utils.ErrorJSON(w, err, http.StatusBadRequest)
		return
	}

	if err := h.svc.CreateCampaign(&req); err != nil {
		utils.ErrorJSON(w, err, http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, http.StatusCreated, nil)
}

func (h *CampaignHandler) GetCampaign(w http.ResponseWriter, r *http.Request) {
	// TODO: Get ID from URL params
	id := uint64(1) // Placeholder

	campaign, err := h.svc.GetCampaign(id)
	if err != nil {
		utils.ErrorJSON(w, err, http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, http.StatusOK, campaign)
}

func (h *CampaignHandler) ListCampaigns(w http.ResponseWriter, r *http.Request) {
	var filter types.CampaignFilter
	// TODO: Parse query params into filter

	campaigns, err := h.svc.ListCampaigns(&filter)
	if err != nil {
		utils.ErrorJSON(w, err, http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, http.StatusOK, campaigns)
}
