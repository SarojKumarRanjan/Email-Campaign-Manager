package handler

import (
	"email_campaign/internal/service"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
	"net/http"
)

type SubscriptionHandler struct {
	svc service.SubscriptionService
}

func NewSubscriptionHandler(svc service.SubscriptionService) *SubscriptionHandler {
	return &SubscriptionHandler{svc: svc}
}

func (h *SubscriptionHandler) GetSubscription(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	sub, err := h.svc.GetSubscription(userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Subscription retrieved successfully", sub)
}

func (h *SubscriptionHandler) CreateSubscription(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req types.CreateSubscriptionRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	sub, err := h.svc.CreateSubscription(userID, &req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Subscription created successfully", sub)
}
