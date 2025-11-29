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
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.svc.CreateTemplate(&req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Template created successfully", nil)
}

func (h *TemplateHandler) GetTemplate(w http.ResponseWriter, r *http.Request) {
	// TODO: Parse ID from URL
	id := uint64(1) // Placeholder

	template, err := h.svc.GetTemplate(id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Template retrieved successfully", template)
}

func (h *TemplateHandler) ListTemplates(w http.ResponseWriter, r *http.Request) {
	var filter types.TemplateFilter
	// TODO: Parse query params

	templates, err := h.svc.ListTemplates(&filter)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Templates retrieved successfully", templates)
}
