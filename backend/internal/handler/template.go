package handler

import (
	"net/http"

	"email_campaign/internal/service"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
)

type TemplateHandler struct {
	svc service.TemplateService
}

func NewTemplateHandler(svc service.TemplateService) *TemplateHandler {
	return &TemplateHandler{svc: svc}
}

func (h *TemplateHandler) CreateTemplate(w http.ResponseWriter, r *http.Request) {
	var req types.CreateTemplateRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorJSON(w, err, http.StatusBadRequest)
		return
	}

	if err := h.svc.CreateTemplate(&req); err != nil {
		utils.ErrorJSON(w, err, http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, http.StatusCreated, nil)
}

func (h *TemplateHandler) GetTemplate(w http.ResponseWriter, r *http.Request) {
	// TODO: Get ID from URL params
	id := uint64(1) // Placeholder

	template, err := h.svc.GetTemplate(id)
	if err != nil {
		utils.ErrorJSON(w, err, http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, http.StatusOK, template)
}

func (h *TemplateHandler) ListTemplates(w http.ResponseWriter, r *http.Request) {
	var filter types.TemplateFilter
	// TODO: Parse query params into filter

	templates, err := h.svc.ListTemplates(&filter)
	if err != nil {
		utils.ErrorJSON(w, err, http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, http.StatusOK, templates)
}
