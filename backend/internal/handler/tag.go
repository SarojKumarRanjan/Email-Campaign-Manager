package handler

import (
	"email_campaign/internal/service"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
	"net/http"
	"strconv"
)

type TagHandler struct {
	svc service.TagService
}

func NewTagHandler(svc service.TagService) *TagHandler {
	return &TagHandler{svc: svc}
}

func (h *TagHandler) ListTags(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	tags, err := h.svc.ListTags(userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Tags retrieved successfully", tags)
}

func (h *TagHandler) CreateTag(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req types.CreateTagRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	tag, err := h.svc.CreateTag(userID, &req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Tag created successfully", tag)
}

func (h *TagHandler) UpdateTag(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	tagIDStr := r.URL.Query().Get("id") // Assuming ID is passed as query param or path param handled by router
	// Since we use standard mux, we might need to parse path if we use pattern matching
	// For now, let's assume standard mux doesn't easily give path params without parsing
	// But we registered "/api/v1/tags/:id" in routes.json which implies a router that supports params
	// However, standard http.ServeMux in Go 1.22 supports path params.
	// Let's assume we are using Go 1.22+ features or we need to parse it.
	// The server.go uses `mux.HandleFunc("POST /api/v1/auth/register", ...)` which is Go 1.22 syntax.
	// So we can use `r.PathValue("id")`.

	tagIDStr = r.PathValue("id")
	tagID, err := strconv.ParseUint(tagIDStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid tag ID")
		return
	}

	var req types.UpdateTagRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.svc.UpdateTag(userID, tagID, &req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Tag updated successfully", nil)
}

func (h *TagHandler) DeleteTag(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	tagIDStr := r.PathValue("id")
	tagID, err := strconv.ParseUint(tagIDStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid tag ID")
		return
	}

	if err := h.svc.DeleteTag(userID, tagID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Tag deleted successfully", nil)
}
