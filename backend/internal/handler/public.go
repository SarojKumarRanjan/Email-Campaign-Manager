package handler

import (
	"net/http"

	"email_campaign/internal/service"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
)

type PublicHandler struct {
	svc service.PublicService
}

func NewPublicHandler(svc service.PublicService) *PublicHandler {
	return &PublicHandler{svc: svc}
}

func (h *PublicHandler) Unsubscribe(w http.ResponseWriter, r *http.Request) {
	var req types.UnsubscribeRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.svc.Unsubscribe(&req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Unsubscribed successfully", nil)
}

func (h *PublicHandler) Resubscribe(w http.ResponseWriter, r *http.Request) {
	// Expect token in path? server.go says /:token, handled by manual parsing or query
	token := r.PathValue("token") // or r.URL.Query().Get("token")
	if token == "" {
		// Fallback for query param if path param fails (common in public links)
		token = r.URL.Query().Get("token")
	}

	if token == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Token required")
		return
	}

	if err := h.svc.Resubscribe(token); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Resubscribed successfully", nil)
}

func (h *PublicHandler) UpdatePreferences(w http.ResponseWriter, r *http.Request) {
	var req types.UpdatePreferencesRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.svc.UpdatePreferences(&req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Preferences updated successfully", nil)
}
