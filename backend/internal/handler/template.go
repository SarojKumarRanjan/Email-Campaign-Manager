package handler

import (
	"fmt"
	"net/http"
	"strconv"

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

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	req.UserID = userID

	if err := h.svc.CreateTemplate(&req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Template created successfully", nil)
}

func (h *TemplateHandler) GetTemplate(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid template ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	template, err := h.svc.GetTemplate(id, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Template retrieved successfully", template)
}

func (h *TemplateHandler) ListTemplates(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	filter := types.TemplateFilter{
		Page:         utils.ParseIntDefault(query.Get("page"), 1),
		Limit:        utils.ParseIntDefault(query.Get("limit"), 10),
		SortBy:       utils.DefaultString(query.Get("sort_by"), "created_at"),
		SortOrder:    utils.DefaultString(query.Get("sort_order"), "desc"),
		Search:       query.Get("search"),
		JoinOperator: utils.DefaultString(query.Get("join_operator"), "and"),
	}

	if isDefaultStr := query.Get("is_default"); isDefaultStr != "" {
		val := isDefaultStr == "true"
		filter.IsDefault = &val
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	filter.UserID = userID

	templates, total, err := h.svc.ListTemplates(&filter)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := map[string]interface{}{
		"data":  templates,
		"total": total,
		"page":  filter.Page,
		"limit": filter.Limit,
	}

	utils.SuccessResponse(w, http.StatusOK, "Templates retrieved successfully", response)
}

func (h *TemplateHandler) UpdateTemplate(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid template ID")
		return
	}

	var req types.UpdateTemplateRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.UpdateTemplate(id, userID, &req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Template updated successfully", nil)
}

func (h *TemplateHandler) DeleteTemplate(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid template ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.DeleteTemplate(id, userID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Template deleted successfully", nil)
}

func (h *TemplateHandler) DuplicateTemplate(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid template ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.DuplicateTemplate(id, userID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Template duplicated successfully", nil)
}

func (h *TemplateHandler) SetDefaultTemplate(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid template ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.SetDefaultTemplate(id, userID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Default template set successfully", nil)
}

func (h *TemplateHandler) PreviewTemplate(w http.ResponseWriter, r *http.Request) {
	// If ID is provided, fetch it first? Or just parse body?
	// Route is /templates/:id/preview, so presumably we might want to preview saved template
	// OR sending content to preview.
	// Let's support both. If body has content, use it. If not, load from ID.
	// But `PreviewTemplateRequest` requires HTMLContent.
	// Let's assume this endpoint is for previewing *unsaved* changes or validating current edit.
	// So we primarily look at body.

	var req types.PreviewTemplateRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	html, err := h.svc.PreviewTemplate(&req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("Template error: %v", err))
		return
	}

	// Return HTML directly or JSON?
	// JSON is better for API consistency.
	utils.SuccessResponse(w, http.StatusOK, "Preview generated", map[string]string{"html": html})
}

func (h *TemplateHandler) UploadTemplateImage(w http.ResponseWriter, r *http.Request) {
	// Limit 5MB
	if err := r.ParseMultipartForm(5 << 20); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "File too large")
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid image")
		return
	}
	defer file.Close()

	url, err := h.svc.UploadTemplateImage(file, header.Filename)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Image uploaded successfully", types.UploadTemplateImageResponse{URL: url})
}
