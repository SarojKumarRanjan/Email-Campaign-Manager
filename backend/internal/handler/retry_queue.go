package handler

import (
	"net/http"
	"strconv"

	"email_campaign/internal/service"
	"email_campaign/internal/utils"
)

type RetryQueueHandler struct {
	svc service.RetryQueueService
}

func NewRetryQueueHandler(svc service.RetryQueueService) *RetryQueueHandler {
	return &RetryQueueHandler{svc: svc}
}

func (h *RetryQueueHandler) ListRetryItems(w http.ResponseWriter, r *http.Request) {
	page := 1
	limit := 50
	if p, err := strconv.Atoi(r.URL.Query().Get("page")); err == nil {
		page = p
	}
	if l, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil {
		limit = l
	}

	items, err := h.svc.ListRetryItems(page, limit)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Retry items retrieved", items)
}

func (h *RetryQueueHandler) GetRetryItem(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid ID")
		return
	}

	item, err := h.svc.GetRetryItem(id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Retry item retrieved", item)
}

func (h *RetryQueueHandler) ProcessRetryQueue(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.ProcessRetryQueue(); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Retry queue processing started", nil)
}

func (h *RetryQueueHandler) ClearRetryQueue(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.ClearRetryQueue(); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Retry queue cleared", nil)
}
